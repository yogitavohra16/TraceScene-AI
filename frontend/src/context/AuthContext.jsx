/**
 * AuthContext - holds the DRF auth token (Section 36: MVP token auth) and
 * exposes login/logout. Token is persisted to localStorage so a page
 * refresh doesn't log the user out.
 */
import { createContext, useContext, useMemo, useState } from "react";

import { login as loginRequest, logout as logoutRequest } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tracescene_token"));
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const data = await loginRequest(username, password);
    localStorage.setItem("tracescene_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Even if the server call fails, clear the local session so the user
      // isn't stuck "logged in" against a dead token.
    }
    localStorage.removeItem("tracescene_token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, isAuthenticated: !!token, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
