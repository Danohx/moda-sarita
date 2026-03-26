import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type VarianteBasePayload = {
  sku: string;
  codigo_barras?: string | null;
  precio_costo?: number | null;
  precio_venta: number;
  stock_fisico: number;
  stock_apartado: number;
  stock_minimo: number;
  talla_id?: string | number | null;
  color_id?: string | number | null;
  activo?: boolean;
};

export type Producto = {
  id: string | number;
  nombre: string;
  descripcion?: string | null;
  categoria_id?: string | number | null;
  categoria_nombre?: string | null;
  proveedor_id?: string | number | null;
  destacado?: boolean;
  slug?: string | null;
  maneja_variantes?: boolean;
  activo?: boolean;
  sku?: string | null;
  precio_venta?: number | null;
  stock_total?: number | null;
  variantes_count?: number;
  stock_fisico_total?: number;
  stock_apartado_total?: number;
  stock_disponible_total?: number;
  precio_desde?: number | null;
  precio_hasta?: number | null;
  imagen_principal?: string | null;
};

export type ProductoCreatePayload = {
  nombre: string;
  descripcion?: string | null;
  categoria_id?: string | number | null;
  proveedor_id?: string | number | null;
  destacado?: boolean;
  slug?: string | null;
  maneja_variantes?: boolean;
  variante_base: VarianteBasePayload;
};

export type ProductoUpdatePayload = Partial<{
  nombre: string;
  descripcion: string | null;
  categoria_id: string | number | null;
  proveedor_id: string | number | null;
  slug: string | null;
  maneja_variantes: boolean;
  activo: boolean;
}>;

type ProductosResponse = {
  ok: boolean;
  data: Producto[];
};

type ProductoResponse = {
  ok: boolean;
  data: Producto | null;
};

type ProductoFilters = {
  q?: string;
  categoriaId?: string | number;
  destacado?: boolean;
  activo?: boolean;
};

export const productosApi = {
  getAll: (filters?: ProductoFilters) =>
    apiFetch<ProductosResponse>(API_ENDPOINTS.productos.adminList, {
      method: "GET",
      query: filters,
    }),

  getAllPublic: (filters?: Omit<ProductoFilters, "activo">) =>
    apiFetch<ProductosResponse>(API_ENDPOINTS.productos.list, {
      method: "GET",
      withAuth: false,
      query: filters,
    }),

  getById: (id: string | number) =>
    apiFetch<ProductoResponse>(API_ENDPOINTS.productos.byId(id), {
      method: "GET",
    }),

  create: (payload: ProductoCreatePayload) =>
    apiFetch<ProductoResponse>(API_ENDPOINTS.productos.list, {
      method: "POST",
      body: payload,
    }),

  update: (id: string | number, payload: ProductoUpdatePayload) =>
    apiFetch<ProductoResponse>(API_ENDPOINTS.productos.byId(id), {
      method: "PATCH",
      body: payload,
    }),

  changeStatus: (id: string | number, activo: boolean) =>
    apiFetch<ProductoResponse>(API_ENDPOINTS.productos.status(id), {
      method: "PATCH",
      body: { activo },
    }),

  changeFeatured: (id: string | number, destacado: boolean) =>
    apiFetch<ProductoResponse>(API_ENDPOINTS.productos.destacado(id), {
      method: "PATCH",
      body: { destacado },
    }),
};