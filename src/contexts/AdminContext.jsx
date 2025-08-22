import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is logged in on component mount
  useEffect(() => {
    const adminStatus = localStorage.getItem('choirAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = (password) => {
    // Simple password check - you can change this password
    if (password === 'choir2024') {
      setIsAdmin(true);
      localStorage.setItem('choirAdmin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('choirAdmin');
  };

  const value = {
    isAdmin,
    isLoading,
    login,
    logout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
