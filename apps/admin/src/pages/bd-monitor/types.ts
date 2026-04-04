export type DbSummary = {
  status: string;
  size: string;
  connections: number;
};

export type DbVacuum = {
  schemaname: string;
  relname: string;
  n_live_tup: number;
  n_dead_tup: number;
  last_vacuum: string | null;
  last_autovacuum: string | null;
};

export type DbAlert = {
  id: string;
  title: string;
  severity: "info" | "warning" | "error";
};

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

export type AuditLog = {
  id: number;
  modulo: string;
  accion: string;
  descripcion: string | null;
  metadata: unknown;
  created_at: string;
  usuario_email: string | null;
};