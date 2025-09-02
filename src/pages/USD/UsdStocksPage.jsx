import React, { useState, useEffect, useMemo, useReducer, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, Loader2, Download, Filter, SortAsc, SortDesc, BarChart3, List, LineChart, Building2, PiggyBank } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

// Cache configuration
const CACHE_KEY = 'usd_stock_price_map';
const CACHE_TIMESTAMP_KEY = 'usd_stock_price_map_timestamp';
const CACHE_EXPIRY_MS = 3600000; // 1 hour

// Environment variables for APIs
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

// Symbol Badge Component
const SymbolBadge = ({ symbol }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-sm">
    {symbol}
  </span>
);

// Action types for reducer
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_STOCK_PRICES: 'SET_STOCK_PRICES',
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH: 'SET_SEARCH',
  SET_SORT: 'SET_SORT',
  SET_FILTER: 'SET_FILTER'
};

// Initial state
const initialState = {
  stockPrices: {},
  loading: true,
  error: null,
  searchTerm: '',
  sortBy: 'marketValue',
  sortDirection: 'desc',
  filterBy: 'all'
};

// Reducer for state management
const stocksReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_STOCK_PRICES:
      return { ...state, stockPrices: action.payload, loading: false };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_SEARCH:
      return { ...state, searchTerm: action.payload };
    case ACTIONS.SET_SORT:
      return { ...state, sortBy: action.payload.sortBy, sortDirection: action.payload.sortDirection };
    case ACTIONS.SET_FILTER:
      return { ...state, filterBy: action.payload };
    default:
      return state;
  }
};

