import { apiFetch } from "./client";

const TIENDA_ENDPOINTS = {
  perfil: "/tienda/perfil",
  direcciones: "/tienda/direcciones",
  direccionById: (id: string | number) => `/tienda/direcciones/${id}`,
  direccionPrincipal: (id: string | number) =>
    `/tienda/direcciones/${id}/principal`,
  pedidos: "/tienda/pedidos",
  pedidoById: (id: string | number) => `/tienda/pedidos/${id}`,
  cancelarPedido: (id: string | number) => `/tienda/pedidos/${id}/cancelar`,
  credito: "/tienda/credito",
  movimientosCredito: "/tienda/credito/movimientos",
} as const;

export type ValidarCuponResponse = {
  ok: boolean;
  data: {
    codigo: string;
    subtotal: number;
    descuento: number;
    total: number;
    uso_maximo: number | null;
    uso_maximo_por_cliente: number | null;
    usos_globales_restantes: number | null;
    usos_cliente_restantes: number | null;
  };
};

export type TiendaPerfil = {
  id: string;
  usuario_id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  nombre_completo: string;
  telefono?: string | null;
  email: string;
  fecha_registro?: string;
};

export type TiendaDireccion = {
  id: string;
  cliente_id: string;
  calle: string;
  numero_exterior?: string | null;
  numero_interior?: string | null;
  colonia?: string | null;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string | null;
  es_principal: boolean;
};

export type TiendaDireccionPayload = Omit<
  TiendaDireccion,
  "id" | "cliente_id" | "es_principal"
> & {
  es_principal?: boolean;
};

export type TiendaPedidoResumen = {
  id: string;
  folio: number;
  estado: string;
  subtotal: string | number;
  descuento: string | number;
  costo_envio: string | number;
  total: string | number;
  fecha_creacion: string;
  fecha_cancelacion?: string | null;
  motivo_cancelacion?: string | null;
  tipo_entrega: "RECOGER" | "DOMICILIO";
  costo_envio_confirmado: boolean;
  metodo_pago_solicitado?: string | null;
  pago_estado?: string | null;
  items_count?: number | string;
};

export type TiendaPedidoDetalleItem = {
  id: string;
  variante_id: string;
  cantidad: number;
  precio_unitario: string | number;
  importe: string | number;
  producto_id: string;
  producto_nombre: string;
  talla_nombre?: string | null;
  color_nombre?: string | null;
  color_hex?: string | null;
  sku?: string | null;
  imagen_principal?: string | null;
};

export type TiendaPedidoPago = {
  id: string;
  monto: string | number;
  metodo: string;
  estado: string;
  referencia_externa?: string | null;
  fecha_pago: string;
};

export type TiendaPedidoDetalle = {
  pedido: TiendaPedidoResumen & {
    observaciones?: string | null;
    direccion?: TiendaDireccion | null;
  };
  detalles: TiendaPedidoDetalleItem[];
  pagos: TiendaPedidoPago[];
};


export type TiendaCreditoEstado =
  | "NO_HABILITADO"
  | "SIN_LIMITE"
  | "SIN_DEUDA"
  | "CON_SALDO"
  | "LIMITE_ALCANZADO"
  | "SOBREGIRADO";

export type TiendaCreditoResumen = {
  cliente_id: string;
  habilitado: boolean;
  limite_credito: number;
  saldo_deudor: number;
  credito_disponible: number;
  monto_excedido: number;
  porcentaje_utilizado: number;
  estado: TiendaCreditoEstado;
  fecha_activacion_credito?: string | null;
  fecha_actualizacion_credito?: string | null;
  total_movimientos: number;
  ultima_actividad?: string | null;
  calendario_configurado: false;
};

export type TiendaMovimientoCredito = {
  id: string;
  fecha: string;
  tipo: "COMPRA" | "ABONO" | "AJUSTE";
  descripcion: string;
  monto: number;
  saldo_anterior: number;
  saldo_resultante: number;
  metodo_pago?: string | null;
  referencia_externa?: string | null;
  observaciones?: string | null;
  pedido_id?: string | null;
  pedido_folio?: number | null;
};

export type TiendaMovimientosCredito = {
  items: TiendaMovimientoCredito[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

export type CrearPedidoTiendaPayload = {
  tipo_entrega: "RECOGER" | "DOMICILIO";
  direccion_id?: string | null;
  metodo_pago: string;
  referencia_externa?: string | null;
  observaciones?: string | null;
  items: Array<{
    variante_id: string;
    cantidad: number;
  }>;
};

type ApiResponse<T> = {
  ok: boolean;
  msg?: string;
  message?: string;
  data: T;
};

export const tiendaApi = {
  getPerfil: () =>
    apiFetch<ApiResponse<TiendaPerfil>>(TIENDA_ENDPOINTS.perfil, {
      method: "GET",
    }),

  updatePerfil: (payload: Partial<Pick<TiendaPerfil, "nombres" | "apellido_paterno" | "apellido_materno" | "telefono">>) =>
    apiFetch<ApiResponse<TiendaPerfil>>(TIENDA_ENDPOINTS.perfil, {
      method: "PATCH",
      body: payload,
    }),

  getDirecciones: () =>
    apiFetch<ApiResponse<TiendaDireccion[]>>(TIENDA_ENDPOINTS.direcciones, {
      method: "GET",
    }),

  createDireccion: (payload: TiendaDireccionPayload) =>
    apiFetch<ApiResponse<TiendaDireccion>>(TIENDA_ENDPOINTS.direcciones, {
      method: "POST",
      body: payload,
    }),

  setDireccionPrincipal: (id: string | number) =>
    apiFetch<ApiResponse<TiendaDireccion>>(
      TIENDA_ENDPOINTS.direccionPrincipal(id),
      { method: "PATCH" },
    ),

  deleteDireccion: (id: string | number) =>
    apiFetch<ApiResponse<{ id: string }>>(TIENDA_ENDPOINTS.direccionById(id), {
      method: "DELETE",
    }),

  getPedidos: () =>
    apiFetch<ApiResponse<TiendaPedidoResumen[]>>(TIENDA_ENDPOINTS.pedidos, {
      method: "GET",
    }),

  getPedidoById: (id: string | number) =>
    apiFetch<ApiResponse<TiendaPedidoDetalle>>(TIENDA_ENDPOINTS.pedidoById(id), {
      method: "GET",
    }),

  createPedido: (payload: CrearPedidoTiendaPayload) =>
    apiFetch<ApiResponse<TiendaPedidoDetalle>>(TIENDA_ENDPOINTS.pedidos, {
      method: "POST",
      body: payload,
    }),

  cancelarPedido: (id: string | number, motivo: string) =>
    apiFetch<ApiResponse<TiendaPedidoDetalle>>(
      TIENDA_ENDPOINTS.cancelarPedido(id),
      {
        method: "POST",
        body: { motivo },
      },
    ),

  getCredito: () =>
    apiFetch<ApiResponse<TiendaCreditoResumen>>(TIENDA_ENDPOINTS.credito, {
      method: "GET",
    }),

  getMovimientosCredito: (params?: { limit?: number; offset?: number }) =>
    apiFetch<ApiResponse<TiendaMovimientosCredito>>(
      TIENDA_ENDPOINTS.movimientosCredito,
      {
        method: "GET",
        query: params,
      },
    ),
};
