import React, { useState } from "react";
import { IndianRupee, DollarSign, Euro, Download, Upload, Plus, Edit2, Trash2, TrendingDown, Calendar, Target, CreditCard, AlertTriangle } from 'lucide-react';

function LiabilitiesPage({
  currentBalance = 183934,
  initialBalance = 200000,
  loanStartDate = "1 Jan 2023",
  repaidAmount = 16066,
  balances = [],
  setBalances = () => {},
}) {
  const [activeTab, setActiveTab] = useState("Balances");
  const [liabilityCurrency, setLiabilityCurrency] = useState("USD");
  const [inputDate, setInputDate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputCurrency, setInputCurrency] = useState("USD");
  const [inputNote, setInputNote] = useState("");

  // Currency conversion rates (mock data)
  const conversionRates = {
    USD: { INR: 83.12, EUR: 0.92 },
    INR: { USD: 0.012, EUR: 0.011 },
    EUR: { USD: 1.09, INR: 90.45 }
  };

  const convertCurrency = (amount, from, to) => {
    if (from === to) return amount;
    return amount * (conversionRates[from]?.[to] || 1);
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { USD: '$', INR: '₹', EUR: '€' };
    return `${symbols[currency] || '$'}${Math.round(amount).toLocaleString()}`;
  };

  const convertedBalance = convertCurrency(currentBalance, 'USD', liabilityCurrency);
  const convertedInitialBalance = convertCurrency(initialBalance, 'USD', liabilityCurrency);
  const convertedRepaidAmount = convertCurrency(repaidAmount, 'USD', liabilityCurrency);

  const handleAddBalance = () => {
    if (!inputDate || !inputValue || isNaN(parseFloat(inputValue))) {
      alert('Please fill in both date and a valid numeric value');
      return;
    }
    
    const newBalance = {
      id: Date.now(),
      date: inputDate,
      value: parseFloat(inputValue),
      currency: inputCurrency,
      note: inputNote,
    };
    
    setBalances([newBalance, ...balances]);
    
    // Clear form
    setInputDate("");
    setInputValue("");
    setInputCurrency("USD");
    setInputNote("");
  };

  const handleDelete = (id) => {
    const newBalances = balances.filter((b) => b.id !== id);
    setBalances(newBalances);
  };

  const formatDate = (d) =>
    typeof d === "string"
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  const getCurrencyIcon = (currency) => {
    switch(currency) {
      case 'INR': return <IndianRupee className="w-5 h-5" />;
      case 'EUR': return <Euro className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const cycleNextCurrency = () => {
    const currencies = ['USD', 'INR', 'EUR'];
    const currentIndex = currencies.indexOf(liabilityCurrency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setLiabilityCurrency(currencies[nextIndex]);
  };

  const repaymentPercentage = initialBalance > 0 ? (repaidAmount / initialBalance) * 100 : 0;
  const remainingPercentage = 100 - repaymentPercentage;

  const handleDownload = () => {
    if (balances.length === 0) {
      alert('No data to download');
      return;
    }

    try {
      const headers = ['Date', 'Value', 'Currency', 'Note'];
      const csvRows = [headers.join(',')];
      
      balances.forEach(balance => {
        const row = [
          formatDate(balance.date),
          balance.value.toString(),
          balance.currency,
          balance.note ? `"${balance.note.replace(/"/g, '""')}"` : '""'
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `liabilities_balances_${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent mb-2">
              Liabilities
            </h1>
            <p className="text-gray-400">
              Manage your debt and financial obligations
            </p>
          </div>
          <button
            onClick={cycleNextCurrency}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            {getCurrencyIcon(liabilityCurrency)}
            <span>{liabilityCurrency}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 border border-red-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Current Balance</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(convertedBalance, liabilityCurrency)}</p>
                <p className="text-red-200 text-xs mt-1">Outstanding debt</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 border border-orange-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Initial Balance</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(convertedInitialBalance, liabilityCurrency)}</p>
                <p className="text-orange-200 text-xs mt-1">Original amount</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 border border-blue-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Loan Start Date</p>
                <p className="text-3xl font-bold text-white">{loanStartDate}</p>
                <p className="text-blue-200 text-xs mt-1">Origination date</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 border border-green-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Repaid Amount</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(convertedRepaidAmount, liabilityCurrency)}</p>
                <p className="text-green-200 text-xs mt-1">{repaymentPercentage.toFixed(1)}% complete</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Debt Progress</h3>
              <p className="text-gray-400 text-sm">Track your repayment journey</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">{repaymentPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-400">Repaid</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700 rounded-full"
                style={{ width: `${Math.min(repaymentPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Repaid: {formatCurrency(convertedRepaidAmount, liabilityCurrency)}</span>
            <span className="text-gray-400">Remaining: {formatCurrency(convertedBalance, liabilityCurrency)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-xl">
          {["Overview", "Balances", "Documents"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Balances" && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleDownload}
                disabled={balances.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                <span>Download CSV</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                <Upload size={16} />
                <span>Upload</span>
              </button>
            </div>

            {/* Add New Entry Form */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Balance Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Currency</label>
                  <select
                    value={inputCurrency}
                    onChange={(e) => setInputCurrency(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Note</label>
                  <input
                    type="text"
                    placeholder="Add a note"
                    value={inputNote}
                    onChange={(e) => setInputNote(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddBalance}
                    disabled={!inputDate || !inputValue}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    <span>Add Entry</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Balance Entries */}
            {balances.length > 0 ? (
              <div className="grid gap-4">
                {balances.map((balance, index) => (
                  <div key={balance.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getCurrencyIcon(balance.currency)}
                          <span className="text-xl font-bold text-red-400">
                            {balance.currency === 'USD' ? '$' : balance.currency === 'INR' ? '₹' : '€'}
                            {balance.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          <p className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{formatDate(balance.date)}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {balance.note && (
                          <span className="text-sm text-gray-400 max-w-xs truncate">
                            {balance.note}
                          </span>
                        )}
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(balance.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <TrendingDown className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Balance Entries</h3>
                  <p className="text-gray-400 mb-6">
                    Add your first liability balance to start tracking
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overview Tab */}
{activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Debt Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                      <span className="text-gray-400">Total Outstanding</span>
                      <span className="text-xl font-bold text-red-400">
                        {formatCurrency(convertedBalance, liabilityCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                      <span className="text-gray-400">Progress Made</span>
                      <span className="text-xl font-bold text-green-400">
                        {repaymentPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                      <span className="text-gray-400">Time Since Start</span>
                      <span className="text-xl font-bold text-blue-400">
                        {Math.floor((new Date() - new Date(loanStartDate.replace(/(\d+)\s(\w+)\s(\d+)/, '$2 $1, $3'))) / (1000 * 60 * 60 * 24 * 30))} months
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Debt Trend</h3>
                  <div className="relative h-48">
                    <svg className="w-full h-full" viewBox="0 0 300 120">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Area under curve */}
                      <defs>
                        <linearGradient id="debtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Sample debt reduction curve */}
                      <path
                        d="M 20 80 Q 60 75 100 70 Q 140 65 180 60 Q 220 50 260 45 L 280 40"
                        stroke="#EF4444"
                        strokeWidth="2"
                        fill="none"
                        className="animate-pulse"
                      />
                      
                      {/* Area fill */}
                      <path
                        d="M 20 80 Q 60 75 100 70 Q 140 65 180 60 Q 220 50 260 45 L 280 40 L 280 100 L 20 100 Z"
                        fill="url(#debtGradient)"
                      />
                      
                      {/* Data points */}
                      <circle cx="20" cy="80" r="3" fill="#EF4444" className="animate-pulse" />
                      <circle cx="100" cy="70" r="3" fill="#EF4444" className="animate-pulse" />
                      <circle cx="180" cy="60" r="3" fill="#EF4444" className="animate-pulse" />
                      <circle cx="260" cy="45" r="3" fill="#EF4444" className="animate-pulse" />
                      <circle cx="280" cy="40" r="3" fill="#10B981" className="animate-pulse" />
                    </svg>
                    
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
                      <span>{formatCurrency(convertedInitialBalance, liabilityCurrency)}</span>
                      <span>{formatCurrency(convertedInitialBalance * 0.5, liabilityCurrency)}</span>
                      <span>0</span>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 -mb-6">
                      <span>Start</span>
                      <span>6mo</span>
                      <span>1yr</span>
                      <span>18mo</span>
                      <span>Now</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-gray-400">Debt Balance</span>
                    </div>
                    <span className="text-red-400 font-medium">Trending Down</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "Documents" && (
          <div className="text-center py-16">
            <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Document Management</h3>
              <p className="text-gray-400 mb-6">
                Upload and organize your liability-related documents
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg">
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiabilitiesPage;
