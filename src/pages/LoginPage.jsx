import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!password) {
      setError('Please enter the password');
      setLoading(false);
      return;
    }

    const result = login(password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-40 h-40 sm:w-60 sm:h-60 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Login Card */}
        <div className="bg-gray-800/60 backdrop-blur-2xl border border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-green-500/25">
              <span className="text-xl sm:text-2xl font-bold text-white">F</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">FIRE</h1>
            <p className="text-gray-400 text-xs sm:text-sm font-medium">Portfolio Tracker</p>
            <div className="mt-3 sm:mt-4">
              <p className="text-gray-300 text-sm sm:text-base font-semibold">Welcome Back</p>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed px-2">Enter your password to access your dashboard</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your dashboard password"
                  autoFocus
                  required
                  className="w-full px-4 py-3 sm:py-4 bg-gray-700/60 border border-gray-600/60 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 focus:bg-gray-700/80 transition-all duration-300 text-sm sm:text-base group-hover:border-gray-500/60"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 sm:p-4 text-red-400 text-xs sm:text-sm flex items-start transform transition-transform duration-300 animate-pulse">
                <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 text-sm sm:text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Access Dashboard
                </span>
              )}
            </button>

            {/* Security Note */}
            <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl p-3 sm:p-4 text-yellow-400 text-xs sm:text-sm flex items-start">
              <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-semibold text-yellow-300">Security Notice</p>
                <p className="text-yellow-400/90 mt-1 leading-relaxed">This dashboard contains personal financial data. Only authorized access is permitted.</p>
              </div>
            </div>

            {/* Demo Info */}
            <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-blue-300 text-xs sm:text-sm">Demo Access</p>
              </div>
              <p className="text-blue-400/90 text-xs sm:text-sm mb-2">Use demo password:</p>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-2 inline-block">
                <code className="text-blue-300 font-mono text-xs sm:text-sm font-bold">demo123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 px-4">
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Secure</span>
            <span className="text-gray-500">•</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Private</span>
            <span className="text-gray-500">•</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">Personal Finance</span>
          </div>
          <p className="text-gray-500 text-xs mt-2">© 2025 FIRE Portfolio Tracker</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;