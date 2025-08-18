import React, { useState, useEffect } from 'react';
import KuveraTransactions from './components/KuveraTransactions';
import  KuveraImg from './assets/Kuvera.png';
import  IbkrImg from './assets/ibkr-logo.png';
import { 
  Home, 
  CreditCard, 
  BarChart3, 
  User, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  FileText,
  Check,
  IndianRupee,
  Euro
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [brokerType, setBrokerType] = useState('Kuvera');
  const [uploadedFiles, setUploadedFiles] = useState({
    kuvera: null,
    interactive: null
  });

  // Sample data for charts
  const overviewData = [
    { month: 'Jan', income: 200, expenses: 180 },
    { month: 'Feb', income: 150, expenses: 200 },
    { month: 'Mar', income: 300, expenses: 150 },
    { month: 'Apr', income: 280, expenses: 220 },
    { month: 'May', income: 200, expenses: 180 },
    { month: 'Jun', income: 324, expenses: 200 },
    { month: 'Jul', income: 250, expenses: 170 },
    { month: 'Aug', income: 180, expenses: 160 },
    { month: 'Sep', income: 220, expenses: 190 },
    { month: 'Oct', income: 280, expenses: 200 },
    { month: 'Nov', income: 200, expenses: 180 },
    { month: 'Dec', income: 150, expenses: 140 }
  ];

  const activityData = [
    { month: 'Jan', earning: 4, spent: 2 },
    { month: 'Feb', earning: 3, spent: 4 },
    { month: 'Mar', earning: 5, spent: 3 },
    { month: 'Apr', earning: 4, spent: 3 },
    { month: 'May', earning: 6, spent: 2 },
    { month: 'Jun', earning: 3, spent: 4 },
    { month: 'Jul', earning: 5, spent: 3 },
    { month: 'Aug', earning: 4, spent: 2 },
    { month: 'Sep', earning: 3, spent: 3 },
    { month: 'Oct', earning: 5, spent: 2 },
    { month: 'Nov', earning: 4, spent: 3 },
    { month: 'Dec', earning: 6, spent: 2 }
  ];

  const sidebarItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Transactions', icon: BarChart3 },
    { name: 'Upload', icon: CreditCard },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Personal', icon: User },
    { name: 'Message', icon: MessageSquare },
    { name: 'Setting', icon: Settings }
  ];

  const transactions = [
    { name: 'Mathews Ferreira', amount: '+$54.00', time: '11:20 AM', avatar: '👤', type: 'positive' },
    { name: 'Floyd Miles', amount: '-$39.65', time: '10:40 AM', avatar: '👤', type: 'negative' },
    { name: 'Jerome Bell', amount: '+$26.00', time: '09:15 AM', avatar: '👤', type: 'positive' },
    { name: 'Ralph Edwards', amount: '-$66.21', time: '08:20 AM', avatar: '👤', type: 'negative' }
  ];

  //
  const [kuveraTransactions, setKuveraTransactions] = useState([]);
  const [ibkrTransactions, setIbkrTransactions] = useState([]);
  const [rupeeInvestments, setRupeeInvestments] = useState(0);
  const [usdInvestments, setUsdInvestments] = useState(9000);
  const [euroInvestments, setEuroInvestments] = useState(5000);
  const [netWorth, setNetWorth] = useState(0);
  const [goalAmount, setGoalAmount] = useState(10000000); // Set your goal amount here
  const [usdInrRate, setUsdInrRate] = useState(0);
  const [euroInrRate, setEuroInrRate] = useState(0);
  const [netWorthCurrency, setNetWorthCurrency] = useState('INR'); // 'INR' or 'USD' or 'EUR
  const [goalCurrency, setGoalCurrency] = useState('INR'); // 'INR' or 'USD' or 'EUR

  // Fetch USD/INR rate from exchangerate-api.com
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/INR')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.USD) {
          setUsdInrRate(1 / data.rates.USD);
        }
        if (data && data.rates && data.rates.EUR) {
          setEuroInrRate(1 / data.rates.EUR);
        }
      })
      .catch(() => {});
  }, []);

