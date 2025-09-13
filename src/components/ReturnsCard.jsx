import React, { useState } from 'react';
import { Percent, TrendingUp, TrendingDown } from 'lucide-react';


const ReturnsCard = ({
  returnType,
  setReturnType,
  totals,
  formatPercent
}) => {
  const isPositive = (returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn) >= 0;
  
  return (
    <div className={`${
      isPositive
        ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600'
        : 'bg-gradient-to-br from-red-500 via-rose-500 to-red-600'
    } p-5 md:p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 min-h-[160px] md:min-h-[180px] flex-grow min-w-[300px] border border-white/20 relative overflow-hidden group`}>
      
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-full blur-lg"></div>
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Header - Simplified without large icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Percent size={18} className={`${
              isPositive ? 'text-emerald-100' : 'text-gray-200'
            } flex-shrink-0`} />
            <h3 className={`${
              isPositive ? 'text-emerald-100' : 'text-gray-200'
            } text-sm font-semibold uppercase tracking-wider`}>
              Returns
            </h3>
          </div>
        </div>
        
        {/* Large Return Value - Much bigger */}
        <div className="flex-1 flex flex-col justify-center mb-4">
          <p className="text-white font-bold text-lg md:text-xl 2xl:text-2xl leading-none mb-2 drop-shadow-lg">
            {formatPercent(returnType === 'absolute' ? totals.absoluteReturn : totals.xirrReturn)}
          </p>
        </div>

        {/* Improved Toggle Switch */}
        <div className="mt-auto">
          <button
            onClick={() => setReturnType(returnType === 'absolute' ? 'xirr' : 'absolute')}
            className="w-full relative overflow-hidden group/toggle"
          >
            <div className="bg-black/20 rounded-xl p-1 backdrop-blur-sm border border-white/20">
              <div className="flex relative">
                {/* Sliding Background */}
                <div 
                  className={`absolute top-1 bottom-1 w-1/2 bg-white/30 rounded-lg transition-transform duration-300 ease-in-out shadow-lg ${
                    returnType === 'absolute' ? 'translate-x-0' : 'translate-x-full'
                  }`}
                />
                
                {/* Toggle Options */}
                <div className={`flex-1 text-center py-1 px-3 rounded-lg transition-colors duration-200 relative z-10 ${
                  returnType === 'absolute' ? 'text-white font-semibold' : 'text-white/70'
                }`}>
                  <span className="text-sm">Absolute</span>
                </div>
                <div className={`flex-1 text-center py-1 px-3 rounded-lg transition-colors duration-200 relative z-10 ${
                  returnType === 'xirr' ? 'text-white font-semibold' : 'text-white/70'
                }`}>
                  <span className="text-sm">XIRR</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnsCard;
