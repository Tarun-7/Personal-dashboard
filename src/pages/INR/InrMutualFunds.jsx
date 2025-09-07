import React, { useState, useEffect, useMemo, useReducer, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, AlertCircle, Loader2, Download, Filter, SortAsc, SortDesc, BarChart3, List, ChartNoAxesCombined, HandCoins, Building2, PiggyBank, LineChart } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

// Fund Badge Component
const FundBadge = ({ fundName }) => {
  const getBadgeInfo = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('large') || lowerName.includes('nifty')) return { text: 'Large Cap', color: 'from-blue-500 to-blue-600' };
    if (lowerName.includes('mid')) return { text: 'Mid Cap', color: 'from-green-500 to-green-600' };
    if (lowerName.includes('small')) return { text: 'Small Cap', color: 'from-orange-500 to-orange-600' };
    if (lowerName.includes('hybrid')) return { text: 'Hybrid', color: 'from-purple-500 to-purple-600' };
    if (lowerName.includes('debt') || lowerName.includes('bond')) return { text: 'Debt', color: 'from-gray-500 to-gray-600' };
    if (lowerName.includes('equity')) return { text: 'Equity', color: 'from-emerald-500 to-emerald-600' };
    return { text: 'Fund', color: 'from-indigo-500 to-indigo-600' };
  };

  const { text, color } = getBadgeInfo(fundName);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r ${color} text-white text-xs font-semibold shadow-sm`}>
      {text}
    </span>
  );
};

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
  loading: false,
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

const InrMutualFunds = ({ transactions = [], mutualFundSummary = {} }) => {
  const [state, dispatch] = useReducer(transactionsReducer, initialState);
  const [selectedFund, setSelectedFund] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  const [returnType, setReturnType] = useState('xirr');
  
  // Refs for optimization
  const prevTotalMarketValue = useRef(null);

  // Use pre-calculated data from mutualFundSummary
  const processedData = useMemo(() => {
    const summary = mutualFundSummary || {};
    const fundsData = summary.fundsData || [];
    
    return {
      fundGroups: fundsData.reduce((acc, fund) => {
        acc[fund.fund] = fund;
        return acc;
      }, {}),
      totals: {
        totalInvested: summary.totalInvested || 0,
        totalCurrentValue: summary.totalCurrentValue || 0,
        totalProfitLoss: summary.totalProfitLoss || 0,
        absoluteReturn: summary.absoluteReturn || 0,
        xirrReturn: summary.xirrReturn || 0
      },
      fundsArray: fundsData
    };
  }, [mutualFundSummary]);

  // Filter and sort the funds data
  const filteredAndSortedData = useMemo(() => {
    let filtered = processedData.fundsArray || [];

    // Apply search filter
    if (state.searchTerm) {
      filtered = filtered.filter(fund =>
        fund.fund.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Apply profit/loss filter
    if (state.filterBy === 'profit') {
      filtered = filtered.filter(fund => (fund.profitLoss || 0) > 0);
    } else if (state.filterBy === 'loss') {
      filtered = filtered.filter(fund => (fund.profitLoss || 0) < 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (state.sortBy) {
        case 'fund':
          aValue = a.fund;
          bValue = b.fund;
          break;
        case 'units':
          aValue = a.totalUnits;
          bValue = b.totalUnits;
          break;
        case 'invested':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
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
  }, [processedData.fundsArray, state.searchTerm, state.filterBy, state.sortBy, state.sortDirection, returnType]);

  // Get selected fund data
  const selectedFundData = useMemo(() => {
    if (!selectedFund || !processedData.fundGroups[selectedFund]) {
      return null;
    }
    return processedData.fundGroups[selectedFund];
  }, [selectedFund, processedData.fundGroups]);

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
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
    const headers = ['Fund Name', 'Units', 'Net Investment', 'Market Value', 'Profit/Loss', 'P/L %'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(row => [
        `"${row.fund}"`,
        (row.totalUnits || 0).toFixed(4),
        (row.totalAmount || 0).toFixed(2),
        (row.currentValue || 0).toFixed(2),
        (row.profitLoss || 0).toFixed(2),
        (returnType === 'absolute' ? row.profitLossPercent : row.xirrPercent || 0).toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inr_mutual_funds_portfolio_summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { totals } = processedData;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center max-w-md shadow-2xl">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <HandCoins className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No Mutual Fund Transactions Found</h2>
          <p className="text-gray-400 leading-relaxed">
            Upload your Kuvera mutual fund transactions CSV file to view your portfolio summary.
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            INR Mutual Funds Portfolio Dashboard
          </h1>
          <p className="text-gray-400">Track your mutual fund investments and performance</p>
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
              placeholder="Search funds..."
              value={state.searchTerm}
              onChange={(e) => dispatch({ type: ACTIONS.SET_SEARCH, payload: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Fund Filter Buttons */}
          <div className="flex bg-slate-900/60 rounded-lg p-1 border border-gray-600">
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
          <div className="flex bg-slate-900/60 rounded-lg p-1 border border-gray-600">
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

        {/* Portfolio Table */}
        {!state.loading && filteredAndSortedData.length > 0 && (
          <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
            <div className="max-w-7xl mx-auto">              
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-700/70 bg-slate-900/80">
                        <th
                          className="group px-6 py-5 text-left text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('fund')}
                        >
                          <span className="inline-flex items-center">
                            Fund Name
                            <SortIcon columnKey="fund" />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('units')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Units
                            <SortIcon columnKey="units" />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('invested')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Net Invested
                            <SortIcon columnKey="invested" />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('marketValue')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Market Value
                            <SortIcon columnKey="marketValue" />
                          </span>
                        </th>
                        <th
                          className="group px-6 py-5 text-right text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                          onClick={() => handleSort('profitLoss')}
                        >
                          <span className="inline-flex items-center justify-end w-full">
                            Profit / Loss
                            <SortIcon columnKey="profitLoss" />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedData.map((fund, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-slate-700/40 hover:border-blue-500/30 hover:bg-slate-800/30 hover:-translate-y-px transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                        >
                          <td className="px-6 py-5">
                            <div className="font-semibold text-white text-base mb-1">
                              {fund.fund.length > 50 ? fund.fund.substring(0, 50) + '...' : fund.fund}
                            </div>
                            <div className="mt-2">
                              <FundBadge fundName={fund.fund} />
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-slate-200 font-semibold text-base">
                              {Number(fund.totalUnits || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-slate-200 font-semibold text-base">
                              {formatCurrency(fund.totalAmount)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              ₹{((fund.avgNav || 0)).toFixed(2)} avg
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="text-slate-200 font-semibold text-base">
                              {formatCurrency(fund.currentValue)}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              ₹{((fund.marketValue || 0)).toFixed(2)} NAV
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <span className={`font-bold text-base ${
                                (fund.profitLoss || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}>
                                {formatCurrency(fund.profitLoss)}
                              </span>
                              {(fund.profitLoss || 0) > 0 ? (
                                <TrendingUp className="w-5 h-5 text-emerald-400 hover:scale-110 transition-transform duration-200" />
                              ) : (fund.profitLoss || 0) < 0 ? (
                                <TrendingDown className="w-5 h-5 text-red-400 hover:scale-110 transition-transform duration-200" />
                              ) : null}
                            </div>
                            <div className={`text-xs mt-1 font-semibold ${
                              (fund.profitLoss || 0) > 0
                                ? 'text-emerald-400'
                                : (fund.profitLoss || 0) < 0
                                ? 'text-red-400'
                                : 'text-slate-400'
                            }`}>
                              {((returnType === "absolute"
                                ? fund.profitLossPercent
                                : fund.xirrPercent) || 0
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
        {!state.loading && filteredAndSortedData.length === 0 && processedData.fundsArray.length > 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No funds match your current filters</p>
          </div>
        )}

        {/* Individual Fund Transactions Section */}
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
                  setShowTransactions(true);
                }}
                className="flex-1 lg:min-w-80 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Choose a fund to view transactions...</option>
                {filteredAndSortedData.map((fund, index) => (
                  <option key={index} value={fund.fund}>
                    {fund.fund.length > 60 ? fund.fund.substring(0, 60) + '...' : fund.fund}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedFund && selectedFundData ? (
            <div className="space-y-6">
              {/* Fund Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Fund Name & Badge */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Fund Details</h4>
                  <div className="mb-2">
                    <FundBadge fundName={selectedFundData.fund} />
                  </div>
                  <p className="text-gray-300 text-sm truncate" title={selectedFundData.fund}>
                    {selectedFundData.fund.length > 25 ? selectedFundData.fund.substring(0, 25) + '...' : selectedFundData.fund}
                  </p>
                </div>

                {/* Holdings */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Holdings</h4>
                  <p className="text-white text-xl font-bold">{(selectedFundData.totalUnits || 0).toFixed(4)} units</p>
                  <p className="text-gray-300 text-sm">Avg: ₹{((selectedFundData.avgNav || 0)).toFixed(2)}</p>
                </div>

                {/* Investment Info */}
                <div className="bg-gray-700 p-4 rounded-xl border border-gray-600">
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Investment / Market</h4>
                  <div className="flex flex-col">
                    <p className="text-white text-lg font-semibold">{formatCurrency(selectedFundData.totalAmount)}</p>
                    <p className="text-blue-400 text-lg font-semibold">{formatCurrency(selectedFundData.currentValue)}</p>
                  </div>
                </div>

                {/* P&L Combined */}
                <div className={`p-4 rounded-xl border ${
                  (selectedFundData.profitLoss || 0) >= 0 
                    ? 'bg-green-900/30 border-green-600/50' 
                    : 'bg-red-900/30 border-red-600/50'
                }`}>
                  <h4 className="text-gray-400 text-sm font-medium mb-1">Profit & Loss</h4>
                  <div className="flex flex-col">
                    <p className={`text-lg font-bold ${
                      (selectedFundData.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(selectedFundData.profitLoss)}
                    </p>
                    <p className={`text-sm font-semibold ${
                      (selectedFundData.profitLoss || 0) >= 0 ? 'text-green-300' : 'text-red-300'
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
                      {selectedFundData.transactions ? selectedFundData.transactions.length : 0}
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
                {showTransactions && selectedFundData.transactions && selectedFundData.transactions.length > 0 && (
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
                          {selectedFundData.transactions.map((transaction, index) => (
                            <tr key={index} className="border-b border-gray-700 hover:bg-gray-600/30">
                              <td className="py-3 px-4 text-gray-200">
                                {transaction["Date"] || Object.values(transaction)[0] || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-gray-200">
                                {transaction["Folio Number"] || Object.values(transaction)[1] || 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  ((transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase() === 'BUY' || 
                                   (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase() === 'PURCHASE')
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {transaction["Order"] || Object.values(transaction)[3] || 'BUY'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-white font-medium">
                                <span className={`${parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                  {parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0).toFixed(4)}
                                </span>
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
                            <td className="py-3 px-4 text-white font-bold">
                              Total for {selectedFundData.fund.length > 20 ? selectedFundData.fund.substring(0, 20) + '...' : selectedFundData.fund}
                            </td>
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4"></td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {(selectedFundData.totalUnits || 0).toFixed(4)}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              ₹{((selectedFundData.avgNav || 0)).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right text-white font-bold">
                              {formatCurrency(selectedFundData.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* No Transactions Message */}
                {showTransactions && (!selectedFundData.transactions || selectedFundData.transactions.length === 0) && (
                  <div className="p-4 text-center py-8">
                    <div className="bg-gray-600/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <List size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-400">No transaction history available for this fund</p>
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