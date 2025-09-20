import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  profile?: {
    fullName?: string;
    selectedSubjects?: string[];
    targetExam?: string;
  };
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  setToken: (token: string, remember: boolean) => void;
}

// lib/auth.tsx

// ... (your AuthProvider and useAuth code stays the same)

export function getToken(): string | null {
  // ✅ Read from preferred key, then fallbacks for compatibility
  const candidates = [
    localStorage.getItem("auth_token"),
    sessionStorage.getItem("auth_token"),
    localStorage.getItem("access_token"),
    sessionStorage.getItem("access_token"),
    localStorage.getItem("token"),
    sessionStorage.getItem("token"),
  ];
  const token = candidates.find((t) => !!t && t.trim().length > 0) || null;
  if (process.env.NODE_ENV === "development") {
    try {
      const masked = token ? `${token.slice(0, 6)}…${token.slice(-4)}` : "null";
      // eslint-disable-next-line no-console
      console.debug("apiClient.getToken ->", masked);
    } catch {}
  }
  return token;
}


export function useAuthFetch() {
  const { token } = useAuth();

  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };

    return fetch(url, { ...options, headers });
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  // ✅ Load token & user on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken =
          localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setTokenState(storedToken);

        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
          credentials: "include", // ✅ include cookies if backend uses them
        });

        if (!response.ok) throw new Error("Failed to verify auth");

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error("Auth init failed:", err);
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        setTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ Helper to persist token
  const setToken = (newToken: string, remember: boolean) => {
    setTokenState(newToken);

    if (remember) {
      localStorage.setItem("auth_token", newToken);
      sessionStorage.removeItem("auth_token");
    } else {
      sessionStorage.setItem("auth_token", newToken);
      localStorage.removeItem("auth_token");
    }
  };

  // ✅ Login
  const login = async (email: string, password: string, remember = true) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to login");
    }

    const data = await response.json();

    // Support both `access_token` and `token` from backend
    const authToken = data.access_token || data.token;
    if (!authToken) throw new Error("No token returned from server");

    setToken(authToken, remember);
    setUser(data.user);

    // ✅ Redirect after login
    navigate("/dashboard");
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      setUser(null);
      setTokenState(null);
      navigate("/login");
    }
  };

  // ✅ Signup
  const signup = async (data: SignupData) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create account");
    }

    return await response.json();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user, // ✅ both token + user
        isLoading,
        login,
        logout,
        signup,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
