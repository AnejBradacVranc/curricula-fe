"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAccessToken, logout as clearToken } from "@/lib/api";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  markAuthenticated: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(!!getAccessToken());
    setIsLoading(false);
  }, []);

  const markAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      markAuthenticated,
      logout,
    }),
    [isAuthenticated, isLoading, markAuthenticated, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
