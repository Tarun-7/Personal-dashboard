import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Generate a simple hash for password verification
  const hashPassword = (password) => {
    // Simple hash - you can make this more complex
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  };

  // Store the hashed password (change this to your password hash)
  const CORRECT_PASSWORD_HASH = import.meta.env.VITE_PASSWORD_HASH;

  useEffect(() => {
    // Check if user is already logged in
    const savedAuth = localStorage.getItem('dashboardAuth');
    const savedUser = localStorage.getItem('dashboardUser');
    
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (password) => {
    const passwordHash = hashPassword(password);
    
    if (passwordHash === CORRECT_PASSWORD_HASH) {
      const userData = {
        name: 'Dashboard Owner',
        loginTime: new Date().toISOString()
      };
      
      setIsAuthenticated(true);
      setUser(userData);
      
      // Set session with expiration (24 hours)
      const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('dashboardAuth', 'true');
      localStorage.setItem('dashboardUser', JSON.stringify(userData));
      localStorage.setItem('dashboardExpiry', expirationTime.toString());
      
      return { success: true };
    } else {
      return { success: false, error: 'Invalid password' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('dashboardAuth');
    localStorage.removeItem('dashboardUser');
    localStorage.removeItem('dashboardExpiry');
  };

  // Check for session expiration
  useEffect(() => {
    const checkExpiration = () => {
      const expiry = localStorage.getItem('dashboardExpiry');
      if (expiry && new Date().getTime() > parseInt(expiry)) {
        logout();
      }
    };

    const interval = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
