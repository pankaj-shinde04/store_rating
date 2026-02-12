import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        
        if (storedUser && accessToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = (userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  // Get user permissions based on role
  const getUserPermissions = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          'view_all_users',
          'manage_users',
          'view_all_stores',
          'manage_stores',
          'view_system_stats',
          'manage_system'
        ];
      case 'store_owner':
        return [
          'view_own_stores',
          'manage_own_stores',
          'view_store_ratings',
          'respond_to_ratings'
        ];
      case 'normal_user':
        return [
          'view_stores',
          'rate_stores',
          'edit_own_ratings',
          'manage_own_profile'
        ];
      default:
        return [];
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  // Get redirect path based on user role
  const getRedirectPath = () => {
    if (!user) return '/login';

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'store_owner':
        return '/owner/dashboard';
      case 'normal_user':
        return '/stores';
      default:
        return '/login';
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    getUserPermissions,
    hasPermission,
    getRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
