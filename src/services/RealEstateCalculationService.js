class RealEstateCalculationService {
  // ---- Loading (mirrors SavingsCalculationService.calculateSavingsSummary) ----
  static async loadRealEstateData() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}/data/real-estate.json`);

      if (!response.ok) {
        throw new Error(`Failed to fetch real estate data: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Real estate data is not an array');
      }

      return this.buildSummary(data);
    } catch (error) {
      console.error('Error loading real estate data:', error);
      return this.buildSummary([], error.message);
    }
  }

  // ---- Core EMI math ----
  // Standard reducing-balance EMI formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  static calculateEMI(principal, annualRatePercent, tenureMonths) {
    const P = Number(principal) || 0;
    const n = Number(tenureMonths) || 0;
    if (P <= 0 || n <= 0) return 0;

    const r = (Number(annualRatePercent) || 0) / 12 / 100;
    if (r === 0) return P / n;

    const factor = Math.pow(1 + r, n);
    return (P * r * factor) / (factor - 1);
  }

  static generateAmortizationSchedule(principal, annualRatePercent, tenureMonths, startDate) {
    const P = Number(principal) || 0;
    const n = Number(tenureMonths) || 0;
    if (P <= 0 || n <= 0) return [];

    const r = (Number(annualRatePercent) || 0) / 12 / 100;
    const emi = this.calculateEMI(P, annualRatePercent, n);
    const start = startDate ? new Date(startDate) : new Date();

    let balance = P;
    const schedule = [];

    for (let m = 1; m <= n; m++) {
      const interestPaid = balance * r;
      let principalPaid = emi - interestPaid;
      if (principalPaid > balance || m === n) principalPaid = balance;
      balance = Math.max(0, balance - principalPaid);

      const date = new Date(start);
      date.setMonth(date.getMonth() + m);

      schedule.push({
        month: m,
        date: date.toISOString().split('T')[0],
        interestPaid,
        principalPaid,
        emi: principalPaid + interestPaid,
        balance
      });

      if (balance <= 0) break;
    }

    return schedule;
  }

  // Collapses a monthly schedule into yearly rows for charting
  static getYearlySchedule(schedule = []) {
    const years = [];
    for (let i = 0; i < schedule.length; i += 12) {
      const yearRows = schedule.slice(i, i + 12);
      const last = yearRows[yearRows.length - 1];
      years.push({
        year: Math.ceil((i + 1) / 12),
        balance: last.balance,
        principalPaid: yearRows.reduce((s, r) => s + r.principalPaid, 0),
        interestPaid: yearRows.reduce((s, r) => s + r.interestPaid, 0)
      });
    }
    return years;
  }

  // Where a mortgage stands *today*, derived from the full schedule
  static getMortgageSnapshot(mortgage) {
    if (!mortgage || !mortgage.loanAmount || !mortgage.tenureMonths) {
      return {
        hasMortgage: false,
        emi: 0,
        outstandingBalance: 0,
        monthsPaid: 0,
        monthsRemaining: 0,
        totalInterestPaid: 0,
        totalInterestPayable: 0,
        principalPaid: 0,
        payoffDate: null,
        schedule: [],
        lender: mortgage?.lender || null,
        interestRate: mortgage?.interestRate || 0,
        loanAmount: mortgage?.loanAmount || 0,
        tenureMonths: mortgage?.tenureMonths || 0,
        startDate: mortgage?.startDate || null
      };
    }

    const schedule = this.generateAmortizationSchedule(
      mortgage.loanAmount,
      mortgage.interestRate,
      mortgage.tenureMonths,
      mortgage.startDate
    );
    const emi = this.calculateEMI(mortgage.loanAmount, mortgage.interestRate, mortgage.tenureMonths);

    const start = new Date(mortgage.startDate);
    const now = new Date();
    const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;
    let monthsPaid = Math.floor((now - start) / msPerMonth);
    monthsPaid = Math.min(Math.max(monthsPaid, 0), schedule.length);

    const outstandingBalance = monthsPaid === 0
      ? mortgage.loanAmount
      : (schedule[monthsPaid - 1]?.balance ?? 0);

    const totalInterestPaid = schedule.slice(0, monthsPaid).reduce((s, r) => s + r.interestPaid, 0);
    const totalInterestPayable = schedule.reduce((s, r) => s + r.interestPaid, 0);
    const principalPaid = mortgage.loanAmount - outstandingBalance;
    const monthsRemaining = Math.max(0, schedule.length - monthsPaid);
    const payoffDate = schedule.length ? schedule[schedule.length - 1].date : null;

    return {
      hasMortgage: true,
      emi,
      outstandingBalance,
      monthsPaid,
      monthsRemaining,
      totalInterestPaid,
      totalInterestPayable,
      principalPaid,
      payoffDate,
      schedule,
      lender: mortgage.lender,
      interestRate: mortgage.interestRate,
      loanAmount: mortgage.loanAmount,
      tenureMonths: mortgage.tenureMonths,
      startDate: mortgage.startDate
    };
  }

  // Adds computed mortgage + equity fields to a raw property record
  static enrichProperty(property) {
    const snapshot = this.getMortgageSnapshot(property.mortgage);
    const currentValue = Number(property.currentValue ?? property.purchasePrice ?? 0);
    const purchasePrice = Number(property.purchasePrice || 0);
    const equity = currentValue - snapshot.outstandingBalance;
    const ltv = currentValue > 0 ? (snapshot.outstandingBalance / currentValue) * 100 : 0;
    const appreciation = purchasePrice > 0 ? ((currentValue - purchasePrice) / purchasePrice) * 100 : 0;
    const loanProgress = snapshot.loanAmount > 0 ? (snapshot.principalPaid / snapshot.loanAmount) * 100 : 0;

    return {
      ...property,
      currentValue,
      purchasePrice,
      currency: property.currency || 'INR',
      ...snapshot,
      equity,
      ltv,
      appreciation,
      loanProgress
    };
  }

  // Raw properties stay untouched (source of truth for edits/export);
  // propertiesData carries the enriched, display-ready version.
  // NOTE: totals are intentionally NOT summed here, since properties can be
  // in different currencies — the page converts + sums with live FX rates.
  static buildSummary(rawProperties, error = null) {
    return {
      properties: rawProperties,
      propertiesData: rawProperties.map(p => this.enrichProperty(p)),
      itemCount: rawProperties.length,
      error
    };
  }

  static updateProperty(currentRawProperties, newItem, isEdit = false) {
    let updated;
    if (isEdit) {
      updated = currentRawProperties.map(p => (p.id === newItem.id ? newItem : p));
    } else {
      updated = [...currentRawProperties, { ...newItem, id: Date.now() }];
    }
    return this.buildSummary(updated);
  }

  static deleteProperty(currentRawProperties, id) {
    const updated = currentRawProperties.filter(p => p.id !== id);
    return this.buildSummary(updated);
  }

  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export default RealEstateCalculationService;
