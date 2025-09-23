class SavingsCalculationService {
  static async calculateSavingsSummary() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}/data/inr-savings.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch savings data: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Savings data is not an array');
      }
      
      return this.processSavingsData(data);
    } catch (error) {
      console.error('Error loading savings data:', error);
      return {
        savingsData: [],
        totalAmount: 0,
        avgInterestRate: 0,
        totalInterestEarning: 0,
        allocation: [],
        itemCount: 0,
        error: error.message
      };
    }
  }
  
  static processSavingsData(data) {
    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
    const avgInterestRate = data.length > 0 
      ? data.reduce((sum, item) => sum + (item.interestRate || 0), 0) / data.length 
      : 0;
    const totalInterestEarning = data.reduce((sum, item) => 
      sum + (item.amount * (item.interestRate || 0) / 100), 0);
    
    // Group by type for allocation
    const allocation = data.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.amount;
      return acc;
    }, {});
    
    const allocationArray = Object.entries(allocation).map(([type, amount]) => ({
      name: type,
      value: amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      color: data.find(item => item.type === type)?.color || '#6B7280'
    }));
    
    return {
      savingsData: data,
      totalAmount,
      avgInterestRate,
      totalInterestEarning,
      allocation: allocationArray,
      itemCount: data.length,
      error: null
    };
  }
  
  static updateSavingsData(currentData, newItem, isEdit = false) {
    let updatedData;
    
    if (isEdit) {
      updatedData = currentData.map(item => 
        item.id === newItem.id ? newItem : item
      );
    } else {
      updatedData = [...currentData, { ...newItem, id: Date.now() }];
    }
    
    return this.processSavingsData(updatedData);
  }
  
  static deleteSavingsItem(currentData, itemId) {
    const updatedData = currentData.filter(item => item.id !== itemId);
    return this.processSavingsData(updatedData);
  }
  
  static formatCurrency(amount, showBalance = true) {
    if (!showBalance) return '₹••••••';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  static getDaysToMaturity(maturityDate) {
    if (!maturityDate) return null;
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default SavingsCalculationService;
    