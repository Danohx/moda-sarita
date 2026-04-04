import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type MaintenanceJob = {
  id: number;
  tipo: string;
  estado: "pending" | "running" | "completed" | "failed";
  detalle: string | null;
  iniciado_en: string | null;
  finalizado_en: string | null;
  created_at: string;
  ejecutado_por_email: string | null;
};

export const maintenanceApi = {
  getAll: () =>
    apiFetch<{ ok: boolean; data: MaintenanceJob[] }>(
      API_ENDPOINTS.maintenance.list,
      {
        method: "GET",
        withAuth: true,
      },
    ),

  getTables: () =>
    apiFetch<{ ok: boolean; data: string[] }>(
      API_ENDPOINTS.maintenance.tables,
      {
        method: "GET",
        withAuth: true,
      },
    ),
  run: (payload?: { tables?: string[] }) =>
    apiFetch<{ ok: boolean; msg: string; data?: { jobId: number; tables: string[] } }>(API_ENDPOINTS.maintenance.run, {
      method: "POST",
      body: payload ?? {},
      withAuth: true,
    }),
};
