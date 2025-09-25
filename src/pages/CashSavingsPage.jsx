import React, { useState, useMemo, useCallback } from 'react';
import { Percent, Plus, IndianRupee, Euro, TrendingUp, TrendingDown, PieChart, BarChart3, Activity, Target, Calendar, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Eye, EyeOff, Building2, Shield, Clock, Edit, Trash2, X, Check, AlertCircle, CreditCard, Download } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Area, AreaChart } from 'recharts';
import LoadingScreen from '../components/LoadingScreen';
import SavingsCalculationService from '../services/SavingsCalculationService';
import SummaryCard from '../components/SummaryCard';

const CashSavingsPage = ({ savingsSummary = {}, onSavingsUpdate, usdInrRate = 83, euroInrRate = 91 }) => {
  // Add selected currency state
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [showBalance, setShowBalance] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    bankName: '',
    accountName: '',
    amount: '',
    interestRate: '',
    maturityDate: '',
    description: '',
    currency: 'INR' // Add currency field
  });

  const cashSavingsData = savingsSummary.savingsData || [];
  const loading = false;
  const error = savingsSummary.error;

  const accountTypes = [
    { value: 'Savings Account', label: 'Savings Account', icon: Building2 },
    { value: 'Current Account', label: 'Current Account', icon: CreditCard },
    { value: 'Fixed Deposit', label: 'Fixed Deposit', icon: Shield },
    { value: 'Recurring Deposit', label: 'Recurring Deposit', icon: Calendar },
    { value: 'PPF', label: 'Public Provident Fund', icon: Target },
    { value: 'Liquid Fund', label: 'Liquid Fund', icon: Activity },
    { value: 'Debt Fund', label: 'Debt Fund', icon: TrendingUp },
    { value: 'Cash', label: 'Cash in Hand', icon: Wallet }
  ];

  // Currency conversion helper
  const convertAmount = useCallback((amount, fromCurrency = 'INR') => {
    // Convert any currency to INR first
    let amountInINR = amount;
    if (fromCurrency === 'USD') {
      amountInINR = amount * (usdInrRate);
    } else if (fromCurrency === 'EUR') {
      amountInINR = amount * (euroInrRate);
    }

    // Then convert INR to selected currency
    if (selectedCurrency === 'USD') {
      return amountInINR / usdInrRate;
    } else if (selectedCurrency === 'EUR') {
      return amountInINR / euroInrRate;
    }

    return amountInINR;
  }, [selectedCurrency, usdInrRate, euroInrRate]);

  // Use pre-calculated analytics from props with currency conversion
  const analytics = useMemo(() => {
    const totalAmount = (savingsSummary.savingsData || []).reduce((sum, item) => {
      return sum + convertAmount(item.amount, item.currency || 'INR');
    }, 0);

    const totalInterestEarning = (savingsSummary.savingsData || []).reduce((sum, item) => {
      const convertedAmount = convertAmount(item.amount, item.currency || 'INR');
      return sum + (convertedAmount * (item.interestRate || 0) / 100);
    }, 0);

    return {
      totalAmount,
      avgInterestRate: savingsSummary.avgInterestRate || 0,
      totalInterestEarning,
      allocation: savingsSummary.allocation || [],
      itemCount: savingsSummary.itemCount || 0
    };
  }, [savingsSummary, selectedCurrency, usdInrRate, euroInrRate]);

  // Monthly growth data (mock) - keep same
  const monthlyData = [
    { month: 'Jun', amount: 980000 },
    { month: 'Jul', amount: 1020000 },
    { month: 'Aug', amount: 1080000 },
    { month: 'Sep', amount: 1120000 },
    { month: 'Oct', amount: 1135000 },
    { month: 'Nov', amount: 1150000 },
    { month: 'Dec', amount: 1155000 }
  ];

  // Enhanced formatting functions with currency support
  const formatCurrency = useCallback((amount, fromCurrency = 'INR') => {
    if (!showBalance) return '••••••';

    const convertedAmount = convertAmount(amount, fromCurrency);
    const currencySymbols = { INR: '₹', USD: '$', EUR: '€' };
    const symbol = currencySymbols[selectedCurrency] || '₹';

    return symbol + convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }, [showBalance, selectedCurrency, convertAmount]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysToMaturity = (maturityDate) => {
    if (!maturityDate) return null;
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Keep same UI handlers with currency support
  const handleAddNew = () => {
    setFormData({
      type: '',
      bankName: '',
      accountName: '',
      amount: '',
      interestRate: '',
      maturityDate: '',
      description: '',
      currency: 'INR' // Default to INR
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      type: item.type,
      bankName: item.bankName,
      accountName: item.accountName,
      amount: item.amount.toString(),
      interestRate: item.interestRate.toString(),
      maturityDate: item.maturityDate || '',
      description: item.description,
      currency: item.currency || 'INR' // Include currency
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  // Update to use service and notify parent
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedSummary = SavingsCalculationService.deleteSavingsItem(cashSavingsData, id);
      onSavingsUpdate(updatedSummary);
    }
  };

  // Update to use service and notify parent
  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      type: formData.type,
      bankName: formData.bankName,
      accountName: formData.accountName,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate) || 0,
      currency: formData.currency || 'INR', // Include currency
      maturityDate: formData.maturityDate || null,
      description: formData.description,
      color: accountTypes.find(t => t.value === formData.type)?.color || '#6B7280',
      addedDate: editingItem ? editingItem.addedDate : new Date().toISOString().split('T')[0]
    };

    const updatedSummary = SavingsCalculationService.updateSavingsData(
      cashSavingsData,
      newItem,
      !!editingItem
    );

    onSavingsUpdate(updatedSummary);
    setShowAddModal(false);
  };

  // Export function to download cashSavingsData as JSON
  const handleExportData = () => {
    try {
      // Create JSON data with proper formatting
      const exportData = {
        exportDate: new Date().toISOString(),
        selectedCurrency: selectedCurrency,
        totalAmount: analytics.totalAmount,
        itemCount: analytics.itemCount,
        data: cashSavingsData
      };

      // Convert to JSON string with proper indentation
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `cash_savings_export_${selectedCurrency}_${new Date().toISOString().split('T')[0]}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Optional: Show success message (you can add a toast notification here)
      console.log('Savings data exported successfully');

    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const getTypeIcon = (type) => {
    const accountType = accountTypes.find(t => t.value === type);
    return accountType ? accountType.icon : Building2;
  };

  // Keep all the existing UI exactly the same - just show error if needed
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl mb-2 text-slate-300">Failed to load savings data</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state - keep same
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                Cash Savings
              </h1>
              <p className="text-gray-400">Manage your cash, savings accounts, and fixed deposits</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                New
              </button>

              <button
                onClick={handleExportData}
                disabled={cashSavingsData.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  cashSavingsData.length === 0 
                    ? 'bg-slate-600 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-700 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl'
                }`}
                title="Export savings data to JSON"
              >
                <Download size={20} />
                Export
              </button>

              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Cash Savings"
            value={formatCurrency(analytics.totalAmount, selectedCurrency)}
            subtitle="+2.1% this month"
            icon={Wallet}
            statusIcon={TrendingUp}
            gradient="from-blue-600 to-blue-700"
            textColor="green"
            pulseIcon={true}
          />

          <SummaryCard
            title="Avg Interest Rate"
            value={`${analytics.avgInterestRate.toFixed(1)}%`}
            subtitle="Across all accounts"
            icon={Percent}
            statusIcon={TrendingUp}
            gradient="from-green-600 to-green-700"
            textColor="green"
            pulseIcon={true}
          />

          <SummaryCard
            title="Annual Interest"
            value={formatCurrency(analytics.totalInterestEarning, selectedCurrency)}
            subtitle="Expected yearly"
            icon={DollarSign}
            statusIcon={ArrowUpRight}
            gradient="from-emerald-600 to-emerald-700"
            textColor="emerald"
            pulseIcon={true}
          />

          <SummaryCard
            title="Total Accounts"
            value={analytics.itemCount}
            subtitle="Active accounts"
            icon={Building2}
            statusIcon={Shield}
            gradient="from-purple-600 to-purple-700"
            textColor="purple"
            pulseIcon={true}
          />
        </div>

        {/* Accounts List */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden shadow-2xl mb-8">
        <div className="p-6 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Your Accounts ({selectedCurrency})
          </h3>
          
          <div className="flex flex-col items-center">
            <button
              onClick={() => setSelectedCurrency(prev =>
                prev === 'INR' ? 'USD' : prev === 'USD' ? 'EUR' : 'INR'
              )}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-110 cursor-pointer group ${
                selectedCurrency === 'INR'
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-500/25'
                  : selectedCurrency === 'USD'
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25'
                    : 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-500/25'
              } shadow-lg hover:shadow-xl`}
              title={`Switch to ${selectedCurrency === 'INR' ? 'USD' : selectedCurrency === 'USD' ? 'EUR' : 'INR'}`}
            >
              {/* Subtle pulsing ring animation */}
              <div className={`absolute -inset-1 rounded-full animate-pulse opacity-10 ${
                selectedCurrency === 'INR'
                  ? 'bg-orange-400'
                  : selectedCurrency === 'USD'
                    ? 'bg-emerald-400'
                    : 'bg-blue-400'
              }`}></div>
              
              {/* Static ring for depth */}
              <div className={`absolute inset-0 rounded-full ring-2 ${
                selectedCurrency === 'INR'
                  ? 'ring-orange-300/30'
                  : selectedCurrency === 'USD'
                    ? 'ring-emerald-300/30'
                    : 'ring-blue-300/30'
              }`}></div>
              
              {/* Currency icon */}
              <div className="relative z-10">
                {selectedCurrency === 'INR' && <IndianRupee className="w-4 h-4 text-white drop-shadow-sm" />}
                {selectedCurrency === 'USD' && <DollarSign className="w-4 h-4 text-white drop-shadow-sm" />}
                {selectedCurrency === 'EUR' && <Euro className="w-4 h-4 text-white drop-shadow-sm" />}
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            {/* Tap to switch label */}
            <span className={`text-xs font-medium mt-2 animate-pulse transition-colors duration-500 text-center ${
              selectedCurrency === 'INR'
                ? 'text-orange-300'
                : selectedCurrency === 'USD'
                  ? 'text-emerald-300'
                  : 'text-blue-300'
            }`}>
              Tap to switch
            </span>
          </div>
        </div>


          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Account Details</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Amount ({selectedCurrency})</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Interest Rate</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Maturity</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashSavingsData.map((item, index) => {
                  const IconComponent = getTypeIcon(item.type);
                  const daysToMaturity = getDaysToMaturity(item.maturityDate);
                  
                  return (
                    <tr
                      key={item.id}
                      className={`border-t border-gray-700 hover:bg-gray-700/30 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: `${item.color}20`,
                              border: `1px solid ${item.color}30`
                            }}
                          >
                            <IconComponent
                              className="w-6 h-6"
                              style={{ color: item.color }}
                            />
                          </div>
                          <div>
                            <p className="text-white font-medium">{item.accountName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-400">{item.bankName}</span>
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${item.color}20`,
                                  color: item.color
                                }}
                              >
                                {item.type}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-white font-semibold">
                          {formatCurrency(item.amount, item.currency || 'INR')}
                          {item.currency && item.currency !== selectedCurrency && (
                            <div className="text-xs text-gray-500 mt-1">
                              Original: {item.currency} {item.amount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium">{item.interestRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.maturityDate ? (
                          <div>
                            <p className="text-white text-sm">{formatDate(item.maturityDate)}</p>
                            {daysToMaturity !== null && (
                              <p className={`text-xs ${
                                daysToMaturity > 30 ? 'text-gray-400' : 
                                daysToMaturity > 0 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {daysToMaturity > 0 ? `${daysToMaturity} days left` : 'Matured'}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No maturity</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors"
                          >
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

          {cashSavingsData.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Accounts Added</h3>
              <p className="text-gray-400 mb-6">Start by adding your first savings account or fixed deposit</p>
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
              >
                Add Your First Account
              </button>
            </div>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Allocation Pie Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Cash Allocation
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={analytics.allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {analytics.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {analytics.allocation.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-gray-400 text-xs">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Total Amount']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'Edit Account' : 'Add New Account'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select account type</option>
                      {accountTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bank/Institution</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="e.g., HDFC Bank, SBI"
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Name</label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    placeholder="e.g., Primary Savings, FD - 1 Year"
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                    <select
                      value={formData.currency || 'INR'}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      value={formData.interestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Maturity Date</label>
                    <input
                      type="date"
                      value={formData.maturityDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, maturityDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description for this account"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-gray-700">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-300 flex-1 justify-center"
                  >
                    <Check className="w-5 h-5" />
                    {editingItem ? 'Update Account' : 'Add Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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

export default CashSavingsPage;
