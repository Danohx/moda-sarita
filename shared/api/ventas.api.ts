import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type VentaItem = {
  variante_id: string | number;
  cantidad: number;
  precio_unitario?: number | null; 
};

export type VentaPOSPayload = {
  cliente_id?: string | number | null;
  vendedor_id: string | number;
  items: VentaItem[];
  descuento?: number;
  costo_envio?: number;
  cupon_id?: string | number | null;
  metodo_pago: string;
  referencia_externa?: string | null;
  tipo?: string; 
};

export type ApartadoPayload = {
  cliente_id?: string | number | null;
  vendedor_id: string | number;
  items: VentaItem[];
  fecha_limite_apartado?: string | null;
  anticipo: number;
  metodo_pago: string;
  tipo?: string;
};

export type AbonoPayload = {
  monto: number;
  metodo_pago: string;
  referencia_externa?: string | null;
};

export type LiquidarPayload = {
  vendedor_id: string | number;
  metodo_pago: string;
  referencia_externa?: string | null;
};

export type CancelarPayload = {
  vendedor_id: string | number;
  motivo?: string;
};

export type CerrarCortePayload = {
  usuario_id: string | number;
  total_real: number;
  observaciones?: string | null;
};

export type Pedido = {
  id: string | number;
  cliente_id?: string | number | null;
  vendedor_id: string | number;
  tipo: "VENTA_POS" | "APARTADO" | string;
  estado: "PENDIENTE" | "PAGADO" | "CANCELADO" | string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  cupon_id?: string | number | null;
  fecha_limite_apartado?: string | null;
  fecha_creacion?: string; 
  folio?: string;
};

export type AbonoResult = {
  pedido_id: string | number;
  pagado: number;
  total: number;
  saldo: number;
};

export type CorteCaja = {
  id: string | number;
  usuario_id: string | number;
  usuario_nombre?: string;
  inicio_turno: string;
  fin_turno?: string | null;
  total_sistema: number;
  total_real: number;
  observaciones?: string | null;
};

export type AbrirCortePayload = {
  fondo_inicial: number;
}

export type PedidoResponse = {
  ok: boolean;
  data: Pedido | null; 
};

export type AbonoResponse = {
  ok: boolean;
  data: AbonoResult;
};

export type CorteCajaResponse = {
  ok: boolean;
  data: CorteCaja | null;
};

export type HistorialCortesResponse = {
  ok: boolean;
  data: CorteCaja[];
};

export const ventasApi = {
  crearVentaPOS: (payload: VentaPOSPayload) =>
    apiFetch<PedidoResponse>(API_ENDPOINTS.ventas.pos, {
      method: "POST",
      body: payload,
    }),

  crearApartado: (payload: ApartadoPayload) =>
    apiFetch<PedidoResponse>(API_ENDPOINTS.ventas.apartados, {
      method: "POST",
      body: payload,
    }),

  abonarApartado: (id: string | number, payload: AbonoPayload) =>
    apiFetch<AbonoResponse>(API_ENDPOINTS.ventas.abonos(id), {
      method: "POST",
      body: payload,
    }),

  liquidarApartado: (id: string | number, payload: LiquidarPayload) =>
    apiFetch<PedidoResponse>(API_ENDPOINTS.ventas.liquidar(id), {
      method: "POST",
      body: payload,
    }),

  cancelarApartado: (id: string | number, payload: CancelarPayload) =>
    apiFetch<PedidoResponse>(API_ENDPOINTS.ventas.cancelar(id), {
      method: "POST",
      body: payload,
    }),

  abrirCorte: (payload: AbrirCortePayload) =>
    apiFetch<CorteCajaResponse>(API_ENDPOINTS.ventas.abrirCorte, {
      method: "POST",
      body: payload,
    }),

  getCorteActual: () =>
    apiFetch<CorteCajaResponse>(API_ENDPOINTS.ventas.corteActual, {
      method: "GET",
    }),

  cerrarCorte: (id: string | number, payload: CerrarCortePayload) =>
    apiFetch<CorteCajaResponse>(API_ENDPOINTS.ventas.cerrarCorte(id), {
      method: "POST",
      body: payload,
    }),
  
  getHistorialCortes: () =>
    apiFetch<HistorialCortesResponse>(API_ENDPOINTS.ventas.historialCortes, {
      method: "GET",
    }),

  getCorteById: (id: string | number) =>
    apiFetch<CorteCajaResponse>(API_ENDPOINTS.ventas.corteById(id), {
      method: "GET",
    }),
};