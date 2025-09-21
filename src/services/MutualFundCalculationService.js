class MutualFundCalculationService {
  static CACHE_KEY_MARKET_VALUES = 'kuveraMarketValues';
  static CACHE_KEY_MARKET_VALUES_TIMESTAMP = 'kuveraMarketValuesTimestamp';
  static CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  static async calculateMutualFundSummary(transactions) {
    if (!transactions || transactions.length === 0) {
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        absoluteReturn: 0,
        xirrReturn: 0,
        fundsData: []
      };
    }

    const fundGroups = {};
    
    // Group transactions by fund
    transactions.forEach(transaction => {
      const fundName = transaction["Fund"] || transaction["Scheme Name"] || Object.values(transaction)[2] || 'Unknown Fund';
      if (!fundGroups[fundName]) {
        fundGroups[fundName] = [];
      }
      fundGroups[fundName].push(transaction);
    });

    // Load fund codes from data folder
    const fundCodes = await this.loadFundCodes();
    
    // Fetch current market values using existing API logic
    const marketValues = await this.fetchMarketValues(fundCodes);

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const fundsData = [];
    const portfolioCashFlows = []; // Collect all cash flows for portfolio XIRR

    // Calculate metrics for each fund
    Object.entries(fundGroups).forEach(([fundName, fundTransactions]) => {
      const fundCode = this.matchFundCode(fundName, fundCodes);
      const currentNav = marketValues[fundCode] || this.getLatestNavFromTransactions(fundTransactions);
      
      const fundData = this.calculateFundMetrics(fundName, fundTransactions, currentNav);
      
      // Only include funds with non-zero units
      if (fundData.totalUnits > 0.001) {
        totalInvested += fundData.totalAmount;
        totalCurrentValue += fundData.currentValue;
        fundsData.push(fundData);

        // Collect cash flows for portfolio XIRR calculation
        fundTransactions.forEach(transaction => {
          const date = new Date(transaction["Date"] || Object.values(transaction)[0]);
          const orderType = (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase();
          const amount = parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0);
          const cashFlow = orderType === 'SELL' || orderType === 'REDEEM' ? amount : -amount;
          
          portfolioCashFlows.push({
            date: date,
            amount: cashFlow
          });
        });
      }
    });

    const totalProfitLoss = totalCurrentValue - totalInvested;
    const absoluteReturn = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    
    // Calculate portfolio XIRR correctly
    let xirrReturn = 0;
    if (portfolioCashFlows.length > 0 && totalCurrentValue > 0) {
      xirrReturn = this.calculateXIRR(portfolioCashFlows, totalCurrentValue) * 100;
    }

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      absoluteReturn,
      xirrReturn,
      fundsData
    };
  }

  // Load fund codes from data folder
  static async loadFundCodes() {
    try {
      const response = await fetch('/data/KuveraCode.json'); // Adjust path as needed
      if (!response.ok) {
        throw new Error(`Failed to load fund codes: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading fund codes:', error);
      return {};
    }
  }

  // Match fund name to fund code using fuzzy matching
  static matchFundCode(fundName, fundCodes) {
    // Direct match first
    if (fundCodes[fundName]) {
      return fundCodes[fundName];
    }

    // Fuzzy matching - look for partial matches
    const normalizedFundName = fundName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [codeFundName, code] of Object.entries(fundCodes)) {
      const normalizedCodeFundName = codeFundName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Check if fund names have significant overlap
      if (this.calculateSimilarity(normalizedFundName, normalizedCodeFundName) > 0.7) {
        return code;
      }
    }

    return null;
  }

  // Simple string similarity calculation
  static calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  static levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Use the existing API logic from InrMutualFunds component
  static async fetchMarketValues(fundCodes) {
    try {
      // Check cache first
      const cachedData = this.getCachedMarketValues();
      if (cachedData) {
        return cachedData;
      }

      const marketValues = {};
      const promises = [];

      // Create promises for all fund codes
      Object.values(fundCodes).forEach(fundCode => {
        if (fundCode) {
          promises.push(
            this.fetchNavForFund(fundCode)
              .then(nav => {
                if (nav) {
                  marketValues[fundCode] = nav;
                }
              })
              .catch(error => {
                console.warn(`Failed to fetch NAV for ${fundCode}:`, error);
              })
          );
        }
      });

      // Wait for all API calls to complete
      await Promise.allSettled(promises);

      // Cache the results
      this.cacheMarketValues(marketValues);
      return marketValues;
    } catch (error) {
      console.error('Error fetching market values:', error);
      return {};
    }
  }

  // Fetch NAV for individual fund using the same API logic from the component
  static async fetchNavForFund(fundCode) {
    try {
      const response = await fetch(`https://api.mfapi.in/mf/${fundCode}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        return parseFloat(data.data[0].nav);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching NAV for fund ${fundCode}:`, error);
      return null;
    }
  }

  static getCachedMarketValues() {
    try {
      const timestamp = localStorage.getItem(this.CACHE_KEY_MARKET_VALUES_TIMESTAMP);
      const cached = localStorage.getItem(this.CACHE_KEY_MARKET_VALUES);
      
      if (timestamp && cached) {
        const age = Date.now() - parseInt(timestamp);
        if (age < this.CACHE_EXPIRY_MS) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  }

  static cacheMarketValues(marketValues) {
    try {
      localStorage.setItem(this.CACHE_KEY_MARKET_VALUES, JSON.stringify(marketValues));
      localStorage.setItem(this.CACHE_KEY_MARKET_VALUES_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  static getLatestNavFromTransactions(transactions) {
    if (!transactions || transactions.length === 0) return 0;
    
    // Sort by date and get the latest NAV
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(a["Date"] || Object.values(a)[0]);
      const dateB = new Date(b["Date"] || Object.values(b)[0]);
      return dateB - dateA;
    });

    const latestTransaction = sortedTransactions[0];
    return parseFloat(latestTransaction["NAV"] || Object.values(latestTransaction)[5] || 0);
  }

  static calculateFundMetrics(fundName, transactions, currentNav) {
    let totalUnits = 0;
    let totalAmount = 0;

    transactions.forEach(transaction => {
      const orderType = (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase();
      const units = parseFloat(transaction["Units"] || Object.values(transaction)[4] || 0);
      const amount = parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0);

      if (orderType === 'BUY' || orderType === 'PURCHASE') {
        totalUnits += units;
        totalAmount += amount;
      } else if (orderType === 'SELL' || orderType === 'REDEEM') {
        totalUnits -= units;
        totalAmount -= amount;
      }
    });

    const avgNav = totalUnits > 0 ? totalAmount / totalUnits : 0;
    const currentValue = totalUnits * currentNav;
    const profitLoss = currentValue - totalAmount;
    const profitLossPercent = totalAmount > 0 ? (profitLoss / totalAmount) * 100 : 0;
    
    // Calculate XIRR for this fund
    const xirrPercent = this.calculateFundXIRR(transactions, currentValue) * 100;

    return {
      fund: fundName,
      totalUnits,
      totalAmount,
      avgNav,
      currentValue,
      marketValue: currentNav,
      profitLoss,
      profitLossPercent,
      xirrPercent,
      transactions
    };
  }

static calculateFundXIRR(transactions, currentValue) {
  if (!transactions || transactions.length === 0) {
    console.log('No transactions for XIRR calculation');
    return 0;
  }
  
  // Convert transactions to cash flows format
  const cashFlows = [];
  
  transactions.forEach(transaction => {
    const date = new Date(transaction["Date"] || Object.values(transaction)[0]);
    const orderType = (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase();
    const amount = parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0);
    
    // For individual fund XIRR, we need to consider the cash flow direction
    const cashFlow = orderType === 'SELL' || orderType === 'REDEEM' ? amount : -amount;
    
    cashFlows.push({
      date: date,
      amount: cashFlow
    });
  });
  
  // Add debugging
  console.log(`Fund XIRR - Cash Flows:`, cashFlows);
  console.log(`Fund XIRR - Current Value:`, currentValue);
  
  // Now call calculateXIRR with proper cash flows
  const xirr = this.calculateXIRR(cashFlows, currentValue);
  console.log(`Fund XIRR Result:`, xirr);
  
  return xirr;
}

static calculateXIRR(input, currentValue = 0) {
  if (!input || input.length === 0) {
    console.log('calculateXIRR: No input provided');
    return 0;
  }

  let cashFlows = [];
  
  // Check if input is already in cash flow format or needs conversion
  if (input[0] && input[0].hasOwnProperty('date') && input[0].hasOwnProperty('amount')) {
    // Already in cash flow format
    cashFlows = [...input];
  } else {
    // Convert transactions to cash flows
    input.forEach(transaction => {
      const date = new Date(transaction["Date"] || Object.values(transaction)[0]);
      const orderType = (transaction["Order"] || Object.values(transaction)[3] || 'BUY').toUpperCase();
      const amount = parseFloat(transaction["Amount (INR)"] || Object.values(transaction)[7] || 0);
      
      const cashFlow = orderType === 'SELL' || orderType === 'REDEEM' ? amount : -amount;
      
      cashFlows.push({
        date: date,
        amount: cashFlow
      });
    });
  }

  // If currentValue is provided, add it as the final cash flow
  if (currentValue > 0) {
    cashFlows.push({
      date: new Date(),
      amount: currentValue
    });
  }

  if (cashFlows.length < 2) {
    console.log('calculateXIRR: Less than 2 cash flows');
    return 0;
  }

  // Sort by date
  cashFlows.sort((a, b) => a.date - b.date);

  // Check if all cash flows are the same sign (would result in undefined XIRR)
  const signs = cashFlows.map(cf => Math.sign(cf.amount));
  const uniqueSigns = [...new Set(signs)];
  if (uniqueSigns.length === 1) {
    console.log('calculateXIRR: All cash flows have same sign');
    return 0; // Cannot calculate XIRR if all cash flows have the same sign
  }

  console.log('calculateXIRR: Processing cash flows:', cashFlows);

  const npv = (rate) => {
    const baseDate = cashFlows[0].date;
    let total = 0;
    
    cashFlows.forEach(cf => {
      const years = (cf.date - baseDate) / (365.25 * 24 * 60 * 60 * 1000);
      if (years >= 0) { // Ensure no negative years
        total += cf.amount / Math.pow(1 + rate, years);
      }
    });
    
    return total;
  };

  let rate = 0.1;
  const tolerance = 1e-6;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    const fValue = npv(rate);
    const fDerivative = (npv(rate + tolerance) - fValue) / tolerance;

    if (Math.abs(fValue) < tolerance) break;
    if (Math.abs(fDerivative) < tolerance) break;

    const newRate = rate - fValue / fDerivative;
    if (Math.abs(newRate - rate) < tolerance) {
      console.log(`calculateXIRR: Converged to rate: ${newRate}`);
      return newRate;
    }

    rate = newRate;

    // Prevent infinite loops with bounds
    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }

  console.log(`calculateXIRR: Final rate after ${maxIterations} iterations: ${rate}`);
  return rate;
}

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static formatPercent(percent) {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  }
}

export default MutualFundCalculationService;
