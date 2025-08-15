'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  naam?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_super_admin?: boolean;
}

interface Tenant {
  id: string;
  subdomain: string;
  company_name: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current subdomain
  const getSubdomain = () => {
    if (typeof window === 'undefined') return 'admin';
    
    const hostname = window.location.hostname;
    
    // Development mode
    if (hostname.includes('localhost')) {
      // Check URL params for admin mode
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') return 'admin';
      
      // Check if we're on a specific route that indicates subdomain
      const path = window.location.pathname;
      if (path.includes('/admin')) return 'admin';
      return 'vmta'; // Default to vmta for development
    }
    
    // Production mode
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      return ['www', 'api', 'mail', 'ftp'].includes(subdomain) ? 'admin' : subdomain;
    }
    
    return 'admin';
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        const storedTenant = localStorage.getItem('auth_tenant');

        if (storedToken && storedUser) {
          // Validate token with backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/validate`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'x-subdomain': getSubdomain(),
            },
          });

          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            if (storedTenant) {
              setTenant(JSON.parse(storedTenant));
            }
          } else {
            // Token invalid, clear storage
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tenant');
    setToken(null);
    setUser(null);
    setTenant(null);
  };

  const login = async (email: string, password: string) => {
    const subdomain = getSubdomain();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-subdomain': subdomain,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store auth data
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    if (data.tenant) {
      localStorage.setItem('auth_tenant', JSON.stringify(data.tenant));
      setTenant(data.tenant);
    }

    setToken(data.access_token);
    setUser(data.user);

    // The ProtectedLayout will automatically show the authenticated content
    // No need to manually redirect here
  };

  const logout = () => {
    clearAuthData();
    // Force page reload to reset state completely
    window.location.href = '/';
  };

  const value = {
    user,
    tenant,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    isSuperAdmin: user?.role === 'super_admin' || user?.is_super_admin === true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};