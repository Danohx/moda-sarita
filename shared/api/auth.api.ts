import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import { authStorage, tokenStorage } from "./storage";
import type { AuthUser, LoginPayload, LoginResponse } from "./types";

export type RegisterPayload = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  correo: string;
  contrasena: string;
};

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<{ mensaje: string; userId: string }>(API_ENDPOINTS.auth.register, {
      method: "POST",
      body: payload,
      withAuth: false,
    }),

  login: async (payload: LoginPayload) => {
    const response = await apiFetch<LoginResponse>(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: payload,
      withAuth: false,
    });

    if (response.accessToken || response.refreshToken) {
      tokenStorage.setTokens({
        accessToken: response.accessToken ?? null,
        refreshToken: response.refreshToken ?? null,
      });
    }

    return response;
  },

  verify2FA: async (payload: { tempToken: string; otpCode: string }) => {
    const response = await apiFetch<LoginResponse>(API_ENDPOINTS.auth.verify2FA, {
      method: "POST",
      body: payload,
      withAuth: false,
    });

    if (response.accessToken || response.refreshToken) {
      tokenStorage.setTokens({
        accessToken: response.accessToken ?? null,
        refreshToken: response.refreshToken ?? null,
      });
    }

    return response;
  },

  magicLink: (payload: { correo: string }) =>
    apiFetch<{ mensaje: string }>(API_ENDPOINTS.auth.magicLink, {
      method: "POST",
      body: payload,
      withAuth: false,
    }),

  verifyMagicLink: async (payload: { token: string }) => {
    const response = await apiFetch<LoginResponse>(API_ENDPOINTS.auth.verifyMagicLink, {
      method: "POST",
      body: payload,
      withAuth: false,
    });

    if (response.accessToken || response.refreshToken) {
      tokenStorage.setTokens({
        accessToken: response.accessToken ?? null,
        refreshToken: response.refreshToken ?? null,
      });
    }

    return response;
  },

  forgotPassword: (payload: { correo: string }) =>
    apiFetch<{ mensaje: string }>(API_ENDPOINTS.auth.forgotPassword, {
      method: "POST",
      body: payload,
      withAuth: false,
    }),

  resetPassword: (payload: { token: string; nuevaContrasena: string }) =>
    apiFetch<{ mensaje: string }>(API_ENDPOINTS.auth.resetPassword, {
      method: "POST",
      body: payload,
      withAuth: false,
    }),

  refresh: async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      authStorage.clearSession();
      return null;
    }

    const response = await apiFetch<{ accessToken: string }>(API_ENDPOINTS.auth.refreshToken, {
      method: "POST",
      body: { refreshToken },
      withAuth: false,
    });

    tokenStorage.setAccessToken(response.accessToken);
    return response;
  },

  me: async () => {
    const user = await apiFetch<AuthUser>(API_ENDPOINTS.auth.me, {
      method: "GET",
      withAuth: true,
    });

    authStorage.setUser(user);
    return user;
  },

  verifySession: async () => {
    try {
      const user = await authApi.me();
      return { ok: true, user };
    } catch {
      return { ok: false, user: null };
    }
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      await apiFetch<void>(API_ENDPOINTS.auth.logout, {
        method: "POST",
        body: { refreshToken: refreshToken ?? undefined },
        withAuth: false,
      });
    } finally {
      authStorage.clearSession();
    }
  },

  revokeAll: () =>
    apiFetch<{ mensaje: string }>(API_ENDPOINTS.auth.revokeAll, {
      method: "POST",
      withAuth: true,
    }),
};