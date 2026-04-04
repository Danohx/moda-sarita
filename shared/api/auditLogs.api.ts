import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type AuditLog = {
  id: number;
  modulo: string;
  accion: string;
  descripcion: string | null;
  metadata: unknown;
  created_at: string;
  usuario_email: string | null;
};

export const auditLogsApi = {
  getAll: () =>
    apiFetch<{ ok: boolean; data: AuditLog[] }>(API_ENDPOINTS.auditLogs.list, {
      method: "GET",
      withAuth: true,
    }),
};
