import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ExistenciaItem = {
  variante_id: string | number;
  producto_id: string | number;
  producto_nombre: string;
  categoria_id?: string | number | null;
  categoria_nombre?: string | null;
  talla_id?: string | number | null;
  talla_nombre?: string | null;
  talla_tipo?: string | null;
  color_id?: string | number | null;
  color_nombre?: string | null;
  color_hex?: string | null;
  sku?: string | null;
  codigo_barras?: string | null;
  precio_venta?: number | null;
  precio_costo?: number | null;
  stock_fisico?: number;
  stock_apartado?: number;
  stock_minimo?: number;
  stock_disponible?: number;
  bajo_stock?: boolean;
  activo?: boolean;
  updated_at?: string;
};
export type TipoMovimiento = "ENTRADA" | "SALIDA" | "AJUSTE" | "SET_STOCK";

export type MovimientoInventario = {
  id: string | number;
  fecha: string;
  tipo: TipoMovimiento;
  cantidad?: number;
  motivo?: string;
  usuario_id?: string | number | null;
  usuario_email?: string | null;
  variante_id?: string | number;
  producto_id?: string | number;
  producto_nombre?: string;
  sku?: string | null;
};

export type CrearMovimientoInventarioPayload = {
  accion: "ENTRADA" | "SALIDA" | "AJUSTE" | "SET_STOCK";
  variante_id: string | number;
  cantidad?: number;
  stock_fisico?: number;
  motivo: string;
};

type ExistenciasResponse = {
  ok: boolean;
  data: ExistenciaItem[];
};

type MovimientosResponse = {
  ok: boolean;
  data: MovimientoInventario[];
};

type CrearMovimientoResponse = {
  ok: boolean;
  data: {
    id: string | number;
    producto_id: string | number;
    stock_fisico: number;
    stock_apartado?: number;
    stock_minimo?: number;
    activo?: boolean;
    updated_at?: string;
  };
};


export const inventarioApi = {
  getExistencias: () =>
    apiFetch<ExistenciasResponse>(API_ENDPOINTS.inventario.existencias, {
      method: "GET",
    }),

  getVariantStock: (id: string | number) =>
    apiFetch<{ ok: boolean; data: ExistenciaItem }>(
      API_ENDPOINTS.inventario.variantStock(id),
      {
        method: "GET",
      }
    ),

  getVariantMovements: (id: string | number) =>
    apiFetch<MovimientosResponse>(API_ENDPOINTS.inventario.variantMovements(id), {
      method: "GET",
    }),

  getProductMovements: (id: string | number) =>
    apiFetch<MovimientosResponse>(API_ENDPOINTS.inventario.productMovements(id), {
      method: "GET",
    }),
  
  createMovement: (payload: CrearMovimientoInventarioPayload) =>
    apiFetch<CrearMovimientoResponse>(API_ENDPOINTS.inventario.movimientos, {
      method: "POST",
      body: payload,
    })
};