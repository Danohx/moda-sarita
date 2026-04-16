import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Direccion = {
  id: string | number;
  cliente_id?: string | number;
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

export type MovimientoCredito = {
  id: string | number;
  fecha: string;
  tipo: "compra" | "abono" | "ajuste";
  descripcion: string;
  monto: number;
  saldoResultante: number;
  metodo_pago?: string | null;
};

export type Cliente = {
  id: string | number;
  usuario_id?: string | number | null;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  telefono?: string | null;
  email?: string | null;
  tiene_credito?: boolean;
  limite_credito?: number;
  saldo_deudor?: number;
  fecha_activacion_credito?: string | null;
  fecha_actualizacion_credito?: string | null;
  fecha_registro?: string;
  activo?: boolean;
  puede_apartar?: boolean;
  direcciones?: Direccion[];
  movimientos_credito?: MovimientoCredito[];
};

export type AbonoCreditoPayload = {
  monto: number;
  metodo_pago?: string;
  referencia_externa?: string | null;
};

export type ClienteCreatePayload = {
  usuario_id?: string | number | null;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo?: boolean;
  puede_apartar?: boolean;
};

export type ClienteUpdatePayload = Partial<ClienteCreatePayload>;

export type CreditoUpdatePayload = {
  tiene_credito: boolean;
  limite_credito: number;
};

export type DireccionCreatePayload = {
  calle: string;
  numero_exterior?: string | null;
  numero_interior?: string | null;
  colonia?: string | null;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string | null;
  es_principal?: boolean;
};

export type ClienteFilters = {
  q?: string;
  includeInactive?: boolean;
};

export type ClientesResponse = {
  ok: boolean;
  data: Cliente[];
};

export type ClienteDetailResponse = {
  ok: boolean;
  data: (Cliente & {
    direcciones: Direccion[];
  }) | null;
};

export type ClienteResponse = {
  ok: boolean;
  data: Cliente | null;
};

export type MovimientosCreditoResponse = {
  ok: boolean;
  data: MovimientoCredito[];
};

export const clientesApi = {
  getAll: (filters?: ClienteFilters) =>
    apiFetch<ClientesResponse>(API_ENDPOINTS.clientes.list, {
      method: "GET",
      query: filters,
    }),

  getById: (id: string | number) =>
    apiFetch<ClienteDetailResponse>(API_ENDPOINTS.clientes.byId(id), {
      method: "GET",
    }),

  create: (payload: ClienteCreatePayload) =>
    apiFetch<ClienteResponse>(API_ENDPOINTS.clientes.list, {
      method: "POST",
      body: payload,
    }),

  update: (id: string | number, payload: ClienteUpdatePayload) =>
    apiFetch<ClienteResponse>(API_ENDPOINTS.clientes.byId(id), {
      method: "PATCH",
      body: payload,
    }),

  updateCredito: (id: string | number, payload: CreditoUpdatePayload) =>
    apiFetch<ClienteResponse>(API_ENDPOINTS.clientes.credito(id), {
      method: "PATCH",
      body: payload,
    }),

  getMovimientosCredito: (id: string | number) =>
    apiFetch<MovimientosCreditoResponse>(
      API_ENDPOINTS.clientes.movimientosCredito(id),
      {
        method: "GET",
      },
    ),

  abonarCredito: (id: string | number, payload: AbonoCreditoPayload) =>
    apiFetch<ClienteResponse>(API_ENDPOINTS.clientes.abonoCredito(id), {
      method: "POST",
      body: payload,
    }),

  addDireccion: (id: string | number, payload: DireccionCreatePayload) =>
    apiFetch<ClienteResponse>(API_ENDPOINTS.clientes.direcciones(id), {
      method: "POST",
      body: payload,
    }),

  setDireccionPrincipal: (id: string | number, direccionId: string | number) =>
    apiFetch<ClienteResponse>(
      API_ENDPOINTS.clientes.direccionPrincipal(id, direccionId),
      {
        method: "PATCH",
      },
    ),

  deleteDireccion: (id: string | number, direccionId: string | number) =>
    apiFetch<ClienteResponse>(
      API_ENDPOINTS.clientes.direccionById(id, direccionId),
      {
        method: "DELETE",
      },
    ),
};