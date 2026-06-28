import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type AuditLogApi = {
  id: number | string;
  modulo: string;
  accion: string;
  descripcion?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  usuario_email?: string | null;
};

export type ListAuditLogsResponse = {
  ok: boolean;
  data: AuditLogApi[];
};

export const auditLogsApi = {
  getAll: () =>
    apiFetch<ListAuditLogsResponse>(API_ENDPOINTS.auditLogs.list, {
      method: "GET",
      withAuth: true,
    }),
};
