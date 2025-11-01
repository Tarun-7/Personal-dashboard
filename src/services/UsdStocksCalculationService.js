class UsdStocksCalculationService {
  static CACHE_KEY = 'usd_stock_price_map';
  static CACHE_TIMESTAMP_KEY = 'usd_stock_price_map_timestamp';
  static CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  static async calculateUsdStocksSummary(transactions, eurUsdRate = 1.2) {
    if (!transactions || transactions.length === 0) {
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        absoluteReturn: 0,
        xirrReturn: 0,
        stocksData: []
      };
    }

    // Filter transactions - only STK (stocks), no CASH
    const filteredTransactions = transactions.filter(txn => {
      const assetClass = txn.AssetClass;
      const symbol = txn.Symbol;
      return assetClass === 'STK' && symbol && symbol.length > 0;
    });

    if (filteredTransactions.length === 0) {
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        absoluteReturn: 0,
        xirrReturn: 0,
        stocksData: []
      };
    }

    // Get unique symbols
    const uniqueSymbols = [...new Set(filteredTransactions.map(txn => txn.Symbol).filter(Boolean))];
    
    // Fetch stock prices
    const stockPrices = await this.fetchStockPrices(uniqueSymbols, eurUsdRate);

    // Process stocks data
    const stocksData = this.processStocksData(filteredTransactions, stockPrices, eurUsdRate);

    // Calculate totals
    const totalInvested = stocksData.reduce((acc, stock) => acc + stock.netInvestment, 0);
    const totalCurrentValue = stocksData.reduce((acc, stock) => acc + stock.currentValue, 0);
    const totalProfitLoss = stocksData.reduce((acc, stock) => acc + stock.profitLoss, 0);
    const absoluteReturn = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const xirrReturn = this.calculateXIRR(filteredTransactions, totalCurrentValue) * 100;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      absoluteReturn,
      xirrReturn,
      stocksData
    };
  }

  static async fetchStockPrices(symbols, eurUsdRate) {
    try {
      // Check cache first
      const cachedPrices = this.getCachedStockPrices();
      if (cachedPrices) {
        // Return cached prices for symbols we have, fetch missing ones
        const missingSymbols = symbols.filter(symbol => !cachedPrices[symbol]);
        if (missingSymbols.length === 0) {
          return cachedPrices;
        }
      }

      const stockPrices = { ...cachedPrices };
      const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
      const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

      for (const symbol of symbols) {
        if (stockPrices[symbol]) continue; // Skip if already cached

        try {
          let price = 0;
          
          // ETF handling
          if (symbol === 'VUAA' || symbol === 'ETHEEUR' || symbol === 'EMIM') {
            // Special handling for VUAA
            let symbolForApi;

            if (symbol === 'VUAA') {
              symbolForApi = 'VUAA.LON';
            } else if (symbol === 'ETHEEUR') {
              symbolForApi = 'CETH.FRK';
            } else if (symbol === 'EMIM') {
              symbolForApi = 'EMIM.AMS';
            }
            const apiRes = await fetch(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbolForApi)}&apikey=${ALPHA_VANTAGE_API_KEY}`
            );
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              price = Number(apiData?.['Global Quote']?.['05. price']) || 0;

              // Convert EUR to USD for CETH.DEX (ETHEEUR)
              if ((symbol === 'ETHEEUR' || symbol === 'EMIM') && price > 0 && eurUsdRate > 0) {
                const eurPrice = price;
                price = price * eurUsdRate;
                console.log(`${symbol} conversion: EUR ${eurPrice} -> USD ${price} (EUR/USD: ${eurUsdRate})`);
              } else {
                price = price;
              }
            }
          } else {
            // Use Finnhub for other US stocks
            const apiRes = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`
            );
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              price = Number(apiData?.c) || 0;
            }
          }

          stockPrices[symbol] = price;
          
          // Rate limiting
          await new Promise(r => setTimeout(r, 150));
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          stockPrices[symbol] = 0;
        }
      }

      // Cache the results
      this.cacheStockPrices(stockPrices);
      return stockPrices;
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      return {};
    }
  }

  static processStocksData(transactions, stockPrices, eurUsdRate) {
    const stockMap = new Map();

    transactions.forEach(transaction => {
      const symbol = transaction.Symbol;
      const qty = parseFloat(transaction.Quantity) || 0;
      const isEtheeur = symbol === 'ETHEEUR';
      const conversionRate = isEtheeur ? eurUsdRate : 1;

      // Convert amounts for ETHEEUR transactions
      const investedAmount = (parseFloat(transaction.TradeMoney) || 0) * conversionRate;
      const ibCommission = (parseFloat(transaction.IBCommission) || 0) * conversionRate;
      const fifoPnlRealized = (parseFloat(transaction.FifoPnlRealized) || 0) * conversionRate;

      if (!stockMap.has(symbol)) {
        stockMap.set(symbol, {
          symbol,
          companyName: transaction.Description || 'No Description',
          totalQuantity: 0,
          totalAmount: 0,
          totalIbCommission: 0,
          totalFifoPnlRealized: 0,
          averageUnitPrice: 0,
          rows: []
        });
      }

      const stockData = stockMap.get(symbol);
      stockData.rows.push(transaction);
      stockData.totalQuantity += qty;
      stockData.totalAmount += investedAmount;
      stockData.totalIbCommission += ibCommission;
      stockData.totalFifoPnlRealized += fifoPnlRealized;

      if (stockData.totalQuantity > 0) {
        stockData.averageUnitPrice =
          (Math.abs(stockData.totalAmount) + stockData.totalIbCommission) /
          stockData.totalQuantity;
      }
    });

    return Array.from(stockMap.values())
      .filter(stock => stock.totalQuantity > 0.0001)
      .map(stock => {
        const currentPrice = stockPrices[stock.symbol] || 0;
        const totalMarketValue = currentPrice * stock.totalQuantity;
        const unrealizedGains = totalMarketValue - stock.totalIbCommission - Math.abs(stock.totalAmount);
        const profitLoss = unrealizedGains + stock.totalFifoPnlRealized;
        const netInvestment = Math.abs(stock.totalAmount) + Math.abs(stock.totalIbCommission);
        const profitLossPercent = netInvestment > 0 ? (profitLoss / netInvestment) * 100 : 0;
        const xirrPercent = this.calculateXIRR(stock.rows, totalMarketValue) * 100;

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
  }

  static calculateXIRR(transactions, currentValue) {
    if (!transactions || transactions.length === 0) return 0;

    const cashFlows = [];
    const dates = [];

    transactions.forEach(txn => {
      let dateStr = txn.DateTime;
      if (!dateStr) return;

      const date = new Date(dateStr.replace(';', ' '));
      if (isNaN(date.getTime())) return;

      // FIX: Use NetCash directly, which has the correct sign
      const cashFlow = parseFloat(txn.NetCash) || 0;

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

    return 0;
  }


  static getCachedStockPrices() {
    try {
      const cachedPrices = localStorage.getItem(this.CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      const now = Date.now();

      if (cachedPrices && cachedTimestamp && now - Number(cachedTimestamp) < this.CACHE_EXPIRY_MS) {
        return JSON.parse(cachedPrices);
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  }

  static cacheStockPrices(stockPrices) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(stockPrices));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }
}

export default UsdStocksCalculationService;
