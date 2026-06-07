import { API_CONFIG } from "./config";
import { ApiError, extractErrorMessage } from "./errors";
import { authStorage, tokenStorage } from "./storage";
import { API_ENDPOINTS } from "./endpoints";
import type { ApiRequestOptions, QueryParams } from "./types";

let refreshPromise: Promise<string | null> | null = null;

function buildUrl(endpoint: string, query?: QueryParams): string {
  const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);

  if (!query) return url.toString();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (
          nestedValue !== undefined &&
          nestedValue !== null &&
          nestedValue !== ""
        ) {
          url.searchParams.append(`${key}.${nestedKey}`, String(nestedValue));
        }
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  retryOn401 = true,
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    isFormData = false,
    withAuth = true,
    query,
  } = options;

  const finalHeaders = new Headers(headers);

  if (!isFormData) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const accessToken = withAuth ? tokenStorage.getAccessToken() : null;

  if (accessToken) {
    finalHeaders.set(
      API_CONFIG.authHeaderName,
      `${API_CONFIG.bearerPrefix} ${accessToken}`,
    );
  }

  const response = await fetch(buildUrl(endpoint, query), {
    method,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as BodyInit)
          : JSON.stringify(body),
    credentials: API_CONFIG.withCredentials ? "include" : "same-origin",
    signal,
  });

  const parsed = await parseResponse(response);

  if (response.ok) {
    return parsed as T;
  }

  if (
    response.status === 401 &&
    retryOn401 &&
    withAuth &&
    endpoint !== API_ENDPOINTS.auth.refreshToken &&
    endpoint !== API_ENDPOINTS.auth.login
  ) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request<T>(endpoint, options, false);
    }
  }

  throw new ApiError({
    message: extractErrorMessage(parsed, `Error HTTP ${response.status}`),
    status: response.status,
    payload: (parsed ?? null) as never,
  });
}

async function requestBlob(
  endpoint: string,
  options: ApiRequestOptions = {},
  retryOn401 = true,
): Promise<Blob> {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    isFormData = false,
    withAuth = true,
    query,
  } = options;

  const finalHeaders = new Headers(headers);

  if (!isFormData && body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const accessToken = withAuth ? tokenStorage.getAccessToken() : null;

  if (accessToken) {
    finalHeaders.set(
      API_CONFIG.authHeaderName,
      `${API_CONFIG.bearerPrefix} ${accessToken}`,
    );
  }

  const response = await fetch(buildUrl(endpoint, query), {
    method,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as BodyInit)
          : JSON.stringify(body),
    credentials: API_CONFIG.withCredentials ? "include" : "same-origin",
    signal,
  });

  if (response.ok) {
    return response.blob();
  }

  const parsed = await parseResponse(response);

  if (
    response.status === 401 &&
    retryOn401 &&
    withAuth &&
    endpoint !== API_ENDPOINTS.auth.refreshToken &&
    endpoint !== API_ENDPOINTS.auth.login
  ) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      return requestBlob(endpoint, options, false);
    }
  }

  throw new ApiError({
    message: extractErrorMessage(parsed, `Error HTTP ${response.status}`),
    status: response.status,
    payload: (parsed ?? null) as never,
  });
}

async function tryRefreshToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        authStorage.clearSession();
        return null;
      }

      try {
        const response = await request<{ accessToken: string }>(
          API_ENDPOINTS.auth.refreshToken,
          {
            method: "POST",
            body: { refreshToken },
            withAuth: false,
          },
          false,
        );

        if (!response?.accessToken) {
          authStorage.clearSession();
          return null;
        }

        tokenStorage.setAccessToken(response.accessToken);
        return response.accessToken;
      } catch {
        authStorage.clearSession();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export const apiClient = {
  get: <T>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) => request<T>(endpoint, { ...options, method: "DELETE" }),
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return request<T>(endpoint, options);
}

export async function apiFetchBlob(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<Blob> {
  return requestBlob(endpoint, options);
}