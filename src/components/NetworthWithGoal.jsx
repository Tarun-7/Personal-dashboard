import React from 'react';
import { IndianRupee, DollarSign, Euro, TrendingUp } from 'lucide-react';
import GoalProgress from './GoalProgress';

const NetWorthWithGoal = ({
  netWorth,
  netWorthCurrency,
  setNetWorthCurrency,
  rupeeInvestments,
  usdInvestments,
  euroInvestments,
  usdInrRate,
  euroInrRate,
  getGoalAmountInCurrency,
}) => {
  
  const goalInCurrency = getGoalAmountInCurrency();

  // Calculate progress (0 to 1)
  let progress = 0;
  if (goalInCurrency > 0) {
    progress = Math.min(1, netWorth / goalInCurrency);
  }

  let symbolForYourCurrency = '₹'; // default

  if (netWorthCurrency === 'INR') symbolForYourCurrency = '₹';
  else if (netWorthCurrency === 'USD') symbolForYourCurrency = '$';
  else if (netWorthCurrency === 'EUR') symbolForYourCurrency = '€';

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      {/* Net Worth Card - Left Half */}
      <div className="flex-1 bg-gray-800 p-8 rounded-lg flex flex-col justify-between min-h-[220px]">
        <span className="text-gray-400 text-lg mb-4">Total Net Worth</span>
        <div className="flex flex-row items-center justify-between flex-1">
          {/* Amount + Switcher */}
          <div className="flex items-center w-full">
            {/* Amount */}
            <span className="text-4xl md:text-5xl font-bold text-white flex-1 text-left min-w-[120px]">
              {netWorthCurrency === 'INR'
                ? `₹ ${netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : netWorthCurrency === 'USD'
                  ? `$ ${netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  : `€ ${netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              }
            </span>
            {/* Currency Switcher & Icon */}
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
          <div className="flex-1" />
        </div>
        <div className="flex items-center mt-6">
          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-green-500 text-sm font-medium">+12.5% from last month</span>
        </div>
      </div>

      {/* Goal Circle - Right Half */}
      {/* GoalProgress component */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        { usdInrRate && euroInrRate ? (
          <GoalProgress
            netWorth={netWorth}
            usdInvestments={usdInvestments}
            rupeeInvestments={rupeeInvestments}
            euroInvestments={euroInvestments}
            goalAmount={goalInCurrency} // converted goal in INR or base currency
            usdInrRate={usdInrRate}
            euroInrRate={euroInrRate}
            netWorthCurrencySymbol={symbolForYourCurrency}
          />
        ) : (
          <div>Loading currency rates...</div>
        )}
      </div>
    </div>
  );
};

export default NetWorthWithGoal;
