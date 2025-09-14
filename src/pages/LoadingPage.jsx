import React from 'react';

const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-orange-500/10 rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-green-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Main loading container */}
      <div className="text-center z-10 max-w-md mx-auto px-6">
        {/* Logo and brand */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            FIRE
          </h1>
          <p className="text-slate-400 text-sm">Portfolio Tracker</p>
        </div>

        {/* Loading animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            
            {/* Animated progress rings */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-green-500 animate-spin" style={{animationDuration: '2s'}}></div>
            <div className="absolute inset-6 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '2.5s'}}></div>
            
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced loading dots with better spacing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200">
            Loading your portfolio
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/40"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-100 shadow-lg shadow-orange-500/40"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-200 shadow-lg shadow-emerald-500/40"></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 h-2 rounded-full animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Status message */}
        <p className="text-slate-400 text-sm mt-4 animate-pulse">
          Fetching your latest investments...
        </p>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 opacity-20">
        <div className="text-6xl animate-float">₹</div>
      </div>
      <div className="absolute top-1/3 right-10 opacity-20">
        <div className="text-4xl animate-float delay-500">$</div>
      </div>
      <div className="absolute bottom-1/4 left-1/4 opacity-20">
        <div className="text-5xl animate-float delay-1000">€</div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;