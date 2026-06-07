import {
  pedidosApi,
  type PedidoDetalleAdmin,
  type PedidoResumen,
  type LiquidarApartadoPayload,
  type RegistrarAbonoPayload,
} from "../../../../shared/api/pedidos.api";

export type OrderStatus =
  | "PENDIENTE"
  | "PAGADO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO"
  | "DEVUELTO";

export type ApartadoEstado = "ACTIVO" | "LIQUIDADO" | "CANCELADO" | "VENCIDO";

export type WebEstadoFilter = "TODOS" | OrderStatus;

export type ApartadoEstadoFilter = "TODOS" | ApartadoEstado;

export type Order = {
  id: string;
  orderId: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
  time: string;
};

export type Apartado = {
  id: string;
  folio: number;
  customer: string;
  total: number;
  paid: number;
  remaining: number;
  deadline: string;
  progress: number;
  estado: ApartadoEstado;
};

export type OrdersData = {
  orders: Order[];
  apartados: Apartado[];
};

type GetOrdersDataParams = {
  q?: string;
  webEstado?: WebEstadoFilter;
  apartadoEstado?: ApartadoEstadoFilter;
};

function toNumber(value: string | number | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function formatFechaCorta(value?: string | null) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatFechaHora(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapPedidoWeb(pedido: PedidoResumen): Order {
  return {
    id: pedido.id,
    orderId: `#${pedido.folio}`,
    customer: pedido.cliente_nombre || "Cliente no asignado",
    items: toNumber(pedido.items_count),
    total: toNumber(pedido.total),
    status: pedido.estado as OrderStatus,
    time: formatFechaHora(pedido.fecha_creacion),
  };
}

function mapApartado(pedido: PedidoResumen): Apartado {
  const total = toNumber(pedido.total);
  const paid = toNumber(pedido.total_pagado);
  const remaining = toNumber(pedido.saldo_pendiente);

  const progress =
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return {
    id: pedido.id,
    folio: pedido.folio,
    customer: pedido.cliente_nombre || "Cliente no asignado",
    total,
    paid,
    remaining,
    deadline: formatFechaCorta(pedido.fecha_limite_apartado),
    progress,
    estado: pedido.estado as ApartadoEstado,
  };
}

export const pedidosService = {
  async getOrdersData(params: GetOrdersDataParams = {}): Promise<OrdersData> {
    const q = params.q?.trim() || undefined;

    const webEstado =
      params.webEstado && params.webEstado !== "TODOS"
        ? params.webEstado
        : undefined;

    const apartadoEstado =
      params.apartadoEstado && params.apartadoEstado !== "TODOS"
        ? params.apartadoEstado
        : undefined;

    const [webResponse, apartadosResponse] = await Promise.all([
      pedidosApi.getAll({
        tipo: "WEB",
        estado: webEstado,
        q,
        limit: 100,
        offset: 0,
      }),
      pedidosApi.getAll({
        tipo: "APARTADO",
        estado: apartadoEstado,
        q,
        limit: 100,
        offset: 0,
      }),
    ]);

    return {
      orders: (webResponse.data ?? []).map(mapPedidoWeb),
      apartados: (apartadosResponse.data ?? []).map(mapApartado),
    };
  },

  async getById(id: string | number): Promise<PedidoDetalleAdmin> {
    const response = await pedidosApi.getById(id);
    return response.data;
  },

  async registrarAbono(id: string | number, payload: RegistrarAbonoPayload) {
    return pedidosApi.registrarAbono(id, payload);
  },

  async liquidar(id: string | number, payload: LiquidarApartadoPayload) {
    return pedidosApi.liquidar(id, payload);
  },

  async cancelar(id: string | number, motivo_cancelacion: string) {
    const response = await pedidosApi.cancelar(id, { motivo_cancelacion });
    return response.data;
  },

  async abrirTicketPdf(id: string | number) {
    const blob = await pedidosApi.getTicketPdf(id);

    const url = URL.createObjectURL(blob);

    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60_000);
  },

  async abrirTicketPagoPdf(id: string | number, pagoId: string | number) {
    const blob = await pedidosApi.getPagoTicketPdf(id, pagoId);

    const url = URL.createObjectURL(blob);

    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60_000);
  },
};
