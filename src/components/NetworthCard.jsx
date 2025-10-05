import React from 'react';
import { IndianRupee, DollarSign, Euro, TrendingUp } from 'lucide-react';
import GoalProgress from './GoalProgress';

const NetWorthCard = ({
  netWorth,
  totalInvested,
  netWorthCurrency = 'INR',
  setNetWorthCurrency,
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
  const convertedTotalGainsLoss = netWorth - convertedTotalInvested;
  const colors = getCurrencyColors(netWorthCurrency);
  const isGain = convertedTotalGainsLoss >= 0;
  const gainsLossTextColor = isGain ? 'text-emerald-300' : 'text-red-300';
  
  const formatAmount = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    
    const numAmount = parseFloat(amount);
    
    if (netWorthCurrency === "INR") {
      if (numAmount >= 10000000) {
        const crores = numAmount / 10000000;
        return `${crores.toFixed(2)} Cr`;
      } else if (numAmount >= 100000) {
        const lakhs = numAmount / 100000;
        return `${lakhs.toFixed(2)} L`;
      } else {
        return numAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
      }
    } else {
      if (numAmount >= 1000000) {
        const millions = numAmount / 1000000;
        return `${millions.toFixed(2)}M`;
      } else if (numAmount >= 1000) {
        const thousands = numAmount / 1000;
        return `${thousands.toFixed(2)}K`;
      } else {
        return numAmount.toFixed(2);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 sm:p-6">
      {/* Net Worth Card - Left Half */}
      <div className="flex-1">
        <div 
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl text-white transition-all duration-500 hover:scale-[1.01] group"
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
            className="absolute left-0 top-0 h-1 sm:h-2 w-full opacity-90 transition-all duration-700"
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
          
          {/* Content */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            {/* Title and Currency Switcher Row */}
            <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex-1">
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-slate-300">
                  Total Net Worth
                </h3>
              </div>
              
              {/* Currency Switcher */}
              <div className="flex flex-col items-center flex-shrink-0">
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
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 cursor-pointer group border border-white/20 backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                      boxShadow: `inset 0 2px 0 rgba(255, 255, 255, 0.2), 0 6px 16px ${colors.glow}`
                    }}
                  >
                    {/* Currency Icon */}
                    <div className="relative z-10">
                      {netWorthCurrency === 'INR' && <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" />}
                      {netWorthCurrency === 'USD' && <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" />}
                      {netWorthCurrency === 'EUR' && <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" />}
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
                
                {/* Switch Label */}
                <span 
                  className="text-xs font-medium mt-1.5 sm:mt-2 text-center"
                  style={{ color: colors.primary }}
                >
                  Switch
                </span>
              </div>
            </div>

            {/* Main Amount */}
            <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
              <div className="flex items-baseline justify-center mb-3 sm:mb-4 lg:mb-5">
                <span 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mr-2 flex-shrink-0"
                  style={{ color: colors.primary }}
                >
                  {symbolForYourCurrency}
                </span>
                <span 
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight"
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
              
              {/* Performance badge */}
              <div className="flex flex-wrap gap-2 justify-center">
                <div
                  className="inline-flex items-center rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium backdrop-blur-sm border transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${colors.glow} 0%, ${colors.glow} 100%)`,
                    borderColor: `${colors.primary}50`,
                    color: colors.primary,
                    boxShadow: `0 3px 8px ${colors.glow}`
                  }}
                >
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  +12.5% this month
                </div>

                {/* Exchange Rate Badge */}
                {netWorthCurrency !== 'INR' && (
                  <div
                    className="inline-flex items-center rounded-lg px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium backdrop-blur-sm border"
                    style={{
                      background: `linear-gradient(135deg, ${colors.glow} 0%, ${colors.glow} 100%)`,
                      borderColor: `${colors.primary}50`,
                      color: colors.primary,
                      boxShadow: `0 3px 8px ${colors.glow}`
                    }}
                  >
                    1 {netWorthCurrency} = ₹{netWorthCurrency === 'USD' ? usdInrRate.toFixed(2) : euroInrRate.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Invested vs Gains/Loss - Stacked on mobile, side by side on larger screens */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4 sm:gap-6 px-2 sm:px-4 lg:px-8">
              {/* Total Invested */}
              <div className="flex-1 flex flex-col items-center sm:items-start">
                <div className="flex items-center mb-1.5 sm:mb-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 mr-2"></div>
                  <span className="text-xs text-slate-400 font-medium">INVESTED</span>
                </div>
                <div className="text-blue-300 font-bold text-lg sm:text-xl lg:text-2xl break-words">
                  {symbolForYourCurrency} {formatAmount(convertedTotalInvested)}
                </div>
              </div>
              
              {/* Gains/Loss */}
              <div className="flex-1 flex flex-col items-center sm:items-end">
                <div className="flex items-center mb-1.5 sm:mb-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      background: isGain 
                        ? 'linear-gradient(to right, #10b981, #059669)' 
                        : 'linear-gradient(to right, #ef4444, #dc2626)' 
                    }}
                  ></div>
                  <span className="text-xs text-slate-400 font-medium ml-2">
                    {isGain ? 'GAINS' : 'LOSS'}
                  </span>
                </div>
                <div className={`font-bold text-lg sm:text-xl lg:text-2xl break-words ${gainsLossTextColor}`}>
                  {symbolForYourCurrency} {formatAmount(convertedTotalGainsLoss)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Goal Circle - Right Half */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        { usdInrRate && euroInrRate ? (
          <GoalProgress
            currentProgress={netWorth} // current net worth
            goal={{ amount: 10000000, deadline: '2026-11-17', monthlyTarget: 200000, color: '#10b981' }}
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