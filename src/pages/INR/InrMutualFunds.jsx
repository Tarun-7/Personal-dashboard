import React, { useState, useEffect, useMemo, useReducer, useRef } from 'react';
import { Eye, X, ChartNoAxesCombined, SortDesc, SortAsc, Search, TrendingUp, TrendingDown, Download, Filter, BarChart3, List, BarChart, HandCoins, PiggyBank, LineChart, ToggleLeft, ToggleRight, Percent } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import ReturnsCard from '../../components/ReturnsCard';
import SummaryCard from '../../components/SummaryCard';
import CompactFilters from '../../components/Investments/CompactFilters';
import TransactionDetails from '../../components/Investments/TransactionDetails';
import PortfolioTable from '../../components/Investments/PortfolioTable';
import PageHeader from '../../components/PageHeader';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Mutual Funds Portfolio"
          description="Track your mutual fund investments and performance"
          showEyeToggle={true}
          showBalance={true}
          onEyeToggle={() => {}} // No-op since it's disabled
          buttons={[    
            {
              label: "Export",
              icon: Download,
              onClick: exportToCSV,
              disabled: transactions.length === 0,
              variant: "success",
              title: "Export mutual funds data to CSV"
            }
          ]}
        />

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
          searchPlaceholder="Search by Fund..."
          resultLabel="Funds"
          resultLabelSingular="Fund"
        />

        {/* Loading State */}
        {state.loading && (
          <LoadingScreen />
        )}

        {/* Portfolio Table */}
        <PortfolioTable
          type="fund"
          filteredAndSortedData={filteredAndSortedData}
          totals={totals}
          loading={state.loading}
          formatCurrency={formatCurrency}
          handleSort={handleSort}
          SortIcon={SortIcon}
          returnType={returnType}
          FundBadge={FundBadge}
        />

        {/* No Results */}
        {!state.loading && filteredAndSortedData.length === 0 && processedData.fundsArray.length > 0 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No funds match your current filters</p>
          </div>
        )}

        {/* Individual Fund Transactions Section */}
        <TransactionDetails
          type="fund"
          title="Fund Transaction Details"
          selectedItem={selectedFund}
          setSelectedItem={setSelectedFund}
          selectedItemData={selectedFundData}
          filteredAndSortedData={filteredAndSortedData}
          showTransactions={showTransactions}
          setShowTransactions={setShowTransactions}
          formatCurrency={formatCurrency}
          formatPrice={formatCurrency}
          formatPercent={formatPercent}
          returnType={returnType}
          FundBadge={FundBadge}
          selectLabel="Select Fund:"
          selectPlaceholder="Choose a fund to view transactions..."
          emptyStateTitle="No Fund Selected"
          emptyStateDescription="Choose a fund from the dropdown above to view its detailed transaction history and performance metrics."
        />
      </div>
    </div>
  );
};

export default InrMutualFunds;