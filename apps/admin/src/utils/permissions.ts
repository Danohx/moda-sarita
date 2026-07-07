import type { AuthUser } from "@shared/api/types";

type PermissionMode = "any" | "all";

type AnyAuthUser = AuthUser & {
  user?: AuthUser;
  permisos?: string[];
  permissions?: string[];
  rol?: string;
  role?: string;
  rol_nombre?: string;
  roleName?: string;
};

function unwrapUser(user: AuthUser | null | undefined): AnyAuthUser | null {
  if (!user) return null;

  const raw = user as AnyAuthUser;

  if (raw.user) {
    return raw.user as AnyAuthUser;
  }

  return raw;
}

export function getCurrentUserId(user: AuthUser | null | undefined) {
  const raw = unwrapUser(user);
  return raw?.id ? String(raw.id) : "";
}

export function getUserRole(user: AuthUser | null | undefined) {
  const raw = unwrapUser(user);

  return String(
    raw?.rol || raw?.role || raw?.rol_nombre || raw?.roleName || "",
  ).toUpperCase();
}

export function getUserPermissions(user: AuthUser | null | undefined) {
  const raw = unwrapUser(user);

  if (Array.isArray(raw?.permisos)) return raw.permisos;
  if (Array.isArray(raw?.permissions)) return raw.permissions;

  return [];
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permissions?: string | readonly string[],
  mode: PermissionMode = "any",
) {
  if (!permissions) return true;

  const required = Array.isArray(permissions) ? permissions : [permissions];

  if (required.length === 0) return true;

  const userPermissions = getUserPermissions(user);

  if (mode === "all") {
    return required.every((permission) => userPermissions.includes(permission));
  }

  return required.some((permission) => userPermissions.includes(permission));
}

export function canAccess(
  user: AuthUser | null | undefined,
  options: {
    permissions?: string | readonly string[];
    mode?: PermissionMode;
  },
) {
  return hasPermission(user, options.permissions, options.mode ?? "any");
}
