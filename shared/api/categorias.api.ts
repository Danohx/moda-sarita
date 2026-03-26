import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Categoria = {
  id: string | number;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
};

type CategoriasResponse = {
  ok: boolean;
  data: Categoria[];
};

type CategoriaResponse = {
  ok: boolean;
  data: Categoria;
};

export const categoriasApi = {
  getAll: () =>
    apiFetch<CategoriasResponse>(API_ENDPOINTS.categorias.adminList, {
      method: "GET",
      withAuth: true,
    }),

  getAllPublic: () =>
    apiFetch<CategoriasResponse>(API_ENDPOINTS.categorias.list, {
      method: "GET",
      withAuth: true,
    }),

  create: (payload: Partial<Categoria>) =>
    apiFetch<CategoriaResponse>(API_ENDPOINTS.categorias.list, {
      method: "POST",
      body: payload,
      withAuth: true,
    }),

  update: (id: string | number, payload: Partial<Categoria>) =>
    apiFetch<CategoriaResponse>(API_ENDPOINTS.categorias.byId(id), {
      method: "PATCH",
      body: payload,
      withAuth: true,
    }),

  changeStatus: (id: string | number, activo: boolean) =>
    apiFetch<CategoriaResponse>(API_ENDPOINTS.categorias.status(id), {
      method: "PATCH",
      body: { activo },
      withAuth: true,
    }),
};