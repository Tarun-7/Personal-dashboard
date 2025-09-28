import React, { useState, useMemo, useReducer } from 'react';
import { X, Eye, Search, TrendingUp, TrendingDown, AlertCircle, Download, SortAsc, SortDesc, BarChart3, List, LineChart, Building2, PiggyBank, ChartNoAxesCombined, Filter, Menu } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import ReturnsCard from '../../components/ReturnsCard';
import SummaryCard from '../../components/SummaryCard';
import CompactFilters from '../../components/Investments/CompactFilters';

// Symbol Badge Component
const SymbolBadge = ({ symbol }) => {
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-sm`}>
      {symbol}
    </span>
  );
};

// Action types for reducer
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH: 'SET_SEARCH',
  SET_SORT: 'SET_SORT',
  SET_FILTER: 'SET_FILTER'
};

// Initial state
const initialState = {
  loading: false,
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

const UsdStocksDashboard = ({ 
  transactions = [], 
  usdStocksSummary = {}
}) => {
  const [state, dispatch] = useReducer(stocksReducer, initialState);
  const [selectedStock, setSelectedStock] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  const [returnType, setReturnType] = useState('absolute');

  // Use pre-calculated data from usdStocksSummary prop
  const processedData = useMemo(() => {
    const summary = usdStocksSummary || {};
    const stocksData = summary.stocksData || [];
    
    return {
      stocksData,
      stockGroups: stocksData.reduce((acc, stock) => {
        acc[stock.symbol] = stock;
        return acc;
      }, {}),
      totals: {
        totalInvested: summary.totalInvested || 0,
        totalCurrentValue: summary.totalCurrentValue || 0,
        totalProfitLoss: summary.totalProfitLoss || 0,
        absoluteReturn: summary.absoluteReturn || 0,
        xirrReturn: summary.xirrReturn || 0
      },
      stocksArray: stocksData
    };
  }, [usdStocksSummary]);

  // Filter and sort the stocks data
  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData.stocksArray || [];

    // Apply search filter
    if (state.searchTerm) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        stock.companyName.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Apply profit/loss filter
    if (state.filterBy === 'profit') {
      filtered = filtered.filter(stock => (stock.profitLoss || 0) > 0);
    } else if (state.filterBy === 'loss') {
      filtered = filtered.filter(stock => (stock.profitLoss || 0) < 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (state.sortBy) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'company':
          aValue = a.companyName;
          bValue = b.companyName;
          break;
        case 'quantity':
          aValue = a.totalQuantity;
          bValue = b.totalQuantity;
          break;
        case 'avgPrice':
          aValue = a.averageUnitPrice;
          bValue = b.averageUnitPrice;
          break;
        case 'invested':
          aValue = a.netInvestment;
          bValue = b.netInvestment;
          break;
        case 'marketValue':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case 'profitLoss':
          aValue = a.profitLoss;
          bValue = b.profitLoss;
          break;
        case 'profitLossPercent':
          aValue = returnType === 'absolute' ? a.profitLossPercent : a.xirrPercent;
          bValue = returnType === 'absolute' ? b.profitLossPercent : b.xirrPercent;
          break;
        default:
          aValue = a.currentValue;
          bValue = b.currentValue;
      }

      if (typeof aValue === 'string') {
        return state.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return state.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [processedData.stocksArray, state.searchTerm, state.filterBy, state.sortBy, state.sortDirection, returnType]);

  // Get selected stock data
  const selectedStockData = useMemo(() => {
    if (!selectedStock || !processedData.stockGroups[selectedStock]) {
      return null;
    }
    return processedData.stockGroups[selectedStock];
  }, [selectedStock, processedData.stockGroups]);

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
    const headers = ['Symbol', 'Company Name', 'Quantity', 'Net Investment', 'Market Value', 'Profit/Loss', 'P/L %'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(row => [
        row.symbol,
        `"${row.companyName}"`,
        (row.totalQuantity || 0).toFixed(4),
        (row.netInvestment || 0).toFixed(2),
        (row.currentValue || 0).toFixed(2),
        (row.profitLoss || 0).toFixed(2),
        (returnType === 'absolute' ? row.profitLossPercent : row.xirrPercent || 0).toFixed(2)
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

  const { totals } = processedData;

  // Filter transactions - only STK (stocks), no CASH
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const assetClass = txn.AssetClass;
      const symbol = txn.Symbol;
      return assetClass === 'STK' && symbol && symbol.length > 0;
    });
  }, [transactions]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                USD Stocks Portfolio
              </h1>
              <p className="text-gray-400">Track your USD equity investments and performance</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                disabled={transactions.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  transactions.length === 0
                    ? 'bg-slate-600 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-700 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl'
                }`}
                title="Export USD stocks data to CSV"
              >
                <Download size={20} />
                Export
              </button>

              <button
                // onClick={() => setShowBalance(!showBalance)}
                className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
              >
                {true ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards - Improved responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Invested Card */}
          <SummaryCard
            title="Net Investment"
            value={formatCurrency(totals.totalInvested)}
            subtitle="Total invested amount"
            icon={PiggyBank}
            statusIcon={PiggyBank}
            gradient="from-blue-500 to-cyan-600"
            textColor="text-blue-100"
            pulseIcon={true}
          />

          {/* Current Value Card */}
          <SummaryCard
            title="Market Value"
            value={formatCurrency(totals.totalCurrentValue)}
            icon={LineChart}
            subtitle="Total current value"
            statusIcon={LineChart}
            gradient="from-purple-500 to-indigo-600"
            textColor="text-purple-100"
            pulseIcon={true}
          />

          {/* Total Profit/Loss Card */}
          <SummaryCard
            title="Total P&L"
            value={formatCurrency(totals.totalProfitLoss)}
            icon={
              totals.totalProfitLoss >= 0 ? TrendingUp : TrendingDown
            }
            subtitle="Total Profit / Loss"
            statusIcon={
              totals.totalProfitLoss >= 0 ? TrendingUp : TrendingDown
            }
            gradient={totals.totalProfitLoss >= 0 ? "from-emerald-500 to-green-600" : "from-red-500 to-rose-600"}
          />

          {/* Enhanced Returns Card with Improved Toggle */}
          <div className="h-full">  
            <ReturnsCard
              returnType={returnType}
              setReturnType={setReturnType}
              totals={totals}
              formatPercent={formatPercent}
            />
          </div>
        </div>
        
        {/* Compact Filter Controls */}
        <CompactFilters
          state={state}
          dispatch={dispatch}
          ACTIONS={ACTIONS}
          filteredAndSortedData={filteredAndSortedData}
          searchPlaceholder="Search by symbol or company name..."
          resultLabel="stocks"
          resultLabelSingular="stock"
        />

        {/* Loading State */}
        {state.loading && (
          <LoadingScreen />
        )}

        {/* Portfolio Table */}
        {!state.loading && filteredAndSortedData.length > 0 && (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-2">
            <div className="max-w-7xl mx-auto">              
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <colgroup>
                      <col className="w-2/5" />
                      <col className="w-1/8" />
                      <col className="w-1/6" />
                      <col className="w-1/6" />
                      <col className="w-1/6" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-700/70 bg-slate-900/80">
                        <th
                          className="group px-6 py-5 text-left text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('company')}
                        >
                          <div className="flex items-center justify-start gap-2">
                            <span>Company</span>
                            <SortIcon columnKey="company" />
                          </div>
                        </th>
                        <th
                          className="group px-6 py-5 text-center text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span>Quantity</span>
                            <SortIcon columnKey="quantity" />
                          </div>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('invested')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <span>Net Invested</span>
                            <SortIcon columnKey="invested" />
                          </div>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('marketValue')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <span>Market Value</span>
                            <SortIcon columnKey="marketValue" />
                          </div>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('profitLoss')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            <span>Profit / Loss</span>
                            <SortIcon columnKey="profitLoss" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedData.map((stock, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-slate-700/40 hover:border-blue-500/30 hover:bg-slate-800/30 hover:-translate-y-px transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                          onClick={() => handleRowClick(stock.symbol)}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col space-y-1">
                              <div className="text-slate-200 font-semibold text-base truncate pr-2">
                                {stock.companyName}
                              </div>
                              <div className="flex items-center gap-2">
                                <SymbolBadge symbol={stock.symbol} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-center">
                              <div className="text-slate-200 font-semibold text-base">
                                {Number(stock.totalQuantity || 0).toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">shares</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-right">
                              <div className="text-slate-200 font-semibold text-base">
                                {formatCurrency(stock.netInvestment)}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {formatPrice(stock.averageUnitPrice)} avg
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-right">
                              <div className="text-slate-200 font-semibold text-base">
                                {formatCurrency(stock.currentValue)}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {formatPrice(stock.currentPrice)} price
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-2 mb-1">
                                <span className={`font-bold text-base ${
                                  (stock.profitLoss || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                                }`}>
                                  {formatCurrency(stock.profitLoss)}
                                </span>
                                {(stock.profitLoss || 0) > 0 ? (
                                  <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                ) : (stock.profitLoss || 0) < 0 ? (
                                  <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                                ) : null}
                              </div>
                              <div className={`text-xs font-semibold ${
                                (stock.profitLoss || 0) > 0
                                  ? 'text-emerald-400'
                                  : (stock.profitLoss || 0) < 0
                                  ? 'text-red-400'
                                  : 'text-slate-400'
                              }`}>
                                {((returnType === "absolute"
                                  ? stock.profitLossPercent
                                  : stock.xirrPercent) || 0
                                ).toFixed(2)}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-blue-500/30 bg-gradient-to-r from-slate-900 to-slate-800">
                        <td className="px-6 py-5">
                          <div className="text-left text-white font-bold text-lg">
                            Total Portfolio
                          </div>
                        </td>
                        <td className="px-6 py-5"></td>
                        <td className="px-6 py-5">
                          <div className="text-right text-slate-200 font-bold text-lg">
                            {formatCurrency(totals.totalInvested)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-right text-slate-200 font-bold text-lg">
                            {formatCurrency(totals.totalCurrentValue)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`text-right font-bold text-lg ${
                            totals.totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {formatCurrency(totals.totalProfitLoss)}
                          </div>
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
        {!state.loading && filteredAndSortedData.length === 0 && processedData.stocksArray.length > 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No stocks match your current filters</p>
          </div>
        )}

        {/* Individual Stock Transactions Section */}
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
                {filteredAndSortedData.map((stock, index) => (
                  <option key={index} value={stock.symbol}>
                    {stock.symbol} - {stock.companyName.length > 40 ? stock.companyName.substring(0, 40) + '...' : stock.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedStock && selectedStockData ? (
            <div className="space-y-6">
              {/* Stock Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Stock Symbol & Badge */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Stock Details</h4>
                  <p className="text-white text-xl font-bold" title={selectedStockData.companyName}>
                    {selectedStockData.companyName.length > 25 ? selectedStockData.companyName.substring(0, 25) + '...' : selectedStockData.companyName}
                  </p>
                  <div className="mb-2">
                    <SymbolBadge symbol={selectedStockData.symbol} />
                  </div>
                </div>

                {/* Holdings */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Holdings</h4>
                  <p className="text-white text-xl font-bold">{(selectedStockData.totalQuantity || 0).toFixed(4)} shares</p>
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
                  (selectedStockData.profitLoss || 0) >= 0 
                    ? 'bg-green-900/30 border-green-600/50' 
                    : 'bg-red-900/30 border-red-600/50'
                }`}>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Profit & Loss</h4>
                  <div className="flex flex-col">
                    <p className={`text-lg font-bold ${
                      (selectedStockData.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(selectedStockData.profitLoss)}
                    </p>
                    <p className={`text-sm font-semibold ${
                      (selectedStockData.profitLoss || 0) >= 0 ? 'text-green-300' : 'text-red-300'
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
                      {selectedStockData.rows ? selectedStockData.rows.length : 0}
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
                        <Menu size={16} />
                        Hide Transactions
                      </>
                    ) : (
                      <>
                        <Menu size={16} />
                        Show Transactions
                      </>
                    )}
                  </button>
                </div>

                {/* Transactions Table */}
                {showTransactions && selectedStockData.rows && selectedStockData.rows.length > 0 && (
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Symbol</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Quantity</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Trade Price</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Trade Money</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStockData.rows.map((transaction, index) => (
                            <tr key={index} className="border-b border-gray-700 hover:bg-gray-600/30">
                              <td className="py-3 px-4 text-gray-200">
                                {new Date(transaction.DateTime?.replace(';', ' ') || '').toLocaleDateString() || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-gray-200">
                                {transaction.Symbol || 'N/A'}
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
                              <td className="py-3 px-4 text-right text-white font-medium">
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
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {(selectedStockData.totalQuantity || 0).toFixed(4)}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {formatPrice(selectedStockData.averageUnitPrice)}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {formatCurrency(selectedStockData.totalAmount)}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {formatCurrency(selectedStockData.totalIbCommission)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* No Transactions Message */}
                {showTransactions && (!selectedStockData.rows || selectedStockData.rows.length === 0) && (
                  <div className="p-4 text-center py-8">
                    <div className="bg-gray-600/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <List size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-400">No transaction history available for this stock</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="bg-gray-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ChartNoAxesCombined size={32} className="text-gray-400" />
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