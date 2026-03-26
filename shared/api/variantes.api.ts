import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Variante = {
  id: string | number;
  producto_id?: string | number;
  talla_id?: string | number | null;
  color_id?: string | number | null;
  sku?: string | null;
  codigo_barras?: string | null;
  precio_venta?: number | null;
  precio_costo?: number | null;
  stock_fisico?: number;
  stock_apartado?: number;
  stock_minimo?: number;
  activo?: boolean;
};

type VariantesResponse = {
  ok: boolean;
  data: Variante[];
};

type VarianteResponse = {
  ok: boolean;
  data: Variante;
};

export const variantesApi = {
  getById: (id: string | number) =>
    apiFetch<VarianteResponse>(API_ENDPOINTS.variantes.byId(id), {
      method: "GET",
    }),

  getByProductoId: (productoId: string | number) =>
    apiFetch<VariantesResponse>(API_ENDPOINTS.productos.variantes(productoId), {
      method: "GET",
      withAuth: false,
    }),
  getByProductoIdAdmin: (productoId: string | number) =>
    apiFetch<VariantesResponse>(API_ENDPOINTS.productos.variantesAdmin(productoId), {
      method: "GET",
    }),

  create: (
    productoId: string | number,
    payload:
      | {
          talla_id?: string | number | null;
          color_id?: string | number | null;
          sku: string;
          codigo_barras?: string | null;
          precio_venta: number;
          precio_costo?: number | null;
          stock_fisico?: number;
          stock_apartado?: number;
          stock_minimo?: number;
          activo?: boolean;
        }
      | Array<{
          talla_id?: string | number | null;
          color_id?: string | number | null;
          sku: string;
          codigo_barras?: string | null;
          precio_venta: number;
          precio_costo?: number | null;
          stock_fisico?: number;
          stock_apartado?: number;
          stock_minimo?: number;
          activo?: boolean;
        }>,
  ) =>
    apiFetch<VariantesResponse>(API_ENDPOINTS.productos.variantes(productoId), {
      method: "POST",
      body: payload,
    }),

  update: (
    id: string | number,
    payload: Partial<{
      talla_id: string | number | null;
      color_id: string | number | null;
      sku: string | null;
      codigo_barras: string | null;
      precio_venta: number | null;
      precio_costo: number | null;
      stock_minimo: number;
    }>,
  ) =>
    apiFetch<VarianteResponse>(API_ENDPOINTS.variantes.byId(id), {
      method: "PATCH",
      body: payload,
    }),

  changeStatus: (id: string | number, activo: boolean) =>
    apiFetch<VarianteResponse>(API_ENDPOINTS.variantes.status(id), {
      method: "PATCH",
      body: { activo },
    }),

  changeStock: (id: string | number, payload: { cantidad: number; motivo: string }) =>
    apiFetch<VarianteResponse>(API_ENDPOINTS.variantes.stock(id), {
      method: "PATCH",
      body: payload,
    }),
};