// Update net worth whenever investments, rates, or currency changes
useEffect(() => {
  if (netWorthCurrency === 'INR') {
    setNetWorth(
      rupeeInvestments +
      usdInvestments * usdInrRate +
      euroInvestments * euroInrRate
    );
  } else if (netWorthCurrency === 'USD') {
    setNetWorth(
      rupeeInvestments / usdInrRate +
      usdInvestments +
      (euroInvestments * euroInrRate) / usdInrRate
    );
  } else if (netWorthCurrency === 'EUR') {
    setNetWorth(
      rupeeInvestments / euroInrRate +
      usdInvestments * (usdInrRate / euroInrRate) +
      euroInvestments
    );
  }
}, [rupeeInvestments, usdInvestments, euroInvestments, usdInrRate, euroInrRate, netWorthCurrency]);

// Convert goalAmount (which is always in INR) to the selected currency
const getGoalAmountInCurrency = () => {
  if (netWorthCurrency === 'INR') {
    return goalAmount;
  } else if (netWorthCurrency === 'USD') {
    return usdInrRate > 0 ? goalAmount / usdInrRate : 0;
  } else if (netWorthCurrency === 'EUR') {
    return euroInrRate > 0 ? goalAmount / euroInrRate : 0;
  }
  return goalAmount;
};

useEffect(() => {
  // Load persisted rupeeInvestments on mount
  const saved = localStorage.getItem('rupeeInvestments');
  if (saved && !isNaN(Number(saved))) {
    setRupeeInvestments(Number(saved));
  }
}, []);
  

