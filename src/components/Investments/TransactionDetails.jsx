import React, { useState } from 'react';
import { BarChart3, Menu, List, ChevronDown, ChevronUp } from 'lucide-react';

const TransactionDetails = ({
  title = "Transaction Details",
  selectedItem,
  setSelectedItem,
  selectedItemData,
  filteredAndSortedData = [],
  showTransactions,
  setShowTransactions,
  formatCurrency = (value) => `₹${value?.toFixed(2) || '0.00'}`,
  formatPrice = (value) => `₹${value?.toFixed(2) || '0.00'}`,
  formatPercent = (value) => `${value?.toFixed(2) || '0.00'}%`,
  returnType = "absolute",
  type = "stock",
  SymbolBadge = ({ symbol }) => <span className="text-xs text-slate-400">{symbol}</span>,
  FundBadge = ({ fundName }) => <span className="text-xs text-slate-400">{fundName?.substring(0, 20)}</span>,
  selectLabel = "Select Item:",
  selectPlaceholder = "Choose an item to view transactions...",
  emptyStateTitle = "No Item Selected",
  emptyStateDescription = "Choose an item from the dropdown above to view its detailed transaction history."
}) => {
  const [expandedTransactions, setExpandedTransactions] = useState(new Set());
  const isStock = type === "stock";

  const toggleTransaction = (index) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTransactions(newExpanded);
  };

  const getDisplayName = (item) => {
    if (isStock) {
      return item.companyName?.length > 40 ? item.companyName.substring(0, 40) + '...' : item.companyName;
    }
    return item.fund?.length > 60 ? item.fund.substring(0, 60) + '...' : item.fund;
  };

  const getSelectValue = (item) => isStock ? item.symbol : item.fund;
  const getItemName = (data) => isStock ? data.symbol : data.fund;
  
  const getHoldingsData = (data) => {
    if (isStock) {
      return {
        amount: (data.totalQuantity || 0).toFixed(4),
        unit: "shares",
        avgPrice: formatPrice(data.averageUnitPrice)
      };
    }
    return {
      amount: (data.totalUnits || 0).toFixed(4),
      unit: "units", 
      avgPrice: `₹${((data.avgNav || 0)).toFixed(2)}`
    };
  };

  const getTransactions = (data) => isStock ? data.rows : data.transactions;

  return (
    <div className="mt-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 rounded-2xl p-3 sm:p-6 border border-slate-700/50">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={20} className="sm:w-6 sm:h-6" />
          {title}
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-slate-300 text-sm font-medium whitespace-nowrap">{selectLabel}</span>
          <select
            value={selectedItem}
            onChange={(e) => {
              setSelectedItem(e.target.value);
              setShowTransactions(true);
            }}
            className="flex-1 sm:min-w-60 lg:min-w-80 px-3 sm:px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="">{selectPlaceholder}</option>
            {filteredAndSortedData.map((item, index) => (
              <option key={index} value={getSelectValue(item)}>
                {isStock ? `${item.symbol} - ${getDisplayName(item)}` : getDisplayName(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedItem && selectedItemData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-800/60 backdrop-blur-xl p-3 sm:p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-slate-400 text-sm font-medium mb-1">
                {isStock ? "Stock" : "Fund"}
              </h4>
              <p className="text-white text-lg font-bold mb-2">
                {isStock ? selectedItemData.companyName : selectedItemData.fund?.substring(0, 25)}
              </p>
              {isStock ? (
                <SymbolBadge symbol={selectedItemData.symbol} />
              ) : (
                <FundBadge fundName={selectedItemData.fund} />
              )}
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl p-3 sm:p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-slate-400 text-sm font-medium mb-1">Holdings</h4>
              <p className="text-white text-lg font-bold">
                {getHoldingsData(selectedItemData).amount} {getHoldingsData(selectedItemData).unit}
              </p>
              <p className="text-slate-300 text-sm">Avg: {getHoldingsData(selectedItemData).avgPrice}</p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-xl p-3 sm:p-4 rounded-xl border border-slate-700/50">
              <h4 className="text-slate-400 text-sm font-medium mb-1">Investment / Market</h4>
              <p className="text-white text-base font-semibold">
                {formatCurrency(isStock ? selectedItemData.netInvestment : selectedItemData.totalAmount)}
              </p>
              <p className="text-blue-400 text-base font-semibold">
                {formatCurrency(selectedItemData.currentValue)}
              </p>
            </div>

            <div className={`p-3 sm:p-4 rounded-xl border backdrop-blur-xl ${
              (selectedItemData.profitLoss || 0) >= 0 
                ? 'bg-emerald-900/30 border-emerald-600/50' 
                : 'bg-red-900/30 border-red-600/50'
            }`}>
              <h4 className="text-slate-400 text-sm font-medium mb-1">Profit & Loss</h4>
              <p className={`text-base font-bold ${
                (selectedItemData.profitLoss || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatCurrency(selectedItemData.profitLoss)}
              </p>
              <p className={`text-sm font-semibold ${
                (selectedItemData.profitLoss || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {formatPercent(returnType === 'absolute' ? selectedItemData.profitLossPercent : selectedItemData.xirrPercent)}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                Transaction History
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getTransactions(selectedItemData)?.length || 0}
                </span>
              </h3>
              
              <button
                onClick={() => setShowTransactions(!showTransactions)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                  showTransactions ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Menu size={16} />
                {showTransactions ? 'Hide' : 'Show'} Transactions
              </button>
            </div>

            {showTransactions && getTransactions(selectedItemData)?.length > 0 ? (
              <>
                <div className="hidden md:block p-3 sm:p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          {isStock ? (
                            <>
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Date</th>
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Symbol</th>
                              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Quantity</th>
                              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Trade Price</th>
                              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Trade Money</th>
                              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Commission</th>
                            </>
                          ) : (
                            <>
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Date</th>
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Folio</th>
                              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Type</th>
                              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Units</th>
                              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">NAV</th>
                              <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-slate-300 font-semibold text-sm">Amount</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {getTransactions(selectedItemData).map((transaction, index) => (
                          <tr key={index} className="border-b border-slate-700/40 hover:bg-slate-800/30">
                            {isStock ? (
                              <>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-200 text-sm">
                                  {new Date(transaction.DateTime?.replace(';', ' ') || '').toLocaleDateString() || 'N/A'}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-200 text-sm">
                                  {transaction.Symbol || 'N/A'}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-medium text-sm">
                                  <span className={parseFloat(transaction.Quantity || 0) < 0 ? 'text-red-400' : 'text-emerald-400'}>
                                    {parseFloat(transaction.Quantity || 0).toFixed(4)}
                                  </span>
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-medium text-sm">
                                  {formatPrice(parseFloat(transaction.TradePrice || 0))}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                  {formatCurrency(parseFloat(transaction.TradeMoney || 0))}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-medium text-sm">
                                  {formatCurrency(parseFloat(transaction.IBCommission || 0))}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-200 text-sm">
                                  {transaction["Date"] || Object.values(transaction)[0] || 'N/A'}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-200 text-sm">
                                  {transaction["Folio Number"] || Object.values(transaction)[1] || 'N/A'}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    ((transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase() === 'BUY' || 
                                     (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase() === 'PURCHASE')
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    {transaction["Order"] || Object.values(transaction)[3] || 'BUY'}
                                  </span>
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-medium text-sm">
                                  <span className={parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0) < 0 ? 'text-red-400' : 'text-emerald-400'}>
                                    {parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0).toFixed(4)}
                                  </span>
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-medium text-sm">
                                  ₹{parseFloat(transaction["NAV"] || Object.values(transaction)[5] || 0).toFixed(2)}
                                </td>
                                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                  {formatCurrency(parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0))}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-700/30 border-t-2 border-slate-600">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-white font-bold text-sm">
                            Total for {getItemName(selectedItemData).length > 15 ? 
                              getItemName(selectedItemData).substring(0, 15) + '...' : 
                              getItemName(selectedItemData)}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4"></td>
                          {isStock ? (
                            <>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                {(selectedItemData.totalQuantity || 0).toFixed(4)}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                {formatPrice(selectedItemData.averageUnitPrice)}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                {formatCurrency(selectedItemData.totalAmount)}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                {formatCurrency(selectedItemData.totalIbCommission || 0)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 sm:py-3 px-2 sm:px-4"></td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                {(selectedItemData.totalUnits || 0).toFixed(4)}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                ₹{((selectedItemData.avgNav || 0)).toFixed(2)}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-bold text-sm">
                                {formatCurrency(selectedItemData.totalAmount)}
                              </td>
                            </>
                          )}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="md:hidden p-3 space-y-2">
                  {getTransactions(selectedItemData).map((transaction, index) => {
                    const isExpanded = expandedTransactions.has(index);
                    return (
                      <div key={index} className="bg-slate-700/40 rounded-lg border border-slate-600/50 overflow-hidden">
                        <div className="p-3 cursor-pointer" onClick={() => toggleTransaction(index)}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-white font-semibold text-sm">
                                {isStock 
                                  ? new Date(transaction.DateTime?.replace(';', ' ') || '').toLocaleDateString()
                                  : transaction["Date"] || 'N/A'
                                }
                              </div>
                              {isStock ? (
                                <div className="text-slate-400 text-xs mt-0.5">{transaction.Symbol}</div>
                              ) : (
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                                  (transaction["Order"] || 'BUY').toUpperCase().includes('BUY') || (transaction["Order"] || 'BUY').toUpperCase().includes('PURCHASE')
                                    ? 'bg-emerald-500/20 text-emerald-400' 
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {transaction["Order"] || 'BUY'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${
                                parseFloat(isStock ? transaction.Quantity : transaction["Units"] || 0) < 0 
                                  ? 'text-red-400' 
                                  : 'text-emerald-400'
                              }`}>
                                {parseFloat(isStock ? transaction.Quantity : transaction["Units"] || 0).toFixed(2)}
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-slate-500">Amount</div>
                              <div className="text-slate-200 font-semibold text-sm">
                                {isStock 
                                  ? formatCurrency(parseFloat(transaction.TradeMoney || 0))
                                  : formatCurrency(parseFloat(transaction["Amount (INR)"] || 0))
                                }
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">{isStock ? 'Price' : 'NAV'}</div>
                              <div className="text-slate-200 font-semibold text-sm">
                                {isStock 
                                  ? formatPrice(parseFloat(transaction.TradePrice || 0))
                                  : `₹${parseFloat(transaction["NAV"] || 0).toFixed(2)}`
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-slate-600/50 bg-slate-800/50 p-3 space-y-2">
                            {isStock ? (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Full Quantity:</span>
                                  <span className="text-slate-200 font-medium">
                                    {parseFloat(transaction.Quantity || 0).toFixed(4)} shares
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Commission:</span>
                                  <span className="text-slate-200 font-medium">
                                    {formatCurrency(parseFloat(transaction.IBCommission || 0))}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Folio:</span>
                                  <span className="text-slate-200 font-medium">{transaction["Folio Number"] || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Full Units:</span>
                                  <span className="text-slate-200 font-medium">
                                    {parseFloat(transaction["Units"] || 0).toFixed(4)} units
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="bg-slate-700/60 rounded-lg border border-blue-500/30 p-3 mt-3">
                    <div className="text-white font-bold text-sm mb-2">Total for {getItemName(selectedItemData)}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-slate-400">{isStock ? 'Shares' : 'Units'}</div>
                        <div className="text-slate-200 font-bold">
                          {isStock ? (selectedItemData.totalQuantity || 0).toFixed(4) : (selectedItemData.totalUnits || 0).toFixed(4)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Total Amount</div>
                        <div className="text-slate-200 font-bold">{formatCurrency(selectedItemData.totalAmount)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : showTransactions ? (
              <div className="p-4 text-center py-8">
                <div className="bg-slate-700/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <List size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-400">No transactions available</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-slate-700/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">{emptyStateTitle}</h3>
          <p className="text-slate-400">{emptyStateDescription}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;