class LiabilitiesCalculationService {
  static async calculateLiabilitiesSummary() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}/data/liabilities.json`);

      if (!response.ok) {
        throw new Error(`Failed to fetch liabilities data: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Liabilities data is not an array');
      }

      return this.processLiabilitiesData(data);
    } catch (error) {
      console.error('Error loading liabilities data:', error);
      // Fall back to an empty ledger rather than blocking app load — this is
      // expected on first run before public/data/liabilities.json exists.
      return this.processLiabilitiesData([]);
    }
  }

  static processLiabilitiesData(balances) {
    const sorted = [...(balances || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      balances: sorted,
      itemCount: sorted.length,
      error: null,
    };
  }

  static updateLiabilitiesData(currentData, newItem, isEdit = false) {
    let updatedData;

    if (isEdit) {
      updatedData = currentData.map((item) => (item.id === newItem.id ? newItem : item));
    } else {
      updatedData = [...currentData, { ...newItem, id: newItem.id || Date.now() }];
    }

    return this.processLiabilitiesData(updatedData);
  }

  static deleteLiabilitiesItem(currentData, itemId) {
    const updatedData = currentData.filter((item) => item.id !== itemId);
    return this.processLiabilitiesData(updatedData);
  }
}

export default LiabilitiesCalculationService;
