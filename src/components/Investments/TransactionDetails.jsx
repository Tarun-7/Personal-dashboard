import React from 'react';
import { BarChart3, Menu, TrendingDown, TrendingUp, List, ChartNoAxesCombined } from 'lucide-react';

const TransactionDetails = ({
  // Common props
  title = "Transaction Details",
  selectedItem,
  setSelectedItem,
  selectedItemData,
  filteredAndSortedData,
  showTransactions,
  setShowTransactions,
  formatCurrency,
  formatPrice,
  formatPercent,
  returnType,
  
  // Type-specific props
  type = "stock", // "stock" or "fund"
  
  // Stock-specific props (when type="stock")
  SymbolBadge,
  
  // Fund-specific props (when type="fund")
  FundBadge,
  
  // Customization
  selectLabel = "Select Item:",
  selectPlaceholder = "Choose an item to view transactions...",
  emptyStateTitle = "No Item Selected",
  emptyStateDescription = "Choose an item from the dropdown above to view its detailed transaction history and performance metrics."
}) => {
  
  const isStock = type === "stock";
  const isFund = type === "fund";

  // Dynamic field mappings based on type
  const getDisplayName = (item) => {
    if (isStock) {
      return item.companyName?.length > 40 
        ? item.companyName.substring(0, 40) + '...' 
        : item.companyName;
    }
    return item.fund?.length > 60 
      ? item.fund.substring(0, 60) + '...' 
      : item.fund;
  };

  const getSelectValue = (item) => isStock ? item.symbol : item.fund;
  const getItemName = (data) => isStock ? data.symbol : data.fund;
  const getItemDisplayName = (data) => {
    if (isStock) {
      return data.companyName?.length > 25 
        ? data.companyName.substring(0, 25) + '...' 
        : data.companyName;
    }
    return data.fund?.length > 25 
      ? data.fund.substring(0, 25) + '...' 
      : data.fund;
  };

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

  const getInvestmentData = (data) => {
    if (isStock) {
      return {
        invested: formatCurrency(data.netInvestment),
        current: formatCurrency(data.currentValue)
      };
    }
    return {
      invested: formatCurrency(data.totalAmount),
      current: formatCurrency(data.currentValue)
    };
  };

  const getTransactions = (data) => isStock ? data.rows : data.transactions;
  const getTransactionCount = (data) => {
    const transactions = getTransactions(data);
    return transactions ? transactions.length : 0;
  };

  return (
    <div className="mt-8 bg-gray-800 rounded-2xl p-3 sm:p-6 border border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={20} className="sm:w-6 sm:h-6" />
          {title}
        </h2>
        
        {/* Item Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-gray-300 text-sm font-medium whitespace-nowrap">{selectLabel}</span>
          <select
            value={selectedItem}
            onChange={(e) => {
              setSelectedItem(e.target.value);
              setShowTransactions(true);
            }}
            className="flex-1 sm:min-w-60 lg:min-w-80 px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Item Details */}
            <div className="bg-gray-700 p-3 sm:p-4 rounded-xl border border-gray-600">
              <h4 className="text-gray-400 text-sm font-medium mb-1">
                {isStock ? "Stock Details" : "Fund Details"}
              </h4>
              {isStock ? (
                <>
                  <p className="text-white text-lg sm:text-xl font-bold mb-2" title={selectedItemData.companyName}>
                    {getItemDisplayName(selectedItemData)}
                  </p>
                  <div className="mb-2">
                    <SymbolBadge symbol={selectedItemData.symbol} />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <FundBadge fundName={selectedItemData.fund} />
                  </div>
                  <p className="text-gray-300 text-sm truncate" title={selectedItemData.fund}>
                    {getItemDisplayName(selectedItemData)}
                  </p>
                </>
              )}
            </div>

            {/* Holdings */}
            <div className="bg-gray-700 p-3 sm:p-4 rounded-xl border border-gray-600">
              <h4 className="text-gray-400 text-sm font-medium mb-1">Holdings</h4>
              {(() => {
                const holdings = getHoldingsData(selectedItemData);
                return (
                  <>
                    <p className="text-white text-lg sm:text-xl font-bold">
                      {holdings.amount} {holdings.unit}
                    </p>
                    <p className="text-gray-300 text-sm">Avg: {holdings.avgPrice}</p>
                  </>
                );
              })()}
            </div>

            {/* Investment Info */}
            <div className="bg-gray-700 p-3 sm:p-4 rounded-xl border border-gray-600">
              <h4 className="text-gray-400 text-sm font-medium mb-1">Investment / Market</h4>
              {(() => {
                const investment = getInvestmentData(selectedItemData);
                return (
                  <div className="flex flex-col">
                    <p className="text-white text-base sm:text-lg font-semibold">{investment.invested}</p>
                    <p className="text-blue-400 text-base sm:text-lg font-semibold">{investment.current}</p>
                  </div>
                );
              })()}
            </div>

            {/* P&L Combined */}
            <div className={`p-3 sm:p-4 rounded-xl border ${
              (selectedItemData.profitLoss || 0) >= 0 
                ? 'bg-green-900/30 border-green-600/50' 
                : 'bg-red-900/30 border-red-600/50'
            }`}>
              <h4 className="text-gray-400 text-sm font-medium mb-1">Profit & Loss</h4>
              <div className="flex flex-col">
                <p className={`text-base sm:text-lg font-bold ${
                  (selectedItemData.profitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatCurrency(selectedItemData.profitLoss)}
                </p>
                <p className={`text-sm font-semibold ${
                  (selectedItemData.profitLoss || 0) >= 0 ? 'text-green-300' : 'text-red-300'
                }`}>
                  {formatPercent(
                    returnType === 'absolute' 
                      ? selectedItemData.profitLossPercent 
                      : selectedItemData.xirrPercent
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="bg-gray-700 rounded-xl border border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-gray-600 gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                Transaction History
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getTransactionCount(selectedItemData)}
                </span>
              </h3>
              
              {/* Toggle Transactions Button */}
              <button
                onClick={() => setShowTransactions(!showTransactions)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
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
            {showTransactions && getTransactions(selectedItemData) && getTransactions(selectedItemData).length > 0 && (
              <div className="p-3 sm:p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        {isStock ? (
                          <>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Date</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Symbol</th>
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Quantity</th>
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Trade Price</th>
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Trade Money</th>
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Commission</th>
                          </>
                        ) : (
                          <>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Date</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Folio</th>
                            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Type</th>
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Units</th>
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">NAV</th>
                            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-300 font-semibold text-sm">Amount</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {getTransactions(selectedItemData).map((transaction, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-600/30">
                          {isStock ? (
                            <>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-200 text-sm">
                                {new Date(transaction.DateTime?.replace(';', ' ') || '').toLocaleDateString() || 'N/A'}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-200 text-sm">
                                {transaction.Symbol || 'N/A'}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-medium text-sm">
                                <span className={`${parseFloat(transaction.Quantity || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
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
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-200 text-sm">
                                {transaction["Date"] || Object.values(transaction)[0] || 'N/A'}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-200 text-sm">
                                {transaction["Folio Number"] || Object.values(transaction)[1] || 'N/A'}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  ((transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase() === 'BUY' || 
                                   (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase() === 'PURCHASE')
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {transaction["Order"] || Object.values(transaction)[3] || 'BUY'}
                                </span>
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-white font-medium text-sm">
                                <span className={`${parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
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
                    
                    {/* Summary Row */}
                    <tfoot>
                      <tr className="bg-gray-600/30 border-t-2 border-gray-500">
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
                              {formatCurrency(selectedItemData.totalIbCommission)}
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
            )}

            {/* No Transactions Message */}
            {showTransactions && (!getTransactions(selectedItemData) || getTransactions(selectedItemData).length === 0) && (
              <div className="p-4 text-center py-8">
                <div className="bg-gray-600/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <List size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-400">
                  No transaction history available for this {isStock ? 'stock' : 'fund'}
                </p>
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
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{emptyStateTitle}</h3>
          <p className="text-gray-400">{emptyStateDescription}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;