// Handle file uploads for different brokers
  const handleFileUpload = (broker, event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setUploadedFiles(prev => ({
        ...prev,
        [broker]: file
      }));
    }
    if (broker === 'kuvera') {
      handleKuveraFile(event);
    }
    if (broker === 'ibkr') {
      handleInteractiveFile(event);
    }
  };

  const handleInteractiveFile = (e) => {
    const selectedFile = e.target.files[0];
  }

  const handleKuveraFile = (e) => {

    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const fileDownloadUrl = URL.createObjectURL(selectedFile);
    const currentTime = new Date().toLocaleString();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const [headerLine, ...lines] = text.split("\n").filter(Boolean);
      const headers = headerLine.split(",");
      const parsed = lines.map((l) => {
        const vals = l.split(",");
        return headers.reduce(
          (obj, h, idx) => ({
            ...obj,
            [h.trim()]: vals[idx]?.trim(),
          }),
          {}
        );
      });
      setKuveraTransactions(parsed);
      
      // Calculate total mutual fund market value and save to state
      const total = parsed
        .filter(txn => txn['Type'] && txn['Type'].toLowerCase().includes('mutual'))
        .reduce((sum, txn) => {
          const val = parseFloat(
            txn['Market Value']?.replace(/[^0-9.-]+/g, '') || '0'
          );
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
      setRupeeInvestments(total);
      localStorage.setItem('rupeeInvestments', total);
      setActiveTab("Transactions");
    };
    reader.readAsText(selectedFile);
  }

  const payments = [
    { category: 'Account', amount: '$3240', color: 'bg-green-500' },
    { category: 'Software', amount: '$240', color: 'bg-green-500' },
    { category: 'Rent House', amount: '$1640', color: 'bg-green-500' },
    { category: 'Food', amount: '$140', color: 'bg-green-500' }
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-green-500 rounded mr-3"></div>
          <span className="text-xl font-semibold">FIRE</span>
        </div>
        
        <nav>
          {sidebarItems.map((item) => (
            <div
              key={item.name}
              className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                item.name === activeTab 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">{activeTab}</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..."
                className="bg-gray-800 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Bell className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white" />
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === 'Dashboard' && (
          <>
            {/* Net Worth Card */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Net Worth Card - Left Half */}
              <div className="flex-1 bg-gray-800 p-8 rounded-lg flex flex-col justify-between min-h-[220px]">
                <span className="text-gray-400 text-lg mb-4">Total Net Worth</span>
                <div className="flex flex-row items-center justify-between flex-1">
                  {/* Amount + Switcher */}
                  <div className="flex items-center w-full">
                    {/* Amount - always left aligned, takes all available space */}
                    <span className="text-4xl md:text-5xl font-bold text-white flex-1 text-left min-w-[120px]">
                      {netWorthCurrency === 'INR'
                        ? `₹ ${netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                        : netWorthCurrency === 'USD'
                          ? `$ ${netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                          : `€ ${netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                      }
                    </span>
                    {/* Currency Switcher & Icon - always right, fixed position */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setNetWorthCurrency(prev =>
                          prev === 'INR' ? 'EUR' : prev === 'USD' ? 'INR' : 'USD'
                        )}
                        className="p-2 rounded-full hover:bg-gray-700"
                        aria-label="Previous currency"
                      >
                        <span className="text-xl">{'‹'}</span>
                      </button>
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center
                          bg-gradient-to-br
                          ${
                            netWorthCurrency === 'INR'
                              ? 'from-blue-500 to-blue-600 ring-4 ring-blue-400'
                              : netWorthCurrency === 'USD'
                              ? 'from-yellow-400 to-yellow-500 ring-4 ring-yellow-300'
                              : 'from-green-400 to-green-600 ring-4 ring-green-300'
                          }`}
                        style={{ transition: 'background 0.3s' }}
                        title={`Show in ${netWorthCurrency}`}
                      >
                        {netWorthCurrency === 'INR' && <IndianRupee className="w-8 h-8 text-white" />}
                        {netWorthCurrency === 'USD' && <DollarSign className="w-8 h-8 text-white" />}
                        {netWorthCurrency === 'EUR' && <Euro className="w-8 h-8 text-white" />}
                      </div>
                      <button
                        onClick={() => setNetWorthCurrency(prev =>
                          prev === 'INR' ? 'USD' : prev === 'USD' ? 'EUR' : 'INR'
                        )}
                        className="p-2 rounded-full hover:bg-gray-700"
                        aria-label="Next currency"
                      >
                        <span className="text-xl">{'›'}</span>
                      </button>
                    </div>
                  </div>
                  {/* Fill right space */}
                  <div className="flex-1"></div>
                </div>
                <div className="flex items-center mt-6">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-green-500 text-sm font-medium">+12.5% from last month</span>
                </div>
              </div>

              {/* Goal Circle - Right Half */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  {/*
                    Calculate progress:
                    - Clamp between 0 and 1
                    - Use netWorth and goalAmount in the current netWorthCurrency
                  */}
              {(() => {
                // Calculate progress (0 to 1)
                const goalInCurrency = getGoalAmountInCurrency();
                let progress = 0;
                if (goalInCurrency > 0) {
                  progress = Math.min(1, netWorth / goalInCurrency);
                }
                const percent = Math.floor(progress * 100);

                const r = 85;
                const circumference = 2 * Math.PI * r;
                const dashoffset = circumference * (1 - progress);

                return (
                  <>
              <svg width="200" height="200" viewBox="0 0 200 200" className="mb-2">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={r}
                  stroke="#2d3748"
                  strokeWidth="20"
                  fill="none"
                />
                {/* INR arc */}
                {rupeeInvestments > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={r}
                    stroke="url(#inrGradient)"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference * (1 - Math.min(1, rupeeInvestments / goalInCurrency))
                    }
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1s',
                      zIndex: 3,
                    }}
                  />
                )}
                {/* USD arc */}
                {usdInvestments > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={r}
                    stroke="url(#usdGradient)"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference * (1 -
                        Math.min(1, (rupeeInvestments + usdInvestments * usdInrRate) / goalInCurrency)
                      )
                    }
                    style={{
                      transition: 'stroke-dashoffset 1s',
                      zIndex: 2,
                    }}
                    strokeLinecap="round"
                  />
                )}
                {/* EUR arc */}
                {euroInvestments > 0 && (
                  <circle
                    cx="100"
                    cy="100"
                    r={r}
                    stroke="url(#eurGradient)"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference * (1 -
                        Math.min(
                          1,
                          (rupeeInvestments + usdInvestments * usdInrRate + euroInvestments * euroInrRate) / goalInCurrency
                        )
                      )
                    }
                    style={{
                      transition: 'stroke-dashoffset 1s',
                      zIndex: 1,
                    }}
                    strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient id="inrGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                  <linearGradient id="usdGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e42" />
                  </linearGradient>
                  <linearGradient id="eurGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="2.5rem"
                  fontWeight="bold"
                  fill="#fff"
                >
                  {percent}%
                </text>
              </svg>
                    <div className="text-white text-xl font-semibold">Goal</div>
                    <div className="text-green-200 text-lg font-bold">
                      {netWorthCurrency === 'INR'
                        ? `₹${goalInCurrency.toLocaleString('en-IN')}`
                        : netWorthCurrency === 'USD'
                          ? `$${goalInCurrency.toLocaleString('en-US')}`
                          : `€${goalInCurrency.toLocaleString('en-US')}`}
                    </div>
                  </>
                );
              })()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              <div className="bg-gray-800 p-6 rounded-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 z-10 relative">
                  <span className="text-gray-400 text-sm">India Investments</span>
                </div>
                <div className="text-2xl font-semibold z-10 relative">
                  {rupeeInvestments.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                {/* Hero Rupee Symbol Banner */}
                <div className="absolute inset-y-0 right-0 h-full w-2/3 pointer-events-none" style={{marginRight: '-1.5rem'}}>
                  <IndianRupee
                    className="text-blue-600"
                    style={{
                      width: '50%',
                      height: '50%',
                      fontSize: '6rem',
                      opacity: 0.8,
                      display: 'block'
                    }}
                  />
                </div>
              </div>

              
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">USD Investments</span>
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-2xl font-semibold">{usdInvestments.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Euro Investements</span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-semibold">{euroInvestments.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Liabilities</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-semibold">0</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overview Chart */}
              <div className="col-span-1 lg:col-span-2 bg-gray-800 p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <h3 className="text-lg font-semibold">Overview</h3>
                  <div className="flex flex-wrap items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-400">Income</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-400">Expenses</span>
                    </div>
                    <select className="bg-gray-700 text-sm px-3 py-1 rounded">
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={overviewData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Credit Card */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Credit Card</h3>
                  <Plus className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
                </div>
                <div className="bg-gradient-to-br from-gray-700 to-gray-600 p-4 rounded-lg mb-4">
                  <div className="text-sm text-gray-300 mb-1">LOGO</div>
                  <div className="text-lg font-mono mb-4">5475 7381 3765 ••••</div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>$615,392 USD</span>
                    <span>04 / 24</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Recent Transaction</h4>
                    <span className="text-green-500 text-sm cursor-pointer">See all</span>
                  </div>
                  {transactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-full mr-3 flex items-center justify-center text-xs">
                          {transaction.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{transaction.name}</div>
                          <div className="text-xs text-gray-400">{transaction.time}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.type === 'positive' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Chart */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                  <h3 className="text-lg font-semibold">Activity</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-400">Earning</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-400">Spent</span>
                    </div>
                  </div>
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Bar dataKey="earning" fill="#10b981" />
                      <Bar dataKey="spent" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment */}
              <div className="col-span-1 lg:col-span-2 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-6">Payment</h3>
                {payments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${payment.color} rounded mr-4 flex items-center justify-center`}>
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium">{payment.category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{payment.amount}</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className={`h-2 ${payment.color} rounded-full`} style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transactions Page */}
        {activeTab === 'Transactions' && (
          <div className="space-y-6">
            {/* Broker Switch */}
            <div className="flex justify-center">
              <div className="bg-gray-800 p-1 rounded-lg flex">
                <button
                  onClick={() => setBrokerType('Kuvera')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    brokerType === 'Kuvera'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Kuvera
                </button>
                <button
                  onClick={() => setBrokerType('Interactive Broker')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    brokerType === 'Interactive Broker'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Interactive Broker
                </button>
              </div>
            </div>

            {/* Content based on selected broker */}
            {brokerType === 'Kuvera' ? (
              <KuveraTransactions 
                transactions={kuveraTransactions} 
                onTotalMarketValue={setRupeeInvestments}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Transactions - {brokerType}</h2>
                  <p className="text-gray-400">{brokerType} transaction management will be available here</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Page */}
        {activeTab === 'Upload' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Upload Transaction Files</h2>
              <p className="text-gray-400">Upload CSV files from your brokers to track your investments</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kuvera Upload Card */}
              <div className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 border-2 border-transparent hover:border-green-500/30">
                {/* Hero Image Section */}
                <div className="h-32 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <img
                    src={KuveraImg}
                    alt="Kuvera Logo"
                    className="absolute inset-0 w-full h-full object-cover z-10"
                  />
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-semibold mb-2">Kuvera Transactions</h3>
                  <p className="text-gray-400 mb-6">Upload your Kuvera transaction CSV file</p>
                  
                  {uploadedFiles.kuvera ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center mb-2">
                        <Check className="w-6 h-6 text-green-500 mr-2" />
                        <span className="text-green-500 font-medium">File Uploaded</span>
                      </div>
                      <p className="text-sm text-gray-300">{uploadedFiles.kuvera.name}</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4 hover:border-blue-500 transition-colors">
                      <div className="w-8 h-8 text-gray-400 mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-gray-400 mb-2">Drag & drop your CSV file here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload('kuvera', e)}
                    className="hidden"
                    id="kuvera-upload"
                  />
                  <label
                    htmlFor="kuvera-upload"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {uploadedFiles.kuvera ? 'Replace File' : 'Choose CSV File'}
                  </label>
                </div>
              </div>

              {/* Interactive Brokers Upload Card */}
              <div className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 border-2 border-transparent hover:border-green-500/30">
                {/* Hero Image Section */}
                <div className="h-32 bg-gradient-to-r from-red-400 via-red-500 to-red-600 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <img
                    src={IbkrImg}
                    alt="Interactive Brokers Logo"
                    className="absolute inset-0 w-full h-full object-cover z-10"
                  />
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-semibold mb-2">Interactive Brokers</h3>
                  <p className="text-gray-400 mb-6">Upload your Interactive Brokers CSV file</p>
                  
                  {uploadedFiles.interactive ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center mb-2">
                        <Check className="w-6 h-6 text-green-500 mr-2" />
                        <span className="text-green-500 font-medium">File Uploaded</span>
                      </div>
                      <p className="text-sm text-gray-300">{uploadedFiles.interactive.name}</p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4 hover:border-red-500 transition-colors">
                      <div className="w-8 h-8 text-gray-400 mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-gray-400 mb-2">Drag & drop your CSV file here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload('ibkr', e)}
                    className="hidden"
                    id="interactive-upload"
                  />
                  <label
                    htmlFor="interactive-upload"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {uploadedFiles.interactive ? 'Replace File' : 'Choose CSV File'}
                  </label>
                </div>
              </div>
            </div>

            {/* Upload Instructions */}
            <div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  Upload Instructions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-blue-400 mb-2">Kuvera CSV Format</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Export from Kuvera dashboard</li>
                      <li>• Include transaction history</li>
                      <li>• Ensure all columns are present</li>
                      <li>• File size limit: 10MB</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-400 mb-2">Interactive Brokers CSV Format</h5>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Export from TWS or Client Portal</li>
                      <li>• Include trade confirmations</li>
                      <li>• Standard IB CSV format</li>
                      <li>• File size limit: 10MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Page */}
        {activeTab === 'Analytics' && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Analytics</h2>
              <p className="text-gray-400">Advanced analytics will be available here</p>
            </div>
          </div>
        )}

        {/* Personal Page */}
        {activeTab === 'Personal' && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Personal</h2>
              <p className="text-gray-400">Personal settings will be available here</p>
            </div>
          </div>
        )}

        {/* Message Page */}
        {activeTab === 'Message' && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Messages</h2>
              <p className="text-gray-400">Message center will be available here</p>
            </div>
          </div>
        )}

        {/* Setting Page */}
        {activeTab === 'Setting' && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Settings</h2>
              <p className="text-gray-400">Application settings will be available here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;