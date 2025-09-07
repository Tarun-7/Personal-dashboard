import React, { useState, useEffect } from 'react';
import './app.css'
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import GoalsPage from './pages/GoalsPage';
import Sidebar from './components/Sidebar';
import InrMutualFunds from './pages/INR/InrMutualFunds';
import InrInvestmentsOverview from './pages/INR/InrOverviewPage';
import InrSavingsDashboardPage from './pages/INR/InrSavingsDashboardPage';
import UsdStocksPage from './pages/USD/UsdStocksPage';
import UsdCryptoPage from './pages/USD/UsdCryptoPage';

import DataLoadingService from './services/DataLoadingService';
import InvestmentCalculationService from './services/InvestmentCalculationService';
import ExchangeRateService from './services/ExchangeRateService';

import { 
  Home, 
  BarChart3, 
  Settings, 
  Search, 
  Bell,
  Menu
} from 'lucide-react';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [brokerType, setBrokerType] = useState('Kuvera');
  const [uploadedFiles, setUploadedFiles] = useState({
    kuvera: null,
    ibkr: null
  });


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


  // Reviewed 
  const [rupeeInvestments, setRupeeInvestments] = useState(0);
  const [InrMfValue, setInrMfvalue] = useState(0);
  const [InrSavingsValue, setInrSavingsValue] = useState(0);


  //Reviewed states for investments and transactions
  const [kuveraTransactions, setKuveraTransactions] = useState([]);
  const [ibkrTransactions, setIbkrTransactions] = useState([]);
  const [usdInvestments, setUsdInvestments] = useState(0);
  const [euroInvestments, setEuroInvestments] = useState(7000);
  const [netWorth, setNetWorth] = useState(0);
  const [goalAmount, setGoalAmount] = useState(10000000); // Set your goal amount here
  const [usdInrRate, setUsdInrRate] = useState(null);
  const [euroInrRate, setEuroInrRate] = useState(null);
  const [netWorthCurrency, setNetWorthCurrency] = useState('INR'); // 'INR' or 'USD' or 'EUR
  const [goalCurrency, setGoalCurrency] = useState('INR'); // 'INR' or 'USD' or 'EUR

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [balances, setBalances] = useState([
    {
      id: 1,
      date: "2024-01-15",
      value: 185000,
      currency: "USD",
      note: "Monthly statement balance"
    },
    {
      id: 2,
      date: "2024-02-15", 
      value: 182000,
      currency: "USD",
      note: "After payment"
    }
  ]);

  // Fetch exchange rates
  useEffect(() => {
    const loadExchangeRates = async () => {
      const rates = await ExchangeRateService.fetchExchangeRates();
      if (rates.success) {
        setUsdInrRate(rates.usdInr);
        setEuroInrRate(rates.euroInr);
      }
    };

    loadExchangeRates();
  }, []);

  // Update net worth calculation
  useEffect(() => {
    if (usdInrRate && euroInrRate) {
      const investments = {
        rupee: rupeeInvestments,
        usd: usdInvestments,
        euro: euroInvestments
      };
      
      const exchangeRates = {
        usdInr: usdInrRate,
        euroInr: euroInrRate
      };

      const calculatedNetWorth = InvestmentCalculationService.calculateNetWorth(
        investments,
        exchangeRates,
        netWorthCurrency
      );
      
      setNetWorth(calculatedNetWorth);
    }
  }, [rupeeInvestments, usdInvestments, euroInvestments, usdInrRate, euroInrRate, netWorthCurrency]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load Kuvera data
      const kuveraData = await DataLoadingService.loadKuveraData();
      if (kuveraData.success) {
        setKuveraTransactions(kuveraData.transactions);
        setRupeeInvestments(kuveraData.totalValue);
        console.log('Initial Kuvera file loaded successfully');
      }

      // Load IBKR data
      const ibkrData = await DataLoadingService.loadIbkrData();
      if (ibkrData.success) {
        setIbkrTransactions(ibkrData.transactions);
        setUsdInvestments(ibkrData.totalValue);
        console.log('Initial IBKR file loaded successfully');
      }
    };

    loadInitialData();
  }, []);

// Convert goalAmount (which is always in INR) to the selected currency
  const getGoalAmountInCurrency = () => {
    const exchangeRates = { usdInr: usdInrRate, euroInr: euroInrRate };
    return InvestmentCalculationService.convertGoalAmountToCurrency(
      goalAmount,
      netWorthCurrency,
      exchangeRates
    );
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

  const handleKuveraFile = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    try {
      const result = await DataLoadingService.processKuveraFile(selectedFile);
      
      setKuveraTransactions(result.transactions);
      setRupeeInvestments(result.totalValue);
      setActiveTab("inr-mutual-funds");
      setBrokerType("Kuvera");
    } catch (error) {
      console.error('Error processing Kuvera file:', error);
      // Handle error appropriately
    }
  };

  const handleIbkrFile = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    try {
      const result = await DataLoadingService.processIbkrFile(selectedFile);
      
      setIbkrTransactions(result.transactions);
      setUsdInvestments(result.totalValue);
      setActiveTab('usd-stocks');
      setBrokerType("Interactive Broker");
    } catch (error) {
      console.error('Error processing IBKR file:', error);
      // Handle error appropriately
    }
  };

    const [liability, setLiability] = useState([
    {
      id: 1,
      date: "2024-01-15",
      value: 185000,
      currency: "USD",
      note: "Monthly statement balance"
    },
    {
      id: 2,
      date: "2024-02-15", 
      value: 182000,
      currency: "USD",
      note: "After payment"
    }
  ]);


  return (
    <div className="flex h-screen bg-slate-950 text-white">
      
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleSidebar={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-0">
          <div className="flex items-center">
            {!sidebarOpen && (
              <button
                className="mr-4 bg-gray-800 rounded-lg p-2 hover:bg-gray-700 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open Sidebar"
              >
                <Menu size={20} className="text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
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
              activityData={activityData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'inr-overview' && (
            <InrInvestmentsOverview 
              transactions={kuveraTransactions} 
              onTotalMarketValue={setRupeeInvestments} 
            />
          )}

          {activeTab === 'inr-mutual-funds' && (
            <InrMutualFunds 
              transactions={kuveraTransactions} 
              onTotalMarketValue={setRupeeInvestments} 
            />
          )}

          {activeTab === 'inr-savings' && (
            <InrSavingsDashboardPage
            />
          )}
          
          {activeTab === 'usd-stocks' && (
            <UsdStocksPage
              transactions={ibkrTransactions}
              onTotalMarketValueChange={setUsdInvestments}
            />
          )}  

          {activeTab === 'usd-crypto' && (
            <UsdCryptoPage
            />
          )}  

          {/* Upload Page */}
          {activeTab === 'Upload' && (
            <UploadPage
              uploadedFiles={uploadedFiles}
              handleFileUpload={handleFileUpload}
            />
          )}


          {/* Liabilities Page */}
          {activeTab === 'Liabilities' && (
            <LiabilitiesPage
              balances={liability}
              setBalances={setLiability}
            />
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

          {/* Goal Page */}
          {activeTab === "Goals" && <GoalsPage />}

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
    </div>
  );
};

export default Dashboard;