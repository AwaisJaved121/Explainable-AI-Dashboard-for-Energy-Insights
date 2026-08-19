import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('energy_dashboard_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('energy_dashboard_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    // In a real app, this would call an API
    // For demo, we'll simulate different user roles
    const { email, role = 'engineer' } = credentials;
    
    const newUser = {
      id: Date.now(),
      name: email.split('@')[0],
      email,
      role,
      permissions: role === 'manager' 
        ? ['view', 'predict', 'explain', 'optimize', 'manage_users']
        : ['view', 'predict', 'explain', 'optimize']
    };

    localStorage.setItem('energy_dashboard_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('energy_dashboard_user');
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) || user.role === 'manager';
  }, [user]);

  const value = {
    user,
    login,
    logout,
    hasPermission,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};