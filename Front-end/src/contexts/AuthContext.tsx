import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser as loginUserApi, registerUser as registerUserApi, logoutUser as logoutUserApi, LoginResponse } from '../api/auth';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, terms: boolean) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const storedUser = sessionStorage.getItem('user') ?? localStorage.getItem('user');
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser((prev) => prev ?? storedUser);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist auth user so dashboard reloads keep state; sessionStorage preferred but keep localStorage in sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) {
      const serializedUser = JSON.stringify(user);
      sessionStorage.setItem('user', serializedUser);
      localStorage.setItem('user', serializedUser);
    } else {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user'); // Clean up old storage
    }
  }, [user]);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response: LoginResponse = await loginUserApi({ emailOrUsername, password });
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, terms: boolean) => {
    try {
      const response: LoginResponse = await registerUserApi({ username, email, password, terms });
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUserApi();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
