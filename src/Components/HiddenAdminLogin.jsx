import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HiLockClosed, HiUser, HiKey, HiHome, HiShieldCheck, HiEye, HiEyeOff } from 'react-icons/hi';
import '../styles/HiddenAdminLogin.css';
import logo from '../assets/mainlogo.png';

const HiddenAdminLogin = () => {
  console.log('HiddenAdminLogin: Component rendered');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(credentials.username, credentials.password);
      if (result.success) {
        setCredentials({ username: '', password: '' });
        // Redirect to admin dashboard after successful login
        window.location.href = `/${import.meta.env.ADMIN_ROUTE || 'admin-panel-choir-8942'}`;
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="hidden-admin-login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img src={logo} alt="Choir Logo" className="login-logo" />
            </div>
            <h1><HiShieldCheck className="header-icon" /> Admin Access</h1>
            <p>Enter your credentials to access the choir management panel</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username"><HiUser className="input-icon" /> Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password"><HiKey className="input-icon" /> Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <HiEyeOff className="eye-icon" /> : <HiEye className="eye-icon" />}
                </button>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isLoading}
            >
              <HiLockClosed className="button-icon" />
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
          
          <div className="login-footer">
            <button 
              onClick={() => window.location.href = '/'} 
              className="back-home-btn"
            >
              <HiHome className="button-icon" />
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiddenAdminLogin;
