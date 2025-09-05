import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'Owner' | 'Staff' | 'Customer';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Role mapping function
  const mapRoleIdToRoleName = (roleId: number | string): 'Owner' | 'Staff' | 'Customer' => {
    const id = typeof roleId === 'string' ? parseInt(roleId) : roleId;
    switch (id) {
      case 1: return 'Customer'; // Admin -> Staff
      case 2: return 'Owner'; // Owner -> Owner
      case 3: return 'Staff'; // Employee -> Staff
      case 4: return 'Staff'; // Pharmacist -> Staff
      // case 8: return 'Customer'; // Customer -> Customer
      default: return 'Customer'; // Default fallback
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Auth response:', userData); // Debug log
        
        // Get role from various possible field names
        const roleId = userData.user?.role_id || userData.role_id || userData.roleId || userData.role || userData.user_role;
        console.log('Found roleId:', roleId); // Debug log
        const mappedRole = mapRoleIdToRoleName(roleId);
        console.log('Mapped role:', mappedRole); // Debug log
        
        // Handle different API response structures
        const user: User = {
          id: userData.user?.id || userData.id || userData.user_id || userData.userId,
          email: userData.user?.email || userData.email,
          role: mappedRole,
          name: userData.user?.firstname || userData.firstname || userData.user?.name || userData.name || userData.username || userData.full_name,
        };
        console.log('Processed user:', user); // Debug log
        setUser(user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Login response:', userData); // Debug log
        
        // Get role from various possible field names
        const roleId = userData.data?.role_id || userData.user?.role_id || userData.role_id || userData.roleId || userData.role || userData.user_role;
        console.log('Login found roleId:', roleId); // Debug log
        const mappedRole = mapRoleIdToRoleName(roleId);
        console.log('Login mapped role:', mappedRole); // Debug log
        
        // Create properly formatted user object
        const user: User = {
          id: userData.data?.employee_id || userData.user?.id || userData.id || userData.user_id || userData.userId,
          email: userData.data?.email || userData.user?.email || userData.email,
          role: mappedRole,
          name: userData.data?.firstname || userData.user?.firstname || userData.firstname || userData.user?.name || userData.name || userData.username || userData.full_name,
        };
        console.log('Login processed user:', user); // Debug log
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
