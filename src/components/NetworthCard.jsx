import React from 'react';
import { IndianRupee, DollarSign, Euro, TrendingUp } from 'lucide-react';
import GoalProgress from './GoalProgress';
import { ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid } from "recharts";


const NetWorthCard = ({
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

  const chartData = [
  { label: "Jan", value: 200 },
  { label: "Feb", value: 450 },
  { label: "Mar", value: 300 },
  { label: "Apr", value: 900 },
  { label: "May", value: 350 },
  { label: "Jun", value: 800 },
  { label: "Jul", value: 300 },
  { label: "Aug", value: 700 },
  { label: "Sep", value: 1000},
  { label: "Oct", value: 1500},
  { label: "Nov", value: 1800},
  { label: "Dec", value: 2500},
];
  
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
      <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative">
        {/* Refined gradient header */}
        <div className={`relative p-6 transition-all duration-700 ${
          netWorthCurrency === 'INR'
            ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-orange-800/20'
            : netWorthCurrency === 'USD'
              ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-emerald-800/20'
              : 'bg-gradient-to-br from-slate-700 via-slate-600 to-blue-800/20'
        }`}>
          
          {/* Subtle animated overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>

          <div className="relative z-10">
            <span className="text-slate-300 text-sm font-medium">
              Total Net Worth
            </span>
            
            <div className="flex items-start justify-between mt-3">
              {/* Amount display */}
              <div className="flex-1">
                <div className="flex items-baseline mb-4">
                  <span className={`text-2xl font-semibold mr-2 transition-colors duration-500 ${
                    netWorthCurrency === 'INR'
                      ? 'text-orange-300'
                      : netWorthCurrency === 'USD'
                        ? 'text-emerald-300'
                        : 'text-blue-300'
                  }`}>
                    {netWorthCurrency === 'INR' ? '₹' : netWorthCurrency === 'USD' ? '$' : '€'}
                  </span>
                  <span className="text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">
                    {netWorth.toLocaleString(netWorthCurrency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                
                {/* Badge row with trend and exchange rate */}
                <div className="flex items-center space-x-3">
                  {/* Trend indicator badge */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-full transition-all duration-500 ${
                    netWorthCurrency === 'INR'
                      ? 'bg-orange-500/10 border border-orange-500/20'
                      : netWorthCurrency === 'USD'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-blue-500/10 border border-blue-500/20'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-2 transition-colors duration-500 ${
                      netWorthCurrency === 'INR'
                        ? 'text-orange-300'
                        : netWorthCurrency === 'USD'
                          ? 'text-emerald-300'
                          : 'text-blue-300'
                    }`} />
                    <span className="text-white text-sm font-semibold">+12.5%</span>
                    <span className="text-slate-400 text-xs ml-2">this month</span>
                  </div>

                  {/* Exchange rate badge - only shown for non-INR currencies */}
                  {netWorthCurrency !== 'INR' && (
                    <div className={`inline-flex items-center px-4 py-2 rounded-full transition-all duration-500 ${
                        netWorthCurrency === 'INR'
                          ? 'bg-orange-500/10 border border-orange-500/20'
                          : netWorthCurrency === 'USD'
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-blue-500/10 border border-blue-500/20'
                      }`}>
                      <span className="text-slate-300 text-xs font-medium">
                        1 {netWorthCurrency} = ₹{netWorthCurrency === 'USD' ? usdInrRate.toFixed(2) : euroInrRate.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Round Currency Switcher with subtle pulse */}
              <div className="flex flex-col items-center ml-6">
                <button
                  onClick={() => setNetWorthCurrency(prev =>
                    prev === 'INR' ? 'USD' : prev === 'USD' ? 'EUR' : 'INR'
                  )}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-110 cursor-pointer group ${
                    netWorthCurrency === 'INR'
                      ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-500/25'
                      : netWorthCurrency === 'USD'
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25'
                        : 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-500/25'
                  } shadow-lg hover:shadow-xl`}
                  title={`Switch to ${netWorthCurrency === 'INR' ? 'USD' : netWorthCurrency === 'USD' ? 'EUR' : 'INR'}`}
                >
                  {/* Subtle pulsing ring animation */}
                  <div className={`absolute -inset-1 rounded-full animate-pulse opacity-10 ${
                    netWorthCurrency === 'INR'
                      ? 'bg-orange-400'
                      : netWorthCurrency === 'USD'
                        ? 'bg-emerald-400'
                        : 'bg-blue-400'
                  }`}></div>
                  
                  {/* Static ring for depth */}
                  <div className={`absolute inset-0 rounded-full ring-2 ${
                    netWorthCurrency === 'INR'
                      ? 'ring-orange-300/30'
                      : netWorthCurrency === 'USD'
                        ? 'ring-emerald-300/30'
                        : 'ring-blue-300/30'
                  }`}></div>
                  
                  {/* Currency icon */}
                  <div className="relative z-10">
                    {netWorthCurrency === 'INR' && <IndianRupee className="w-7 h-7 text-white drop-shadow-sm" />}
                    {netWorthCurrency === 'USD' && <DollarSign className="w-7 h-7 text-white drop-shadow-sm" />}
                    {netWorthCurrency === 'EUR' && <Euro className="w-7 h-7 text-white drop-shadow-sm" />}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                {/* Tap to switch label */}
                <span className={`text-xs font-medium mt-2 animate-pulse transition-colors duration-500 text-center ${
                  netWorthCurrency === 'INR'
                    ? 'text-orange-300'
                    : netWorthCurrency === 'USD'
                      ? 'text-emerald-300'
                      : 'text-blue-300'
                }`}>
                  Tap to switch
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced chart section */}
        <div className="p-6 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
          <div style={{ width: '100%', height: 130 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`chartGradient-${netWorthCurrency}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={
                      netWorthCurrency === 'INR' ? '#FB923C' 
                      : netWorthCurrency === 'USD' ? '#10B981' 
                      : '#3B82F6'
                    } stopOpacity={0.4} />
                    <stop offset="50%" stopColor={
                      netWorthCurrency === 'INR' ? '#FB923C' 
                      : netWorthCurrency === 'USD' ? '#10B981' 
                      : '#3B82F6'
                    } stopOpacity={0.1} />
                    <stop offset="100%" stopColor={
                      netWorthCurrency === 'INR' ? '#FB923C' 
                      : netWorthCurrency === 'USD' ? '#10B981' 
                      : '#3B82F6'
                    } stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  vertical={false} 
                  stroke="#374151" 
                  strokeDasharray="2 4" 
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  dy={10}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={
                    netWorthCurrency === 'INR' ? '#FB923C' 
                    : netWorthCurrency === 'USD' ? '#10B981' 
                    : '#3B82F6'
                  }
                  strokeWidth={3}
                  fill={`url(#chartGradient-${netWorthCurrency})`}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: netWorthCurrency === 'INR' ? '#FB923C' 
                        : netWorthCurrency === 'USD' ? '#10B981' 
                        : '#3B82F6',
                    strokeWidth: 2,
                    stroke: 'white',
                    strokeOpacity: 0.8,
                    fillOpacity: 1
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Goal Circle - Right Half */}
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

export default NetWorthCard;
