import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Activity, 
  Target,
  Calendar,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Plus,
  RefreshCw
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Area, AreaChart, Legend } from 'recharts';

const InrInvestmentsOverview = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [timeframe, setTimeframe] = useState('1Y');

  // All historical data
  const allPerformanceData = [
    { month: 'Jan 2024', value: 3000000, invested: 2950000, date: new Date('2024-01-01') },
    { month: 'Feb 2024', value: 3200000, invested: 3100000, date: new Date('2024-02-01') },
    { month: 'Mar 2024', value: 3350000, invested: 3200000, date: new Date('2024-03-01') },
    { month: 'Apr 2024', value: 3400000, invested: 3300000, date: new Date('2024-04-01') },
    { month: 'May 2024', value: 3600000, invested: 3400000, date: new Date('2024-05-01') },
    { month: 'Jun 2024', value: 3750000, invested: 3450000, date: new Date('2024-06-01') },
    { month: 'Jul 2024', value: 3800000, invested: 3500000, date: new Date('2024-07-01') },
    { month: 'Aug 2024', value: 3900000, invested: 3520000, date: new Date('2024-08-01') },
    { month: 'Sep 2024', value: 4000000, invested: 3540000, date: new Date('2024-09-01') },
    { month: 'Oct 2024', value: 4100000, invested: 3549000, date: new Date('2024-10-01') },
    { month: 'Nov 2024', value: 4050000, invested: 3549631, date: new Date('2024-11-01') },
    { month: 'Dec 2024', value: 4119856, invested: 3549631, date: new Date('2024-12-01') }
  ];

  const allContributionsData = [
    { month: 'Jan', amount: 50000, date: new Date('2024-01-01') },
    { month: 'Feb', amount: 75000, date: new Date('2024-02-01') },
    { month: 'Mar', amount: 45000, date: new Date('2024-03-01') },
    { month: 'Apr', amount: 60000, date: new Date('2024-04-01') },
    { month: 'May', amount: 80000, date: new Date('2024-05-01') },
    { month: 'Jun', amount: 55000, date: new Date('2024-06-01') },
    { month: 'Jul', amount: 70000, date: new Date('2024-07-01') },
    { month: 'Aug', amount: 40000, date: new Date('2024-08-01') },
    { month: 'Sep', amount: 65000, date: new Date('2024-09-01') },
    { month: 'Oct', amount: 50000, date: new Date('2024-10-01') },
    { month: 'Nov', amount: 30000, date: new Date('2024-11-01') },
    { month: 'Dec', amount: 45000, date: new Date('2024-12-01') }
  ];

  // Filter data based on timeframe
  const getFilteredData = (data, timeframe) => {
    const now = new Date();
    let cutoffDate;
    
    switch(timeframe) {
      case '1M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6M':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1Y':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'ALL':
      default:
        return data;
    }
    
    return data.filter(item => item.date >= cutoffDate);
  };

  const performanceData = getFilteredData(allPerformanceData, timeframe);
  const monthlyContributions = getFilteredData(allContributionsData, timeframe);

  // Calculate portfolio data based on current timeframe
  const portfolioData = useMemo(() => {
    const currentData = performanceData[performanceData.length - 1] || allPerformanceData[allPerformanceData.length - 1];
    const previousData = performanceData[0] || allPerformanceData[0];
    
    const totalValue = currentData.value;
    const totalInvested = currentData.invested;
    const totalGains = totalValue - totalInvested;
    const gainsPercent = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;
    
    // Calculate growth from start of period
    const periodGrowth = previousData.value > 0 ? ((totalValue - previousData.value) / previousData.value) * 100 : 0;
    
    return {
      totalValue,
      totalInvested,
      totalGains,
      gainsPercent,
      monthlyGrowth: periodGrowth
    };
  }, [timeframe, performanceData]);

  // Asset allocation (remains constant but could be made dynamic)
  const assetAllocation = [
    { name: 'Mutual Funds', value: portfolioData.totalValue * 0.586, percentage: 58.6, color: '#3B82F6', growth: 16.2 },
    { name: 'Stocks', value: portfolioData.totalValue * 0.300, percentage: 30.0, color: '#10B981', growth: 12.5 },
    { name: 'Crypto', value: portfolioData.totalValue * 0.075, percentage: 7.5, color: '#F59E0B', growth: 25.8 },
    { name: 'Fixed Deposits', value: portfolioData.totalValue * 0.039, percentage: 3.9, color: '#6366F1', growth: 6.5 }
  ];

  const topPerformers = [
    { name: 'Quant Multi Cap Growth Direct Plan', returns: 79.66, value: 215580, type: 'Mutual Fund' },
    { name: 'Reliance Industries Ltd', returns: 45.2, value: 156780, type: 'Stock' },
    { name: 'Bitcoin', returns: 145.8, value: 125430, type: 'Crypto' },
    { name: 'Tata Small Cap Growth Direct Plan', returns: 11.39, value: 267321, type: 'Mutual Fund' }
  ];

  const formatCurrency = (amount) => {
    if (!showBalance) return '₹••••••';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                INR Investments Overview
              </h1>
              <p className="text-gray-400">Comprehensive view of your Indian rupee investments</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
                {['1M', '3M', '6M', '1Y', 'ALL'].map(period => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      timeframe === period 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 lg:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-100 text-xs lg:text-sm font-medium">Total Portfolio</h3>
              <Wallet className="w-4 h-4 lg:w-5 lg:h-5 text-blue-200 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 break-all">{formatCurrency(portfolioData.totalValue)}</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-300 flex-shrink-0" />
              <span className="text-green-300 text-xs lg:text-sm truncate">+{portfolioData.monthlyGrowth.toFixed(1)}% this period</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-4 lg:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-100 text-xs lg:text-sm font-medium">Total Invested</h3>
              <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-green-200 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 break-all">{formatCurrency(portfolioData.totalInvested)}</p>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 lg:w-4 lg:h-4 text-green-300 flex-shrink-0" />
              <span className="text-green-300 text-xs lg:text-sm truncate">Since inception</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-4 lg:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-emerald-100 text-xs lg:text-sm font-medium">Total Gains</h3>
              <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-200 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 break-all">{formatCurrency(portfolioData.totalGains)}</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-300 flex-shrink-0" />
              <span className="text-emerald-300 text-xs lg:text-sm truncate">{formatPercent(portfolioData.gainsPercent)} returns</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-4 lg:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-100 text-xs lg:text-sm font-medium">Asset Classes</h3>
              <Target className="w-4 h-4 lg:w-5 lg:h-5 text-purple-200 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{assetAllocation.length}</p>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 lg:w-4 lg:h-4 text-purple-300 flex-shrink-0" />
              <span className="text-purple-300 text-xs lg:text-sm truncate">Diversified</span>
            </div>
          </div>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="flex gap-6">
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Portfolio Summary Cards */}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Asset Allocation Pie Chart */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Asset Allocation
                </h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={assetAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {assetAllocation.map((entry, index) => (
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
                  {assetAllocation.map((asset, index) => (
                    <div key={asset.name} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: asset.color }}></div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{asset.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{asset.percentage.toFixed(1)}%</span>
                          <span className={`text-xs ${asset.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercent(asset.growth)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Performance */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Portfolio Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => [formatCurrency(value), value === performanceData[0]?.value ? 'Current Value' : 'Invested']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorInvested)"
                      strokeWidth={2}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Monthly Contributions */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Contributions
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyContributions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => [formatCurrency(value), 'Contribution']}
                    />
                    <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performers */}
              <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Performers
                </h3>
                <div className="space-y-4">
                  {topPerformers.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm max-w-xs truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.type === 'Mutual Fund' ? 'bg-blue-600/20 text-blue-400' :
                              item.type === 'Stock' ? 'bg-green-600/20 text-green-400' :
                              'bg-yellow-600/20 text-yellow-400'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-gray-400 text-xs">{formatCurrency(item.value)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">{formatPercent(item.returns)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="w-80 space-y-6">
            {/* Quick Actions Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
                <RefreshCw className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
              
              <div className="space-y-4">
                <button className="w-full flex items-center gap-4 p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-all duration-300 hover:scale-[1.02] text-left">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">View Mutual Funds</p>
                    <p className="text-blue-300 text-sm">₹24.2L invested • 4 funds</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-blue-400" />
                </button>

                <button className="w-full flex items-center gap-4 p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-all duration-300 hover:scale-[1.02] text-left">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">View Savings</p>
                    <p className="text-purple-300 text-sm">₹10.5L invested • 2 accounts</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            </div>

            {/* Add Investment */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-indigo-500/30 p-6 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Add New Investment</h3>
                <p className="text-gray-400 text-sm mb-4">Diversify your portfolio with new assets</p>
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02]">
                  Start Investing
                </button>
              </div>
            </div>

            {/* Market Summary */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Market Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">NIFTY 50</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">22,326.90</span>
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +1.2%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">SENSEX</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">73,651.35</span>
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +0.8%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">USD/INR</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">83.45</span>
                    <span className="text-red-400 text-sm flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      -0.3%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InrInvestmentsOverview;