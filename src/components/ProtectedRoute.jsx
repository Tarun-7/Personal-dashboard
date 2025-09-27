import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <LoginPage />;
};

export default ProtectedRoute;