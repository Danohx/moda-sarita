import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { Variante } from "./variantes.api";

export type ProductoDetalleResponseData = {
  producto: {
    id: string | number;
    nombre: string;
    descripcion?: string | null;
    slug?: string | null;
    destacado?: boolean;
    activo?: boolean;
    maneja_variantes?: boolean;
    categoria_id?: string | number | null;
    categoria_nombre?: string | null;
    proveedor_id?: string | number | null;
    fecha_creacion?: string;
    precio_desde?: number | null;
    precio_hasta?: number | null;
    stock_fisico_total?: number;
    stock_apartado_total?: number;
    stock_disponible_total?: number;
    variantes_activas?: number;
  };
  imagenes: Array<{
    id: string | number;
    public_id?: string | null;
    url: string;
    orden?: number;
    es_principal?: boolean;
    created_at?: string;
  }>;
  imagen_principal?: {
    id: string | number;
    public_id?: string | null;
    url: string;
    orden?: number;
    es_principal?: boolean;
    created_at?: string;
  } | null;
  variantes: Variante[];
  options: {
    tallas: Array<{
      id: string | number;
      nombre: string;
      tipo?: string | null;
    }>;
    colores: Array<{
      id: string | number;
      nombre: string;
      hex?: string | null;
    }>;
  };
};

type ProductoDetalleResponse = {
  ok: boolean;
  data: ProductoDetalleResponseData;
};

export const productoDetalleApi = {
  getByProductoIdPublic: (productoId: string | number) =>
    apiFetch<ProductoDetalleResponse>(API_ENDPOINTS.productos.detalle(productoId), {
      method: "GET",
      withAuth: false,
    }),
  getByProductoIdAdmin: (productoId: string | number) =>
    apiFetch<ProductoDetalleResponse>(API_ENDPOINTS.productos.detalleAdmin(productoId), {
      method: "GET",
    })
};