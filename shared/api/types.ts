export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Primitive = string | number | boolean | null | undefined;

export type QueryValue =
  | Primitive
  | Primitive[]
  | Record<string, Primitive>;

export type QueryParams = Record<string, QueryValue>;

export type ApiSuccessResponse<T> = {
  ok?: boolean;
  mensaje?: string;
  msg?: string;
  message?: string;
  data?: T;
  user?: unknown;
  roles?: unknown[];
  permisos?: string[];
};

export type ApiErrorPayload = {
  ok?: boolean;
  mensaje?: string;
  msg?: string;
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]> | string[] | unknown;
  [key: string]: unknown;
};

export type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  isFormData?: boolean;
  withAuth?: boolean;
  query?: QueryParams;
};

export type SessionTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type AuthUser = {
  id?: string;
  correo?: string;
  email?: string;
  nombre?: string;
  rol?: string;
  permisos?: string[];
  sid?: string;
  tfa?: boolean;
  activo?: boolean;
};

export type LoginPayload = {
  correo: string;
  contrasena: string;
};

export type LoginResponse = {
  requires2FA: boolean;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    correo: string;
    tfaEnabled: boolean;
  };
  mensaje: string;
};