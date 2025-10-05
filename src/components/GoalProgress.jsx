import React, { useState } from 'react';
import { Target, Calendar } from 'lucide-react';

const GoalProgress = (props) => {
  const currentProgress = props.currentProgress || 6109003;
  const goal = props.goal || {
    amount: 10000000,
    deadline: '2026-12-31',
    monthlyTarget: 200000,
    color: '#10b981'
  };
  const netWorthCurrencySymbol = props.netWorthCurrencySymbol || '₹';
  const usdInrRate = props.usdInrRate || 85;
  const euroInrRate = props.euroInrRate || 100;
  
  const convertAmount = (amount) => {
    if (netWorthCurrencySymbol === '₹' || netWorthCurrencySymbol === 'INR') {
      return amount;
    }
    if (netWorthCurrencySymbol === '$' || netWorthCurrencySymbol === 'USD') {
      return amount / usdInrRate;
    }
    if (netWorthCurrencySymbol === '€' || netWorthCurrencySymbol === 'EUR') {
      return amount / euroInrRate;
    }
    return amount;
  };
  
  const goalAmount = convertAmount(goal.amount);
  const monthlyTarget = convertAmount(goal.monthlyTarget);
  const deadline = goal.deadline;
  const progressColor = goal.color;
  
  const percent = goalAmount > 0 ? Math.min(100, Math.floor((currentProgress / goalAmount) * 100)) : 0;
  
  const remaining = Math.max(0, goalAmount - currentProgress);
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const monthsRemaining = Math.max(0, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24 * 30)));
  
  const milestone1 = goalAmount * 0.25;
  const milestone2 = goalAmount * 0.50;
  const milestone3 = goalAmount * 0.75;
  const milestone4 = goalAmount;
  
  const getCurrentMilestone = () => {
    if (currentProgress >= milestone4) return { number: 4, completed: true, amount: milestone4 };
    if (currentProgress >= milestone3) return { number: 4, completed: false, amount: milestone4 };
    if (currentProgress >= milestone2) return { number: 3, completed: false, amount: milestone3 };
    if (currentProgress >= milestone1) return { number: 2, completed: false, amount: milestone2 };
    return { number: 1, completed: false, amount: milestone1 };
  };
  
  const currentMilestone = getCurrentMilestone();
  const currency = netWorthCurrencySymbol;

  const formatAmount = (amount) => {
    if (currency === '₹') {
      return currency + formatIndianAmount(amount);
    } else if (currency === '$' || currency === '€') {
      return formatForeignAmount(amount, currency);
    } else {
      return currency + formatIndianAmount(amount);
    }
  };
  
  const formatIndianAmount = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    const num = Number(amount);
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2).replace(/\.00$/, '') + 'Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(2).replace(/\.00$/, '') + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toLocaleString('en-IN');
  };
  
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

  const CircleComponent = () => (
    <div className="w-full max-w-[320px] mx-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl relative flex flex-col items-center p-4"
           style={{
             boxShadow: '0 4px 24px 4px rgba(18, 34, 34, 0.3), 0 1.5px 4px rgba(21, 144, 90, 0.3) inset',
             backdropFilter: 'blur(6px)'
           }}>
        <div className="w-60 h-60 relative">
          
          <div className="w-full h-full rounded-full relative"
               style={{
                 background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                 padding: '12px',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.1)'
               }}>
            
            {[
              { percent: 25, deg: 0 },
              { percent: 50, deg: 90 },
              { percent: 75, deg: 180 },
              { percent: 100, deg: 270 }
            ].map((marker, index) => {
              const milestonePercent = marker.percent;
              const isCompleted = percent >= milestonePercent;
              const isCurrent = percent < milestonePercent && percent >= ((index) * 25);
              
              const radius = 50;
              const angle = (marker.deg - 90) * (Math.PI / 180);
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              
              return (
                <div
                  key={index}
                  className="absolute w-4 h-4 rounded-full z-30"
                  style={{
                    border: '3px solid #0F172A',
                    background: isCompleted ? '#10B981' : isCurrent ? '#F59E0B' : '#374151',
                    left: x + '%',
                    top: y + '%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isCurrent ? '0 0 20px rgba(245, 158, 11, 0.6)' : 'none',
                    animation: isCurrent ? 'milestone-pulse 2s ease-in-out infinite' : 'none'
                  }}
                />
              );
            })}
            
            <div className="w-full h-full rounded-full relative overflow-hidden"
                 style={{
                   background: 'conic-gradient(from 270deg, ' + progressColor + ' 0deg, ' + progressColor + ' 360deg)',
                   boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                 }}>
              
              <div className="absolute inset-0 rounded-full"
                   style={{
                     background: 'conic-gradient(from 270deg, transparent ' + ((percent / 100) * 360) + 'deg, rgba(55, 65, 81, 0.9) ' + ((percent / 100) * 360) + 'deg)'
                   }}
              />
              
              <div className="absolute flex flex-col items-center justify-center rounded-full"
                   style={{
                     inset: '25px',
                     background: 'radial-gradient(circle at center, #0f172a 0%, #1e293b 70%, #334155 100%)',
                     border: '1px solid #3b82f6',
                     boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 2px rgba(59,130,246,0.2)'
                   }}>
                
                <div className="text-3xl font-black text-white mb-1">
                  {percent}%
                </div>
                
                <div className="text-xs font-medium mb-2"
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
                
                <div className="text-xs font-semibold text-slate-300 text-center leading-tight px-2">
                  {formatAmount(currentProgress)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 font-semibold text-slate-50 text-lg text-center px-4">
          Goal: {formatAmount(goalAmount)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="block lg:hidden">
        <CircleComponent />
      </div>

      <div className="hidden lg:block">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700"
             style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-80 h-80 relative">
                
                <div className="w-full h-full rounded-full relative"
                     style={{
                       background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                       padding: '14px',
                       boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.1)'
                     }}>
                  
                  {[
                    { percent: 25, deg: 0 },
                    { percent: 50, deg: 90 },
                    { percent: 75, deg: 180 },
                    { percent: 100, deg: 270 }
                  ].map((marker, index) => {
                    const milestonePercent = marker.percent;
                    const isCompleted = percent >= milestonePercent;
                    const isCurrent = percent < milestonePercent && percent >= ((index) * 25);
                    
                    const radius = 50;
                    const angle = (marker.deg - 90) * (Math.PI / 180);
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    
                    return (
                      <div
                        key={index}
                        className="absolute w-5 h-5 rounded-full z-30"
                        style={{
                          border: '3px solid #0F172A',
                          background: isCompleted ? '#10B981' : isCurrent ? '#F59E0B' : '#374151',
                          left: x + '%',
                          top: y + '%',
                          transform: 'translate(-50%, -50%)',
                          boxShadow: isCurrent ? '0 0 20px rgba(245, 158, 11, 0.6)' : 'none',
                          animation: isCurrent ? 'milestone-pulse 2s ease-in-out infinite' : 'none'
                        }}
                      />
                    );
                  })}
                  
                  <div className="w-full h-full rounded-full relative overflow-hidden"
                       style={{
                         background: 'conic-gradient(from 270deg, ' + progressColor + ' 0deg, ' + progressColor + ' 360deg)',
                         boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                       }}>
                    
                    <div className="absolute inset-0 rounded-full"
                         style={{
                           background: 'conic-gradient(from 270deg, transparent ' + ((percent / 100) * 360) + 'deg, rgba(55, 65, 81, 0.9) ' + ((percent / 100) * 360) + 'deg)'
                         }}
                    />
                    
                    <div className="absolute flex flex-col items-center justify-center rounded-full"
                         style={{
                           inset: '30px',
                           background: 'radial-gradient(circle at center, #0f172a 0%, #1e293b 70%, #334155 100%)',
                           border: '1px solid #3b82f6',
                           boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 2px rgba(59,130,246,0.2)'
                         }}>
                      
                      <div className="text-5xl font-black text-white mb-2">
                        {percent}%
                      </div>
                      
                      <div className="text-sm font-medium mb-3"
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
                      
                      <div className="text-base font-semibold text-slate-300 text-center leading-tight px-3">
                        {formatAmount(currentProgress)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:hidden font-bold text-slate-50 text-lg text-center">
                  Goal: {formatAmount(goalAmount)}
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Goal Overview</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Target</div>
                    <div className="text-lg font-bold text-white">{formatAmount(goalAmount)}</div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Remaining</div>
                    <div className="text-lg font-bold text-orange-400">{formatAmount(remaining)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg">
                  <span className="text-sm text-slate-400">Deadline</span>
                  <span className="text-sm font-semibold text-white">
                    {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg">
                  <span className="text-sm text-slate-400">Months Remaining</span>
                  <span className="text-sm font-semibold text-purple-400">{monthsRemaining} months</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg">
                  <span className="text-sm text-slate-400">Monthly Target</span>
                  <span className="text-sm font-semibold text-emerald-400">{formatAmount(monthlyTarget)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes milestone-pulse {
            0%, 100% { 
              transform: translate(-50%, -50%) scale(1);
            }
            50% { 
              transform: translate(-50%, -50%) scale(1.3);
              box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
            }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `
      }} />
    </div>
  );
};

export default GoalProgress;