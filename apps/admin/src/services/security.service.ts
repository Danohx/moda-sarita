import {
  securityApi,
  type CreateRolePayload,
  type UpdateRolePayload,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
  type SecuritySessionApi,
} from "../../../../shared/api/security.api";

type Enable2FAPayload = Parameters<typeof securityApi.enable2FA>[0];

export type SecurityRole = {
  id: string;
  name: string;
  descripcion?: string | null;
  permissions: string[];
  userCount?: number;
  isSystem: boolean;
  activo: boolean;
};

export type SecurityPermission = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
};

export type SecurityEmployee = {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  fullName: string;
  email: string;
  rolId: string;
  rolName: string;
  activo: boolean;
  tfaEnabled: boolean;
  createdAt: string;
  lastSession?: string | null;
};

export type SecuritySession = {
  id: string;
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  status: "ACTIVA" | "REVOCADA" | "EXPIRADA";
  isCurrent: boolean;
};

export type SecurityStatus = {
  id: string;
  email: string;
  tfaEnabled: boolean;
  passkeysCount: number;
};

function isSystemRole(nombre: string) {
  return ["ADMINISTRADOR", "ADMIN", "SUPERADMIN"].includes(
    String(nombre || "")
      .trim()
      .toUpperCase(),
  );
}

function getPermissionCategory(slug: string) {
  const [module] = String(slug).split(".");

  const labels: Record<string, string> = {
    configuracion: "Configuración",
    seguridad: "Seguridad",
    ventas: "Ventas",
    inventario: "Inventario",
    clientes: "Clientes",
    marketing: "Marketing",
    reportes: "Reportes",
    dashboard: "Dashboard",
  };

  return labels[module] ?? module.toUpperCase();
}

export const securityService = {
  async setup2FA() {
    return securityApi.setup2FA();
  },

  async enable2FA(payload: Enable2FAPayload) {
    return securityApi.enable2FA(payload);
  },

  async getEmployees(params?: {
    q?: string;
    includeInactive?: boolean;
  }): Promise<SecurityEmployee[]> {
    const response = await securityApi.getEmployees(params);

    return response.data.map((employee) => ({
      id: employee.id,
      nombres: employee.nombres,
      apellidoPaterno: employee.apellido_paterno,
      apellidoMaterno: employee.apellido_materno ?? null,
      fullName: employee.nombre_completo,
      email: employee.email,
      rolId: employee.rol_id ? String(employee.rol_id) : "",
      rolName: employee.rol_nombre ?? "Sin rol",
      activo: employee.activo ?? true,
      tfaEnabled: employee.tfa_enabled ?? false,
      createdAt: employee.fecha_creacion,
      lastSession: employee.ultima_sesion ?? null,
    }));
  },

  async createEmployee(payload: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno?: string | null;
    email: string;
    rolId: string | number;
    passwordTemporal: string;
  }) {
    const body: CreateEmployeePayload = {
      nombres: payload.nombres,
      apellido_paterno: payload.apellidoPaterno,
      apellido_materno: payload.apellidoMaterno ?? null,
      email: payload.email,
      rol_id: Number(payload.rolId),
      password_temporal: payload.passwordTemporal,
    };

    return securityApi.createEmployee(body);
  },

  async updateEmployee(
    usuarioId: string | number,
    payload: {
      nombres?: string;
      apellidoPaterno?: string;
      apellidoMaterno?: string | null;
      email?: string;
      rolId?: string | number;
    },
  ) {
    const body: UpdateEmployeePayload = {};

    if (payload.nombres !== undefined) body.nombres = payload.nombres;
    if (payload.apellidoPaterno !== undefined) {
      body.apellido_paterno = payload.apellidoPaterno;
    }
    if (payload.apellidoMaterno !== undefined) {
      body.apellido_materno = payload.apellidoMaterno;
    }
    if (payload.email !== undefined) body.email = payload.email;
    if (payload.rolId !== undefined) body.rol_id = Number(payload.rolId);

    return securityApi.updateEmployee(usuarioId, body);
  },

  async updateEmployeeStatus(usuarioId: string | number, activo: boolean) {
    return securityApi.updateEmployeeStatus(usuarioId, {
      activo,
    });
  },

  async getSessions(): Promise<SecuritySession[]> {
    const response = await securityApi.getSessions();

    return response.data.map((session: SecuritySessionApi) => ({
      id: session.id,
      userId: session.user_id,
      userAgent: session.user_agent ?? null,
      ipAddress: session.ip_address ?? null,
      createdAt: session.created_at,
      expiresAt: session.expires_at,
      revokedAt: session.revoked_at ?? null,
      status: session.estado,
      isCurrent: session.es_sesion_actual,
    }));
  },

  async revokeSession(sessionId: string | number) {
    return securityApi.revokeSession(sessionId);
  },

  async revokeOtherSessions() {
    return securityApi.revokeOtherSessions();
  },

  async getRolesWithPermisos(): Promise<SecurityRole[]> {
    const response = await securityApi.getRoles(true);

    return response.roles.map((role) => ({
      id: String(role.id),
      name: role.nombre,
      descripcion: role.descripcion ?? null,
      permissions: Array.isArray(role.permisos) ? role.permisos : [],
      userCount: role.usuarios_activos ?? role.total_usuarios ?? 0,
      isSystem: isSystemRole(role.nombre),
      activo: role.activo ?? true,
    }));
  },

  async getPermisos(): Promise<SecurityPermission[]> {
    const response = await securityApi.getPermisos();

    return response.permisos.map((permission) => ({
      id: permission.slug,
      name: permission.nombre_legible,
      description: permission.descripcion ?? null,
      category: getPermissionCategory(permission.slug),
    }));
  },

  async createRole(payload: {
    name: string;
    descripcion?: string | null;
    permissions: string[];
  }) {
    const body: CreateRolePayload = {
      nombre: payload.name,
      descripcion: payload.descripcion ?? null,
      permisos: payload.permissions,
    };

    return securityApi.createRole(body);
  },

  async updateRole(
    rolId: string | number,
    payload: {
      name: string;
      descripcion?: string | null;
    },
  ) {
    const body: UpdateRolePayload = {
      nombre: payload.name,
      descripcion: payload.descripcion ?? null,
    };

    return securityApi.updateRole(rolId, body);
  },

  async setRolePermissions(rolId: string | number, permissions: string[]) {
    return securityApi.setPermisosRol(rolId, {
      permisos: permissions,
    });
  },

  async updateRoleStatus(rolId: string | number, activo: boolean) {
    return securityApi.updateRoleStatus(rolId, {
      activo,
    });
  },

  async getSecurityStatus(): Promise<SecurityStatus> {
    const response = await securityApi.getSecurityStatus();

    return {
      id: response.data.id,
      email: response.data.email,
      tfaEnabled: response.data.tfa_enabled,
      passkeysCount: response.data.passkeys_count ?? 0,
    };
  },
};
