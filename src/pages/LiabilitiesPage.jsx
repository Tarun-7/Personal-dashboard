import React, { useState, useMemo, useRef } from "react";
import {
  IndianRupee,
  DollarSign,
  Euro,
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Calendar,
  Target,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import LiabilitiesCalculationService from "../services/LiabilitiesCalculationService";

function LiabilitiesPage({
  balances = [],
  onLiabilitiesUpdate = () => {},
  usdInrRate = 83.25,
  euroInrRate = 90.5,
}) {
  const [activeTab, setActiveTab] = useState("Balances");
  const [liabilityCurrency, setLiabilityCurrency] = useState("USD");
  const [inputDate, setInputDate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputCurrency, setInputCurrency] = useState("USD");
  const [inputNote, setInputNote] = useState("");
  const fileInputRef = useRef(null);

  // ---- Currency helpers (normalize everything to INR, then to the display currency) ----
  const toINR = (amount, currency) => {
    if (currency === 'USD') return amount * usdInrRate;
    if (currency === 'EUR') return amount * euroInrRate;
    return amount;
  };

  const fromINR = (amountINR, currency) => {
    if (currency === 'USD') return usdInrRate > 0 ? amountINR / usdInrRate : 0;
    if (currency === 'EUR') return euroInrRate > 0 ? amountINR / euroInrRate : 0;
    return amountINR;
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { USD: '$', INR: '₹', EUR: '€' };
    return `${symbols[currency] || '$'}${Math.round(amount).toLocaleString()}`;
  };

  // ---- Derive current/initial/repaid balance from the actual entries ----
  const sortedBalances = useMemo(
    () => [...balances].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [balances]
  );

  const earliestEntry = sortedBalances[0] || null;
  const latestEntry = sortedBalances[sortedBalances.length - 1] || null;

  const initialBalanceINR = earliestEntry ? toINR(earliestEntry.value, earliestEntry.currency) : 0;
  const currentBalanceINR = latestEntry ? toINR(latestEntry.value, latestEntry.currency) : 0;
  const repaidAmountINR = initialBalanceINR - currentBalanceINR;
  const isIncreasing = repaidAmountINR < 0;

  const loanStartDateObj = earliestEntry ? new Date(earliestEntry.date) : null;

  const convertedBalance = fromINR(currentBalanceINR, liabilityCurrency);
  const convertedInitialBalance = fromINR(initialBalanceINR, liabilityCurrency);
  const convertedRepaidAmount = fromINR(Math.abs(repaidAmountINR), liabilityCurrency);

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

    const updatedSummary = LiabilitiesCalculationService.updateLiabilitiesData(balances, newBalance, false);
    onLiabilitiesUpdate(updatedSummary);

    // Clear form
    setInputDate("");
    setInputValue("");
    setInputCurrency("USD");
    setInputNote("");
  };

  const handleDelete = (id) => {
    const updatedSummary = LiabilitiesCalculationService.deleteLiabilitiesItem(balances, id);
    onLiabilitiesUpdate(updatedSummary);
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

  const repaymentPercentage = initialBalanceINR > 0 ? (repaidAmountINR / initialBalanceINR) * 100 : 0;
  const clampedRepaymentPercentage = Math.max(0, Math.min(repaymentPercentage, 100));
  const remainingPercentage = 100 - clampedRepaymentPercentage;

  const handleDownloadCSV = () => {
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

  // Downloads the raw balances array — the exact shape LiabilitiesCalculationService
  // expects, so this file can be dropped straight into public/data/liabilities.json
  // to persist across reloads without a backend.
  const handleDownloadJSON = () => {
    if (balances.length === 0) {
      alert('No data to download');
      return;
    }

    try {
      const jsonString = JSON.stringify(balances, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'liabilities.json';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      balances.length > 0 &&
      !window.confirm('This will replace your current liability entries with the uploaded file. Continue?')
    ) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error('File must contain a JSON array of balance entries');
        }
        const updatedSummary = LiabilitiesCalculationService.processLiabilitiesData(parsed);
        onLiabilitiesUpdate(updatedSummary);
      } catch (error) {
        console.error('Failed to import liabilities JSON:', error);
        alert('Could not read that file. Make sure it is a valid liabilities JSON export.');
      } finally {
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      alert('Failed to read the file.');
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Real trend data from the entries themselves, in the currently selected currency
  const trendData = useMemo(
    () =>
      sortedBalances.map((b) => ({
        date: formatDate(b.date),
        value: Math.round(fromINR(toINR(b.value, b.currency), liabilityCurrency)),
      })),
    [sortedBalances, liabilityCurrency, usdInrRate, euroInrRate]
  );

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
                <p className="text-red-200 text-xs mt-1">Most recent entry</p>
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
                <p className="text-orange-200 text-xs mt-1">First recorded entry</p>
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
                <p className="text-3xl font-bold text-white">
                  {loanStartDateObj ? formatDate(earliestEntry.date) : 'No entries'}
                </p>
                <p className="text-blue-200 text-xs mt-1">Earliest entry</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-r ${isIncreasing ? 'from-red-500 to-rose-600' : 'from-green-500 to-emerald-600'} rounded-2xl p-6 border ${isIncreasing ? 'border-red-400/20' : 'border-green-400/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${isIncreasing ? 'text-red-100' : 'text-green-100'} text-sm font-medium`}>
                  {isIncreasing ? 'Balance Increase' : 'Repaid Amount'}
                </p>
                <p className="text-3xl font-bold text-white">{formatCurrency(convertedRepaidAmount, liabilityCurrency)}</p>
                <p className={`${isIncreasing ? 'text-red-200' : 'text-green-200'} text-xs mt-1`}>
                  {Math.abs(repaymentPercentage).toFixed(1)}% {isIncreasing ? 'increase' : 'complete'}
                </p>
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
              <p className={`text-2xl font-bold ${isIncreasing ? 'text-red-400' : 'text-green-400'}`}>
                {clampedRepaymentPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-400">{isIncreasing ? 'Increased' : 'Repaid'}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${isIncreasing ? 'from-red-400 to-rose-500' : 'from-green-400 to-emerald-500'} transition-all duration-700 rounded-full`}
                style={{ width: `${clampedRepaymentPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              {isIncreasing ? 'Increase' : 'Repaid'}: {formatCurrency(convertedRepaidAmount, liabilityCurrency)}
            </span>
            <span className="text-gray-400">Current: {formatCurrency(convertedBalance, liabilityCurrency)}</span>
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
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileSelected}
                className="hidden"
              />
              <button
                onClick={handleDownloadCSV}
                disabled={balances.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                <span>Download CSV</span>
              </button>
              <button
                onClick={handleDownloadJSON}
                disabled={balances.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download as liabilities.json — drop this into public/data/ to persist it across reloads"
              >
                <Download size={16} />
                <span>Download JSON</span>
              </button>
              <button
                onClick={handleUploadClick}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                title="Load a previously downloaded liabilities.json"
              >
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
                {sortedBalances.slice().reverse().map((balance) => (
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
                    Add your first liability balance to start tracking, or upload a previously downloaded liabilities.json
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
                      <span className={`text-xl font-bold ${isIncreasing ? 'text-red-400' : 'text-green-400'}`}>
                        {clampedRepaymentPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                      <span className="text-gray-400">Time Since Start</span>
                      <span className="text-xl font-bold text-blue-400">
                        {loanStartDateObj
                          ? `${Math.floor((new Date() - loanStartDateObj) / (1000 * 60 * 60 * 24 * 30))} months`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Debt Trend</h3>
                  {trendData.length >= 2 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="debtGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                        <YAxis
                          stroke="#9CA3AF"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => formatCurrency(v, liabilityCurrency)}
                          width={70}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          formatter={(value) => [formatCurrency(value, liabilityCurrency), 'Balance']}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#EF4444"
                          strokeWidth={2}
                          fill="url(#debtGradient)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-center px-4">
                      <p className="text-gray-400 text-sm">
                        Add at least two balance entries to see a trend line here.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-gray-400">Debt Balance</span>
                    </div>
                    <span className={`font-medium flex items-center gap-1 ${isIncreasing ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isIncreasing ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isIncreasing ? 'Trending Up' : 'Trending Down'}
                    </span>
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