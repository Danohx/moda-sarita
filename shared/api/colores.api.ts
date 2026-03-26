import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Color = {
  id: string | number;
  nombre: string;
  codigo_hex?: string | null;
  activo?: boolean;
};

type ColoresResponse = {
  ok: boolean;
  data: Color[];
};

type ColorResponse = {
  ok: boolean;
  data: Color;
};

export const coloresApi = {
  getAll: () =>
    apiFetch<ColoresResponse>(API_ENDPOINTS.colores.adminList, {
      method: "GET",
    }),
  
  getAllPublic: () =>
    apiFetch<ColoresResponse>(API_ENDPOINTS.colores.list, {
      method: "GET",
    }),

  create: (payload: Partial<Color>) =>
    apiFetch<ColorResponse>(API_ENDPOINTS.colores.list, {
      method: "POST",
      body: payload,
    }),

  update: (id: string | number, payload: Partial<Color>) =>
    apiFetch<ColorResponse>(API_ENDPOINTS.colores.byId(id), {
      method: "PATCH",
      body: payload,
    }),

  changeStatus: (id: string | number, activo: boolean) =>
    apiFetch<ColorResponse>(API_ENDPOINTS.colores.status(id), {
      method: "PATCH",
      body: { activo },
    }),
};