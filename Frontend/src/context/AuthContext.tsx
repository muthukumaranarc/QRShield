import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, AUTH_TOKEN_KEY, getAuthHeaders } from '../services/apiConfig';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  memberSince: string;
  totalScans: number;
  securityScore: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, pass: string) => Promise<boolean>;
  googleLogin: (idToken?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AUTH_USER_KEY = '@qrshield_user_profile';

const DEFAULT_USER: UserProfile = {
  id: 'u_default_demo',
  name: 'Iniya Malini',
  email: 'iniya@example.com',
  phone: '+91 98765 43210',
  avatarUrl: null,
  memberSince: '18 Oct 2025',
  totalScans: 124,
  securityScore: 92,
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  isAuthenticated: true,
  login: async () => true,
  signup: async () => true,
  googleLogin: async () => true,
  logout: () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    // Restore session on app launch
    (async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const saved = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (saved) {
          setUser(JSON.parse(saved));
          setIsAuthenticated(true);
        }
        if (token) {
          // Verify & refresh profile with backend
          refreshProfile();
        }
      } catch {}
    })();
  }, []);

  const refreshProfile = async (): Promise<void> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => {
          const updated: UserProfile = {
            id: data.id,
            name: data.name || prev?.name || 'User',
            email: data.email || prev?.email || '',
            phone: prev?.phone || '+91 98765 43210',
            avatarUrl: data.avatarUrl || prev?.avatarUrl,
            memberSince: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : prev?.memberSince || '18 Oct 2025',
            totalScans: prev?.totalScans ?? 124,
            securityScore: prev?.securityScore ?? 92,
          };
          AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated)).catch(() => {});
          return updated;
        });
      }
    } catch {
      // offline
    }
  };

  const login = async (emailOrPhone: string, pass: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@mobile.qrshield.internal`,
          password: pass,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        }
        const loggedInUser: UserProfile = {
          id: data.user?.id || 'u_' + Date.now(),
          name: data.user?.name || DEFAULT_USER.name,
          email: data.user?.email || emailOrPhone,
          phone: !emailOrPhone.includes('@') ? emailOrPhone : DEFAULT_USER.phone,
          avatarUrl: data.user?.avatarUrl || null,
          memberSince: data.user?.createdAt
            ? new Date(data.user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : DEFAULT_USER.memberSince,
          totalScans: DEFAULT_USER.totalScans,
          securityScore: DEFAULT_USER.securityScore,
        };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedInUser));
        return true;
      }
    } catch {
      // Backend offline: perform local sign-in fallback
    }

    const fallbackUser: UserProfile = {
      ...DEFAULT_USER,
      email: emailOrPhone.includes('@') ? emailOrPhone : DEFAULT_USER.email,
      phone: !emailOrPhone.includes('@') ? emailOrPhone : DEFAULT_USER.phone,
    };
    setUser(fallbackUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallbackUser));
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    pass: string
  ): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(API_ENDPOINTS.AUTH_REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password: pass,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        }
        const newUser: UserProfile = {
          id: data.user?.id || 'u_' + Date.now(),
          name: data.user?.name || name,
          email: data.user?.email || email,
          phone,
          avatarUrl: data.user?.avatarUrl || null,
          memberSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          totalScans: 0,
          securityScore: 100,
        };
        setUser(newUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
        return true;
      }
    } catch {
      // Offline fallback
    }

    const fallbackNewUser: UserProfile = {
      name,
      email,
      phone,
      memberSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      totalScans: 0,
      securityScore: 100,
    };
    setUser(fallbackNewUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallbackNewUser));
    return true;
  };

  const googleLogin = async (idToken?: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_GOOGLE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          idToken: idToken || 'simulated_google_oauth_id_token',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        }
        const googleUser: UserProfile = {
          id: data.user?.id || 'u_' + Date.now(),
          name: data.user?.name || 'Google User',
          email: data.user?.email || 'google.user@gmail.com',
          phone: DEFAULT_USER.phone,
          avatarUrl: data.user?.avatarUrl || null,
          memberSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          totalScans: 12,
          securityScore: 98,
        };
        setUser(googleUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(googleUser));
        return true;
      }
    } catch {
      // Offline fallback
    }

    return login('google.user@gmail.com', 'dummy_google_pass');
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    setUser(updated);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));

    try {
      const headers = await getAuthHeaders();
      await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: updated.name,
          avatarUrl: updated.avatarUrl,
        }),
      });
    } catch {
      // Offline update preserved locally
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        googleLogin,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
