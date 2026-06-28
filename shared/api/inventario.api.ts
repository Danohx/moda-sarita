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

export type ExistenciasParams = {
  q?: string;
  limit?: number;
  offset?: number;
  categoriaId?: number;
  soloBajoStock?: boolean;
  varianteId?: string | number;
  productoId?: string | number;
};

// Agrega este tipo para la respuesta paginada
export type ExistenciasResponse = {
  ok: boolean;
  data: ExistenciaItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type InventarioAlertaBajoStock = {
  variante_id: string;
  producto_id: string;
  producto_nombre: string;
  categoria_nombre?: string | null;
  talla_nombre?: string | null;
  color_nombre?: string | null;
  sku?: string | null;
  codigo_barras?: string | null;
  stock_fisico: number;
  stock_apartado: number;
  stock_disponible: number;
  stock_minimo: number;
  updated_at?: string;
};

export type InventarioProductoSinImagen = {
  producto_id: string;
  nombre: string;
  categoria_id?: string | number | null;
  categoria_nombre?: string | null;
  activo: boolean;
  fecha_creacion?: string;
};

export type InventarioProductoSinCategoria = {
  producto_id: string;
  nombre: string;
  activo: boolean;
  fecha_creacion?: string;
};

export type InventarioAlertasResponseData = {
  bajo_stock: InventarioAlertaBajoStock[];
  productos_sin_imagen: InventarioProductoSinImagen[];
  productos_sin_categoria: InventarioProductoSinCategoria[];
  resumen: {
    bajo_stock: number;
    productos_sin_imagen: number;
    productos_sin_categoria: number;
    total: number;
  };
};

type InventarioAlertasResponse = {
  ok: boolean;
  data: InventarioAlertasResponseData;
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
  getExistencias: (params?: ExistenciasParams) =>
    apiFetch<ExistenciasResponse>(API_ENDPOINTS.inventario.existencias, {
      method: "GET",
      query: params,
    }),

  getAlertas: (limit = 20) =>
    apiFetch<InventarioAlertasResponse>(API_ENDPOINTS.inventario.alertas, {
      method: "GET",
      query: { limit },
    }),

  getVariantStock: (id: string | number) =>
    apiFetch<{ ok: boolean; data: ExistenciaItem }>(
      API_ENDPOINTS.inventario.variantStock(id),
      {
        method: "GET",
      },
    ),

  getVariantMovements: (id: string | number) =>
    apiFetch<MovimientosResponse>(
      API_ENDPOINTS.inventario.variantMovements(id),
      {
        method: "GET",
      },
    ),

  getProductMovements: (id: string | number) =>
    apiFetch<MovimientosResponse>(
      API_ENDPOINTS.inventario.productMovements(id),
      {
        method: "GET",
      },
    ),

  createMovement: (payload: CrearMovimientoInventarioPayload) =>
    apiFetch<CrearMovimientoResponse>(API_ENDPOINTS.inventario.movimientos, {
      method: "POST",
      body: payload,
    }),
};
