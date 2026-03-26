import type { SessionTokens, AuthUser } from "./types";

const ACCESS_TOKEN_KEY = "ms_access_token";
const REFRESH_TOKEN_KEY = "ms_refresh_token";
const AUTH_USER_KEY = "ms_auth_user";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // noop
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // noop
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return safeGet(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return safeGet(REFRESH_TOKEN_KEY);
  },

  setAccessToken(token: string | null): void {
    if (!token) {
      safeRemove(ACCESS_TOKEN_KEY);
      return;
    }
    safeSet(ACCESS_TOKEN_KEY, token);
  },

  setRefreshToken(token: string | null): void {
    if (!token) {
      safeRemove(REFRESH_TOKEN_KEY);
      return;
    }
    safeSet(REFRESH_TOKEN_KEY, token);
  },

  getTokens(): SessionTokens {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
  },

  setTokens(tokens: Partial<SessionTokens>): void {
    if ("accessToken" in tokens) {
      this.setAccessToken(tokens.accessToken ?? null);
    }

    if ("refreshToken" in tokens) {
      this.setRefreshToken(tokens.refreshToken ?? null);
    }
  },

  clearTokens(): void {
    safeRemove(ACCESS_TOKEN_KEY);
    safeRemove(REFRESH_TOKEN_KEY);
  },
};

export const authStorage = {
  getUser<T extends AuthUser = AuthUser>(): T | null {
    const raw = safeGet(AUTH_USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser | null): void {
    if (!user) {
      safeRemove(AUTH_USER_KEY);
      return;
    }
    safeSet(AUTH_USER_KEY, JSON.stringify(user));
  },

  clearUser(): void {
    safeRemove(AUTH_USER_KEY);
  },

  clearSession(): void {
    tokenStorage.clearTokens();
    this.clearUser();
  },
};