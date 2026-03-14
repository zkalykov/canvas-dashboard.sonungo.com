'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  canvasUrl: string | null;
  login: (canvas_url: string, canvas_token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  canvasUrl: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        if (data.canvas_url) {
          setCanvasUrl(data.canvas_url);
        } else {
          setCanvasUrl(null);
        }
      } else {
        setIsAuthenticated(false);
        setCanvasUrl(null);
      }
    } catch (e) {
      console.error('Failed to check session', e);
      setIsAuthenticated(false);
      setCanvasUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Periodic check to auto-logout if session expires while app is open
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check every 5 minutes
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, checkSession]);

  const login = useCallback(async (canvas_url: string, canvas_token: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvas_url, canvas_token }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      setCanvasUrl(canvas_url);
    } else {
      throw new Error('Login failed');
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setCanvasUrl(null);
    // Optionally redirect after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        canvasUrl,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
