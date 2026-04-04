import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type DbSummary = {
  status: string;
  size: string;
  connections: number;
};

export type DbTable = {
  schemaname: string;
  relname: string;
  size: string;
};

export type DbVacuum = {
  schemaname: string;
  relname: string;
  n_live_tup: number;
  n_dead_tup: number;
  last_vacuum: string | null;
  last_autovacuum: string | null;
};

export type DbConnection = {
  state: string;
  total: number;
};

export const monitoringApi = {
  getSummary: () =>
    apiFetch<{ ok: boolean; data: DbSummary }>(
      API_ENDPOINTS.monitoring.summary,
      {
        method: "GET",
        withAuth: true,
      }
    ),

  getTables: () =>
    apiFetch<{ ok: boolean; data: DbTable[] }>(
      API_ENDPOINTS.monitoring.tables,
      {
        method: "GET",
        withAuth: true,
      }
    ),

  getVacuum: () =>
    apiFetch<{ ok: boolean; data: DbVacuum[] }>(
      API_ENDPOINTS.monitoring.vacuum,
      {
        method: "GET",
        withAuth: true,
      }
    ),

  getConnections: () =>
    apiFetch<{ ok: boolean; data: DbConnection[] }>(
      API_ENDPOINTS.monitoring.connections,
      {
        method: "GET",
        withAuth: true,
      }
    ),
};