const UsdStocksDashboard = ({ transactions = [], onTotalMarketValueChange }) => {
  const [state, dispatch] = useReducer(stocksReducer, initialState);
  const [selectedStock, setSelectedStock] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  const [returnType, setReturnType] = useState('absolute');
  
  // Refs for fetching optimization
  const fetchedSymbolsRef = useRef(new Set());
  const prevTotalMarketValue = useRef(null);

  // XIRR calculation function
  const calculateXIRR = (transactions, currentValue) => {
    if (!transactions || transactions.length === 0) return 0;

    const cashFlows = [];
    const dates = [];

    transactions.forEach(txn => {
      let dateStr = txn.DateTime;
      if (!dateStr) return;
      const date = new Date(dateStr.replace(';', ' '));
      if (isNaN(date.getTime())) return;

      const tradeMoney = parseFloat(txn.TradeMoney) || 0;
      const ibCommission = parseFloat(txn.IBCommission) || 0;

      const cashFlow = tradeMoney + ibCommission; // Includes IB commission cost

      if (cashFlow !== 0) {
        cashFlows.push(cashFlow);
        dates.push(date);
      }
    });

    if (currentValue > 0) {
      cashFlows.push(currentValue);
      dates.push(new Date());
    }

    if (cashFlows.length < 2) return 0;

    // Check if cash flows have both positive and negative
    const hasPositive = cashFlows.some(c => c > 0);
    const hasNegative = cashFlows.some(c => c < 0);
    if (!hasPositive || !hasNegative) return 0;

    const npv = (rate) => {
      const baseDate = dates[0];
      return cashFlows.reduce((acc, val, i) => {
        const diff = (dates[i] - baseDate) / (1000 * 3600 * 24);
        const years = diff / 365;
        return acc + val / Math.pow(1 + rate, years);
      }, 0);
    };

    const npvDerivative = (rate) => {
      const baseDate = dates[0];
      return cashFlows.reduce((acc, val, i) => {
        if (i === 0) return acc;
        const diff = (dates[i] - baseDate) / (1000 * 3600 * 24);
        const years = diff / 365;
        return acc - (years * val) / Math.pow(1 + rate, years + 1);
      }, 0);
    };

    // Newton-Raphson method
    let rate = 0.1;
    const tolerance = 1e-7;
    const maxIter = 100;

    for (let i = 0; i < maxIter; i++) {
      const val = npv(rate);
      if (Math.abs(val) < tolerance) return rate;
      const deriv = npvDerivative(rate);
      if (Math.abs(deriv) < tolerance) break;

      const newRate = rate - val / deriv;
      if (Math.abs(newRate - rate) < tolerance) return newRate;
      rate = newRate;
    }

    // Fallback: bisection method
    let lower = -0.9999;
    let upper = 10;
    let mid = rate;

    for (let i = 0; i < 50; i++) {
      mid = (lower + upper) / 2;
      const val = npv(mid);
      if (Math.abs(val) < tolerance) return mid;

      if (npv(lower) * val < 0) {
        upper = mid;
      } else {
        lower = mid;
      }

      if (Math.abs(upper - lower) < tolerance) return mid;
    }

    return 0;
  };


  // Filter transactions - only STK (stocks), no CASH
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const assetClass = txn.AssetClass;
      const symbol = txn.Symbol;
      
      // Only include STK (stocks), exclude CASH
      return assetClass === 'STK' && symbol && symbol.length > 0;
    });
  }, [transactions]);

  // Get unique symbols
  const uniqueSymbols = useMemo(() => {
    return [...new Set(filteredTransactions.map(txn => txn.Symbol).filter(Boolean))];
  }, [filteredTransactions]);

  // Fetch stock prices with special handling for VUAA
  useEffect(() => {
    const fetchStockPrices = async () => {
      // Check cache first
      const cachedPrices = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      const now = Date.now();

      if (cachedPrices && cachedTimestamp && now - Number(cachedTimestamp) < CACHE_EXPIRY_MS) {
        const parsedPrices = JSON.parse(cachedPrices);
        dispatch({ type: ACTIONS.SET_STOCK_PRICES, payload: parsedPrices });
        fetchedSymbolsRef.current = new Set(Object.keys(parsedPrices));
        return;
      }

      const newSymbols = uniqueSymbols.filter(sym => !fetchedSymbolsRef.current.has(sym));
      if (newSymbols.length === 0) {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        return;
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      try {
        let newPrices = {};

        for (const symbol of newSymbols) {
          try {
            let price = 0;
            console.log(`Fetching price for ${symbol}`);

            // Special handling for VUAA - use Alpha Vantage like in old IBKR transactions
            if (symbol === 'VUAA') {
              const symbolForApi = `${symbol}.LON`;
              const apiRes = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbolForApi)}&apikey=${ALPHA_VANTAGE_API_KEY}`
              );
              
              if (apiRes.ok) {
                const apiData = await apiRes.json();
                console.log(`Alpha Vantage response for ${symbol}:`, apiData);
                price = Number(apiData?.['Global Quote']?.['05. price']) || 0;
              } else {
                console.log(`Alpha Vantage API error for ${symbol}:`, apiRes.status, apiRes.statusText);
              }
            } else {
              // Use Finnhub for other US stocks
              const apiRes = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`
              );
              
              if (apiRes.ok) {
                const apiData = await apiRes.json();
                console.log(`Finnhub response for ${symbol}:`, apiData);
                price = Number(apiData?.c) || 0;
              } else {
                console.log(`Finnhub API error for ${symbol}:`, apiRes.status, apiRes.statusText);
              }
            }

            console.log(`Final price for ${symbol}: ${price}`);
            newPrices[symbol] = price;
            fetchedSymbolsRef.current.add(symbol);

            // Rate limiting
            await new Promise(r => setTimeout(r, 150));

          } catch (error) {
            console.log(`Error fetching price for ${symbol}:`, error);
            newPrices[symbol] = 0;
            fetchedSymbolsRef.current.add(symbol);
          }
        }

        const updatedPrices = { ...state.stockPrices, ...newPrices };
        dispatch({ type: ACTIONS.SET_STOCK_PRICES, payload: updatedPrices });
        
        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedPrices));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to fetch stock prices' });
      }
    };

    if (uniqueSymbols.length > 0) {
      fetchStockPrices();
    } else {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [uniqueSymbols, filteredTransactions]);

  // Process and group transactions by stock with CORRECT calculations
  const processedData = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];
    
    const stockMap = new Map();

    filteredTransactions.forEach(transaction => {
      const symbol = transaction.Symbol;
      const qty = parseFloat(transaction.Quantity) || 0;
      const investedAmount = parseFloat(transaction.TradeMoney) || 0; // Your specified field
      const ibCommission = parseFloat(transaction.IBCommission) || 0; // Your specified field
      const fifoPnlRealized = parseFloat(transaction.FifoPnlRealized) || 0; // Your specified field
      const tradePrice = parseFloat(transaction.TradePrice) || 0;
      
      if (!stockMap.has(symbol)) {
        stockMap.set(symbol, {
          symbol,
          companyName: transaction.Description || 'No Description', // Company name from Description
          totalQuantity: 0,
          totalAmount: 0, // Sum of TradeMoney
          totalIbCommission: 0, // Sum of IBCommission
          totalFifoPnlRealized: 0, // Sum of FifoPnlRealized
          averageUnitPrice: 0,
          rows: []
        });
      }

      const stockData = stockMap.get(symbol);
      stockData.rows.push(transaction);

      // Sum the quantities and amounts as per your specification
      stockData.totalQuantity += qty;
      stockData.totalAmount += investedAmount; // TradeMoney
      stockData.totalIbCommission += ibCommission; // IBCommission
      stockData.totalFifoPnlRealized += fifoPnlRealized; // FifoPnlRealized

      // Calculate average unit price
      if (stockData.totalQuantity > 0) {
        stockData.averageUnitPrice = (Math.abs(stockData.totalAmount) + stockData.totalIbCommission) / stockData.totalQuantity;

      }
    });

    return Array.from(stockMap.values())
      .filter(stock => stock.totalQuantity > 0.0001) // Filter out stocks with zero or near-zero quantities
      .map(stock => {
        const currentPrice = state.stockPrices[stock.symbol] || 0;
        const totalMarketValue = currentPrice * stock.totalQuantity; // Current market value
        
        // Your specified calculation: unrealizedGains = totalMarketValue - totalIbCommission - totalAmount
        const unrealizedGains = totalMarketValue - stock.totalIbCommission - Math.abs(stock.totalAmount);
        
        const profitLoss = unrealizedGains + stock.totalFifoPnlRealized; // Total P&L
        const netInvestment = Math.abs(stock.totalAmount) + Math.abs(stock.totalIbCommission); // Total invested
        const profitLossPercent = netInvestment > 0 ? (profitLoss / netInvestment) * 100 : 0;
        const xirrPercent = calculateXIRR(stock.rows, totalMarketValue) * 100;

        return {
          ...stock,
          currentPrice,
          currentValue: totalMarketValue,
          netInvestment,
          unrealizedGains,
          profitLoss,
          profitLossPercent,
          xirrPercent
        };
      });
  }, [filteredTransactions, state.stockPrices]);


  // Apply search and filter
  const filteredData = useMemo(() => {
    let filtered = processedData;

    if (state.searchTerm) {
      filtered = filtered.filter(item =>
        item.symbol.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        item.companyName.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    if (state.filterBy === 'profit') {
      filtered = filtered.filter(item => item.profitLoss > 0);
    } else if (state.filterBy === 'loss') {
      filtered = filtered.filter(item => item.profitLoss < 0);
    }

    return filtered;
  }, [processedData, state.searchTerm, state.filterBy]);

  // Apply sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal, bVal;
      
      switch (state.sortBy) {
        case 'symbol':
          aVal = a.symbol;
          bVal = b.symbol;
          break;
        case 'company':
          aVal = a.companyName;
          bVal = b.companyName;
          break;
        case 'quantity':
          aVal = a.totalQuantity;
          bVal = b.totalQuantity;
          break;
        case 'avgPrice': // Renamed from unitPrice
          aVal = a.averageUnitPrice;
          bVal = b.averageUnitPrice;
          break;
        case 'invested':
          aVal = a.netInvestment;
          bVal = b.netInvestment;
          break;
        case 'marketValue': // Renamed from currentValue
          aVal = a.currentValue;
          bVal = b.currentValue;
          break;
        case 'profitLoss':
          aVal = a.profitLoss;
          bVal = b.profitLoss;
          break;
        case 'profitLossPercent':
          aVal = returnType === 'absolute' ? a.profitLossPercent : a.xirrPercent;
          bVal = returnType === 'absolute' ? b.profitLossPercent : b.xirrPercent;
          break;
        default:
          aVal = a.currentValue;
          bVal = b.currentValue;
      }

      if (typeof aVal === 'string') {
        return state.sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, state.sortBy, state.sortDirection, returnType]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        absoluteReturn: 0,
        xirrReturn: 0
      };
    }
    
    const totalInvested = processedData.reduce((acc, stock) => acc + stock.netInvestment, 0);
    const totalCurrentValue = processedData.reduce((acc, stock) => acc + stock.currentValue, 0);
    const totalProfitLoss = processedData.reduce((acc, stock) => acc + stock.profitLoss, 0);
    const absoluteReturn = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const xirrReturn = calculateXIRR(filteredTransactions, totalCurrentValue) * 100;
    
    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      absoluteReturn,
      xirrReturn
    };
  }, [processedData, filteredTransactions]);

  // Get selected stock's transactions
  const selectedStockData = useMemo(() => {
    if (!selectedStock) return null;
    return processedData.find(stock => stock.symbol === selectedStock);
  }, [selectedStock, processedData]);

  // Notify parent of total market value
  useEffect(() => {
    if (onTotalMarketValueChange && totals.totalCurrentValue !== prevTotalMarketValue.current) {
      onTotalMarketValueChange(totals.totalCurrentValue);
      prevTotalMarketValue.current = totals.totalCurrentValue;
    }
  }, [totals.totalCurrentValue, onTotalMarketValueChange]);

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price || 0);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${(percent || 0).toFixed(2)}%`;
  };

  const SortIcon = ({ columnKey }) => {
    if (state.sortBy !== columnKey) return <SortAsc className="w-4 h-4 opacity-50" />;
    return state.sortDirection === 'asc' ? 
      <SortAsc className="w-4 h-4 text-blue-400" /> : 
      <SortDesc className="w-4 h-4 text-blue-400" />;
  };

  // Event handlers
  const handleSort = (column) => {
    let sortColumn = column;
    if (column === 'profitLossPercent' || column === 'xirrPercent') {
      sortColumn = 'profitLossPercent';
    }
    
    dispatch({
      type: ACTIONS.SET_SORT,
      payload: {
        sortBy: sortColumn,
        sortDirection: state.sortBy === sortColumn && state.sortDirection === 'desc' ? 'asc' : 'desc'
      }
    });
  };

  const exportToCSV = () => {
    const headers = ['Symbol', 'Company', 'Quantity', 'Avg Price', 'Net Investment', 'Market Value', 'Profit/Loss', 'P/L %'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        `"${row.symbol}"`,
        `"${row.companyName}"`,
        row.totalQuantity.toFixed(4),
        row.averageUnitPrice.toFixed(2),
        row.netInvestment.toFixed(2),
        row.currentValue.toFixed(2),
        row.profitLoss.toFixed(2),
        (returnType === 'absolute' ? row.profitLossPercent : row.xirrPercent).toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usd_stocks_portfolio_summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center max-w-md shadow-2xl">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No USD Stock Transactions Found</h2>
          <p className="text-gray-400 leading-relaxed">
            Upload your IBKR USD stock transactions CSV file to view your portfolio summary.
          </p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-300 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            USD Stocks Portfolio Dashboard
          </h1>
          <p className="text-gray-400">Track your USD equity investments and performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Invested Card */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank size={20} className="text-blue-200" />
                  <h3 className="text-blue-100 text-sm font-medium uppercase tracking-wide">Net Investment</h3>
                </div>
                <p className="text-white font-bold text-3xl">{formatCurrency(totals.totalInvested)}</p>
              </div>
              <div className="text-blue-200 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <PiggyBank size={32} />
              </div>
            </div>
          </div>

          {/* Current Value Card */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LineChart size={20} className="text-purple-200" />
                  <h3 className="text-purple-100 text-sm font-medium uppercase tracking-wide">Market Value</h3>
                </div>
                <p className="text-white font-bold text-3xl">{formatCurrency(totals.totalCurrentValue)}</p>
              </div>
              <div className="text-purple-200 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <LineChart size={32} />
              </div>
            </div>
          </div>

          {/* Profit/Loss Card with Toggle */}
          <div className={`${totals.totalProfitLoss >= 0
            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-red-500 to-rose-600'
          } p-6 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`${totals.totalProfitLoss >= 0 ? 'text-green-100' : 'text-red-100'} text-sm font-medium uppercase tracking-wide`}>
                  Total P&L
                </h3>
                <p className="text-white font-bold text-3xl mt-2">{formatCurrency(totals.totalProfitLoss)}</p>
                
                {/* Dynamic Return Display */}
                <div className="mt-3">
                  <div className={`${
                    (returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn) >= 0 
                      ? 'bg-green-900/60 border-green-300/30' 
                      : 'bg-red-900/60 border-red-300/30'
                  } backdrop-blur-sm px-4 py-2 rounded-xl border inline-flex items-center gap-2`}>
                    <span className="text-white text-sm font-medium">
                      {returnType === 'absolute' ? 'Absolute:' : 'XIRR:'}
                    </span>
                    <span className="text-white font-bold text-xl">
                      {formatPercent(returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn)}
                    </span>
                    <div className="text-white">
                      {(returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn) >= 0 ? 
                        <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`${totals.totalProfitLoss >= 0 ? 'text-green-200' : 'text-red-200'} bg-white/20 p-3 rounded-xl backdrop-blur-sm`}>
                {totals.totalProfitLoss >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
              </div>
            </div>
          </div>
        </div>
        
        {/* Compact Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search stocks or companies..."
              value={state.searchTerm}
              onChange={(e) => dispatch({ type: ACTIONS.SET_SEARCH, payload: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Stock Filter Buttons */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
            <button
              onClick={() => dispatch({ type: ACTIONS.SET_FILTER, payload: 'all' })}
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                state.filterBy === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => dispatch({ type: ACTIONS.SET_FILTER, payload: 'profit' })}
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                state.filterBy === 'profit'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Profit
            </button>
            <button
              onClick={() => dispatch({ type: ACTIONS.SET_FILTER, payload: 'loss' })}
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                state.filterBy === 'loss'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Loss
            </button>
          </div>

          {/* Return Type Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
            <button
              onClick={() => setReturnType('absolute')}
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                returnType === 'absolute'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Abs %
            </button>
            <button
              onClick={() => setReturnType('xirr')}
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                returnType === 'xirr'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              XIRR %
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Loading State */}
        {state.loading && (
          <LoadingScreen />
        )}

        {/* Portfolio Table with Updated Column Names */}
        {!state.loading && sortedData.length > 0 && (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
            <div className="max-w-7xl mx-auto">              
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-700/70 bg-slate-900/80">
                        <th
                          className="group px-6 py-5 text-left text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('company')}
                        >
                          <span className="inline-flex items-center">
                            Company
                            <SortIcon
                              columnKey="company"
                              currentSort={state.sortBy}
                              direction={state.sortDirection}
                            />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('quantity')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Quantity
                            <SortIcon
                              columnKey="quantity"
                              currentSort={state.sortBy}
                              direction={state.sortDirection}
                            />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('invested')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Net Invested
                            <SortIcon
                              columnKey="invested"
                              currentSort={state.sortBy}
                              direction={state.sortDirection}
                            />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('marketValue')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Market Value
                            <SortIcon
                              columnKey="marketValue"
                              currentSort={state.sortBy}
                              direction={state.sortDirection}
                            />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('profitLoss')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Profit / Loss
                            <SortIcon
                              columnKey="profitLoss"
                              currentSort={state.sortBy}
                              direction={state.sortDirection}
                            />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((stock, index) => (
                        <tr 
                          key={stock.symbol} 
                          className="border-b border-slate-700/40 hover:border-blue-500/30 hover:bg-slate-800/30 hover:-translate-y-px transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                        >
                          <td className="px-6 py-5">
                            <div className="font-semibold text-white text-base">
                              {stock.companyName}
                            </div>
                            <div className="mt-2">
                              <SymbolBadge symbol={stock.symbol} />
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-slate-200 font-semibold text-base">
                              {Number(stock.totalQuantity).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-slate-200 font-semibold text-base">
                              {formatCurrency(stock.netInvestment)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              {formatPrice(stock.averageUnitPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-slate-200 font-semibold text-base">
                              {formatCurrency(stock.currentValue)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              {formatPrice(stock.currentPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className={`font-bold text-base ${
                                stock.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}>
                                {formatCurrency(stock.profitLoss)}
                              </span>
                              {stock.profitLoss > 0 ? (
                                <TrendingUp className="w-5 h-5 text-emerald-400 hover:scale-110 transition-transform duration-200" />
                              ) : stock.profitLoss < 0 ? (
                                <TrendingDown className="w-5 h-5 text-red-400 hover:scale-110 transition-transform duration-200" />
                              ) : null}
                            </div>
                            <div className={`text-xs mt-1 font-semibold ${
                              stock.profitLoss > 0
                                ? 'text-emerald-400'
                                : stock.profitLoss < 0
                                ? 'text-red-400'
                                : 'text-slate-400'
                            }`}>
                              {(returnType === "absolute"
                                ? stock.profitLossPercent
                                : stock.xirrPercent
                              ).toFixed(2)}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-blue-500/30 bg-gradient-to-r from-slate-900 to-slate-800">
                        <td className="px-6 py-5 text-left text-white font-bold text-lg">
                          Total Portfolio
                        </td>
                        <td className="px-6 py-5 text-right"></td>
                        <td className="px-6 py-5 text-right text-slate-200 font-bold text-lg">
                          {formatCurrency(totals.totalInvested)}
                        </td>
                        <td className="px-6 py-5 text-right text-slate-200 font-bold text-lg">
                          {formatCurrency(totals.totalCurrentValue)}
                        </td>
                        <td className={`px-6 py-5 text-right font-bold text-lg ${
                          totals.totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {formatCurrency(totals.totalProfitLoss)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!state.loading && sortedData.length === 0 && processedData.length > 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No stocks match your current filters</p>
          </div>
        )}

        {/* Individual Transactions Section */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={24} />
              Stock Transaction Details
            </h2>
            
            {/* Stock Selection */}
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm font-medium whitespace-nowrap">Select Stock:</span>
              <select
                value={selectedStock}
                onChange={(e) => {
                  setSelectedStock(e.target.value);
                  setShowTransactions(true);
                }}
                className="flex-1 lg:min-w-80 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a stock to view transactions...</option>
                {processedData.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedStock && selectedStockData ? (
            <div className="space-y-6">
              {/* Stock Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Symbol & Company */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Stock Details</h4>
                  <div className="mb-2">
                    <SymbolBadge symbol={selectedStockData.symbol} />
                  </div>
                  <p className="text-gray-300 text-sm truncate" title={selectedStockData.companyName}>
                    {selectedStockData.companyName}
                  </p>
                </div>

                {/* Holdings */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Holdings</h4>
                  <p className="text-white text-xl font-bold">{selectedStockData.totalQuantity.toFixed(4)} shares</p>
                  <p className="text-gray-300 text-sm">Avg: {formatPrice(selectedStockData.averageUnitPrice)}</p>
                </div>

                {/* Investment Info */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Investment / Market</h4>
                  <div className="flex flex-col">
                    <p className="text-white text-lg font-semibold">{formatCurrency(selectedStockData.netInvestment)}</p>
                    <p className="text-blue-400 text-lg font-semibold">{formatCurrency(selectedStockData.currentValue)}</p>
                  </div>
                </div>

                {/* P&L Combined */}
                <div className={`p-4 rounded-xl border ${
                  selectedStockData.profitLoss >= 0 
                    ? 'bg-green-900/30 border-green-600/50' 
                    : 'bg-red-900/30 border-red-600/50'
                }`}>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Profit & Loss</h4>
                  <div className="flex flex-col">
                    <p className={`text-lg font-bold ${
                      selectedStockData.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(selectedStockData.profitLoss)}
                    </p>
                    <p className={`text-sm font-semibold ${
                      selectedStockData.profitLoss >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {formatPercent(
                        returnType === 'absolute' 
                          ? selectedStockData.profitLossPercent 
                          : selectedStockData.xirrPercent
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction History Section */}
              <div className="bg-gray-700 rounded-xl border border-gray-600">
                <div className="flex items-center justify-between p-4 border-b border-gray-600">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Transaction History
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {selectedStockData.rows.length}
                    </span>
                  </h3>
                  
                  {/* Toggle Transactions Button */}
                  <button
                    onClick={() => setShowTransactions(!showTransactions)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      showTransactions
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
                    }`}
                  >
                    {showTransactions ? (
                      <>
                        <TrendingDown size={16} />
                        Hide Transactions
                      </>
                    ) : (
                      <>
                        <TrendingUp size={16} />
                        Show Transactions
                      </>
                    )}
                  </button>
                </div>

                {/* Transactions Table */}
                {showTransactions && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Quantity</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Trade Price</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Trade Money</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">IB Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStockData.rows.map((transaction, index) => (
                            <tr key={index} className="border-b border-gray-700 hover:bg-gray-600/30">
                              <td className="py-3 px-4 text-gray-200">
                                {new Date(transaction.DateTime?.replace(';', ' ') || '').toLocaleDateString() || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-right text-white font-medium">
                                <span className={`${parseFloat(transaction.Quantity || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                  {parseFloat(transaction.Quantity || 0).toFixed(4)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-white font-medium">
                                {formatPrice(parseFloat(transaction.TradePrice || 0))}
                              </td>
                              <td className="py-3 px-4 text-right text-white font-bold">
                                {formatCurrency(parseFloat(transaction.TradeMoney || 0))}
                              </td>
                              <td className="py-3 px-4 text-right text-red-300 font-medium">
                                {formatCurrency(parseFloat(transaction.IBCommission || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        
                        {/* Summary Row */}
                        <tfoot>
                          <tr className="bg-gray-600/30 border-t-2 border-gray-500">
                            <td className="py-3 px-4 text-white font-bold">
                              Total for {selectedStockData.symbol}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {selectedStockData.totalQuantity.toFixed(4)}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {formatPrice(selectedStockData.averageUnitPrice)}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {formatCurrency(selectedStockData.totalAmount)}
                            </td>
                            <td className="py-3 px-4 text-right text-red-300 font-bold">
                              {formatCurrency(selectedStockData.totalIbCommission)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Stock Selected</h3>
              <p className="text-gray-400">
                Choose a stock from the dropdown above to view its detailed transaction history and performance metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsdStocksDashboard;
