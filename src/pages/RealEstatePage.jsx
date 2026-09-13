import React, { useState, useMemo, useCallback } from 'react';
import {
  Home, Building2, MapPin, Umbrella, Key, Plus, Edit, Trash2, X, Check,
  Download, Upload, Calculator, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
  Wallet, PiggyBank, Percent, Calendar, AlertCircle, Shield, IndianRupee, DollarSign, Euro
} from 'lucide-react';
import {
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import LoadingScreen from '../components/LoadingScreen';
import SummaryCard from '../components/SummaryCard';
import PageHeader from '../components/PageHeader';
import RealEstateCalculationService from '../services/RealEstateCalculationService';

const PROPERTY_TYPES = [
  { value: 'Residential', label: 'Residential', icon: Home, color: '#3B82F6' },
  { value: 'Commercial', label: 'Commercial', icon: Building2, color: '#8B5CF6' },
  { value: 'Land', label: 'Land', icon: MapPin, color: '#10B981' },
  { value: 'Vacation Home', label: 'Vacation Home', icon: Umbrella, color: '#F59E0B' },
  { value: 'Rental Property', label: 'Rental Property', icon: Key, color: '#EC4899' }
];

const getTypeMeta = (type) => PROPERTY_TYPES.find(t => t.value === type) || PROPERTY_TYPES[0];

const initialFormData = {
  name: '', address: '', type: 'Residential', currency: 'INR',
  purchasePrice: '', currentValue: '', purchaseDate: '', description: '',
  hasMortgage: false, lender: '', loanAmount: '', interestRate: '',
  tenureYears: '', mortgageStartDate: ''
};

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };

// Distinct per-property colors for the allocation chart (type color is still used
// for row icons — this is separate so two properties of the same type are visually distinguishable)
const PORTFOLIO_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444', '#84CC16'];

// EMI calculator slider ranges scale with the selected display currency
const CALC_RANGES = {
  INR: { min: 100000, max: 50000000, step: 50000, default: 5000000 },
  USD: { min: 5000, max: 1500000, step: 1000, default: 300000 },
  EUR: { min: 5000, max: 1500000, step: 1000, default: 300000 }
};

