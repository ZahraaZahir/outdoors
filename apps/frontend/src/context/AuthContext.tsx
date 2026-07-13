import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../lib/api";
import type { User } from "../lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (data: { name: string; password: string; phoneNumber: string }) => Promise<{ otpCode: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

function parseJwt(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.sub,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      name: payload.name ?? "",
      verified: false,
      createdAt: "",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;
    try {
      const res = await api.refresh(refreshToken);
      localStorage.setItem("token", res.accessToken);
      setToken(res.accessToken);
      setUser(parseJwt(res.accessToken));
      return true;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let payload: { exp?: number };
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }
    const expiresAt = (payload.exp ?? 0) * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry <= 0) {
      refreshAccessToken().finally(() => setLoading(false));
      return;
    }

    setUser(parseJwt(token));

    const refreshBuffer = 60_000;
    const refreshIn = Math.max(timeUntilExpiry - refreshBuffer, 5_000);
    const timer = setTimeout(() => { refreshAccessToken(); }, refreshIn);

    setLoading(false);
    return () => clearTimeout(timer);
  }, [token, refreshAccessToken]);

  const login = async (phoneNumber: string, password: string) => {
    const res = await api.login({ phoneNumber, password });
    localStorage.setItem("token", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    setToken(res.accessToken);
    setUser(parseJwt(res.accessToken));
  };

  const register = async (data: { name: string; password: string; phoneNumber: string }) => {
    const res = await api.register(data);
    return { otpCode: res.otpCode };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
