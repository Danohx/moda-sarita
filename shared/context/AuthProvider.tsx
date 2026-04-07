import React, { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { authApi } from "../api/auth.api";
import { authStorage, tokenStorage } from "../api/storage";
import type { AuthUser } from "../api/types";

type Props = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    try {
      setLoading(true);

      const { accessToken, refreshToken } = tokenStorage.getTokens();

      if (!accessToken && !refreshToken) {
        setUser(null);
        authStorage.clearSession();
        return;
      }

      const me = await authApi.me();
      setUser(me);
      authStorage.setUser?.(me);
    } catch {
      setUser(null);
      authStorage.clearSession();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      authStorage.clearSession();
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      setUser,
      logout,
      restoreSession,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};