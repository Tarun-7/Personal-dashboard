import FileProcessingService from './FileProcessingService';
import InvestmentCalculationService from './InvestmentCalculationService';

class DataLoadingService {
  static async loadKuveraData() {
    try {
      const text = await FileProcessingService.loadInitialFile('/data/kuvera.csv');
      const transactions = FileProcessingService.parseKuveraCSV(text);
      const totalValue = InvestmentCalculationService.calculateMutualFundTotal(transactions);
      
      return {
        transactions,
        totalValue,
        success: true
      };
    } catch (error) {
      return {
        transactions: [],
        totalValue: 0,
        success: false,
        error: error.message
      };
    }
  }

  static async loadIbkrData() {
    try {
      const text = await FileProcessingService.loadInitialFile('/data/ibkr.csv');
      const { rows } = FileProcessingService.parseCSV(text);
      const totalValue = InvestmentCalculationService.calculateTotalTradeValue(rows);
      
      return {
        transactions: rows,
        totalValue,
        success: true
      };
    } catch (error) {
      return {
        transactions: [],
        totalValue: 0,
        success: false,
        error: error.message
      };
    }
  }

  static processKuveraFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const transactions = FileProcessingService.parseKuveraCSV(text);
          const totalValue = InvestmentCalculationService.calculateMutualFundTotal(transactions);
          
          resolve({
            transactions,
            totalValue,
            fileUrl: URL.createObjectURL(file),
            timestamp: new Date().toLocaleString()
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static processIbkrFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const { rows } = FileProcessingService.parseCSV(text);
          const totalValue = InvestmentCalculationService.calculateTotalTradeValue(rows);
          
          resolve({
            transactions: rows,
            totalValue
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export default DataLoadingService;
