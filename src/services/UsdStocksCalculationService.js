class UsdStocksCalculationService {
  static CACHE_KEY = 'usd_stock_price_map';
  static CACHE_TIMESTAMP_KEY = 'usd_stock_price_map_timestamp';
  static CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  // Map from your internal/IBKR ETF ticker to the correct Yahoo Finance symbol.
  // Yahoo uses different exchange suffixes than Alpha Vantage did:
  //   .L  = London Stock Exchange
  //   .AS = Euronext Amsterdam
  //   .DE = Xetra (Deutsche Börse)
  //   .F  = Frankfurt Stock Exchange
  // If a symbol stops resolving, test it with curl against the proxy first
  // (see cloudflare-worker/README.md) before assuming the code is wrong.
  static ETF_YAHOO_SYMBOLS = {
    VUAA: 'VUAA.L',
    ETHEEUR: 'CETH.PA',
    EMIM: 'EMIM.AS',
    VWCG: 'VWCG.DE',
    JEDI: 'JEDI.DE',
    EGLN: 'EGLN.L'
  };

  // Same idea as ETF_YAHOO_SYMBOLS above, but for regular stocks whose IBKR
  // ticker isn't what Yahoo knows them by - typically stocks IBKR trades on a
  // non-US exchange. Symbols listed here skip Finnhub (its free tier doesn't
  // cover non-US exchanges) and are priced through the same Cloudflare Worker
  // proxy as the ETFs. Keys must match the IBKR "Symbol" column exactly
  // (case-sensitive), and are quoted because a ticker starting with a digit
  // isn't a valid bare object key.
  //   .MU = Munich Stock Exchange (quoted in EUR)
  static STOCK_YAHOO_SYMBOLS = {
    '2DG': '2DG.MU'
  };

  // Stocks whose IBKR trades are denominated in EUR, so their trade amounts
  // (NetCash / IBCommission / FifoPnlRealized) get the same EUR -> USD
  // conversion ETHEEUR gets in processStocksData. If a stock's Net Invested
  // looks off by roughly the EUR/USD rate versus IBKR, its trades are already
  // in USD - remove it from this list.
  static EUR_TRADED_STOCKS = ['2DG'];

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
      const ETF_PROXY_URL = import.meta.env.VITE_ETF_PROXY_URL;

      for (const symbol of symbols) {
        if (stockPrices[symbol]) continue; // Skip if already cached

        try {
          let price = 0;

          if (this.ETF_YAHOO_SYMBOLS[symbol] || this.STOCK_YAHOO_SYMBOLS[symbol]) {
            // ETF handling — routed through the Cloudflare Worker proxy in front of
            // Yahoo Finance. Finnhub's free tier blocks non-US exchanges (403), and
            // Alpha Vantage's free tier is capped at 25 requests/day, so neither
            // reliably served these international-exchange ETFs.
            // Stocks listed in STOCK_YAHOO_SYMBOLS take this same path for the
            // same reason (non-US listings Finnhub can't price).
            if (!ETF_PROXY_URL) {
              console.warn(
                `VITE_ETF_PROXY_URL is not set — skipping price fetch for ${symbol}. ` +
                `See cloudflare-worker/README.md to deploy the proxy.`
              );
            } else {
              const yahooSymbol = this.ETF_YAHOO_SYMBOLS[symbol] || this.STOCK_YAHOO_SYMBOLS[symbol];
              const apiRes = await fetch(
                `${ETF_PROXY_URL}?symbol=${encodeURIComponent(yahooSymbol)}`
              );

              if (apiRes.ok) {
                const apiData = await apiRes.json();
                price = Number(apiData?.price) || 0;

                // Convert EUR-denominated ETFs to USD (same pairs as before the switch)
                if ((symbol === 'ETHEEUR' || symbol === 'EMIM' || symbol === 'VWCG'|| symbol === 'JEDI') && price > 0 && eurUsdRate > 0) {
                  const eurPrice = price;
                  price = price * eurUsdRate;
                  console.log(`${symbol} conversion: EUR ${eurPrice} -> USD ${price} (EUR/USD: ${eurUsdRate})`);
                }

                // Mapped stocks: convert only when Yahoo itself reports the quote
                // in EUR (e.g. .MU / .DE listings) instead of hardcoding a symbol
                // list - the worker passes Yahoo's currency through in its payload.
                if (this.STOCK_YAHOO_SYMBOLS[symbol] && apiData?.currency === 'EUR' && price > 0 && eurUsdRate > 0) {
                  const eurPrice = price;
                  price = price * eurUsdRate;
                  console.log(`${symbol} conversion: EUR ${eurPrice} -> USD ${price} (EUR/USD: ${eurUsdRate})`);
                }
              } else {
                console.warn(`ETF proxy returned ${apiRes.status} for ${symbol} (${yahooSymbol})`);
              }
            }
          } else {
            // Use Finnhub for other US stocks, falling back to Yahoo (through
            // the same Cloudflare Worker proxy used for ETF pricing above) if
            // Finnhub fails outright or comes back with no usable price.
            try {
              const apiRes = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`
              );
              if (apiRes.ok) {
                const apiData = await apiRes.json();
                price = Number(apiData?.c) || 0;
              }
            } catch (finnhubError) {
              console.warn(`Finnhub failed for ${symbol}, trying Yahoo fallback:`, finnhubError);
            }

            // Finnhub can return ok:true with c:0 for a bad/unsupported symbol —
            // treat "no price" the same as a hard failure and fall back
            if (!price) {
              price = await this.fetchYahooFallbackPrice(symbol, ETF_PROXY_URL);
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

  // Fallback quote source when Finnhub fails or returns no price for a
  // regular US-stock symbol. Reuses the same Cloudflare Worker proxy already
  // deployed for ETF pricing above (Yahoo's endpoint doesn't send CORS
  // headers for direct browser calls, so it has to go through that proxy).
  // Response shape matches worker.js's payload: { symbol, price, currency, ... }.
  static async fetchYahooFallbackPrice(symbol, proxyUrl) {
    if (!proxyUrl) {
      console.warn(`No VITE_ETF_PROXY_URL configured, skipping Yahoo fallback for ${symbol}`);
      return 0;
    }

    try {
      const apiRes = await fetch(`${proxyUrl}?symbol=${encodeURIComponent(symbol)}`);
      if (!apiRes.ok) {
        console.warn(`ETF proxy returned ${apiRes.status} for Yahoo fallback on ${symbol}`);
        return 0;
      }
      const apiData = await apiRes.json();
      return Number(apiData?.price) || 0;
    } catch (error) {
      console.error(`Yahoo fallback failed for ${symbol}:`, error);
      return 0;
    }
  }

  static processStocksData(transactions, stockPrices, eurUsdRate) {
    const stockMap = new Map();

    transactions.forEach(transaction => {
      const symbol = transaction.Symbol;
      const qty = parseFloat(transaction.Quantity) || 0;
      const isEtheeur = symbol === 'ETHEEUR';
      // EUR-traded stocks (see EUR_TRADED_STOCKS) get the same trade-amount
      // conversion as ETHEEUR.
      const conversionRate = (isEtheeur || this.EUR_TRADED_STOCKS.includes(symbol)) ? eurUsdRate : 1;

      // Convert amounts for ETHEEUR transactions.
      // NetCash (not TradeMoney) is used here because it's the field that
      // already carries the correct cash-flow sign - negative for a buy,
      // positive for a sell - and already nets IBCommission into it. Same
      // field calculateXIRR below relies on for the same reason.
      // TradeMoney = Quantity * TradePrice, so it's positive for a buy and
      // negative for a sell (it follows Quantity's sign, not cash flow),
      // which is why building cost basis from it broke on any symbol with a
      // sell in its history.
      const netCash = (parseFloat(transaction.NetCash) || 0) * conversionRate;
      // Commission is always a cost - kept here only as an informational
      // running total (shown in the UI); it's not used in the cost-basis
      // math below since NetCash already nets it in.
      const ibCommission = Math.abs(parseFloat(transaction.IBCommission) || 0) * conversionRate;
      const fifoPnlRealized = (parseFloat(transaction.FifoPnlRealized) || 0) * conversionRate;

      if (!stockMap.has(symbol)) {
        stockMap.set(symbol, {
          symbol,
          companyName: transaction.Description || 'No Description',
          totalQuantity: 0,
          totalNetCash: 0,
          totalIbCommission: 0,
          totalFifoPnlRealized: 0,
          averageUnitPrice: 0,
          rows: []
        });
      }

      const stockData = stockMap.get(symbol);
      stockData.rows.push(transaction);
      stockData.totalQuantity += qty;
      stockData.totalNetCash += netCash;
      stockData.totalIbCommission += ibCommission;
      stockData.totalFifoPnlRealized += fifoPnlRealized;

      // Cost basis of shares still held: gross cash paid out so far
      // (-totalNetCash), with the FIFO-realized portion of any sells added
      // back in - that part of the cash received back was a gain, not a
      // return of principal, so it shouldn't shrink the remaining basis.
      const remainingCostBasis = -stockData.totalNetCash + stockData.totalFifoPnlRealized;

      if (stockData.totalQuantity > 0) {
        stockData.averageUnitPrice = remainingCostBasis / stockData.totalQuantity;
      }
    });

    return Array.from(stockMap.values())
      .filter(stock => stock.totalQuantity > 0.0001)
      .map(stock => {
        const currentPrice = stockPrices[stock.symbol] || 0;
        const totalMarketValue = currentPrice * stock.totalQuantity;

        const remainingCostBasis = -stock.totalNetCash + stock.totalFifoPnlRealized;
        const unrealizedGains = totalMarketValue - remainingCostBasis;
        // Realized P&L is layered on top of the unrealized gain on the
        // shares still held, not on top of a cost basis that already
        // implicitly contains it - see remainingCostBasis above.
        const profitLoss = unrealizedGains + stock.totalFifoPnlRealized;
        const netInvestment = remainingCostBasis;
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