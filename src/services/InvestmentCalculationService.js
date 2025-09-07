class InvestmentCalculationService {
  static calculateMutualFundTotal(transactions) {
    return transactions
      .filter(txn => txn['Type'] && txn['Type'].toLowerCase().includes('mutual'))
      .reduce((sum, txn) => {
        const val = parseFloat(
          txn['Market Value']?.replace(/[^0-9.-]/g, '') || '0'
        );
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  }

  static calculateTotalTradeValue(transactions) {
    return transactions.reduce((sum, txn) => {
      const val = parseFloat(txn['TradeMoney']) || 0;
      return sum + Math.abs(val);
    }, 0);
  }

  static calculateNetWorth(investments, exchangeRates, currency = 'INR') {
    const { rupee, usd, euro } = investments;
    const { usdInr, euroInr } = exchangeRates;

    switch (currency) {
      case 'INR':
        return rupee + (usd * usdInr) + (euro * euroInr);
      case 'USD':
        return (rupee / usdInr) + usd + ((euro * euroInr) / usdInr);
      case 'EUR':
        return (rupee / euroInr) + (usd * (usdInr / euroInr)) + euro;
      default:
        return rupee + (usd * usdInr) + (euro * euroInr);
    }
  }

  static convertGoalAmountToCurrency(goalAmount, targetCurrency, exchangeRates) {
    const { usdInr, euroInr } = exchangeRates;

    switch (targetCurrency) {
      case 'INR':
        return goalAmount;
      case 'USD':
        return usdInr > 0 ? goalAmount / usdInr : 0;
      case 'EUR':
        return euroInr > 0 ? goalAmount / euroInr : 0;
      default:
        return goalAmount;
    }
  }
}

export default InvestmentCalculationService;