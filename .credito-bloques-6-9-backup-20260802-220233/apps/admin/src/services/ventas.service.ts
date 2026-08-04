import {
  ventasApi,
  type ListVentasHistorialParams,
  type VentaDetalleApi,
  type VentaHistorialApi,
  type VentaPagoApi,
  type TicketPdfModo,
} from "../../../../shared/api/ventas.api";

type CreateVentaPOS = Parameters<typeof ventasApi.crearVentaPOS>[0];
type CreateApartado = Parameters<typeof ventasApi.crearApartado>[0];
type CreateAbono = Parameters<typeof ventasApi.abonarApartado>[1];
type CreateLiquidar = Parameters<typeof ventasApi.liquidarApartado>[1];
type CreateCancelar = Parameters<typeof ventasApi.cancelarApartado>[1];
type CreateCerrarCorte = Parameters<typeof ventasApi.cerrarCorte>[1];
type CreateAbrirCorte = Parameters<typeof ventasApi.abrirCorte>[0];

export type VentaHistorial = {
  id: string;
  folio: string;
  folioLabel: string;
  estado: string;
  estadoLabel: string;
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
  totalPagado: number;
  totalProductos: number;
  metodosPago: string;
  fechaCreacion: string;
  fechaCancelacion: string | null;
  motivoCancelacion: string | null;
  observaciones: string | null;
  clienteId: string | null;
  clienteNombre: string;
  clienteTelefono?: string | null;
  clienteEmail?: string | null;
  vendedorId: string | null;
  vendedorNombre: string;
  vendedorEmail?: string | null;
};

export type VentaDetalle = {
  id: string;
  varianteId: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  sku: string | null;
  codigoBarras: string | null;
  productoId: string;
  productoNombre: string;
  tallaNombre: string | null;
  colorNombre: string | null;
  colorHex: string | null;
};

export type VentaPago = {
  id: string;
  monto: number;
  metodo: string;
  metodoLabel: string;
  referenciaExterna: string | null;
  fechaPago: string;
  concepto: string;
  conceptoLabel: string;
  estado: string;
  estadoLabel: string;
  usuarioNombre: string;
};

export type VentaHistorialDetalle = {
  venta: VentaHistorial;
  detalles: VentaDetalle[];
  pagos: VentaPago[];
};

export type ListVentasHistorialResult = {
  data: VentaHistorial[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  CANCELADO: "Cancelado",
  DEVUELTO: "Devuelto",
};

const METODO_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA_CREDITO: "Tarjeta de crédito",
  TARJETA_DEBITO: "Tarjeta de débito",
  TRANSFERENCIA: "Transferencia",
  PAYPAL: "PayPal",
  MERCADO_PAGO: "Mercado Pago",
  CREDITO_TIENDA: "Crédito de tienda",
};

const CONCEPTO_LABELS: Record<string, string> = {
  PAGO_TOTAL: "Pago total",
  ANTICIPO: "Anticipo",
  ABONO: "Abono",
  LIQUIDACION: "Liquidación",
  REEMBOLSO: "Reembolso",
};

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toText(value: unknown, fallback = "N/A") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function labelFromMap(map: Record<string, string>, value: unknown) {
  const key = String(value ?? "")
    .trim()
    .toUpperCase();
  return map[key] || key || "N/A";
}

function mapVenta(row: VentaHistorialApi): VentaHistorial {
  return {
    id: String(row.id),
    folio: String(row.folio ?? ""),
    folioLabel: `VTA-${row.folio ?? ""}`,
    estado: String(row.estado ?? ""),
    estadoLabel: labelFromMap(ESTADO_LABELS, row.estado),
    subtotal: toNumber(row.subtotal),
    descuento: toNumber(row.descuento),
    costoEnvio: toNumber(row.costo_envio),
    total: toNumber(row.total),
    totalPagado: toNumber(row.total_pagado),
    totalProductos: toNumber(row.total_productos),
    metodosPago: toText(row.metodos_pago),
    fechaCreacion: row.fecha_creacion,
    fechaCancelacion: row.fecha_cancelacion ?? null,
    motivoCancelacion: row.motivo_cancelacion ?? null,
    observaciones: row.observaciones ?? null,
    clienteId: row.cliente_id ? String(row.cliente_id) : null,
    clienteNombre: toText(row.cliente_nombre, "Público general"),
    clienteTelefono: row.cliente_telefono ?? null,
    clienteEmail: row.cliente_email ?? null,
    vendedorId: row.vendedor_id ? String(row.vendedor_id) : null,
    vendedorNombre: toText(row.vendedor_nombre),
    vendedorEmail: row.vendedor_email ?? null,
  };
}

