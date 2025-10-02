import React, { useState, useEffect } from 'react';

// Import Components
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import LiabilitiesPage from './pages/LiabilitiesPage';
import GoalsPage from './pages/GoalsPage';
import Sidebar from './components/Sidebar';
import InrMutualFunds from './pages/INR/InrMutualFunds';
import CashSavingsPage from './pages/CashSavingsPage';
import UsdStocksPage from './pages/USD/UsdStocksPage';
import CryptoInvestments from './pages/CryptoInvestmentsPage';
import LoadingPage from './pages/LoadingPage';
import PageHeader from './components/PageHeader';

// Import Services
import DataLoadingService from './services/DataLoadingService';
import InvestmentCalculationService from './services/InvestmentCalculationService';
import ExchangeRateService from './services/ExchangeRateService';
import MutualFundCalculationService from './services/MutualFundCalculationService';
import SavingsCalculationService from './services/SavingsCalculationService'; 
import UsdStocksCalculationService from './services/UsdStocksCalculationService';

// Import authentication components
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { 
  BarChart3, 
  Settings, 
  Menu
} from 'lucide-react';

const Dashboard = () => {

  // Reviewed states
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if it's mobile on initial load
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    kuvera: null,
    ibkr: null
  });
  const [rupeeInvestments, setRupeeInvestments] = useState(0);
  const [InrMfValue, setInrMfvalue] = useState(0);
  const [cashAndSavings, setCashAndSavings] = useState(0);
  const [inrMutualFundSummary, setInrMutualFundSummary] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    absoluteReturn: 0,
    fundsData: []
  });
  const [savingsSummary, setSavingsSummary] = useState({
    savingsData: [],
    totalAmount: 0,
    avgInterestRate: 0,
    totalInterestEarning: 0,
    allocation: [],
    itemCount: 0,
    error: null
  });
  const [usdStocksSummary, setUsdStocksSummary] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    absoluteReturn: 0,
    fundsData: []
  });
  const [kuveraTransactions, setKuveraTransactions] = useState([]);
  const [ibkrTransactions, setIbkrTransactions] = useState([]);
  const [usdInvestments, setUsdInvestments] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [usdInrRate, setUsdInrRate] = useState(null);
  const [euroInrRate, setEuroInrRate] = useState(null);
  const [netWorthCurrency, setNetWorthCurrency] = useState('INR');
  const [euroInvestments, setEuroInvestments] = useState(7000);  // Assuming a static value for Euro investments for now
  const [loadingStates, setLoadingStates] = useState({
    savings: true,
    mutualFunds: false,
    usdStocks: false,
    exchangeRates: true,
    initialData: true
  });

  // Review states for investments and transactions
  const [goalAmount, setGoalAmount] = useState(10000000); // Set your goal amount here // 'INR' or 'USD' or 'EUR
  const [goalCurrency, setGoalCurrency] = useState('INR'); // 'INR' or 'USD' or 'EUR
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

  // Update rupee investments whenever mutual fund or savings values change
  useEffect(() => {
    setRupeeInvestments(InrMfValue + cashAndSavings);
  }, [InrMfValue, cashAndSavings]);

  // Load savings data on app initialization
  useEffect(() => {
    const loadSavingsData = async () => {
      try {
        updateLoadingState('savings', true);
        const summary = await SavingsCalculationService.calculateSavingsSummary();
        setSavingsSummary(summary);
        setCashAndSavings(summary.totalAmount); // Update the dashboard value
      } catch (error) {
        console.error('Error loading savings data:', error);
      } finally {
        updateLoadingState('savings', false);
      }
    };

    loadSavingsData();
  }, []);

  // Helper function to update loading state
  const updateLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Check if any calculations are still loading
  const isLoading = Object.values(loadingStates).some(state => state === true);

  // Function to handle savings data updates from the savings page
  const handleSavingsUpdate = (updatedSummary) => {
    setSavingsSummary(updatedSummary);
    setCashAndSavings(updatedSummary.totalAmount);
  };

  // Calculate mutual fund summary when Kuvera transactions change
  useEffect(() => {
    const calculateMutualFundSummary = async () => {
      if (kuveraTransactions.length > 0) {
        try {
          updateLoadingState('mutualFunds', true);
          const summary = await MutualFundCalculationService.calculateMutualFundSummary(kuveraTransactions);
          setInrMutualFundSummary(summary);
          setInrMfvalue(summary.totalCurrentValue);
        } catch (error) {
          console.error('Error calculating mutual fund summary:', error);
          // Fallback to basic calculation without API data
          const basicSummary = {
            totalInvested: 0,
            totalCurrentValue: 0,
            totalProfitLoss: 0,
            absoluteReturn: 0,
            xirrReturn: 0,
            fundsData: []
          };
          setInrMutualFundSummary(basicSummary);
        } finally {
          updateLoadingState('mutualFunds', false);
        }
      } else {
        updateLoadingState('mutualFunds', false);
      }
    };

    calculateMutualFundSummary();
  }, [kuveraTransactions]);

