import React from 'react';
import { 
  IndianRupee, DollarSign, Euro, Siren, Plus 
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, BarChart, Bar } from 'recharts';
import NetWorthCard from '../components/NetworthCard';
import InvestmentCard from '../components/InvestmentCard';

const Dashboard = ({
  netWorth,
  netWorthCurrency,
  setNetWorthCurrency,
  rupeeInvestments,
  usdInvestments,
  euroInvestments,
  usdInrRate,
  euroInrRate,
  getGoalAmountInCurrency,
  activityData,
  setActiveTab
}) => {
  return (
    
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start pb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Portfolio Overview
            </h1>
            <p className="text-gray-400">
              Your comprehensive financial dashboard
            </p>
          </div>
        </div>

        {/* Net Worth Card */}
        <NetWorthCard
          netWorth={netWorth}
          netWorthCurrency={netWorthCurrency}
          setNetWorthCurrency={setNetWorthCurrency}
          rupeeInvestments={rupeeInvestments}
          usdInvestments={usdInvestments}
          euroInvestments={euroInvestments}
          usdInrRate={usdInrRate}
          euroInrRate={euroInrRate}
          getGoalAmountInCurrency={getGoalAmountInCurrency}
        />

        {/* Investment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <InvestmentCard
            title="INR Investments"
            amount={rupeeInvestments}
            currencySymbol="₹"
            delta="+8.2% this month"
            deltaPositive={true}
            icons={<IndianRupee className="h-6 w-6 text-white" />}
            badgeGradient={["#3b82f6", "#2563eb"]}
            amountLocale="en-IN"
            onClick={() => setActiveTab('INR Investments')} // Sidebar path
          />

          <InvestmentCard
            title="USD Investments"
            amount={usdInvestments}
            currencySymbol="$"
            delta="+8.2% this month"
            deltaPositive={true}
            lastUpdated="2 hours ago"
            fxNote="1 USD = ₹83.25"
            icons={<DollarSign className="h-6 w-6 text-white" />}
            badgeGradient={["#fbbf24", "#f59e0b"]}
            amountLocale="en-US"
            onClick={() => setActiveTab('USD Investments')} // Sidebar path
          />

          <InvestmentCard
            title="Euro Investments"
            amount={euroInvestments}
            currencySymbol="€"
            delta="+8.2% this month"
            deltaPositive={true}
            lastUpdated="2 hours ago"
            fxNote="1 USD = ₹83.25"
            icons={<Euro className="h-6 w-6 text-white" />}
            badgeGradient={["#34d399", "#10b981"]}  
            amountLocale="en-US"
          />

          <InvestmentCard
            title="Liabilities"
            amount={0}
            currencySymbol="₹"
            icons={<Siren className="h-6 w-6 text-white"/>}
            badgeGradient={["#ef4444", "#dc2626"]}
            amountLocale="en-IN"
            delta="+8.2% this month"
            deltaPositive={false}
            lastUpdated="2 hours ago"
          />
        </div>

        {/* Activity Chart */}
        <div className="grid">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-lg font-semibold">Activity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-400">INR Investments</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-400">USD Investements</span>
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
        </div>
      </div>
    </div>
    
  );
};

export default Dashboard;
