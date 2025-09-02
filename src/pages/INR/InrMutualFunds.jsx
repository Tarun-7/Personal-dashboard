import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, Loader2, Download, Filter, SortAsc, SortDesc, BarChart3, List, ChartNoAxesCombined, HandCoins } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const CACHE_KEY_MARKET_VALUES = 'kuveraMarketValues';
const CACHE_KEY_MARKET_VALUES_TIMESTAMP = 'kuveraMarketValuesTimestamp';
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

// Action types for reducer
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_FUND_CODES: 'SET_FUND_CODES',
  SET_MARKET_VALUES: 'SET_MARKET_VALUES',
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH: 'SET_SEARCH',
  SET_SORT: 'SET_SORT',
  SET_FILTER: 'SET_FILTER'
};

// Initial state
const initialState = {
  fundCodes: {},
  marketValues: {},
  loading: true,
  error: null,
  searchTerm: '',
  sortBy: 'marketValue',
  sortDirection: 'desc',
  filterBy: 'all'
};

// Reducer for state management
const transactionsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_FUND_CODES:
      return { ...state, fundCodes: action.payload };
    case ACTIONS.SET_MARKET_VALUES:
      return { ...state, marketValues: action.payload, loading: false };
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

const InrMutualFunds = ({ transactions, onTotalMarketValue }) => {
  const [state, dispatch] = useReducer(transactionsReducer, initialState);
  const [selectedFund, setSelectedFund] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  const [returnType, setReturnType] = useState('xirr'); // 'absolute' or 'xirr'

  const calculateXIRR = (transactions, currentValues) => {
    const cashFlows = [];
    
    transactions.forEach(transaction => {
      const date = new Date(transaction["Date"] || Object.values(transaction)[0]);
      const orderType = (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase();
      const amount = parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0);
      
      const cashFlow = orderType === 'SELL' || orderType === 'REDEEM' ? amount : -amount;
      
      cashFlows.push({
        date: date,
        amount: cashFlow
      });
    });
    
    if (currentValues > 0) {
      cashFlows.push({
        date: new Date(),
        amount: currentValues
      });
    }
    
    if (cashFlows.length < 2) return 0;
    
    cashFlows.sort((a, b) => a.date - b.date);
    
    const npv = (rate) => {
      const baseDate = cashFlows[0].date;
      let total = 0;
      
      cashFlows.forEach(cf => {
        const years = (cf.date - baseDate) / (365.25 * 24 * 60 * 60 * 1000);
        total += cf.amount / Math.pow(1 + rate, years);
      });
      
      return total;
    };
    
    let rate = 0.1;
    const tolerance = 1e-6;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      const fValue = npv(rate);
      const fDerivative = (npv(rate + tolerance) - fValue) / tolerance;
      
      if (Math.abs(fValue) < tolerance || fDerivative === 0) break;
      
      const newRate = rate - fValue / fDerivative;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      
      rate = newRate;
    }
    
    return rate;
  };

  // XIRR calculation for individual funds
  const calculateFundXIRR = (fundTransactions, currentValue) => {
    if (!fundTransactions || fundTransactions.length === 0) return 0;
    return calculateXIRR(fundTransactions, currentValue);
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const SortIcon = ({ column }) => {
    if (state.sortBy !== column) return <SortAsc className="w-4 h-4 opacity-50" />;
    return state.sortDirection === 'asc' ? 
      <SortAsc className="w-4 h-4 text-blue-400" /> : 
      <SortDesc className="w-4 h-4 text-blue-400" />;
  };

  // Fetch fund codes from JSON file once mount
  useEffect(() => {
    const fetchFundCodes = async () => {
      try {
        const response = await fetch('/data/KuveraCode.json');
        if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
        const data = await response.json();
        dispatch({ type: ACTIONS.SET_FUND_CODES, payload: data });
        console.log('Fund codes loaded:', data);
      } catch (error) {
        console.error('Error fetching fund codes:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load fund codes' });
      }
    };
    
    fetchFundCodes();
  }, []);

  // Fetch market values with caching
  useEffect(() => {
    if (!state.fundCodes || Object.keys(state.fundCodes).length === 0) return;

    const cachedValues = localStorage.getItem(CACHE_KEY_MARKET_VALUES);
    const cachedTimestamp = localStorage.getItem(CACHE_KEY_MARKET_VALUES_TIMESTAMP);
    const now = Date.now();
    const isCacheValid = cachedValues && cachedTimestamp && 
      now - parseInt(cachedTimestamp, 10) < CACHE_EXPIRY_MS;

    if (isCacheValid) {
      const parsedValues = JSON.parse(cachedValues);
      dispatch({ type: ACTIONS.SET_MARKET_VALUES, payload: parsedValues });
      console.log('Using cached market values');
      if (onTotalMarketValue) {
        const totalValue = Object.values(parsedValues).reduce(
          (acc, val) => acc + parseFloat(val || 0), 0
        );
        onTotalMarketValue(totalValue);
      }
      return;
    }

    const fetchMarketValues = async () => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const values = {};
      
      for (const [fund, code] of Object.entries(state.fundCodes)) {
        try {
          const response = await fetch(`https://api.mfapi.in/mf/${code}/latest`);
          if (response.ok) {
            const data = await response.json();
            const nav = data?.data?.[0]?.nav;
            if (nav) {
              values[fund] = parseFloat(nav);
              console.log(`Fetched NAV for ${fund} (${code}):`, nav);
            }
          } else {
            console.error(`Failed to fetch NAV for ${fund} (${code}):`, response.status);
          }
        } catch (error) {
          console.error(`Error fetching NAV for ${fund} (${code}):`, error);
        }
      }

      dispatch({ type: ACTIONS.SET_MARKET_VALUES, payload: values });
      localStorage.setItem(CACHE_KEY_MARKET_VALUES, JSON.stringify(values));
      localStorage.setItem(CACHE_KEY_MARKET_VALUES_TIMESTAMP, now.toString());
      
      if (onTotalMarketValue) {
        const totalValue = Object.values(values).reduce(
          (acc, val) => acc + parseFloat(val || 0), 0
        );
        onTotalMarketValue(totalValue);
      }
    };

  fetchMarketValues();
}, [state.fundCodes, onTotalMarketValue]);


  // Process and group transactions
  const processedData = useMemo(() => {
    const fundMap = new Map();

    transactions.forEach(transaction => {
      const fundName = transaction["Name of the Fund"] || Object.values(transaction)[2] || 'Unknown Fund';
      const orderType = (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase();
      const units = parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0);
      const amount = parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0);

      if (!fundMap.has(fundName)) {
        fundMap.set(fundName, {
          fund: fundName,
          totalUnits: 0,
          totalAmount: 0,
          rows: []
        });
      }

      const fundData = fundMap.get(fundName);
      fundData.rows.push(transaction);

      // Handle BUY and SELL transactions differently
      if (orderType === 'SELL' || orderType === 'REDEEM') {
        // For SELL orders: subtract units and amount
        fundData.totalUnits -= units;
        fundData.totalAmount -= amount;
      } else {
        // For BUY orders: add units and amount (default behavior)
        fundData.totalUnits += units;
        fundData.totalAmount += amount;
      }
    });

    return Array.from(fundMap.values()).map(fund => {
      const marketValue = state.marketValues[fund.fund] || 0;
      const currentValue = marketValue * fund.totalUnits;
      const profitLoss = currentValue - fund.totalAmount;
      const profitLossPercent = fund.totalAmount > 0 ? (profitLoss / fund.totalAmount) * 100 : 0;
      const xirrPercent = calculateFundXIRR(fund.rows, currentValue) * 100;

      return {
        ...fund,
        marketValue,
        currentValue,
        profitLoss,
        profitLossPercent,
        xirrPercent
      };
    });
  }, [transactions, state.marketValues]);


  // Apply search and filter
  const filteredData = useMemo(() => {
    let filtered = processedData;

    if (state.searchTerm) {
      filtered = filtered.filter(item =>
        item.fund.toLowerCase().includes(state.searchTerm.toLowerCase())
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
        case 'fund':
          aVal = a.fund;
          bVal = b.fund;
          break;
        case 'invested':
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case 'marketValue':
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
        case 'xirrPercent':
          aVal = returnType === 'absolute' ? a.profitLossPercent : a.xirrPercent;
          bVal = returnType === 'absolute' ? b.profitLossPercent : b.xirrPercent;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return state.sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return state.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, state.sortBy, state.sortDirection]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalInvested = processedData.reduce((acc, fund) => acc + fund.totalAmount, 0);
    const totalCurrentValue = processedData.reduce((acc, fund) => acc + fund.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const absoluteReturn = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const xirrReturn = calculateXIRR(transactions, totalCurrentValue) * 100;
    
    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      absoluteReturn,
      xirrReturn
    };
  }, [processedData, transactions]);


  // Get selected fund's transactions
  const selectedFundData = useMemo(() => {
    if (!selectedFund) return null;
    return processedData.find(fund => fund.fund === selectedFund);
  }, [selectedFund, processedData]);

  // Get unique fund names for dropdown
  const fundNames = useMemo(() => {
    return processedData.map(fund => fund.fund).sort();
  }, [processedData]);

  // Notify parent of total market value
  useEffect(() => {
    if (onTotalMarketValue) {
      onTotalMarketValue(totals.totalCurrentValue);
    }
  }, [totals.totalCurrentValue, onTotalMarketValue]);

  // Event handlers
  const handleSort = (column) => {
    dispatch({
      type: ACTIONS.SET_SORT,
      payload: {
        sortBy: column,
        sortDirection: state.sortBy === column && state.sortDirection === 'desc' ? 'asc' : 'desc'
      }
    });
  };

  const handleSearch = (e) => {
    dispatch({ type: ACTIONS.SET_SEARCH, payload: e.target.value });
  };

  const handleFilter = (filter) => {
    dispatch({ type: ACTIONS.SET_FILTER, payload: filter });
  };

  const exportToCSV = () => {
    const headers = ['Fund Name', 'Units', 'NAV', 'Invested Amount', 'Current Value', 'Profit/Loss', 'P/L %'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        `"${row.fund}"`,
        row.totalUnits.toFixed(2),
        row.marketValue.toFixed(2),
        row.totalAmount.toFixed(2),
        row.currentValue.toFixed(2),
        row.profitLoss.toFixed(2),
        row.profitLossPercent.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kuvera_portfolio_summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center max-w-md shadow-2xl">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No Transactions Found</h2>
          <p className="text-gray-400 leading-relaxed">
            Upload your Kuvera transactions CSV file to view your portfolio summary and track your investments.
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
            onClick={fetchMarketData}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Mutual Funds Dashboard
          </h1>
          <p className="text-gray-400">Track your mutual fund investments and performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Invested Card */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-cyan-100 text-sm font-medium uppercase tracking-wide">Total Invested</h3>
                <p className="text-white font-bold text-3xl mt-2">{formatCurrency(totals.totalInvested)}</p>
              </div>
              <div className="text-cyan-200 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <HandCoins size={28} />
              </div>
            </div>
          </div>

          {/* Current Value Card */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-violet-100 text-sm font-medium uppercase tracking-wide">Current Value</h3>
                <p className="text-white font-bold text-3xl mt-2">{formatCurrency(totals.totalCurrentValue)}</p>
              </div>
              <div className="text-violet-200 bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <ChartNoAxesCombined size={28} />
              </div>
            </div>
          </div>

          {/* Profit/Loss Card with Toggle */}
          <div className={`${totals.totalProfitLoss >= 0
            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
            : 'bg-gradient-to-r from-rose-500 to-red-600'
          } p-6 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`${totals.totalProfitLoss >= 0 ? 'text-emerald-100' : 'text-rose-100'} text-sm font-medium uppercase tracking-wide`}>
                  Total P&L
                </h3>
                <p className="text-white font-bold text-3xl mt-2">{formatCurrency(totals.totalProfitLoss)}</p>
                
                {/* Dynamic Return Display */}
                <div className="mt-3">
                  <div className={`${
                    (returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn) >= 0 
                      ? 'bg-emerald-900/60 border-emerald-300/30' 
                      : 'bg-rose-900/60 border-rose-300/30'
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
              
              <div className={`${totals.totalProfitLoss >= 0 ? 'text-emerald-200' : 'text-rose-200'} bg-white/20 p-3 rounded-xl backdrop-blur-sm`}>
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
              placeholder="Search funds..."
              value={state.searchTerm}
              onChange={(e) => dispatch({ type: ACTIONS.SET_SEARCH, payload: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Fund Filter Buttons */}
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
            onClick={() => {exportToCSV();}}
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

        {/* Portfolio Table */}
        {!state.loading && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden shadow-xl mb-12">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    {[
                      { key: 'fund', label: 'Fund Name' },
                      { key: 'units', label: 'Units' },
                      { key: 'nav', label: 'Current NAV' },
                      { key: 'invested', label: 'Invested Amount' },
                      { key: 'marketValue', label: 'Current Value' },
                      { key: 'profitLoss', label: 'Profit/Loss' },
                      { 
                        key: returnType === 'absolute' ? 'profitLossPercent' : 'xirrPercent', 
                        label: returnType === 'absolute' ? 'Profit/Loss %' : 'XIRR %' 
                      }
                    ].map(header => (
                      <th
                        key={header.key}
                        onClick={() => handleSort(header.key)}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {header.label}
                          <SortIcon column={header.key} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((fund, index) => (
                    <tr
                      key={fund.fund}
                      className={`border-t border-gray-700 hover:bg-gray-700/30 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-white max-w-xs truncate" title={fund.fund}>
                        {fund.fund}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {fund.totalUnits.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        ₹{fund.marketValue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {formatCurrency(fund.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-semibold">
                        {formatCurrency(fund.currentValue)}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${
                        fund.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(fund.profitLoss)}
                      </td>
                      {/* In your table row mapping */}
                      <td className={`px-6 py-4 text-sm ${
                        (returnType === 'absolute' ? fund.profitLossPercent : fund.xirrPercent) >= 0 
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(returnType === 'absolute' ? fund.profitLossPercent : fund.xirrPercent) >= 0 ? (
                          <TrendingUp className="inline mr-1" size={16} />
                        ) : (
                          <TrendingDown className="inline mr-1" size={16} />
                        )}
                        {formatPercent(returnType === 'absolute' ? fund.profitLossPercent : fund.xirrPercent)}
                      </td>

                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800 border-t-2 border-blue-500">
                  {/* Total Portfolio Row */}
                  <tr className="bg-gray-800 border-t border-gray-600 font-semibold">
                    <td className="px-6 py-4 text-gray-200">Total Portfolio</td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-gray-200">{formatCurrency(totals.totalInvested)}</td>
                    <td className="px-6 py-4 text-gray-200">{formatCurrency(totals.totalCurrentValue)}</td>
                    <td className={`px-6 py-4 ${totals.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(totals.totalProfitLoss)}
                    </td>
                    <td className={`px-6 py-4 ${
                      (returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn) >= 0 
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercent(returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {!state.loading && sortedData.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No funds match your current filters</p>
          </div>
        )}

        {/* Individual Transactions Section */}
        <div className="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={24} />
              Fund Transaction Details
            </h2>
            
            {/* Fund Selection */}
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm font-medium whitespace-nowrap">Select Fund:</span>
              <select
                value={selectedFund}
                onChange={(e) => {
                  setSelectedFund(e.target.value);
                  setShowTransactions(true); // Auto-show transactions when fund is selected
                }}
                className="flex-1 lg:min-w-80 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a fund to view transactions...</option>
                {processedData.map((fund) => (
                  <option key={fund.fund} value={fund.fund}>
                    {fund.fund}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedFund && selectedFundData ? (
            <div className="space-y-6">
              {/* Fund Summary Cards - Improved Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Units */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Total Units</h4>
                  <p className="text-white text-xl font-bold">{selectedFundData.totalUnits.toFixed(2)}</p>
                </div>

                {/* Current NAV */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Current NAV</h4>
                  <p className="text-white text-xl font-bold">₹{selectedFundData.marketValue.toFixed(2)}</p>
                </div>

                {/* Investment & Value */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Invested / Current</h4>
                  <div className="flex flex-col">
                    <p className="text-white text-lg font-semibold">{formatCurrency(selectedFundData.totalAmount)}</p>
                    <p className="text-blue-400 text-lg font-semibold">{formatCurrency(selectedFundData.currentValue)}</p>
                  </div>
                </div>

                {/* P&L Combined */}
                <div className={`p-4 rounded-xl border ${
                  selectedFundData.profitLoss >= 0 
                    ? 'bg-green-900/30 border-green-600/50' 
                    : 'bg-red-900/30 border-red-600/50'
                }`}>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Profit & Loss</h4>
                  <div className="flex flex-col">
                    <p className={`text-lg font-bold ${
                      selectedFundData.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(selectedFundData.profitLoss)}
                    </p>
                    <p className={`text-sm font-semibold ${
                      selectedFundData.profitLoss >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {formatPercent(
                        returnType === 'absolute' 
                          ? selectedFundData.profitLossPercent 
                          : selectedFundData.xirrPercent
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
                      {selectedFundData.rows.length}
                    </span>
                  </h3>
                  
                  {/* Toggle Transactions Button - Improved */}
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
                        <List size={16} />
                        Hide Transactions
                      </>
                    ) : (
                      <>
                        <List size={16} />
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
                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Folio</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Type</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Units</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">NAV</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFundData.rows.map((transaction, index) => (
                            <tr key={index} className="border-b border-gray-700 hover:bg-gray-600/30">
                              <td className="py-3 px-4 text-gray-200">
                                {transaction["Date"] || Object.values(transaction)[0] || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-gray-200 text-sm">
                                {transaction["Folio Number"] || Object.values(transaction)[1] || 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase() === 'SELL'
                                    ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                    : 'bg-green-600/20 text-green-400 border border-green-600/30'
                                }`}>
                                  {transaction["Order"] || Object.values(transaction)[3] || 'BUY'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-white font-medium">
                                {parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-white font-medium">
                                ₹{parseFloat(transaction["NAV"] || Object.values(transaction)[5] || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-white font-bold">
                                {formatCurrency(parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        
                        {/* Summary Row */}
                        <tfoot>
                          <tr className="bg-gray-600/30 border-t-2 border-gray-500">
                            <td colSpan="3" className="py-3 px-4 text-white font-bold">Total for {selectedFund}</td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {selectedFundData.totalUnits.toFixed(2)}
                            </td>
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {formatCurrency(selectedFundData.totalAmount)}
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
            /* Empty State - Improved */
            <div className="text-center py-12">
              <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Fund Selected</h3>
              <p className="text-gray-400">
                Choose a fund from the dropdown above to view its detailed transaction history and performance metrics.
              </p>
            </div>
          )}
        </div>



        
      </div>
    </div>
  );
};

export default InrMutualFunds;