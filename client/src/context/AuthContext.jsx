import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const unifiedLogin = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      if (token && userData) {
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Unified login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const driverLogin = async (credentials) => {
    try {
      const response = await authAPI.driverLogin(credentials);
      const { token, driver } = response.data;
      
      if (token && driver) {
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify({ ...driver, role: 'driver' }));
        
        setUser({ ...driver, role: 'driver' });
        setIsAuthenticated(true);
        
        return { success: true, user: { ...driver, role: 'driver' } };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Driver login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const parentLogin = async (credentials) => {
    try {
      const response = await authAPI.parentLogin(credentials);
      const { token, parent } = response.data;
      
      if (token && parent) {
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify({ ...parent, role: 'parent' }));
        
        setUser({ ...parent, role: 'parent' });
        setIsAuthenticated(true);
        
        return { success: true, user: { ...parent, role: 'parent' } };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Parent login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const registerDriver = async (data) => {
    try {
      const response = await authAPI.driverRegister(data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Driver registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const registerParent = async (data) => {
    try {
      // For now, simulate parent registration with auto-login
      // In a real implementation, this would call a parent registration API
      const mockParentData = {
        id: Date.now(),
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        role: 'parent',
        status: 'active'
      };
      
      const mockToken = 'mock-parent-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('userData', JSON.stringify(mockParentData));
      
      setUser(mockParentData);
      setIsAuthenticated(true);
      
      return { success: true, user: mockParentData };
    } catch (error) {
      console.error('Parent registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (roles) => {
    if (!user?.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    unifiedLogin,
    driverLogin,
    parentLogin,
    registerDriver,
    registerParent,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
