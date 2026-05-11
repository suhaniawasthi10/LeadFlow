import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/lib/authApi';
import type { AuthUser } from '@/lib/authApi';

const TOKEN_KEY = 'leadflow-token';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Derive initial isLoading from whether we have a token to validate.
  // No token → nothing to check → don't render the loading state at all.
  const [isLoading, setIsLoading] = useState(
    () => localStorage.getItem(TOKEN_KEY) !== null,
  );
  const queryClient = useQueryClient();

  // Initial mount — validate any stored token against /api/auth/me.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for 401s from the axios response interceptor — decoupled from
  // lib/api.ts to avoid a circular import.
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(TOKEN_KEY);
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    queryClient.clear();
    setUser(result.user);
  };

  const signup = async (email: string, password: string) => {
    const result = await authApi.signup(email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    queryClient.clear();
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
