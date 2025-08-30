

const GoalProgress = ({
  netWorth,
  usdInvestments,
  rupeeInvestments,
  euroInvestments,
  goalAmount, // in INR or the used currency
  usdInrRate,
  eurInrRate,
  netWorthCurrencySymbol = '₹'
}) => {
  
  const percent = goalAmount > 0 ? Math.floor(Math.min(1, netWorth / goalAmount) * 100) : 0;
  
  // Calculate milestone progress
  const milestone1 = goalAmount * 0.25; // 25%
  const milestone2 = goalAmount * 0.50; // 50%
  const milestone3 = goalAmount * 0.75; // 75%
  const milestone4 = goalAmount; // 100%
  
  const getCurrentMilestone = () => {
    if (netWorth >= milestone4) return { number: 4, completed: true, amount: milestone4 };
    if (netWorth >= milestone3) return { number: 4, completed: false, amount: milestone4 };
    if (netWorth >= milestone2) return { number: 3, completed: false, amount: milestone3 };
    if (netWorth >= milestone1) return { number: 2, completed: false, amount: milestone2 };
    return { number: 1, completed: false, amount: milestone1 };
  };
  
  const currentMilestone = getCurrentMilestone();
  
  // Format helper functions
  const currency = netWorthCurrencySymbol;

  const formatAmount = (amount) => {
    if (currency === '₹') {
      return `${currency}${formatIndianAmount(amount)}`;
    } else if (currency === '$' || currency === '€') {
      return formatForeignAmount(amount, currency);
    } else {
      return `${currency}${formatIndianAmount(amount)}`;
    }
  };
  
  // Indian number formatting (Lakhs/Crores)
  const formatIndianAmount = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    const num = Number(amount);
    if (num >= 10000000) { // 1 crore
      return (num / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
    } else if (num >= 100000) { // 1 lakh
      return (num / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toLocaleString('en-IN');
  };
  
  // USD/EUR formatting (K format)
  const formatForeignAmount = (amount, currencySymbol) => {
    if (!amount || isNaN(amount)) return currencySymbol + '0';
    const num = Number(amount);
    if (num >= 1000000) {
      return currencySymbol + (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
      return currencySymbol + (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return currencySymbol + num.toLocaleString();
  };
  
  const fmt = x => typeof x === 'number'
    ? x.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : x;

  // Calculate rotation for progress (starts from top, 270 degrees)
  const progressDegrees = (percent / 100) * 360;

  return (
    <div className="w-80 h-80 bg-gray-800 rounded-3xl mx-auto relative flex flex-col items-center"
         style={{
           boxShadow: '0 4px 24px 4px #12222244, 0 1.5px 4px #15905A55 inset',
           backdropFilter: 'blur(6px)',
           padding: '16px 0 0 0'
         }}>
      <div className="w-60 h-60 relative">
        
        {/* Level-based Progress Ring */}
        <div className="w-full h-full rounded-full relative"
             style={{
               background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
               padding: '12px',
               boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.1)'
             }}>
          <div className="w-full h-full rounded-full relative"
               style={{
                 background: `conic-gradient(
                   from 270deg,
                   #10b981 0deg,
                   #3b82f6 ${Math.min(120, percent * 1.2)}deg,
                   #f59e0b ${Math.min(240, percent * 2.4)}deg,
                   #1e293b ${progressDegrees}deg,
                   #374151 ${progressDegrees}deg,
                   #374151 360deg
                 )`,
                 boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
               }}>
            
            {/* Milestone Markers */}
            {[
              { angle: 0, x: '50%', y: '-8px', transform: 'translateX(-50%)' }, // Top
              { angle: 90, x: 'calc(100% + 8px)', y: '50%', transform: 'translateY(-50%)' }, // Right
              { angle: 180, x: '50%', y: 'calc(100% + 8px)', transform: 'translateX(-50%)' }, // Bottom
              { angle: 270, x: '-8px', y: '50%', transform: 'translateY(-50%)' } // Left
            ].map((position, index) => {
              const milestonePercent = (index + 1) * 25;
              const isCompleted = percent >= milestonePercent;
              const isCurrent = percent < milestonePercent && percent >= (index * 25);
              
              return (
                <div
                  key={index}
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    border: '3px solid #0F172A',
                    background: isCompleted ? '#10B981' : isCurrent ? '#F59E0B' : '#374151',
                    top: position.y,
                    left: position.x,
                    transform: position.transform,
                    zIndex: 10,
                    ...(isCurrent && {
                      animation: 'milestone-pulse 2s ease-in-out infinite'
                    })
                  }}
                />
              );
            })}
            
            {/* Center Content - Milestone Info */}
            <div className="absolute flex flex-col items-center justify-center rounded-full animate-pulse"
                 style={{
                   inset: '25px',
                   background: 'radial-gradient(circle at center, #0f172a 0%, #1e293b 70%, #334155 100%)',
                   border: '1px solid #3b82f6',
                   boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 2px rgba(59,130,246,0.2)',
                   animation: 'center-content-pulse 4s ease-in-out infinite'
                 }}>
              
              {/* Current Milestone Info */}
              <div className="text-sm font-medium mb-1"
                   style={{
                     background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
                     backgroundSize: '200% 100%',
                     backgroundClip: 'text',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     animation: 'shimmer 2s ease-in-out infinite'
                   }}>
                Milestone {currentMilestone.number}
              </div>
              
              <div className="text-[15px] font-semibold text-slate-50 text-center leading-tight">
                {formatAmount(netWorth)} / {formatAmount(currentMilestone.amount)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Add keyframes for animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes milestone-pulse {
              0%, 100% { transform: translateX(-50%) scale(1); }
              50% { transform: translateX(-50%) scale(1.3); box-shadow: 0 0 20px rgba(245, 158, 11, 0.6); }
            }
            
            @keyframes center-content-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
            
            @keyframes goal-amount-bounce {
              0%, 100% { transform: translateY(0); }
              25% { transform: translateY(-2px); }
              75% { transform: translateY(-1px); }
            }
            
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `
        }} />
        
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: translateX(-50%) rotate(var(--rotation)) translateY(-128px) rotate(calc(-1 * var(--rotation))) scale(1); }
            50% { transform: translateX(-50%) rotate(var(--rotation)) translateY(-128px) rotate(calc(-1 * var(--rotation))) scale(1.2); }
          }
        `}</style>
      </div>

      <div className="mt-4 font-semibold text-slate-50 text-xl text-center"
           style={{
             animation: percent >= 100 ? 'goal-amount-bounce 2s ease-in-out infinite' : 'none',
             ...(percent >= 100 && {
               background: 'linear-gradient(90deg, #10b981, #34d399, #10b981)',
               backgroundSize: '200% 100%',
               backgroundClip: 'text',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               animation: 'goal-amount-bounce 2s ease-in-out infinite, shimmer 1.5s ease-in-out infinite'
             })
           }}>
        Goal: {formatAmount(goalAmount)}
      </div>
    </div>
  );
};

export default GoalProgress;