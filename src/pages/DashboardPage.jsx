import React from 'react';
import { 
  IndianRupee, DollarSign, Euro, Siren, Plus 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import NetWorthWithGoal from '../components/NetworthWithGoal';
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
  overviewData,
  activityData,
  payments,
  transactions,
}) => {
  return (
    <>
      {/* Net Worth Card */}
      <NetWorthWithGoal
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
          Icon={IndianRupee}
          iconClassName="w-8 h-8 text-blue-500"
          amountLocale="en-IN"
        />

        <InvestmentCard
          title="USD Investments"
          amount={usdInvestments}
          currencySymbol="$"
          Icon={DollarSign}
          iconClassName="w-8 h-8 text-yellow-500"
          amountLocale="en-US"
        />

        <InvestmentCard
          title="Euro Investments"
          amount={euroInvestments}
          currencySymbol="€"
          Icon={Euro}
          iconClassName="w-8 h-8 text-green-500"
          amountLocale="en-US"
        />

        <InvestmentCard
          title="Liabilities"
          amount={0}
          currencySymbol="₹"
          Icon={Siren}
          iconClassName="w-8 h-8 text-red-500"
          amountLocale="en-IN"
        />
      </div>

      {/* Overview Chart, Credit Card, Activity Chart, Payment Section */}
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
  );
};

export default Dashboard;
