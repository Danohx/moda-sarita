import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Talla = {
  id: string | number;
  nombre: string;
  activo?: boolean;
};

type TallasResponse = {
  ok: boolean;
  data: Talla[];
};

type TallaResponse = {
  ok: boolean;
  data: Talla;
};

export const tallasApi = {
  getAll: () =>
    apiFetch<TallasResponse>(API_ENDPOINTS.tallas.adminList, {
      method: "GET",
    }),
  
    getAllPublic: () =>
    apiFetch<TallasResponse>(API_ENDPOINTS.tallas.list, {
      method: "GET",
      withAuth: false
    }),

  create: (payload: Partial<Talla>) =>
    apiFetch<TallaResponse>(API_ENDPOINTS.tallas.list, {
      method: "POST",
      body: payload,
    }),

  update: (id: string | number, payload: Partial<Talla>) =>
    apiFetch<TallaResponse>(API_ENDPOINTS.tallas.byId(id), {
      method: "PATCH",
      body: payload,
    }),

  changeStatus: (id: string | number, activo: boolean) =>
    apiFetch<TallaResponse>(API_ENDPOINTS.tallas.status(id), {
      method: "PATCH",
      body: { activo },
    }),
};