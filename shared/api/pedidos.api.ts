import { apiFetch, apiFetchBlob } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type PedidoTipo = "WEB" | "PUNTO_VENTA" | "APARTADO";

export type PedidoEstado =
  | "PENDIENTE"
  | "PAGADO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO"
  | "DEVUELTO"
  | "ACTIVO"
  | "LIQUIDADO"
  | "VENCIDO";

export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA_CREDITO"
  | "TARJETA_DEBITO"
  | "TRANSFERENCIA"
  | "PAYPAL"
  | "MERCADO_PAGO"
  | "CREDITO_TIENDA";

export type RegistrarAbonoPayload = {
  monto: number;
  metodo: MetodoPago;
  referencia_externa?: string | null;
};

export type LiquidarApartadoPayload = {
  metodo: MetodoPago;
  referencia_externa?: string | null;
};

export type CancelarApartadoPayload = {
  motivo_cancelacion: string;
};

export type PagoGenerado = {
  id: string;
  pedido_id: string;
  monto: string | number;
  metodo: MetodoPago;
  concepto: string;
  estado: string;
  fecha_pago: string;
};

export type PedidoDetalleAdmin = {
  pedido: PedidoResumen;
  detalles: PedidoDetalleProducto[];
  pagos: PedidoPago[];
};

type PedidoActionResponse = {
  ok: boolean;
  message: string;
  data: PedidoDetalleAdmin;
  pago_generado?: PagoGenerado;
};

export type PedidoResumen = {
  id: string;
  folio: number;
  cliente_id: string | null;
  cliente_nombre: string | null;
  vendedor_id: string | null;
  vendedor_nombre?: string | null;
  tipo: PedidoTipo;
  estado: PedidoEstado;
  subtotal: string | number;
  descuento: string | number;
  costo_envio: string | number;
  total: string | number;
  fecha_limite_apartado: string | null;
  fecha_creacion: string;
  motivo_cancelacion: string | null;
  fecha_cancelacion: string | null;
  liquidado_at: string | null;
  observaciones: string | null;
  total_pagado: string | number;
  saldo_pendiente: string | number;
  items_count?: string | number;
};

export type PedidoDetalleProducto = {
  id: string;
  pedido_id: string;
  variante_id: string;
  cantidad: number;
  precio_unitario: string | number;
  importe: string | number;
  producto_id: string;
  talla_id: number | null;
  color_id: number | null;
  sku: string | null;
  codigo_barras: string | null;
  producto_nombre: string;
  producto_descripcion: string | null;
  talla_nombre: string | null;
  color_nombre: string | null;
  color_hex: string | null;
  imagen_principal: string | null;
};

export type PedidoPago = {
  id: string;
  pedido_id: string;
  monto: string | number;
  metodo: string;
  referencia_externa: string | null;
  fecha_pago: string;
  concepto: string;
  estado: string;
  usuario_id: string | null;
  usuario_email: string | null;
  usuario_nombre: string | null;
};

export type PedidosFilters = {
  tipo?: PedidoTipo;
  estado?: PedidoEstado;
  cliente_id?: string;
  q?: string;
  limit?: number;
  offset?: number;
};

type PedidosResponse = {
  ok: boolean;
  data: PedidoResumen[];
};

type PedidoDetalleResponse = {
  ok: boolean;
  data: PedidoDetalleAdmin;
};

export const pedidosApi = {
  getAll: (filters?: PedidosFilters) =>
    apiFetch<PedidosResponse>(API_ENDPOINTS.pedidos.list, {
      method: "GET",
      query: filters,
    }),

  getById: (id: string | number) =>
    apiFetch<PedidoDetalleResponse>(API_ENDPOINTS.pedidos.byId(id), {
      method: "GET",
    }),

  registrarAbono: (id: string | number, payload: RegistrarAbonoPayload) =>
    apiFetch<PedidoActionResponse>(API_ENDPOINTS.pedidos.abonos(id), {
      method: "POST",
      body: payload,
    }),

  liquidar: (id: string | number, payload: LiquidarApartadoPayload) =>
    apiFetch<PedidoActionResponse>(API_ENDPOINTS.pedidos.liquidar(id), {
      method: "POST",
      body: payload,
    }),

  cancelar: (id: string | number, payload: CancelarApartadoPayload) =>
    apiFetch<PedidoActionResponse>(API_ENDPOINTS.pedidos.cancelar(id), {
      method: "POST",
      body: payload,
    }),

  getTicketPdf: (id: string | number) =>
    apiFetchBlob(API_ENDPOINTS.pedidos.ticketPdf(id), {
      method: "GET",
    }),

  getPagoTicketPdf: (id: string | number, pagoId: string | number) =>
    apiFetchBlob(API_ENDPOINTS.pedidos.pagoTicketPdf(id, pagoId), {
      method: "GET",
    }),
};