function mapDetalle(row: VentaDetalleApi): VentaDetalle {
  return {
    id: String(row.id),
    varianteId: String(row.variante_id),
    cantidad: toNumber(row.cantidad),
    precioUnitario: toNumber(row.precio_unitario),
    importe: toNumber(row.importe),
    sku: row.sku ?? null,
    codigoBarras: row.codigo_barras ?? null,
    productoId: String(row.producto_id),
    productoNombre: toText(row.producto_nombre, "Producto"),
    tallaNombre: row.talla_nombre ?? null,
    colorNombre: row.color_nombre ?? null,
    colorHex: row.color_hex ?? null,
  };
}

function mapPago(row: VentaPagoApi): VentaPago {
  return {
    id: String(row.id),
    monto: toNumber(row.monto),
    metodo: String(row.metodo ?? ""),
    metodoLabel: labelFromMap(METODO_LABELS, row.metodo),
    referenciaExterna: row.referencia_externa ?? null,
    fechaPago: row.fecha_pago,
    concepto: String(row.concepto ?? ""),
    conceptoLabel: labelFromMap(CONCEPTO_LABELS, row.concepto),
    estado: String(row.estado ?? ""),
    estadoLabel: labelFromMap(ESTADO_LABELS, row.estado),
    usuarioNombre: toText(row.usuario_nombre),
  };
}

export const ventasService = {
  async crearVentaPOS(payload: CreateVentaPOS) {
    const response = await ventasApi.crearVentaPOS(payload);
    return response.data;
  },

  async crearApartado(payload: CreateApartado) {
    const response = await ventasApi.crearApartado(payload);
    return response.data;
  },

  async abonarApartado(id: string | number, payload: CreateAbono) {
    const response = await ventasApi.abonarApartado(id, payload);
    return response.data;
  },

  async liquidarApartado(id: string | number, payload: CreateLiquidar) {
    const response = await ventasApi.liquidarApartado(id, payload);
    return response.data;
  },

  async cancelarApartado(id: string | number, payload: CreateCancelar) {
    const response = await ventasApi.cancelarApartado(id, payload);
    return response.data;
  },

  async abrirCorte(payload: CreateAbrirCorte) {
    const response = await ventasApi.abrirCorte(payload);
    return response.data;
  },

  async getCorteActual() {
    const response = await ventasApi.getCorteActual();
    return response.data;
  },

  async cerrarCorte(id: string | number, payload: CreateCerrarCorte) {
    const response = await ventasApi.cerrarCorte(id, payload);
    return response.data;
  },

  async getHistorialCortes() {
    const response = await ventasApi.getHistorialCortes();
    return response.data;
  },

  async getCorteById(id: string | number) {
    const response = await ventasApi.getCorteById(id);
    return response.data;
  },

  async list(
    params?: ListVentasHistorialParams,
  ): Promise<ListVentasHistorialResult> {
    const response = await ventasApi.list(params);

    return {
      data: response.data.map(mapVenta),
      pagination: response.pagination,
    };
  },

  async getById(id: string | number): Promise<VentaHistorialDetalle> {
    const response = await ventasApi.getById(id);

    return {
      venta: mapVenta(response.data.venta),
      detalles: response.data.detalles.map(mapDetalle),
      pagos: response.data.pagos.map(mapPago),
    };
  },

  async abrirTicketPdf(
    id: string | number,
    modo: TicketPdfModo = "reimpresion",
  ) {
    const blob = await ventasApi.getTicketPdf(id, modo);
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
