import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

const PortfolioTable = ({
  // Data props
  filteredAndSortedData = [],
  totals = {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0
  },
  loading = false,
  
  // Type-specific props
  type = "stock", // "stock" or "fund"
  
  // Formatting functions
  formatCurrency = (value) => `₹${value?.toFixed(2) || '0.00'}`,
  formatPrice = (value) => `₹${value?.toFixed(2) || '0.00'}`, // Default formatter
  
  // Sorting
  handleSort = () => {},
  SortIcon = () => <ArrowUpDown className="w-4 h-4 text-slate-500" />,
  
  // Display props
  returnType = "absolute",
  
  // Badge components
  SymbolBadge = ({ symbol }) => <span className="text-xs text-slate-400">{symbol}</span>, // For stocks
  FundBadge = ({ fundName }) => <span className="text-xs text-slate-400">{fundName?.substring(0, 20)}</span>, // For funds
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const isStock = type === "stock";
  const isFund = type === "fund";

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (loading || filteredAndSortedData.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full ${isStock ? 'table-fixed' : 'min-w-full'}`}>
                {isStock && (
                  <colgroup>
                    <col className="w-2/5" />
                    <col className="w-1/8" />
                    <col className="w-1/6" />
                    <col className="w-1/6" />
                    <col className="w-1/6" />
                  </colgroup>
                )}
                
                <thead>
                  <tr className="border-b border-slate-700/70 bg-slate-900/80">
                    {/* First Column - Company/Fund Name */}
                    <th
                      className="group px-3 sm:px-6 py-3 sm:py-5 text-left text-xs sm:text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                      onClick={() => handleSort(isStock ? 'company' : 'fund')}
                    >
                      <div className="flex items-center justify-start gap-2">
                        <span>{isStock ? 'Company' : 'Fund Name'}</span>
                        <SortIcon columnKey={isStock ? 'company' : 'fund'} />
                      </div>
                    </th>

                    {/* Second Column - Quantity */}
                    <th
                      className={`group px-3 sm:px-6 py-3 sm:py-5 text-xs sm:text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200 ${
                        isStock ? 'text-center' : 'text-right'
                      }`}
                      onClick={() => handleSort(isStock ? 'quantity' : 'units')}
                    >
                      <div className={`flex items-center gap-2 ${
                        isStock ? 'justify-center' : 'justify-end'
                      }`}>
                        <span>Quantity</span>
                        <SortIcon columnKey={isStock ? 'quantity' : 'units'} />
                      </div>
                    </th>

                    {/* Third Column - Net Invested */}
                    <th
                      className="group px-3 sm:px-6 py-3 sm:py-5 text-right text-xs sm:text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                      onClick={() => handleSort('invested')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <span>Net Invested</span>
                        <SortIcon columnKey="invested" />
                      </div>
                    </th>

                    {/* Fourth Column - Market Value */}
                    <th
                      className="group px-3 sm:px-6 py-3 sm:py-5 text-right text-xs sm:text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
                      onClick={() => handleSort('marketValue')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <span>Market Value</span>
                        <SortIcon columnKey="marketValue" />
                      </div>
                    </th>

                    {/* Fifth Column - Profit/Loss */}
                    <th
                      className="group px-3 sm:px-6 py-3 sm:py-5 text-right text-xs sm:text-sm font-semibold text-slate-300 cursor-pointer select-none hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200"
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
                  {filteredAndSortedData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-slate-700/40 hover:border-blue-500/30 hover:bg-slate-800/30 hover:-translate-y-px transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 ${
                        isStock ? 'cursor-pointer' : ''
                      }`}
                    >
                      {/* First Column - Name & Badge */}
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        {isStock ? (
                          <div className="flex flex-col space-y-1">
                            <div className="text-slate-200 font-semibold text-sm sm:text-base truncate pr-2">
                              {item.companyName}
                            </div>
                            <div className="flex items-center gap-2">
                              <SymbolBadge symbol={item.symbol} />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-white text-sm sm:text-base mb-1">
                              {item.fund.length > 50 ? item.fund.substring(0, 50) + '...' : item.fund}
                            </div>
                            <div className="mt-2">
                              <FundBadge fundName={item.fund} />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Second Column - Quantity */}
                      <td className={`px-3 sm:px-6 py-3 sm:py-5 ${isStock ? 'text-center' : 'text-right'}`}>
                        <div className={isStock ? 'text-center' : ''}>
                          <div className="text-slate-200 font-semibold text-sm sm:text-base">
                            {Number(isStock ? (item.totalQuantity || 0) : (item.totalUnits || 0)).toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {isStock ? 'shares' : 'units'}
                          </div>
                        </div>
                      </td>

                      {/* Third Column - Net Invested */}
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-right">
                        <div>
                          <div className="text-slate-200 font-semibold text-sm sm:text-base">
                            {formatCurrency(isStock ? item.netInvestment : item.totalAmount)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            {isStock 
                              ? `${formatPrice(item.averageUnitPrice)} avg`
                              : `₹${((item.avgNav || 0)).toFixed(2)} avg`
                            }
                          </div>
                        </div>
                      </td>

                      {/* Fourth Column - Market Value */}
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-right">
                        <div>
                          <div className="text-slate-200 font-semibold text-sm sm:text-base">
                            {formatCurrency(item.currentValue)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            {isStock
                              ? `${formatPrice(item.currentPrice)} price`
                              : `₹${((item.marketValue || 0)).toFixed(2)} NAV`
                            }
                          </div>
                        </div>
                      </td>

                      {/* Fifth Column - Profit/Loss */}
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-right">
                        <div>
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className={`font-bold text-sm sm:text-base ${
                              (item.profitLoss || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}>
                              {formatCurrency(item.profitLoss)}
                            </span>
                            {(item.profitLoss || 0) > 0 ? (
                              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0 ${
                                isFund ? 'hover:scale-110 transition-transform duration-200' : ''
                              }`} />
                            ) : (item.profitLoss || 0) < 0 ? (
                              <TrendingDown className={`w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 ${
                                isFund ? 'hover:scale-110 transition-transform duration-200' : ''
                              }`} />
                            ) : null}
                          </div>
                          <div className={`text-xs font-semibold ${
                            (item.profitLoss || 0) > 0
                              ? 'text-emerald-400'
                              : (item.profitLoss || 0) < 0
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}>
                            {((returnType === "absolute"
                              ? item.profitLossPercent
                              : item.xirrPercent) || 0
                            ).toFixed(2)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Footer with totals */}
                <tfoot>
                  <tr className="border-t-2 border-blue-500/30 bg-gradient-to-r from-slate-900 to-slate-800">
                    <td className="px-3 sm:px-6 py-3 sm:py-5">
                      <div className="text-left text-white font-bold text-base sm:text-lg">
                        Total Portfolio
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5"></td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5">
                      <div className="text-right text-slate-200 font-bold text-base sm:text-lg">
                        {formatCurrency(totals.totalInvested)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5">
                      <div className="text-right text-slate-200 font-bold text-base sm:text-lg">
                        {formatCurrency(totals.totalCurrentValue)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5">
                      <div className={`text-right font-bold text-base sm:text-lg ${
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

        {/* Mobile View - Card Layout */}
        <div className="md:hidden space-y-3">
          {filteredAndSortedData.map((item, index) => {
            const profitLoss = item.profitLoss || 0;
            const returnPercent = returnType === "absolute" 
              ? item.profitLossPercent 
              : item.xirrPercent;
            const isExpanded = expandedRows.has(index);

            return (
              <div
                key={index}
                className="bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-lg overflow-hidden"
              >
                {/* Collapsed View - Main Info */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleRow(index)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-white font-bold text-base truncate">
                        {isStock ? item.companyName : (item.fund.length > 35 ? `${item.fund.substring(0, 35)}...` : item.fund)}
                      </h3>
                      <div className="mt-1">
                        {isStock ? (
                          <SymbolBadge symbol={item.symbol} />
                        ) : (
                          <FundBadge fundName={item.fund} />
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {profitLoss > 0 ? (
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      ) : profitLoss < 0 ? (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      ) : null}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Market Value</div>
                      <div className="text-slate-200 font-bold text-base">
                        {formatCurrency(item.currentValue)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">Profit/Loss</div>
                      <div className={`font-bold text-base ${
                        profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {formatCurrency(profitLoss)}
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${
                        profitLoss > 0 ? 'text-emerald-400' : profitLoss < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {(returnPercent || 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded View - Additional Details */}
                {isExpanded && (
                  <div className="border-t border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Quantity</div>
                        <div className="text-slate-200 font-semibold">
                          {Number(isStock ? (item.totalQuantity || 0) : (item.totalUnits || 0)).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {isStock ? 'shares' : 'units'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">Net Invested</div>
                        <div className="text-slate-200 font-semibold">
                          {formatCurrency(isStock ? item.netInvestment : item.totalAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/30">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          {isStock ? 'Avg. Price' : 'Avg. NAV'}
                        </div>
                        <div className="text-slate-300 text-sm font-medium">
                          {isStock 
                            ? formatPrice(item.averageUnitPrice)
                            : `₹${(item.avgNav || 0).toFixed(2)}`
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-1">
                          {isStock ? 'Current Price' : 'Current NAV'}
                        </div>
                        <div className="text-slate-300 text-sm font-medium">
                          {isStock
                            ? formatPrice(item.currentPrice)
                            : `₹${(item.marketValue || 0).toFixed(2)}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Mobile Footer Summary */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border-2 border-blue-500/30 p-4 mt-4">
            <div className="text-white font-bold text-base mb-3">Total Portfolio</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Total Invested</div>
                <div className="text-slate-200 font-bold text-base">
                  {formatCurrency(totals.totalInvested)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">Market Value</div>
                <div className="text-slate-200 font-bold text-base">
                  {formatCurrency(totals.totalCurrentValue)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Total Profit/Loss</div>
              <div className={`font-bold text-lg ${
                totals.totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {formatCurrency(totals.totalProfitLoss)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTable;