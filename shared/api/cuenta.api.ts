import { apiFetch } from "./client";

const CUENTA_ENDPOINTS = {
  resumen: "/cuenta/resumen",
  credito: "/cuenta/credito",
  movimientosCredito: "/cuenta/credito/movimientos",
  creditos: "/cuenta/credito/creditos",
  creditoById: (id: string | number) => `/cuenta/credito/creditos/${id}`,
  creditoCuotas: (id: string | number) => `/cuenta/credito/creditos/${id}/cuotas`,
  creditoPagos: (id: string | number) => `/cuenta/credito/creditos/${id}/pagos`,
  creditoMovimientos: (id: string | number) => `/cuenta/credito/creditos/${id}/movimientos`,
  pedidos: "/cuenta/pedidos",
  apartados: "/cuenta/apartados",
  pedidoById: (id: string | number) => `/cuenta/pedidos/${id}`,
  pedidoPagos: (id: string | number) => `/cuenta/pedidos/${id}/pagos`,
} as const;

type ApiResponse<T> = {
  ok: boolean;
  msg?: string;
  data: T;
};

type PaginatedArrayResponse<T> = ApiResponse<T[]> & {
  pagination?: PaginationMeta & { items?: T[] };
};

export type CuentaPortalResumen = {
  pedidos_total: number;
  pedidos_en_proceso: number;
  apartados_total: number;
  apartados_activos: number;
  direcciones_total: number;
  creditos_total: number;
  creditos_activos: number;
  credito_habilitado: boolean;
  credito_disponible: number;
  pedidos_recientes: CuentaPedidoResumen[];
};

export type CuentaCreditoEstado =
  | "SIN_CREDITO"
  | "SIN_ADEUDO"
  | "AL_CORRIENTE"
  | "EN_MORA"
  | "INCUMPLIDO"
  | "AL_LIMITE";

export type CuentaCreditoResumenGlobal = {
  cliente_id: string;
  cliente_nombre: string;
  habilitado: boolean;
  limite: number;
  limite_credito: number;
  saldo_deudor: number;
  credito_disponible: number;
  porcentaje_utilizado: number;
  estado: CuentaCreditoEstado | string;
  puede_comprar: boolean;
  puede_apartar: boolean;
  fecha_activacion?: string | null;
  ultima_actualizacion?: string | null;
  proxima_fecha_pago?: string | null;
  monto_proximo_pago?: number | null;
  pagos_vencidos: number;
  cuotas_vencidas: number;
  total_vencido: number;
  dias_maximos_atraso: number;
  creditos_activos: number;
  creditos_en_mora: number;
  creditos_incumplidos: number;
  ultimo_movimiento?: CuentaMovimientoCredito | null;
};

export type CuentaMovimientoCredito = {
  id: string;
  credito_id?: string | null;
  cuota_id?: string | null;
  pedido_id?: string | null;
  pedido_folio?: number | string | null;
  pago_id?: string | null;
  fecha: string;
  tipo: "compra" | "abono" | "ajuste" | "COMPRA" | "ABONO" | "AJUSTE" | string;
  descripcion: string;
  monto: string | number;
  saldo_anterior?: string | number;
  saldo_resultante?: string | number;
  saldoResultante?: string | number;
  metodo_pago?: string | null;
  referencia_externa?: string | null;
  observaciones?: string | null;
};

export type CuentaCredito = {
  credito_id: string;
  cliente_id: string;
  pedido_id?: string | null;
  pedido_folio?: number | string | null;
  monto_compra?: string | number;
  enganche?: string | number;
  monto_financiado: string | number;
  saldo_pendiente: string | number;
  plazo_meses?: number | string | null;
  frecuencia_pago?: string | null;
  numero_cuotas?: number | string | null;
  fecha_otorgamiento?: string | null;
  fecha_primer_vencimiento?: string | null;
  fecha_vencimiento_final?: string | null;
  fecha_liquidacion?: string | null;
  estado: string;
  dias_gracia?: number | string | null;
  origen?: string | null;
  datos_calendario_completos?: boolean;
  proximo_vencimiento?: string | null;
  proxima_fecha_pago?: string | null;
  monto_proximo_pago?: string | number | null;
  cuotas_vencidas?: number | string;
  total_vencido?: string | number;
  dias_maximos_atraso?: number | string;
};

export type CuentaCreditoCuota = {
  id: string;
  credito_id: string;
  numero_cuota: number | string;
  fecha_vencimiento: string;
  monto_programado: string | number;
  monto_pagado: string | number;
  monto_condonado?: string | number;
  saldo_pendiente: string | number;
  fecha_pago_completo?: string | null;
  estado: string;
};

export type CuentaCreditoAplicacion = {
  aplicacion_id?: string;
  cuota_id: string;
  monto_aplicado: string | number;
  fecha_aplicacion?: string;
  numero_cuota?: number | string;
  fecha_vencimiento?: string | null;
};

export type CuentaCreditoPago = {
  id: string;
  pedido_id?: string | null;
  credito_id: string;
  monto: string | number;
  metodo: string;
  referencia_externa?: string | null;
  fecha_pago: string;
  concepto: string;
  estado: string;
  usuario_id?: string | null;
  aplicaciones?: CuentaCreditoAplicacion[];
};

