'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Base URL for API endpoints – can be set via NEXT_PUBLIC_API_URL env variable.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'affiliate' | 'admin';
  referralCode: string;
  commissionBalance: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role: string, referredByCode?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('eventnova_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      if (data.success && data.user) {
        setUser({
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          referralCode: data.user.referralCode,
          commissionBalance: data.user.commissionBalance,
        });
      } else {
        // Token is invalid/expired
        logout();
      }
    } catch (error: any) {
      // Use console.warn instead of console.error to prevent Next.js dev overlay from showing a fatal error screen
      console.warn('Backend not available, using offline mock session:', error?.message || 'Failed to fetch');
      // Fallback/offline behavior: if backend is down but token exists, we can mock user session so the frontend is 100% stable during offline presentation!
      const mockUser = localStorage.getItem('eventnova_user');
      if (mockUser && mockUser !== 'undefined') {
        try {
          setUser(JSON.parse(mockUser));
        } catch(e) {
          logout();
        }
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('eventnova_token', data.token);
        localStorage.setItem('eventnova_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Invalid email or password' };
      }
    } catch (error: any) {
      return { success: false, message: 'Server connection failed. Try again.' };
    }
  };

  const register = async (name: string, email: string, password: string, role: string, referredByCode?: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, referredByCode }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('eventnova_token', data.token);
        localStorage.setItem('eventnova_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error: any) {
      return { success: false, message: 'Server connection failed. Try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('eventnova_token');
    localStorage.removeItem('eventnova_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('eventnova_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
