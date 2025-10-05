class ExchangeRateService {
  static async fetchExchangeRates() {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      const data = await response.json();

      if (data && data.rates && data.rates.USD && data.rates.EUR) {
        return {
          usdInr: 1 / data.rates.USD,
          euroInr: 1 / data.rates.EUR,
          eurToUsd: data.rates.USD / data.rates.EUR, // EUR to USD conversion
          success: true
        };
      }

      throw new Error('Invalid exchange rate data');
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return {
        usdInr: null,
        euroInr: null,
        eurToUsd: null, // Add this field to the error response too
        success: false,
        error: error.message
      };
    }
  }
}

export default ExchangeRateService;