export type CuentaPedidoResumen = {
  id: string;
  folio: number | string;
  cliente_id?: string;
  tipo: "WEB" | "PUNTO_VENTA" | "APARTADO" | string;
  estado: string;
  subtotal: string | number;
  descuento: string | number;
  costo_envio: string | number;
  total: string | number;
  total_pagado?: string | number;
  saldo_pendiente?: string | number;
  fecha_limite_apartado?: string | null;
  fecha_creacion: string;
  fecha_cancelacion?: string | null;
  motivo_cancelacion?: string | null;
  tipo_entrega?: "RECOGER" | "DOMICILIO" | string | null;
  costo_envio_confirmado?: boolean;
  metodo_pago_solicitado?: string | null;
  pago_estado?: string | null;
  items_count?: number | string;
  observaciones?: string | null;
  direccion?: CuentaDireccion | null;
};

export type CuentaDireccion = {
  id?: string;
  calle: string;
  numero_exterior?: string | null;
  numero_interior?: string | null;
  colonia?: string | null;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string | null;
};

export type CuentaPedidoDetalleItem = {
  id: string;
  variante_id: string;
  cantidad: number | string;
  precio_unitario: string | number;
  importe: string | number;
  producto_id: string;
  producto_nombre: string;
  producto_descripcion?: string | null;
  talla_nombre?: string | null;
  color_nombre?: string | null;
  color_hex?: string | null;
  sku?: string | null;
  codigo_barras?: string | null;
  imagen_principal?: string | null;
};

export type CuentaPedidoPago = {
  id: string;
  pedido_id: string;
  monto: string | number;
  metodo: string;
  referencia_externa?: string | null;
  fecha_pago: string;
  concepto?: string | null;
  estado: string;
};

export type CuentaPedidoDetalle = {
  pedido: CuentaPedidoResumen;
  detalles: CuentaPedidoDetalleItem[];
  pagos: CuentaPedidoPago[];
  pagos_pagination?: PaginationMeta;
  credito?: {
    credito_id: string;
    credito_estado: string;
    monto_financiado: string | number;
    saldo_pendiente: string | number;
  } | null;
};

export type CuentaCreditoDetalle = {
  credito: CuentaCredito;
  pedido?: { pedido: CuentaPedidoResumen } | null;
};

export type PaginationMeta = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type Paginated<T> = PaginationMeta & { items: T[] };

export const cuentaApi = {
  getResumen: () =>
    apiFetch<ApiResponse<CuentaPortalResumen>>(CUENTA_ENDPOINTS.resumen),

  getCredito: () =>
    apiFetch<ApiResponse<CuentaCreditoResumenGlobal>>(CUENTA_ENDPOINTS.credito),

  getMovimientosCredito: (params?: { limit?: number; offset?: number }) =>
    apiFetch<ApiResponse<CuentaMovimientoCredito[]> & { pagination?: PaginationMeta }>(
      CUENTA_ENDPOINTS.movimientosCredito,
      { method: "GET", query: params },
    ),

  getCreditos: (params?: { estado?: string; limit?: number; offset?: number }) =>
    apiFetch<ApiResponse<Paginated<CuentaCredito>>>(CUENTA_ENDPOINTS.creditos, {
      method: "GET",
      query: params,
    }),

  getCreditoById: (id: string | number) =>
    apiFetch<ApiResponse<CuentaCreditoDetalle>>(CUENTA_ENDPOINTS.creditoById(id)),

  getCreditoCuotas: (id: string | number, params?: { limit?: number; offset?: number }) =>
    apiFetch<ApiResponse<CuentaCreditoCuota[]> & { pagination?: PaginationMeta }>(CUENTA_ENDPOINTS.creditoCuotas(id), { method: "GET", query: params }),

  getCreditoPagos: (id: string | number, params?: { limit?: number; offset?: number }) =>
    apiFetch<ApiResponse<CuentaCreditoPago[]> & { pagination?: PaginationMeta }>(CUENTA_ENDPOINTS.creditoPagos(id), { method: "GET", query: params }),

  getCreditoMovimientos: (id: string | number, params?: { limit?: number; offset?: number }) =>
    apiFetch<ApiResponse<CuentaMovimientoCredito[]> & { pagination?: PaginationMeta }>(CUENTA_ENDPOINTS.creditoMovimientos(id), { method: "GET", query: params }),

  getPedidos: (params?: { estado?: string; limit?: number; offset?: number }) =>
    apiFetch<PaginatedArrayResponse<CuentaPedidoResumen>>(CUENTA_ENDPOINTS.pedidos, {
      method: "GET",
      query: params,
    }),

  getApartados: (params?: { estado?: string; limit?: number; offset?: number }) =>
    apiFetch<PaginatedArrayResponse<CuentaPedidoResumen>>(CUENTA_ENDPOINTS.apartados, {
      method: "GET",
      query: params,
    }),

  getPedidoById: (id: string | number) =>
    apiFetch<ApiResponse<CuentaPedidoDetalle>>(CUENTA_ENDPOINTS.pedidoById(id)),

  getPedidoPagos: (id: string | number, params?: { limit?: number; offset?: number }) =>
    apiFetch<ApiResponse<CuentaPedidoPago[]> & { pagination?: PaginationMeta }>(CUENTA_ENDPOINTS.pedidoPagos(id), { method: "GET", query: params }),
};
