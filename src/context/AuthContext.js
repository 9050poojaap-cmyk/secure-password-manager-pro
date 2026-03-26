import React, { createContext, useCallback, useMemo, useState } from "react";
import { createApi } from "../services/api";

const AuthContext = createContext(null);

const LS_TOKEN = "pm_token";
const LS_USER = "pm_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LS_TOKEN) || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const getToken = useCallback(() => token, [token]);
  const api = useMemo(() => createApi(getToken), [getToken]);

  const login = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(LS_TOKEN, nextToken);
    localStorage.setItem(LS_USER, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  }, []);

  const panic = useCallback(() => {
    // Panic mode: instant logout + best-effort clearing of common sensitive stores.
    logout();
    try {
      sessionStorage.clear();
    } catch {}
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      api,
      login,
      logout,
      panic,
    }),
    [token, user, api, login, logout, panic]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;

