import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus,
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Activity, 
  Target,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Shield,
  Edit,
  Trash2,
  X,
  Check,
  Coins,
  RefreshCw
} from 'lucide-react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Area, 
  AreaChart 
} from 'recharts';

const CryptoInvestments = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [priceData, setPriceData] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    avgPurchasePrice: '',
    purchaseDate: '',
    description: ''
  });

  const supportedCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
    { symbol: 'BNB', name: 'Binance Coin', color: '#F0B90B' },
    { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
    { symbol: 'XRP', name: 'Ripple', color: '#23292F' },
    { symbol: 'SOL', name: 'Solana', color: '#9945FF' },
    { symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
    { symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633' },
    { symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
    { symbol: 'SHIB', name: 'Shiba Inu', color: '#FFA409' },
    { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
    { symbol: 'LTC', name: 'Litecoin', color: '#BFBBBB' },
    { symbol: 'UNI', name: 'Uniswap', color: '#FF007A' },
    { symbol: 'LINK', name: 'Chainlink', color: '#375BD2' },
    { symbol: 'ATOM', name: 'Cosmos', color: '#2E3148' }
  ];

  const [cryptoPortfolio, setCryptoPortfolio] = useState([
    {
      id: 2,
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 2.5,
      avgPurchasePrice: 2800,
      purchaseDate: '2024-07-20',
      description: 'DeFi and smart contracts play',
      color: '#627EEA'
    },
    {
      id: 3,
      symbol: 'ADA',
      name: 'Cardano',
      quantity: 1500,
      avgPurchasePrice: 0.45,
      purchaseDate: '2024-08-10',
      description: 'Proof of stake investment',
      color: '#0033AD'
    },
    {
      id: 4,
      symbol: 'SOL',
      name: 'Solana',
      quantity: 15,
      avgPurchasePrice: 85,
      purchaseDate: '2024-05-30',
      description: 'High-performance blockchain',
      color: '#9945FF'
    }
  ]);

  const fetchCryptoPrices = useCallback(async () => {
    if (cryptoPortfolio.length === 0) return;
    
    setLoadingPrices(true);
    const prices = {};
    
    try {
      const uniqueSymbols = [...new Set(cryptoPortfolio.map(item => item.symbol))];
      
      for (const symbol of uniqueSymbols) {
        const mockPrices = {
          'BTC': 65000,
          'ETH': 3200,
          'ADA': 0.52,
          'SOL': 140,
          'BNB': 320,
          'XRP': 0.58,
          'DOT': 7.8,
          'DOGE': 0.08,
          'AVAX': 32,
          'SHIB': 0.000018,
          'MATIC': 0.65,
          'LTC': 95,
          'UNI': 12,
          'LINK': 15,
          'ATOM': 8.5
        };
        
        prices[symbol] = {
          price: mockPrices[symbol] || 1,
          change24h: (Math.random() - 0.5) * 10,
          lastUpdated: new Date().toISOString()
        };
      }
      
      setPriceData(prices);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setLoadingPrices(false);
    }
  }, [cryptoPortfolio]);

  useEffect(() => {
    fetchCryptoPrices();
  }, [fetchCryptoPrices]);

  const analytics = useMemo(() => {
    const enrichedPortfolio = cryptoPortfolio.map(item => {
      const currentPrice = priceData[item.symbol]?.price || item.avgPurchasePrice;
      const currentValue = item.quantity * currentPrice;
      const initialValue = item.quantity * item.avgPurchasePrice;
      const pnl = currentValue - initialValue;
      const pnlPercentage = ((currentValue - initialValue) / initialValue) * 100;
      
      return {
        ...item,
        currentPrice,
        currentValue,
        initialValue,
        pnl,
        pnlPercentage
      };
    });

    const totalInvestment = enrichedPortfolio.reduce((sum, item) => sum + item.initialValue, 0);
    const totalCurrentValue = enrichedPortfolio.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPnL = totalCurrentValue - totalInvestment;
    const totalPnLPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
    
    const allocation = enrichedPortfolio.map(item => ({
      name: item.symbol,
      value: item.currentValue,
      percentage: (item.currentValue / totalCurrentValue) * 100,
      color: item.color
    }));

    return {
      totalInvestment,
      totalCurrentValue,
      totalPnL,
      totalPnLPercentage,
      allocation,
      enrichedPortfolio,
      itemCount: cryptoPortfolio.length
    };
  }, [cryptoPortfolio, priceData]);

  const monthlyData = [
    { month: 'Jun', value: 5800 },
    { month: 'Jul', value: 6200 },
    { month: 'Aug', value: 7100 },
    { month: 'Sep', value: 8200 },
    { month: 'Oct', value: 7800 },
    { month: 'Nov', value: 8500 },
    { month: 'Dec', value: 8857 }
  ];

  const formatCurrency = (amount) => {
    if (!showBalance) return '$••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatCrypto = (amount, symbol) => {
    if (!showBalance) return '••••••';
    return `${amount.toFixed(8)} ${symbol}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddNew = () => {
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      avgPurchasePrice: '',
      purchaseDate: '',
      description: ''
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      symbol: item.symbol,
      name: item.name,
      quantity: item.quantity.toString(),
      avgPurchasePrice: item.avgPurchasePrice.toString(),
      purchaseDate: item.purchaseDate,
      description: item.description
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      setCryptoPortfolio(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedCrypto = supportedCryptos.find(c => c.symbol === formData.symbol);
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      symbol: formData.symbol,
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      avgPurchasePrice: parseFloat(formData.avgPurchasePrice),
      purchaseDate: formData.purchaseDate,
      description: formData.description,
      color: selectedCrypto?.color || '#6B7280'
    };

    if (editingItem) {
      setCryptoPortfolio(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setCryptoPortfolio(prev => [...prev, newItem]);
    }

    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                Crypto Portfolio
              </h1>
              <p className="text-gray-400">Track your cryptocurrency investments and performance</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchCryptoPrices}
                disabled={loadingPrices}
                className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-all duration-300 border border-gray-600"
              >
                <RefreshCw className={`w-5 h-5 ${loadingPrices ? 'animate-spin' : ''}`} />
                {loadingPrices ? 'Updating...' : 'Refresh Prices'}
              </button>
              
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Position
              </button>
              
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors border border-gray-600"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-orange-100 text-sm font-medium">Total Investment</h3>
              <DollarSign className="w-5 h-5 text-orange-200" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(analytics.totalInvestment)}</p>
            <div className="flex items-center gap-1">
              <Wallet className="w-4 h-4 text-orange-300" />
              <span className="text-orange-300 text-sm">Initial cost basis</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-yellow-100 text-sm font-medium">Current Value</h3>
              <Target className="w-5 h-5 text-yellow-200" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(analytics.totalCurrentValue)}</p>
            <div className="flex items-center gap-1">
              {loadingPrices ? (
                <RefreshCw className="w-4 h-4 text-yellow-300 animate-spin" />
              ) : (
                <Activity className="w-4 h-4 text-yellow-300" />
              )}
              <span className="text-yellow-300 text-sm">Live market value</span>
            </div>
          </div>

          <div className={`bg-gradient-to-r ${analytics.totalPnL >= 0 ? 'from-green-600 to-green-700' : 'from-red-600 to-red-700'} rounded-2xl p-6 shadow-2xl`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`${analytics.totalPnL >= 0 ? 'text-green-100' : 'text-red-100'} text-sm font-medium`}>Total P&L</h3>
              {analytics.totalPnL >= 0 ? 
                <ArrowUpRight className="w-5 h-5 text-green-200" /> : 
                <ArrowDownRight className="w-5 h-5 text-red-200" />
              }
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(analytics.totalPnL)}</p>
            <div className="flex items-center gap-1">
              {analytics.totalPnL >= 0 ? 
                <TrendingUp className="w-4 h-4 text-green-300" /> : 
                <TrendingDown className="w-4 h-4 text-red-300" />
              }
              <span className={`${analytics.totalPnL >= 0 ? 'text-green-300' : 'text-red-300'} text-sm font-medium`}>
                {analytics.totalPnLPercentage >= 0 ? '+' : ''}{analytics.totalPnLPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-100 text-sm font-medium">Holdings</h3>
              <Coins className="w-5 h-5 text-purple-200" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{analytics.itemCount}</p>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-purple-300" />
              <span className="text-purple-300 text-sm">Different cryptos</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Portfolio Allocation
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
                    formatter={(value) => [formatCurrency(value), 'Value']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {analytics.allocation.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-gray-400 text-xs">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Portfolio Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Portfolio Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#F97316"
                  fillOpacity={1}
                  fill="url(#colorCrypto)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Coins className="w-6 h-6" />
              Your Holdings
            </h3>
            {Object.keys(priceData).length > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Last updated: {new Date(Object.values(priceData)[0]?.lastUpdated || new Date()).toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="overflow-x-auto">
            {cryptoPortfolio.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Crypto Holdings</h3>
                <p className="text-gray-400 mb-6">Start by adding your first cryptocurrency position</p>
                <button
                  onClick={handleAddNew}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-white font-medium transition-colors"
                >
                  Add Your First Position
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Asset</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Holdings</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Avg Price</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Current Price</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Current Value</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">P&L</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.enrichedPortfolio.map((item, index) => {
                    const priceChange = priceData[item.symbol]?.change24h || 0;
                    
                    return (
                      <tr
                        key={item.id}
                        className={`border-t border-gray-700 hover:bg-gray-700/30 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: item.color }}>
                              {item.symbol}
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-400">{item.symbol}</span>
                                <span className="text-xs text-gray-500">Added {formatDate(item.purchaseDate)}</span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-white font-medium">{formatCrypto(item.quantity, item.symbol)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-white font-medium">{formatCurrency(item.avgPurchasePrice)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div>
                            <p className="text-white font-medium">{formatCurrency(item.currentPrice)}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {priceChange >= 0 ? 
                                <TrendingUp className="w-3 h-3" /> : 
                                <TrendingDown className="w-3 h-3" />
                              }
                              <span className="text-xs">{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-white font-semibold text-lg">{formatCurrency(item.currentValue)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div>
                            <p className={`font-semibold ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
                            </p>
                            <div className={`flex items-center justify-center gap-1 mt-1 ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.pnl >= 0 ? 
                                <ArrowUpRight className="w-3 h-3" /> : 
                                <ArrowDownRight className="w-3 h-3" />
                              }
                              <span className="text-xs font-medium">
                                {item.pnl >= 0 ? '+' : ''}{item.pnlPercentage.toFixed(2)}%
                              </span>
                            </div>
                          </div>
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
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'Edit Position' : 'Add New Position'}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cryptocurrency *</label>
                    <select
                      value={formData.symbol}
                      onChange={(e) => {
                        const crypto = supportedCryptos.find(c => c.symbol === e.target.value);
                        setFormData(prev => ({ 
                          ...prev, 
                          symbol: e.target.value,
                          name: crypto?.name || ''
                        }));
                      }}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Select Cryptocurrency</option>
                      {supportedCryptos.map(crypto => (
                        <option key={crypto.symbol} value={crypto.symbol}>
                          {crypto.name} ({crypto.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="Auto-filled from selection"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Average Purchase Price (USD) *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.avgPurchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, avgPurchasePrice: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Date *</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="Optional notes about this position"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 rounded-xl text-white font-medium transition-all duration-300"
                  >
                    <Check className="w-4 h-4" />
                    {editingItem ? 'Update Position' : 'Add Position'}
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

export default CryptoInvestments;
