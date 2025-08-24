import React from 'react';

const InvestmentCard = ({ title, amount, Icon, iconClassName = 'w-6 h-6', amountLocale = 'en-IN', currencySymbol = ''}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        {Icon && <Icon className={`${iconClassName}`} />}
      </div>
      <div className="text-2xl font-semibold">
        {currencySymbol}&nbsp;{/* non-breaking space */}
        {typeof amount === 'number' ? amount.toLocaleString(amountLocale, { maximumFractionDigits: 0 }) : amount}
      </div>
    </div>
  );
};

export default InvestmentCard;
