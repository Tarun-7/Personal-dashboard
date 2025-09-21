import React from 'react';
import { IndianRupee, DollarSign, Euro, TrendingUp } from 'lucide-react';
import GoalProgress from './GoalProgress';

const NetWorthCard = ({
  netWorth,
  totalInvested = 5436866, // New prop for total invested amount
  totalGainsLoss = 672137, // Changed from totalCurrentValue to totalGainsLoss
  netWorthCurrency = 'INR',
  setNetWorthCurrency = () => {},
  rupeeInvestments = 4486866,
  usdInvestments = 10133,
  euroInvestments = 7000,
  usdInrRate = 83.25,
  euroInrRate = 90.50,
  getGoalAmountInCurrency = () => 10000000,
}) => {
  
  const goalInCurrency = getGoalAmountInCurrency();
  let progress = 0;
  if (goalInCurrency > 0) {
    progress = Math.min(1, netWorth / goalInCurrency);
  }

  let symbolForYourCurrency = '₹';
  if (netWorthCurrency === 'INR') symbolForYourCurrency = '₹';
  else if (netWorthCurrency === 'USD') symbolForYourCurrency = '$';
  else if (netWorthCurrency === 'EUR') symbolForYourCurrency = '€';

  const getCurrencyColors = (currency) => {
    switch(currency) {
      case 'INR':
        return {
          primary: '#f97316',
          secondary: '#ea580c',
          gradient: 'from-orange-500 to-amber-600',
          glow: 'rgba(249, 115, 22, 0.3)',
          chartColor: '#FB923C'
        };
      case 'USD':
        return {
          primary: '#10b981',
          secondary: '#059669',
          gradient: 'from-emerald-500 to-teal-600',
          glow: 'rgba(16, 185, 129, 0.3)',
          chartColor: '#10B981'
        };
      case 'EUR':
        return {
          primary: '#3b82f6',
          secondary: '#2563eb',
          gradient: 'from-blue-500 to-indigo-600',
          glow: 'rgba(59, 130, 246, 0.3)',
          chartColor: '#3B82F6'
        };
      default:
        return {
          primary: '#f97316',
          secondary: '#ea580c',
          gradient: 'from-orange-500 to-amber-600',
          glow: 'rgba(249, 115, 22, 0.3)',
          chartColor: '#FB923C'
        };
    }
  };

  const colors = getCurrencyColors(netWorthCurrency);
  const isGain = totalGainsLoss >= 0;
  const gainsLossColor = isGain ? '#10b981' : '#ef4444'; // Green for gains, red for losses
  const gainsLossTextColor = isGain ? 'text-emerald-300' : 'text-red-300';

  const convertAmount = (amount, fromCurrency = 'INR', toCurrency = netWorthCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to INR first if needed
    let inrAmount = amount;
    if (fromCurrency === 'USD') {
      inrAmount = amount * usdInrRate;
    } else if (fromCurrency === 'EUR') {
      inrAmount = amount * euroInrRate;
    }
    
    // Convert from INR to target currency
    if (toCurrency === 'USD') {
      return inrAmount / usdInrRate;
    } else if (toCurrency === 'EUR') {
      return inrAmount / euroInrRate;
    }
    
    return inrAmount;
  };

  // Convert the amounts based on current currency
  const convertedTotalInvested = convertAmount(totalInvested, 'INR', netWorthCurrency);
  const convertedTotalGainsLoss = convertAmount(totalGainsLoss, 'INR', netWorthCurrency);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Net Worth Card - Left Half */}
        <div className="flex-1">
          <div 
            className="relative overflow-hidden rounded-3xl text-white transition-all duration-500 hover:scale-[1.01] group"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 30%, #475569 60%, #334155 100%)',
              boxShadow: `
                inset 0 2px 0 rgba(255, 255, 255, 0.1),
                0 20px 40px -10px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `
            }}
          >
            
            {/* Dynamic gradient strip */}
            <div 
              className="absolute left-0 top-0 h-2 w-full opacity-90 transition-all duration-700"
              style={{ 
                background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                filter: 'brightness(1.2) saturate(1.1)'
              }} 
            />
            
            {/* Multi-layer glassmorphism background */}
            <div
              className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
              style={{
                background: `
                  radial-gradient(circle at 20% 20%, ${colors.glow} 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(56, 189, 248, 0.15) 0%, transparent 60%)
                `
              }}
            />

            {/* Animated shimmer overlay */}
            <div
              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            />
            
            {/* Header Section */}
            <div className="relative z-10 p-8 pb-4">
              <div className="flex items-start justify-between">
                
                {/* Left: Title, Amount and Metrics */}
                <div className="flex-1">
                  {/* Title */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-slate-300">
                      Total Net Worth
                    </h3>
                  </div>

                  {/* Main Amount with Performance Badge */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center mb-3">
                      <span 
                        className="text-2xl font-bold mr-2"
                        style={{ color: colors.primary }}
                      >
                        {symbolForYourCurrency}
                      </span>
                      <span 
                        className="text-5xl sm:text-6xl font-black tracking-tight"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {netWorth.toLocaleString(netWorthCurrency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    
                    {/* Performance badge directly below amount */}
                    <div className="flex justify-center">
                      <div
                        className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium backdrop-blur-sm border transition-all duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${colors.glow} 0%, ${colors.glow} 100%)`,
                          borderColor: `${colors.primary}50`,
                          color: colors.primary,
                          boxShadow: `0 3px 8px ${colors.glow}`
                        }}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        +12.5% this month
                      </div>

                      {/* Exchange Rate Badge - Bottom */}
                      {netWorthCurrency !== 'INR' && (
                        <div className="flex justify-center ml-2">
                          <div
                            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium backdrop-blur-sm border"
                            style={{
                              background: `linear-gradient(135deg, ${colors.glow} 0%, ${colors.glow} 100%)`,
                              borderColor: `${colors.primary}50`,
                              color: colors.primary,
                              boxShadow: `0 3px 8px ${colors.glow}`
                            }}
                          >
                            <span className="text-sm">
                              1 {netWorthCurrency} = ₹{netWorthCurrency === 'USD' ? usdInrRate.toFixed(2) : euroInrRate.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Invested vs Gains/Loss - Side by Side */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Total Invested */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 mr-2"></div>
                        <span className="text-xs text-slate-400 font-medium">INVESTED</span>
                      </div>
                      <div className="text-blue-300 font-bold text-xl">
                        {symbolForYourCurrency}{Math.round(convertedTotalInvested).toLocaleString(netWorthCurrency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    
                    {/* Gains/Loss */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div 
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ 
                            background: isGain 
                              ? 'linear-gradient(to right, #10b981, #059669)' 
                              : 'linear-gradient(to right, #ef4444, #dc2626)' 
                          }}
                        ></div>
                        <span className="text-xs text-slate-400 font-medium">
                          {isGain ? 'GAINS' : 'LOSS'}
                        </span>
                      </div>
                      <div className={`font-bold text-xl ${gainsLossTextColor}`}>
                         {isGain ? '+' : '-'} {symbolForYourCurrency}{Math.abs(Math.round(convertedTotalGainsLoss)).toLocaleString(netWorthCurrency === 'INR' ? 'en-IN' : 'en-US', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Premium Currency Switcher */}
                <div className="flex flex-col items-center ml-8">
                  <div className="relative">
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 rounded-full opacity-60 blur-2xl scale-110 group-hover:opacity-80 transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                    />
                    
                    {/* Switch Button */}
                    <button
                      onClick={() => setNetWorthCurrency(prev =>
                        prev === 'INR' ? 'USD' : prev === 'USD' ? 'EUR' : 'INR'
                      )}
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 cursor-pointer group border border-white/20 backdrop-blur-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        boxShadow: `inset 0 2px 0 rgba(255, 255, 255, 0.2), 0 6px 16px ${colors.glow}`
                      }}
                    >
                      {/* Currency Icon */}
                      <div className="relative z-10">
                        {netWorthCurrency === 'INR' && <IndianRupee className="w-6 h-6 text-white drop-shadow-sm" />}
                        {netWorthCurrency === 'USD' && <DollarSign className="w-6 h-6 text-white drop-shadow-sm" />}
                        {netWorthCurrency === 'EUR' && <Euro className="w-6 h-6 text-white drop-shadow-sm" />}
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </div>
                  
                  {/* Switch Label */}
                  <span 
                    className="text-xs font-medium mt-2 text-center"
                    style={{ color: colors.primary }}
                  >
                    Switch
                  </span>
                </div>
              </div>
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
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
};

export default NetWorthCard;
