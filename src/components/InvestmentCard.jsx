import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// Premium InvestmentCard matching the vibrant design from other pages
function InvestmentCard({
  title = "INR Investments",
  amount = 0,
  className = "",
  currencySymbol = "₹",
  delta,
  deltaPositive = true,
  showTopStrip = true,
  lastUpdated,
  badgeGradient = ["#3b82f6", "#2563eb"],
  icons,
  amountLocale = "en-IN",
  onClick,
}) {
  
  const [badgeFrom, badgeTo] = badgeGradient;

  const formatAmount = (amount) => {
    if (!amount || isNaN(amount)) return '0';
    
    const numAmount = parseFloat(amount);
    
    if (amountLocale === "en-IN") {
      // Indian formatting with lakhs and crores
      if (numAmount >= 10000000) { // 1 crore or more
        const crores = numAmount / 10000000;
        return `${crores.toFixed(2)} crores`;
      } else if (numAmount >= 100000) { // 1 lakh or more
        const lakhs = numAmount / 100000;
        return `${lakhs.toFixed(2)} L`;
      } else if (numAmount >= 1000) {
        // Use Indian comma formatting for thousands
        return numAmount.toLocaleString('en-IN');
      } else {
        return numAmount.toFixed(2);
      }
    } else {
      // International formatting (USD, EUR, etc.) with K notation
      if (numAmount >= 1000000) { // 1 million or more
        const millions = numAmount / 1000000;
        return `${millions.toFixed(2)}M`;
      } else if (numAmount >= 1000) { // 1 thousand or more
        const thousands = numAmount / 1000;
        return `${thousands.toFixed(2)} K`;
      } else {
        return numAmount.toFixed(2);
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl text-white p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer group ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 10px 25px -5px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(255, 255, 255, 0.05)
        `
      }}
      role="region"
      aria-label={`${title} card`}
    >
      {showTopStrip && (
        <div 
          className="absolute left-0 top-0 h-1 w-full opacity-90"
          style={{ 
            background: 'linear-gradient(90deg, #14f195 0%, #60a5fa 50%, #a855f7 100%)',
            filter: 'brightness(1.2)'
          }} 
        />
      )}

      {/* Multi-layer glassmorphism effect */}
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(20, 241, 149, 0.2) 0%, transparent 50%)
          `
        }}
      />

      {/* Animated shimmer overlay */}
      <div
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 3s ease-in-out infinite'
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium" style={{ color: '#cbd5e1' }}>
            {title}
          </h3>
        </div>

        {/* Glowing badge */}
        <div className="relative shrink-0">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-60 blur-xl scale-110 group-hover:opacity-80 transition-opacity duration-300"
            style={{ background: `linear-gradient(135deg, ${badgeFrom}, ${badgeTo})` }}
          />
          {/* Badge */}
          <div
            className="relative h-14 w-14 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm"
            style={{ 
              background: `linear-gradient(135deg, ${badgeFrom}, ${badgeTo})`,
              boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 12px ${badgeFrom}40`
            }}
          >
            {icons}
          </div>
        </div>
      </div>

      {/* Amount with gradient text */}
      <div className="relative z-10 mb-6">
        <div 
          className="text-4xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {currencySymbol} {formatAmount(amount, amountLocale)}
        </div>
      </div>
      
      {/* Glowing delta chip */}
      {delta && (
        <div className="relative z-10 mb-4">
          <div
            className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
              deltaPositive
                ? "border-emerald-400/30 text-emerald-300"
                : "border-red-400/30 text-red-300"
            }`}
            style={{
              background: deltaPositive 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
              boxShadow: deltaPositive 
                ? '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 4px 12px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {deltaPositive ? (
              <TrendingUp className="h-4 w-4 mr-2" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-2" />
            )}
            {delta}
          </div>
        </div>
      )}

      {/* Timestamp with subtle glow */}
      {lastUpdated && (
        <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs opacity-70">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
            <path d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6z" />
          </svg>
          <span style={{ color: '#94a3b8' }}>{lastUpdated}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
}
export default InvestmentCard;