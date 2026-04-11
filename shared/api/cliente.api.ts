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
  fecha_registro?: string;
  activo?: boolean;
  direcciones?: Direccion[];
};

export type ClienteCreatePayload = {
  usuario_id?: string | number | null;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  telefono?: string | null;
  email?: string | null;
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

export type ClienteResponse = {
  ok: boolean;
  data: Cliente | null;
};

export const clientesApi = {
  getAll: (filters?: ClienteFilters) =>
    apiFetch<ClientesResponse>(API_ENDPOINTS.clientes.list, {
      method: "GET",
      query: filters,
    }),

  getById: (id: string | number) =>
    apiFetch<ClienteResponse>(API_ENDPOINTS.clientes.byId(id), {
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