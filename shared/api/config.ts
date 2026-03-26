const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl || typeof rawApiUrl !== "string") {
  throw new Error("No se definió VITE_API_URL");
}

export const API_CONFIG = {
  baseUrl: rawApiUrl.replace(/\/+$/, ""),
  timeoutMs: 15000,
  withCredentials: true,
  authHeaderName: "Authorization",
  bearerPrefix: "Bearer",
} as const;

export const API_BASE_URL = API_CONFIG.baseUrl;