import type { ApiErrorPayload } from "./types";

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: ApiErrorPayload | string | null;

  constructor(params: {
    message: string;
    status: number;
    code?: string;
    payload?: ApiErrorPayload | string | null;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.payload = params.payload;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function extractErrorMessage(payload: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (!payload) return fallback;

  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed || fallback;
  }

  if (typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    const candidates = [
      data.mensaje,
      data.msg,
      data.message,
      data.error,
      data.detail,
    ];

    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === "string" && first.trim()) {
        return first.trim();
      }
    }
  }

  return fallback;
}

export function toApiError(error: unknown, fallbackMessage = "No se pudo completar la solicitud"): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || fallbackMessage,
      status: 0,
      payload: null,
    });
  }

  return new ApiError({
    message: fallbackMessage,
    status: 0,
    payload: null,
  });
}