// Calculate USD stocks summary when IBKR transactions change
useEffect(() => {
  const calculateUsdStocksSummary = async () => {
    if (ibkrTransactions.length > 0) {
      try {
        updateLoadingState('usdStocks', true);
        // Import or create a UsdStocksCalculationService similar to MutualFundCalculationService
        const summary = await UsdStocksCalculationService.calculateUsdStocksSummary(ibkrTransactions, euroInrRate, usdInrRate);
        setUsdStocksSummary(summary);
        setUsdInvestments(summary.totalCurrentValue);
        console.log('USD Stocks summary calculated:', summary);
      } catch (error) {
        console.error('Error calculating USD stocks summary:', error);
        // Fallback to basic calculation
        const basicValue = InvestmentCalculationService.calculateTotalTradeValue(ibkrTransactions);
        setUsdInvestments(basicValue);
        setUsdStocksSummary({
          totalInvested: basicValue,
          totalCurrentValue: basicValue,
          totalProfitLoss: 0,
          absoluteReturn: 0,
          fundsData: []
        });
      } finally {
        updateLoadingState('usdStocks', false);
      }
    } else {
      setUsdInvestments(0);
      updateLoadingState('usdStocks', false);
    }
  };

  calculateUsdStocksSummary();
}, [ibkrTransactions]);


  // Fetch exchange rates
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        updateLoadingState('exchangeRates', true);
        const rates = await ExchangeRateService.fetchExchangeRates();
        if (rates.success) {
          setUsdInrRate(rates.usdInr);
          setEuroInrRate(rates.euroInr);
          console.log('Exchange rates loaded successfully');
        }
      } catch (error) {
        console.error('Error loading exchange rates:', error);
      } finally {
        updateLoadingState('exchangeRates', false);
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
        cashAndSavings: cashAndSavings
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
  }, [rupeeInvestments, usdInvestments, cashAndSavings, usdInrRate, euroInrRate, netWorthCurrency]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        updateLoadingState('initialData', true);
        
        // Load Kuvera data
        const kuveraData = await DataLoadingService.loadKuveraData();
        if (kuveraData.success) {
          setKuveraTransactions(kuveraData.transactions);
          console.log('Initial Kuvera file loaded successfully');
          // This will trigger mutual fund calculation
          updateLoadingState('mutualFunds', true);
        }

        // Load IBKR data
        const ibkrData = await DataLoadingService.loadIbkrData();
        if (ibkrData.success) {
          setIbkrTransactions(ibkrData.transactions);
          console.log('Initial IBKR file loaded successfully');
          // This will trigger USD stocks calculation
          updateLoadingState('usdStocks', true);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        updateLoadingState('initialData', false);
      }
    };
    loadInitialData();
  }, []);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false); // Close sidebar when switching to mobile view
      }
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

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
      updateLoadingState('mutualFunds', true);
      const result = await DataLoadingService.processKuveraFile(selectedFile);
      setKuveraTransactions(result.transactions);
      setActiveTab("INR Investments");
    } catch (error) {
      console.error('Error processing Kuvera file:', error);
      updateLoadingState('mutualFunds', false);
    }
  };

  const handleIbkrFile = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    try {
      updateLoadingState('usdStocks', true);
      const result = await DataLoadingService.processIbkrFile(selectedFile);
      setIbkrTransactions(result.transactions);
      setActiveTab('USD Investments');
    } catch (error) {
      console.error('Error processing IBKR file:', error);
      updateLoadingState('usdStocks', false);
    }
  };

  if (isLoading) {
    return (
       <LoadingPage />
      );
  }

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
        <div className="flex items-center p-6 pb-0">
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

        <div className="p-6">
          {/* Stats Cards */}
          {activeTab === 'Dashboard' && (
            <DashboardPage
              netWorth={netWorth}
              netWorthCurrency={netWorthCurrency}
              setNetWorthCurrency={setNetWorthCurrency}
              rupeeInvestments={rupeeInvestments}
              usdInvestments={usdInvestments}
              cashAndSavings={cashAndSavings}
              usdInrRate={usdInrRate}
              euroInrRate={euroInrRate}
              getGoalAmountInCurrency={getGoalAmountInCurrency}
              activityData={activityData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'INR Investments' && (
            <InrMutualFunds 
              transactions={kuveraTransactions} 
              mutualFundSummary={inrMutualFundSummary}
            />
          )}

          {activeTab === 'Cash & Savings' && (
            <CashSavingsPage 
              savingsSummary={savingsSummary}
              onSavingsUpdate={handleSavingsUpdate}
              usdInrRate={usdInrRate}
              euroInrRate={euroInrRate}
            />
          )}
          
          {activeTab === 'USD Investments' && (
            <UsdStocksPage
              transactions={ibkrTransactions}
              usdStocksSummary={usdStocksSummary}
            />
          )}  

          {activeTab === 'Crypto Investments' && (
            <CryptoInvestments
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

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}

export default App;