import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthApi } from '../api/endpoints.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// User roles
export const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin'
};

// Using backend authentication; no mock users

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    console.log('AuthContext: Checking for existing session...');
    const token = localStorage.getItem(import.meta.env.AUTH_TOKEN_KEY || 'choirAuthToken');
    const userData = localStorage.getItem(import.meta.env.USER_DATA_KEY || 'choirUser');
    
    console.log('AuthContext: Token exists:', !!token);
    console.log('AuthContext: User data exists:', !!userData);
    
    (async () => {
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('AuthContext: Setting user from localStorage:', parsedUser);
          setUser(parsedUser);
          setAuthToken(token);
          try {
            const me = await AuthApi.me();
            if (me && me.user) {
              setUser(me.user);
              localStorage.setItem(import.meta.env.USER_DATA_KEY || 'choirUser', JSON.stringify(me.user));
            }
          } catch (err) {
            localStorage.removeItem(import.meta.env.AUTH_TOKEN_KEY || 'choirAuthToken');
            localStorage.removeItem(import.meta.env.USER_DATA_KEY || 'choirUser');
            setUser(null);
            setAuthToken(null);
          }
        } catch (error) {
          console.log('AuthContext: Error parsing user data, clearing localStorage');
          localStorage.removeItem(import.meta.env.AUTH_TOKEN_KEY || 'choirAuthToken');
          localStorage.removeItem(import.meta.env.USER_DATA_KEY || 'choirUser');
        }
      } else {
        console.log('AuthContext: No existing session found');
      }
      console.log('AuthContext: Setting isLoading to false');
      setIsLoading(false);
    })();
  }, []);

  const login = async (username, password) => {
    try {
      const { token, user } = await AuthApi.login({ usernameOrEmail: username, password });
      setUser(user);
      setAuthToken(token);
      localStorage.setItem(import.meta.env.AUTH_TOKEN_KEY || 'choirAuthToken', token);
      localStorage.setItem(import.meta.env.USER_DATA_KEY || 'choirUser', JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err?.data?.message || err?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(import.meta.env.AUTH_TOKEN_KEY || 'choirAuthToken');
    localStorage.removeItem(import.meta.env.USER_DATA_KEY || 'choirUser');
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      [ROLES.GUEST]: 0,
      [ROLES.USER]: 1,
      [ROLES.ADMIN]: 2
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isUser = () => hasRole(ROLES.USER);
  const isGuest = () => !user;

  const value = {
    user,
    isLoading,
    login,
    logout,
    hasRole,
    isAdmin,
    isUser,
    isGuest,
    authToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
