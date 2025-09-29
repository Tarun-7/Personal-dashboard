import React from 'react';
import { Plus, Download, Eye, EyeOff } from 'lucide-react';

const PageHeader = ({
  // Title and description
  title,
  description,
  
  // Button configurations
  buttons = [],
  
  // Eye toggle (optional)
  showEyeToggle = false,
  showBalance = true,
  onEyeToggle = () => {},
  
  // Styling
  className = "mb-8"
}) => {
  return (
    <div className={className}>
      <div className={`flex flex-col sm:flex-row sm:items-center gap-4 mb-4 ${
        (buttons.length > 0 || showEyeToggle) ? 'sm:justify-between' : ''
      }`}>
        {/* Title Section */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">{description}</p>
        </div>
        
        {/* Buttons Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
          {buttons.map((button, index) => {
            const {
              label,
              icon: Icon,
              onClick,
              disabled = false,
              variant = 'primary',
              title: buttonTitle
            } = button;
            
            // Button styling based on variant
            const getButtonStyles = () => {
              if (disabled) {
                return 'bg-slate-600 text-slate-500 cursor-not-allowed';
              }
              
              switch (variant) {
                case 'primary':
                  return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl';
                case 'success':
                  return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-700 text-white shadow-lg hover:shadow-xl';
                case 'secondary':
                  return 'bg-gray-800 text-white hover:bg-gray-700';
                default:
                  return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl';
              }
            };
            
            return (
              <button
                key={index}
                onClick={onClick}
                disabled={disabled}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${getButtonStyles()}`}
                title={buttonTitle}
              >
                {Icon && <Icon size={18} className="sm:w-5 sm:h-5" />}
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
          
          {/* Eye Toggle Button */}
          {showEyeToggle && (
            <button
              onClick={onEyeToggle}
              className="p-2 sm:p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors flex-shrink-0"
              title={showBalance ? "Hide balances" : "Show balances"}
            >
              {showBalance ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;