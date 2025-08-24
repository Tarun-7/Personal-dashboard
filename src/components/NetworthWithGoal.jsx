import React from 'react';
import { IndianRupee, DollarSign, Euro, TrendingUp } from 'lucide-react';

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
  const percent = Math.floor(progress * 100);
  const r = 85;
  const circumference = 2 * Math.PI * r;

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
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
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
        </div>
      </div>
    </div>
  );
};

export default NetWorthWithGoal;
