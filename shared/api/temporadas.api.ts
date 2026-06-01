import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Temporada = {
  id: string | number;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
  mes_inicio?: number | null;
  dia_inicio?: number | null;
  mes_fin?: number | null;
  dia_fin?: number | null;
};

type TemporadasResponse = {
  ok: boolean;
  data: Temporada[];
};

type TemporadaResponse = {
  ok: boolean;
  data: Temporada | null;
};

export type TemporadaCreatePayload = {
  nombre: string;
  descripcion?: string | null;
  mes_inicio?: number | null;
  dia_inicio?: number | null;
  mes_fin?: number | null;
  dia_fin?: number | null;
};

export type TemporadaUpdatePayload = Partial<{
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  mes_inicio: number | null;
  dia_inicio: number | null;
  mes_fin: number | null;
  dia_fin: number | null;
}>;

export const temporadasApi = {
  getAll: (includeInactive?: boolean) =>
    apiFetch<TemporadasResponse>(API_ENDPOINTS.temporadas.list, {
      method: "GET",
      query: includeInactive ? { includeInactive } : undefined,
    }),

  create: (payload: TemporadaCreatePayload) =>
    apiFetch<TemporadaResponse>(API_ENDPOINTS.temporadas.list, {
      method: "POST",
      body: payload,
    }),

  update: (id: string | number, payload: TemporadaUpdatePayload) =>
    apiFetch<TemporadaResponse>(API_ENDPOINTS.temporadas.byId(id), {
      method: "PATCH",
      body: payload,
    }),

  changeStatus: (id: string | number, activo: boolean) =>
    apiFetch<TemporadaResponse>(API_ENDPOINTS.temporadas.status(id), {
      method: "PATCH",
      body: { activo },
    }),
};