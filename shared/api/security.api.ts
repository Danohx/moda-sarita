import { apiClient, apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Setup2FAResponse = {
  ok?: boolean;
  otpauth_url: string;
  mensaje?: string;
};

export type Enable2FAResponse = {
  ok?: boolean;
  success?: boolean;
  mensaje?: string;
  message?: string;
};

export type SecurityRoleApi = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
  permisos?: string[];
  total_permisos?: number;
  total_usuarios?: number;
  usuarios_activos?: number;
};

export type SecurityPermissionApi = {
  slug: string;
  nombre_legible: string;
  descripcion?: string | null;
};

export type SecurityEmployeeApi = {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  nombre_completo: string;
  email: string;
  rol_id: number | null;
  rol_nombre?: string | null;
  activo: boolean;
  tfa_enabled: boolean;
  fecha_creacion: string;
  ultima_sesion?: string | null;
};

export type ListEmployeesResponse = {
  ok: boolean;
  data: SecurityEmployeeApi[];
};

export type CreateEmployeePayload = {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  rol_id: number;
  password_temporal: string;
};

export type UpdateEmployeePayload = {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
  email?: string;
  rol_id?: number;
};

export type UpdateEmployeeStatusPayload = {
  activo: boolean;
};

export type SecuritySessionApi = {
  id: string;
  user_id: string;
  user_agent?: string | null;
  ip_address?: string | null;
  created_at: string;
  expires_at: string;
  revoked_at?: string | null;
  estado: "ACTIVA" | "REVOCADA" | "EXPIRADA";
  es_sesion_actual: boolean;
};

export type SecurityStatusApi = {
  id: string;
  email: string;
  tfa_enabled: boolean;
  passkeys_count: number;
};

export type SecurityStatusResponse = {
  ok: boolean;
  data: SecurityStatusApi;
};

export type ListSessionsResponse = {
  ok: boolean;
  data: SecuritySessionApi[];
};

export type RevokeSessionResponse = {
  ok: boolean;
  message?: string;
  data?: SecuritySessionApi;
};

export type RevokeOtherSessionsResponse = {
  ok: boolean;
  message?: string;
  data: {
    sesiones_revocadas: number;
  };
};

export type EmployeeMutationResponse = {
  ok: boolean;
  message?: string;
  mensaje?: string;
  data: SecurityEmployeeApi;
};

export type ListRolesResponse = {
  ok: boolean;
  roles: SecurityRoleApi[];
};

export type ListPermisosResponse = {
  ok: boolean;
  permisos: SecurityPermissionApi[];
};

export type GetPermisosRolResponse = {
  ok: boolean;
  rolId: number;
  permisos: string[];
};

export type CreateRolePayload = {
  nombre: string;
  descripcion?: string | null;
  permisos?: string[];
};

export type UpdateRolePayload = {
  nombre: string;
  descripcion?: string | null;
};

export type SetPermisosRolPayload = {
  permisos: string[];
};

export type RoleMutationResponse = {
  ok: boolean;
  mensaje?: string;
  data: SecurityRoleApi & {
    permisos?: string[];
  };
};

export type SetPermisosRolResponse = {
  ok: boolean;
  mensaje?: string;
  rolId: number;
  permisos: string[];
};

export type UpdateRoleStatusPayload = {
  activo: boolean;
};

export const securityApi = {
  setup2FA: () =>
    apiFetch<Setup2FAResponse>(API_ENDPOINTS.security.setup2FA, {
      method: "POST",
    }),

  enable2FA: (otpCode: string) =>
    apiFetch<Enable2FAResponse>(API_ENDPOINTS.security.enable2FA, {
      method: "POST",
      body: { token: otpCode },
    }),

  getEmployees: (params?: { q?: string; includeInactive?: boolean }) =>
    apiClient.get<ListEmployeesResponse>(API_ENDPOINTS.security.empleados, {
      query: {
        q: params?.q,
        includeInactive:
          params?.includeInactive === undefined
            ? undefined
            : String(params.includeInactive),
      },
    }),

  createEmployee: (payload: CreateEmployeePayload) =>
    apiClient.post<EmployeeMutationResponse>(
      API_ENDPOINTS.security.empleados,
      payload,
    ),

  updateEmployee: (
    usuarioId: string | number,
    payload: UpdateEmployeePayload,
  ) =>
    apiClient.patch<EmployeeMutationResponse>(
      API_ENDPOINTS.security.empleadoById(usuarioId),
      payload,
    ),

  updateEmployeeStatus: (
    usuarioId: string | number,
    payload: UpdateEmployeeStatusPayload,
  ) =>
    apiClient.patch<EmployeeMutationResponse>(
      API_ENDPOINTS.security.empleadoStatus(usuarioId),
      payload,
    ),

  getSessions: () =>
    apiClient.get<ListSessionsResponse>(API_ENDPOINTS.security.sessions),

  revokeSession: (sessionId: string | number) =>
    apiClient.patch<RevokeSessionResponse>(
      API_ENDPOINTS.security.sessionRevoke(sessionId),
    ),

  revokeOtherSessions: () =>
    apiClient.patch<RevokeOtherSessionsResponse>(
      API_ENDPOINTS.security.revokeOtherSessions,
    ),

  getRoles: (withPermisos = false) =>
    apiClient.get<ListRolesResponse>(API_ENDPOINTS.security.roles, {
      query: withPermisos ? { withPermisos: "true" } : undefined,
    }),

  getPermisos: () =>
    apiClient.get<ListPermisosResponse>(API_ENDPOINTS.security.permisos),

  getPermisosRol: (rolId: string | number) =>
    apiClient.get<GetPermisosRolResponse>(
      API_ENDPOINTS.security.permisosByRol(rolId),
    ),

  createRole: (payload: CreateRolePayload) =>
    apiClient.post<RoleMutationResponse>(API_ENDPOINTS.security.roles, payload),

  updateRole: (rolId: string | number, payload: UpdateRolePayload) =>
    apiClient.patch<RoleMutationResponse>(
      API_ENDPOINTS.security.roleById(rolId),
      payload,
    ),

  setPermisosRol: (rolId: string | number, payload: SetPermisosRolPayload) =>
    apiClient.post<SetPermisosRolResponse>(
      API_ENDPOINTS.security.permisosByRol(rolId),
      payload,
    ),

  updateRoleStatus: (
    rolId: string | number,
    payload: UpdateRoleStatusPayload,
  ) =>
    apiClient.patch<RoleMutationResponse>(
      API_ENDPOINTS.security.roleStatus(rolId),
      payload,
    ),

  getSecurityStatus: () =>
    apiClient.get<SecurityStatusResponse>(API_ENDPOINTS.security.status),
};
