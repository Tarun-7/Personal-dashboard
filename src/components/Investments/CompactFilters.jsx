import React from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';

const CompactFilters = ({
  state,
  dispatch,
  ACTIONS,
  filteredAndSortedData,
  searchPlaceholder = "Search by symbol or company name...",
  resultLabel = "stocks", // or "Funds"
  resultLabelSingular = "stock" // or "Fund"
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900/40 to-slate-800/40 backdrop-blur-xl rounded-2xl p-3 sm:p-5 mb-8 border border-slate-700/50 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
        
        {/* Search Section */}
        <div className="flex-1 min-w-0">
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={state.searchTerm}
              onChange={(e) => dispatch({ type: ACTIONS.SET_SEARCH, payload: e.target.value })}
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm backdrop-blur-sm"
            />
            {state.searchTerm && (
              <button
                onClick={() => dispatch({ type: ACTIONS.SET_SEARCH, payload: '' })}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded-full transition-all duration-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          
          {/* Filter Buttons */}
          <div className="flex bg-slate-800/60 backdrop-blur-sm rounded-xl p-1.5 border border-slate-600/30 shadow-inner">
            <button
              onClick={() => dispatch({ type: ACTIONS.SET_FILTER, payload: 'all' })}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                state.filterBy === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                state.filterBy === 'all' ? 'bg-white/80' : 'bg-slate-500'
              }`}></div>
              All Stocks
              {state.filterBy === 'all' && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 animate-pulse"></div>
              )}
            </button>
            
            <button
              onClick={() => dispatch({ type: ACTIONS.SET_FILTER, payload: 'profit' })}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                state.filterBy === 'profit'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 transform scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp size={14} className={state.filterBy === 'profit' ? 'text-white' : 'text-emerald-400'} />
              Profitable
              {state.filterBy === 'profit' && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-600/20 animate-pulse"></div>
              )}
            </button>
            
            <button
              onClick={() => dispatch({ type: ACTIONS.SET_FILTER, payload: 'loss' })}
              className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                state.filterBy === 'loss'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 transform scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingDown size={14} className={state.filterBy === 'loss' ? 'text-white' : 'text-red-400'} />
              Loss Making
              {state.filterBy === 'loss' && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/20 to-rose-600/20 animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-sm text-slate-400 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-600/30">
          <span className="font-medium text-slate-300">{filteredAndSortedData.length}</span> 
          <span className="ml-1">
            {filteredAndSortedData.length === 1 ? resultLabelSingular : resultLabel}
          </span>
        </div>

      </div>

      {/* Active Filters Indicator */}
      {(state.searchTerm || state.filterBy !== 'all') && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/30">
          <span className="text-xs text-slate-400 font-medium flex-shrink-0">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {state.searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/30">
                <Search size={12} />
                <span className="truncate max-w-20 sm:max-w-none">"{state.searchTerm}"</span>
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_SEARCH, payload: '' })}
                  className="ml-1 hover:bg-blue-500/30 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {state.filterBy !== 'all' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                state.filterBy === 'profit' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                {state.filterBy === 'profit' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="whitespace-nowrap">{state.filterBy === 'profit' ? 'Profitable only' : 'Loss making only'}</span>
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_FILTER, payload: 'all' })}
                  className="ml-1 hover:bg-white/10 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
          
          {/* Clear All Filters */}
          <button
            onClick={() => {
              dispatch({ type: ACTIONS.SET_SEARCH, payload: '' });
              dispatch({ type: ACTIONS.SET_FILTER, payload: 'all' });
            }}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors sm:ml-auto self-start sm:self-auto"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default CompactFilters;