const RealEstatePage = ({
  realEstateSummary = {},
  onRealEstateUpdate = () => {},
  usdInrRate = 83,
  euroInrRate = 90
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [showBalance, setShowBalance] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [formData, setFormData] = useState(initialFormData);
  const [calc, setCalc] = useState({ principal: CALC_RANGES.INR.default, rate: 8.5, years: 20 });

  const properties = realEstateSummary.properties || [];
  const propertiesData = realEstateSummary.propertiesData || [];
  const error = realEstateSummary.error;
  const loading = false;

  // ---- Currency handling (same pattern as Cash & Savings / Liabilities pages) ----
  const convertAmount = useCallback((amount, fromCurrency = 'INR') => {
    let amountInINR = amount || 0;
    if (fromCurrency === 'USD') amountInINR = amount * usdInrRate;
    else if (fromCurrency === 'EUR') amountInINR = amount * euroInrRate;

    if (selectedCurrency === 'USD') return amountInINR / (usdInrRate || 1);
    if (selectedCurrency === 'EUR') return amountInINR / (euroInrRate || 1);
    return amountInINR;
  }, [selectedCurrency, usdInrRate, euroInrRate]);

  const formatCurrency = useCallback((amount, fromCurrency = 'INR') => {
    if (!showBalance) return '••••••';
    const converted = convertAmount(amount, fromCurrency);
    const symbol = CURRENCY_SYMBOLS[selectedCurrency] || '₹';
    return symbol + (converted || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }, [showBalance, selectedCurrency, convertAmount]);

  const formatPercent = (value) => `${value >= 0 ? '+' : ''}${(value || 0).toFixed(1)}%`;

  // ---- Portfolio-level totals, converted + summed with live FX rates ----
  const analytics = useMemo(() => {
    const totalPropertyValue = propertiesData.reduce((s, p) => s + convertAmount(p.currentValue, p.currency), 0);
    const totalPurchasePrice = propertiesData.reduce((s, p) => s + convertAmount(p.purchasePrice, p.currency), 0);
    const totalOutstandingMortgage = propertiesData.reduce((s, p) => s + convertAmount(p.outstandingBalance, p.currency), 0);
    const totalMonthlyEMI = propertiesData.reduce((s, p) => s + convertAmount(p.emi, p.currency), 0);
    const totalEquity = totalPropertyValue - totalOutstandingMortgage;
    const totalAppreciation = totalPurchasePrice > 0
      ? ((totalPropertyValue - totalPurchasePrice) / totalPurchasePrice) * 100
      : 0;

    const allocation = propertiesData
      .map((p, index) => ({
        name: p.name,
        value: convertAmount(p.currentValue, p.currency),
        color: PORTFOLIO_PALETTE[index % PORTFOLIO_PALETTE.length]
      }))
      .map(item => ({
        ...item,
        percentage: totalPropertyValue > 0 ? (item.value / totalPropertyValue) * 100 : 0
      }));

    return { totalPropertyValue, totalOutstandingMortgage, totalEquity, totalMonthlyEMI, totalAppreciation, allocation };
  }, [propertiesData, convertAmount]);

  const propertiesWithMortgage = propertiesData.filter(p => p.hasMortgage);
  const selectedProperty =
    propertiesWithMortgage.find(p => p.id === selectedPropertyId) || propertiesWithMortgage[0] || null;

  const yearlySchedule = useMemo(() => {
    if (!selectedProperty) return [];
    return RealEstateCalculationService.getYearlySchedule(selectedProperty.schedule).map(row => ({
      ...row,
      year: `Yr ${row.year}`,
      balanceConverted: convertAmount(row.balance, selectedProperty.currency),
      principalConverted: convertAmount(row.principalPaid, selectedProperty.currency),
      interestConverted: convertAmount(row.interestPaid, selectedProperty.currency)
    }));
  }, [selectedProperty, convertAmount]);

  // ---- EMI calculator (exploratory, not tied to any saved property) ----
  const calcResult = useMemo(() => {
    const tenureMonths = (Number(calc.years) || 0) * 12;
    const emi = RealEstateCalculationService.calculateEMI(calc.principal, calc.rate, tenureMonths);
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - (Number(calc.principal) || 0);
    return { emi, totalPayment, totalInterest };
  }, [calc]);

  // ---- CRUD ----
  const cycleCurrency = () => {
    setSelectedCurrency(prev => {
      const next = prev === 'INR' ? 'USD' : prev === 'USD' ? 'EUR' : 'INR';
      setCalc(c => ({ ...c, principal: CALC_RANGES[next].default }));
      return next;
    });
  };

  const handleAddNew = () => {
    setFormData(initialFormData);
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (property) => {
    setFormData({
      name: property.name || '',
      address: property.address || '',
      type: property.type || 'Residential',
      currency: property.currency || 'INR',
      purchasePrice: (property.purchasePrice ?? '').toString(),
      currentValue: (property.currentValue ?? '').toString(),
      purchaseDate: property.purchaseDate || '',
      description: property.description || '',
      hasMortgage: !!property.mortgage,
      lender: property.mortgage?.lender || '',
      loanAmount: (property.mortgage?.loanAmount ?? '').toString(),
      interestRate: (property.mortgage?.interestRate ?? '').toString(),
      tenureYears: property.mortgage?.tenureMonths ? (property.mortgage.tenureMonths / 12).toString() : '',
      mortgageStartDate: property.mortgage?.startDate || ''
    });
    setEditingItem(property);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this property? This cannot be undone.')) {
      onRealEstateUpdate(RealEstateCalculationService.deleteProperty(properties, id));
      if (selectedPropertyId === id) setSelectedPropertyId('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.currentValue) {
      alert('Please fill in at least the property name and current value.');
      return;
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.name,
      address: formData.address,
      type: formData.type,
      currency: formData.currency || 'INR',
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      currentValue: parseFloat(formData.currentValue) || 0,
      purchaseDate: formData.purchaseDate || null,
      description: formData.description,
      mortgage: formData.hasMortgage ? {
        lender: formData.lender,
        loanAmount: parseFloat(formData.loanAmount) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        tenureMonths: (parseInt(formData.tenureYears, 10) || 0) * 12,
        startDate: formData.mortgageStartDate || null
      } : null
    };

    onRealEstateUpdate(RealEstateCalculationService.updateProperty(properties, newItem, !!editingItem));
    setShowAddModal(false);
  };

  const handleExportData = () => {
    try {
      const jsonString = JSON.stringify(properties, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `real_estate_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) throw new Error('File must contain a JSON array of properties');
        onRealEstateUpdate(RealEstateCalculationService.buildSummary(parsed));
      } catch (err) {
        console.error('Import failed:', err);
        alert('Could not import file — make sure it is a valid real estate JSON export.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedRows(next);
  };

  const modalEmiPreview = RealEstateCalculationService.calculateEMI(
    parseFloat(formData.loanAmount) || 0,
    parseFloat(formData.interestRate) || 0,
    (parseInt(formData.tenureYears, 10) || 0) * 12
  );

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl mb-2 text-slate-300">Failed to load real estate data</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Real Estate"
          description="Track property value, mortgages, and monthly EMIs"
          showEyeToggle={true}
          showBalance={showBalance}
          onEyeToggle={() => setShowBalance(!showBalance)}
          buttons={[
            { label: 'New Property', icon: Plus, onClick: handleAddNew, variant: 'primary' },
            { label: 'Calculator', icon: Calculator, onClick: () => setShowCalculator(!showCalculator), variant: 'secondary' }
          ]}
        />

        {/* Currency cycler */}
        <div className="flex justify-end mb-6">
          <button
            onClick={cycleCurrency}
            className="flex items-center space-x-2 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition-all font-medium"
          >
            {selectedCurrency === 'INR' && <IndianRupee className="w-4 h-4" />}
            {selectedCurrency === 'USD' && <DollarSign className="w-4 h-4" />}
            {selectedCurrency === 'EUR' && <Euro className="w-4 h-4" />}
            <span>{selectedCurrency}</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Property Value"
            value={formatCurrency(analytics.totalPropertyValue, selectedCurrency)}
            subtitle={formatPercent(analytics.totalAppreciation) + ' since purchase'}
            icon={Home}
            statusIcon={analytics.totalAppreciation >= 0 ? TrendingUp : TrendingDown}
            gradient="from-blue-600 to-blue-700"
            textColor="blue"
            pulseIcon={true}
          />
          <SummaryCard
            title="Total Equity"
            value={formatCurrency(analytics.totalEquity, selectedCurrency)}
            subtitle="Value minus mortgage"
            icon={PiggyBank}
            statusIcon={Shield}
            gradient="from-emerald-600 to-emerald-700"
            textColor="emerald"
            pulseIcon={true}
          />
          <SummaryCard
            title="Outstanding Mortgage"
            value={formatCurrency(analytics.totalOutstandingMortgage, selectedCurrency)}
            subtitle={`${propertiesWithMortgage.length} active loan${propertiesWithMortgage.length === 1 ? '' : 's'}`}
            icon={Wallet}
            statusIcon={TrendingDown}
            gradient="from-orange-600 to-orange-700"
            textColor="orange"
            pulseIcon={true}
          />
          <SummaryCard
            title="Monthly EMI"
            value={formatCurrency(analytics.totalMonthlyEMI, selectedCurrency)}
            subtitle="Combined across properties"
            icon={Calendar}
            statusIcon={Percent}
            gradient="from-purple-600 to-purple-700"
            textColor="purple"
            pulseIcon={true}
          />
        </div>

        {/* EMI Calculator */}
        {showCalculator && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              EMI Calculator
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Loan Amount</span>
                    <span className="font-semibold text-white">
                      {CURRENCY_SYMBOLS[selectedCurrency]}{calc.principal.toLocaleString('en-US')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={CALC_RANGES[selectedCurrency].min}
                    max={CALC_RANGES[selectedCurrency].max}
                    step={CALC_RANGES[selectedCurrency].step}
                    value={calc.principal}
                    onChange={(e) => setCalc(prev => ({ ...prev, principal: Number(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Interest Rate</span>
                    <span className="font-semibold text-white">{calc.rate}%</span>
                  </div>
                  <input
                    type="range" min="3" max="18" step="0.05"
                    value={calc.rate}
                    onChange={(e) => setCalc(prev => ({ ...prev, rate: Number(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Tenure</span>
                    <span className="font-semibold text-white">{calc.years} years</span>
                  </div>
                  <input
                    type="range" min="1" max="30" step="1"
                    value={calc.years}
                    onChange={(e) => setCalc(prev => ({ ...prev, years: Number(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-xl border border-slate-700 p-6 flex flex-col justify-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Monthly EMI</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {CURRENCY_SYMBOLS[selectedCurrency]}{calcResult.emi.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Total Interest</p>
                    <p className="text-lg font-semibold text-orange-400">
                      {CURRENCY_SYMBOLS[selectedCurrency]}{calcResult.totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Total Payment</p>
                    <p className="text-lg font-semibold text-white">
                      {CURRENCY_SYMBOLS[selectedCurrency]}{calcResult.totalPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export / Import */}
        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={handleExportData}
            disabled={properties.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>Download JSON</span>
          </button>
          <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} id="real-estate-upload" />
          <label
            htmlFor="real-estate-upload"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
          >
            <Upload size={16} />
            <span>Upload</span>
          </label>
        </div>

        {/* Property list */}
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Home className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Properties Yet</h3>
              <p className="text-gray-400 mb-6">Add a property to start tracking its value and mortgage.</p>
              <button
                onClick={handleAddNew}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
              >
                Add Your First Property
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden shadow-2xl mb-8">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Property</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Value</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Monthly EMI</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Outstanding / LTV</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 w-48">Loan Progress</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {propertiesData.map((item, index) => {
                    const meta = getTypeMeta(item.type);
                    const TypeIcon = meta.icon;
                    return (
                      <tr
                        key={item.id}
                        className={`border-t border-gray-700 hover:bg-gray-700/30 transition-colors ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}20`, border: `1px solid ${meta.color}30` }}>
                              <TypeIcon className="w-6 h-6" style={{ color: meta.color }} />
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-400">{item.address}</span>
                                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                                  {item.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-white font-semibold">{formatCurrency(item.currentValue, item.currency)}</div>
                          <div className={`text-xs mt-1 ${item.appreciation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatPercent(item.appreciation)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.hasMortgage ? (
                            <>
                              <div className="text-white font-semibold">{formatCurrency(item.emi, item.currency)}</div>
                              <div className="text-xs text-gray-500 mt-1">{item.lender}</div>
                            </>
                          ) : (
                            <span className="text-gray-500 text-sm">No mortgage</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.hasMortgage ? (
                            <>
                              <div className="text-orange-400 font-semibold">{formatCurrency(item.outstandingBalance, item.currency)}</div>
                              <div className="text-xs text-gray-500 mt-1">{item.ltv.toFixed(1)}% LTV</div>
                            </>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.hasMortgage ? (
                            <div>
                              <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                                  style={{ width: `${Math.min(item.loanProgress, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{item.loanProgress.toFixed(0)}% repaid</p>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Owned outright</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {item.hasMortgage && (
                              <button
                                onClick={() => setSelectedPropertyId(item.id)}
                                className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors"
                                title="View amortization chart"
                              >
                                <TrendingDown className="w-4 h-4 text-emerald-400" />
                              </button>
                            )}
                            <button onClick={() => handleEdit(item)} className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors">
                              <Edit className="w-4 h-4 text-blue-400" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {propertiesData.map((item) => {
                const meta = getTypeMeta(item.type);
                const TypeIcon = meta.icon;
                const isExpanded = expandedRows.has(item.id);
                return (
                  <div key={item.id} className="border-t border-gray-700 hover:bg-gray-700/20 transition-all">
                    <div className="p-4 cursor-pointer" onClick={() => toggleRow(item.id)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${meta.color}20`, border: `1px solid ${meta.color}30` }}>
                            <TypeIcon className="w-5 h-5" style={{ color: meta.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{item.address}</p>
                            <div className="text-white font-semibold mt-2">{formatCurrency(item.currentValue, item.currency)}</div>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3">
                        {item.hasMortgage ? (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-500">Monthly EMI</p>
                                <p className="text-white font-semibold">{formatCurrency(item.emi, item.currency)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Outstanding</p>
                                <p className="text-orange-400 font-semibold">{formatCurrency(item.outstandingBalance, item.currency)}</p>
                              </div>
                            </div>
                            <div>
                              <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${Math.min(item.loanProgress, 100)}%` }} />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{item.loanProgress.toFixed(0)}% repaid · {item.lender}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">Owned outright — no mortgage</p>
                        )}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          {item.hasMortgage && (
                            <button onClick={() => setSelectedPropertyId(item.id)} className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
                              <TrendingDown className="w-4 h-4 text-emerald-400" />
                            </button>
                          )}
                          <button onClick={() => handleEdit(item)} className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts */}
        {properties.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Allocation */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-6">Portfolio Composition</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPieChart>
                  <Pie data={analytics.allocation} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2} dataKey="value">
                    {analytics.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                    formatter={(value) => [formatCurrency(value, selectedCurrency), 'Value']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {analytics.allocation.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amortization */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-xl font-semibold text-white">Mortgage Payoff</h3>
                {propertiesWithMortgage.length > 0 && (
                  <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-600 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    {propertiesWithMortgage.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {selectedProperty ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={yearlySchedule}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="year" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(v) => formatCurrency(v, selectedCurrency)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        formatter={(value) => [formatCurrency(value, selectedCurrency), 'Balance remaining']}
                      />
                      <Area type="monotone" dataKey="balanceConverted" stroke="#F97316" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-700 text-sm">
                    <div>
                      <p className="text-gray-500">Months remaining</p>
                      <p className="text-white font-semibold">{selectedProperty.monthsRemaining}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Est. payoff date</p>
                      <p className="text-white font-semibold">{RealEstateCalculationService.formatDate(selectedProperty.payoffDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Interest paid so far</p>
                      <p className="text-orange-400 font-semibold">{formatCurrency(selectedProperty.totalInterestPaid, selectedProperty.currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Total interest (lifetime)</p>
                      <p className="text-orange-400 font-semibold">{formatCurrency(selectedProperty.totalInterestPayable, selectedProperty.currency)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="w-10 h-10 text-gray-500 mb-3" />
                  <p className="text-gray-400">No active mortgages to chart</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Principal vs interest per year */}
        {selectedProperty && yearlySchedule.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">{selectedProperty.name} — Principal vs Interest by Year</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yearlySchedule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => formatCurrency(v, selectedCurrency)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  formatter={(value, name) => [formatCurrency(value, selectedCurrency), name === 'principalConverted' ? 'Principal' : 'Interest']}
                />
                <Legend formatter={(value) => (value === 'principalConverted' ? 'Principal' : 'Interest')} />
                <Bar dataKey="principalConverted" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="interestConverted" stackId="a" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add / Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{editingItem ? 'Edit Property' : 'Add New Property'}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Property Name</label>
                    <input
                      type="text" value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Whitefield Apartment" required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <input
                    type="text" value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g., Whitefield, Bengaluru"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Date</label>
                    <input
                      type="date" value={formData.purchaseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Price</label>
                    <input
                      type="number" min="0" step="0.01" value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Current Value</label>
                    <input
                      type="number" min="0" step="0.01" value={formData.currentValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentValue: e.target.value }))}
                      placeholder="0" required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Mortgage toggle */}
                <div className="pt-2 border-t border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer py-2">
                    <input
                      type="checkbox" checked={formData.hasMortgage}
                      onChange={(e) => setFormData(prev => ({ ...prev, hasMortgage: e.target.checked }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-white font-medium">This property has a mortgage</span>
                  </label>

                  {formData.hasMortgage && (
                    <div className="mt-4 space-y-4 bg-slate-900/40 rounded-xl border border-slate-700 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Lender</label>
                          <input
                            type="text" value={formData.lender}
                            onChange={(e) => setFormData(prev => ({ ...prev, lender: e.target.value }))}
                            placeholder="e.g., HDFC Bank"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Loan Start Date</label>
                          <input
                            type="date" value={formData.mortgageStartDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, mortgageStartDate: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Loan Amount</label>
                          <input
                            type="number" min="0" step="0.01" value={formData.loanAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Interest Rate (%)</label>
                          <input
                            type="number" min="0" max="100" step="0.01" value={formData.interestRate}
                            onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                            placeholder="8.50"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tenure (years)</label>
                          <input
                            type="number" min="1" max="40" step="1" value={formData.tenureYears}
                            onChange={(e) => setFormData(prev => ({ ...prev, tenureYears: e.target.value }))}
                            placeholder="20"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      {modalEmiPreview > 0 && (
                        <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-600 flex items-center justify-between">
                          <span className="text-sm text-gray-400">Estimated Monthly EMI</span>
                          <span className="text-xl font-bold text-emerald-400">
                            {CURRENCY_SYMBOLS[formData.currency] || '₹'}
                            {modalEmiPreview.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional notes about this property" rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-300 flex-1 justify-center"
                  >
                    <Check className="w-5 h-5" />
                    {editingItem ? 'Update Property' : 'Add Property'}
                  </button>
                  <button
                    type="button" onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 font-medium transition-colors flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealEstatePage;
