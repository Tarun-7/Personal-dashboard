import { Loader2, TrendingUp, BarChart3, PieChart } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-900 min-h-[400px]">
      {/* Main loading animation container */}
      <div className="relative mb-8">
        {/* Outer rotating ring */}
        <div className="w-20 h-20 border-4 border-slate-700 rounded-full animate-spin border-t-blue-400 border-r-purple-500"></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse opacity-80"></div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white animate-bounce" />
        </div>
      </div>

      {/* Loading text with typing animation */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2 animate-fade-in">
          Loading Your Portfolio
        </h3>
        <p className="text-gray-400 animate-fade-in-delay">
          Fetching latest mutual fund data...
        </p>
      </div>

      {/* Progress indicators */}
      <div className="flex space-x-4 mb-8">
        <div className="flex items-center space-x-2 text-gray-400 animate-slide-up">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-sm">Performance</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400 animate-slide-up-delay-1">
          <PieChart className="w-4 h-4 text-purple-400" />
          <span className="text-sm">Holdings</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400 animate-slide-up-delay-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm">Analytics</span>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 rounded-full animate-loading-bar origin-left"></div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          0%, 30% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delay-1 {
          0%, 20% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delay-2 {
          0%, 40% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 1.2s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
        
        .animate-slide-up-delay-1 {
          animation: slide-up-delay-1 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up-delay-2 {
          animation: slide-up-delay-2 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;