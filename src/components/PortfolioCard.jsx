import React from 'react';
import { PiggyBank, LineChart, TrendingUp, TrendingDown } from 'lucide-react';

// Reusable PortfolioCard component
const PortfolioCard = ({ 
  title, 
  value, 
  icon: Icon, 
  gradientFrom, 
  gradientTo, 
  iconColor, 
  titleColor,
  isProfit = null 
}) => {
  const getGradientClass = () => {
    if (isProfit !== null) {
      return isProfit 
        ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600' 
        : 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600';
    }
    return `bg-gradient-to-br ${gradientFrom} ${gradientTo}`;
  };

  const getTextColors = () => {
    if (isProfit !== null) {
      return {
        icon: isProfit ? 'text-emerald-100' : 'text-red-100',
        title: isProfit ? 'text-emerald-100' : 'text-red-100'
      };
    }
    return { icon: iconColor, title: titleColor };
  };

  const colors = getTextColors();
  const DisplayIcon = isProfit !== null ? (isProfit ? TrendingUp : TrendingDown) : Icon;

  return (
    <div className={`
      ${getGradientClass()}
      p-4 md:p-5 rounded-2xl shadow-lg hover:shadow-2xl 
      transform hover:scale-[1.02] transition-all duration-300 ease-out
      min-h-[140px] md:min-h-[150px] flex-grow min-w-[230px]
      border border-white/20 backdrop-blur-sm
      relative overflow-hidden group
    `}>
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-full blur-lg"></div>
      </div>
      
      <div className="flex items-start justify-between h-full relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <DisplayIcon size={18} className={`${colors.icon} flex-shrink-0`} />
            <h3 className={`${colors.title} text-sm font-semibold uppercase tracking-wider truncate`}>
              {title}
            </h3>
          </div>
          <p className="text-white font-bold text-lg md:text-xl 2xl:text-2xl leading-tight break-words drop-shadow-sm">
            {value}
          </p>
        </div>
        
        <div className={`
          ${colors.icon} bg-white/20 p-3 rounded-xl backdrop-blur-md 
          ml-3 flex-shrink-0 shadow-inner border border-white/30
          group-hover:bg-white/30 transition-all duration-300
        `}>
          <DisplayIcon size={20} />
        </div>
      </div>
    </div>
  );
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default PortfolioCard;