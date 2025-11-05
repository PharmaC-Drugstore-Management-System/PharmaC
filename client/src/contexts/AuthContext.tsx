import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'Owner' | 'Customer' | 'Employee' | 'Pharmacist';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  authLogin: (email: string, password: string) => Promise<{ success: boolean; skipOtp?: boolean; userData?: any }>; // Updated return type
  verifyOtp: (email: string, otp: string) => Promise<boolean>; // New function for OTP verification
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
  const API_URL = import.meta.env.VITE_API_URL ;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Role mapping function
  const mapRoleIdToRoleName = (roleId: number | string): 'Owner' |  'Customer' | 'Employee' | 'Pharmacist' => {
    const id = typeof roleId === 'string' ? parseInt(roleId) : roleId;
    console.log('🔍 Mapping role_id:', id); // Debug log
    switch (id) {
      case 1: return 'Owner';      // OWNER role
      case 2: return 'Employee';   // EMPLOYEE role
      case 4: return 'Customer';   // CUSTOMER role ✅
      case 5: return 'Pharmacist'; // PHARMACIST role
      default: 
        console.warn('⚠️ Unknown role_id:', id, 'defaulting to Customer');
        return 'Customer'; // Default fallback
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/me`, {
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

  // Step 1: Authenticate credentials and send OTP (doesn't log user in for non-customers)
  const authLogin = async (email: string, password: string): Promise<{ success: boolean; skipOtp?: boolean; userData?: any }> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('🔐 authLogin response:', responseData); // Debug log
        
        // If it's a customer, they skip OTP and are logged in directly
        if (responseData.skipOtp) {
          const userData = responseData.data;
          const roleId = userData?.role_id || userData.roleId || userData.role || userData.user_role;
          console.log('✅ Customer login detected! role_id:', roleId); // Debug log
          const mappedRole = mapRoleIdToRoleName(roleId);
          console.log('✅ Mapped to role:', mappedRole); // Debug log
          
          const user: User = {
            id: userData?.employee_id || userData.id || userData.user_id || userData.userId,
            email: userData?.email,
            role: mappedRole,
            name: userData?.firstname || userData.name || userData.username || userData.full_name,
          };
          
          console.log('👤 Setting customer user:', user); // Debug log
          setUser(user); // Log in the customer directly
          return { success: true, skipOtp: true, userData: user };
        }
        
        console.log('📧 OTP sent to non-customer user'); // Debug log
        // For non-customers, OTP was sent
        return { success: true, skipOtp: false };
      }
      return { success: false };
    } catch (error) {
      console.error('Authentication failed:', error);
      return { success: false };
    }
  };

  // Step 2: Verify OTP and complete login
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('OTP verification response:', userData);
        
        // Get role from various possible field names
        const roleId = userData.data?.role_id || userData.user?.role_id || userData.role_id || userData.roleId || userData.role || userData.user_role;
        console.log('OTP found roleId:', roleId);
        const mappedRole = mapRoleIdToRoleName(roleId);
        console.log('OTP mapped role:', mappedRole);
        
        // Create properly formatted user object
        const user: User = {
          id: userData.data?.employee_id || userData.user?.id || userData.id || userData.user_id || userData.userId,
          email: userData.data?.email || userData.user?.email || userData.email,
          role: mappedRole,
          name: userData.data?.firstname || userData.user?.firstname || userData.firstname || userData.user?.name || userData.name || userData.username || userData.full_name,
        };
        console.log('OTP processed user:', user);
        setUser(user); // This will trigger redirect to dashboard
        return true;
      }
      return false;
    } catch (error) {
      console.error('OTP verification failed:', error);
      return false;
    }
  };

  // Old login function for backwards compatibility (if needed elsewhere)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
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
      await fetch(`${API_URL}/logout`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    loading,
    login,
    authLogin,
    verifyOtp,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
