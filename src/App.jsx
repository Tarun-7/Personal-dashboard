import React, { useState, useEffect } from 'react';
import './app.css'
import KuveraTransactions from './components/KuveraTransactions';
import TransactionsTab from './pages/Transactions';
import DashboardPage from './pages/DashboardPage';
import UploadTab from './pages/UploadPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import { 
  Home, 
  CreditCard, 
  BarChart3, 
  User, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell,
  Siren
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
    { name: 'Liabilities', icon: Siren },
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
  const [usdInvestments, setUsdInvestments] = useState(0);
  const [euroInvestments, setEuroInvestments] = useState(7000);
  const [netWorth, setNetWorth] = useState(0);
  const [goalAmount, setGoalAmount] = useState(10000000); // Set your goal amount here
  const [usdInrRate, setUsdInrRate] = useState(null);
  const [euroInrRate, setEuroInrRate] = useState(null);
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
          console.log("EUR to INR Rate:", 1 / data.rates.EUR);
          console.log("Euro Investments (INR):", euroInvestments);
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
      handleIbkrFile(event);
    }
  };

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

      setActiveTab("Transactions");
    };
    reader.readAsText(selectedFile);
  }
// Simple CSV parser handling quoted fields (does not support multiline fields)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Parse headers
  const headers = csvSplitLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = csvSplitLine(line);
    return headers.reduce((obj, h, i) => {
      obj[h.trim()] = values[i]?.trim() || '';
      return obj;
    }, {});
  });
  return { headers, rows };
}

// Split CSV line into fields properly handling quoted commas
function csvSplitLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const handleIbkrFile = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;
  const reader = new FileReader();

  reader.onload = (ev) => {
    const text = ev.target.result;
    const { rows } = parseCSV(text);

    setIbkrTransactions(rows);

    const totalTradeValue = rows.reduce((sum, txn) => {
      const val = parseFloat(txn['TradeMoney']) || 0;
      return sum + Math.abs(val);
    }, 0);

    console.log('Total IBKR trade value:', totalTradeValue);
    setActiveTab('Transactions');
  };

  reader.readAsText(selectedFile);
};

// Liabilities
const [liabilities, setLiabilities] = useState([]);

// Calculate total liabilities in dashboard currency
const totalLiabilities = liabilities.reduce((sum, l) => {
  if (netWorthCurrency === l.currency) return sum + l.amount;
  if (l.currency === 'USD' && netWorthCurrency === 'INR' && usdInrRate)
    return sum + l.amount * usdInrRate;
  if (l.currency === 'INR' && netWorthCurrency === 'USD' && usdInrRate)
    return sum + l.amount / usdInrRate;
  // For more currencies, extend as needed.
  return sum;
}, 0);



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
          <DashboardPage
            netWorth={netWorth}
            netWorthCurrency={netWorthCurrency}
            setNetWorthCurrency={setNetWorthCurrency}
            rupeeInvestments={rupeeInvestments}
            usdInvestments={usdInvestments}
            euroInvestments={euroInvestments}
            usdInrRate={usdInrRate}
            euroInrRate={euroInrRate}
            getGoalAmountInCurrency={getGoalAmountInCurrency}
            overviewData={overviewData}
            activityData={activityData}
            payments={payments}
            transactions={transactions}
          />
        )}

        {/* Transactions Page */}
        {activeTab === 'Transactions' && (
          <TransactionsTab
            brokerType={brokerType}
            setBrokerType={setBrokerType}
            kuveraTransactions={kuveraTransactions}
            setRupeeInvestments={setRupeeInvestments}
            ibkrTransactions={ibkrTransactions}
            setUsdInvestments={setUsdInvestments}
          />
        )}


        {/* Upload Page */}
        {activeTab === 'Upload' && (
          <UploadTab
            uploadedFiles={uploadedFiles}
            handleFileUpload={handleFileUpload}
          />
        )}


        {/* Liabilities Page */}
        {activeTab === 'Liabilities' && (
          <LiabilitiesPage liabilities={liabilities} setLiabilities={setLiabilities} />
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