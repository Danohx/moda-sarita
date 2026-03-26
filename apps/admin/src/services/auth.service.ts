import { authApi } from "../../../../shared/api/auth.api";
import { authStorage, tokenStorage } from "../../../../shared/api/storage";
import type { AuthUser } from "../../../../shared/api/types";

export const authService = {
  async login(correo: string, contrasena: string) {
    const response = await authApi.login({ correo, contrasena });

    if (response.requires2FA) {
      return response;
    }

    const profile = await authApi.me();

    return {
      ...response,
      profile,
    };
  },

  async restoreSession(): Promise<AuthUser | null> {
    const { accessToken, refreshToken } = tokenStorage.getTokens();

    if (!accessToken && !refreshToken) {
      authStorage.clearSession();
      return null;
    }

    try {
      return await authApi.me();
    } catch {
      authStorage.clearSession();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      authStorage.clearSession();
    }
  },
};