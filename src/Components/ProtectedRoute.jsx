import React from 'react';
import { useAuth, ROLES } from '../contexts/AuthContext';
import HiddenAdminLogin from './HiddenAdminLogin';

const ProtectedRoute = ({ children, requiredRole = ROLES.ADMIN }) => {
  const { user, isLoading, hasRole } = useAuth();
  
  console.log('ProtectedRoute: isLoading:', isLoading);
  console.log('ProtectedRoute: user:', user);
  console.log('ProtectedRoute: hasRole(ADMIN):', hasRole(requiredRole));

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user || !hasRole(requiredRole)) {
    // Show hidden admin login instead of redirecting
    return <HiddenAdminLogin />;
  }

  return children;
};

export default ProtectedRoute;
