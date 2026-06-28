import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ConfigTipoParametro =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "JSON"
  | string;

export type ConfigParametro = {
  clave: string;
  modulo: string;
  nombre: string;
  valor: unknown;
  tipo: ConfigTipoParametro;
  descripcion?: string | null;
  editable: boolean;
  visible_admin: boolean;
  publico: boolean;
  sensible: boolean;
  validacion?: unknown;
  orden: number;
  actualizado_por?: string | null;
  creado_at?: string;
  actualizado_at?: string;
};

export type MetodoPagoConfig = {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  activo_pos: boolean;
  activo_web: boolean;
  activo_admin: boolean;
  requiere_referencia: boolean;
  permite_cambio: boolean;
  requiere_confirmacion_manual: boolean;
  es_credito: boolean;
  orden: number;
  instrucciones_pos?: string | null;
  instrucciones_web?: string | null;
  config_publica?: Record<string, unknown>;
  actualizado_por?: string | null;
  creado_at?: string;
  actualizado_at?: string;
};

export type PatchParametroPayload = {
  valor: unknown;
};

export type PatchMetodoPagoPayload = Partial<
  Pick<
    MetodoPagoConfig,
    | "nombre"
    | "descripcion"
    | "activo_pos"
    | "activo_web"
    | "activo_admin"
    | "requiere_referencia"
    | "permite_cambio"
    | "requiere_confirmacion_manual"
    | "es_credito"
    | "orden"
    | "instrucciones_pos"
    | "instrucciones_web"
    | "config_publica"
  >
>;

type ParametrosResponse = {
  ok: boolean;
  data: ConfigParametro[];
};

type ParametroResponse = {
  ok: boolean;
  msg?: string;
  message?: string;
  data: ConfigParametro;
};

type MetodosPagoResponse = {
  ok: boolean;
  data: MetodoPagoConfig[];
};

type MetodoPagoResponse = {
  ok: boolean;
  msg?: string;
  message?: string;
  data: MetodoPagoConfig;
};

export const configuracionApi = {
  getParametrosAdmin: () =>
    apiFetch<ParametrosResponse>(API_ENDPOINTS.configuracion.adminParametros, {
      method: "GET",
    }),

  getParametrosAgrupadosAdmin: () =>
    apiFetch(API_ENDPOINTS.configuracion.adminParametrosAgrupados, {
      method: "GET",
    }),

  getParametrosModuloAdmin: (modulo: string) =>
    apiFetch<ParametrosResponse>(
      API_ENDPOINTS.configuracion.adminParametrosModulo(modulo),
      {
        method: "GET",
      },
    ),

  updateParametro: (clave: string, payload: PatchParametroPayload) =>
    apiFetch<ParametroResponse>(
      API_ENDPOINTS.configuracion.adminParametroByClave(clave),
      {
        method: "PATCH",
        body: payload,
      },
    ),

  getMetodosPagoAdmin: () =>
    apiFetch<MetodosPagoResponse>(
      API_ENDPOINTS.configuracion.adminMetodosPago,
      {
        method: "GET",
      },
    ),

  updateMetodoPago: (codigo: string, payload: PatchMetodoPagoPayload) =>
    apiFetch<MetodoPagoResponse>(
      API_ENDPOINTS.configuracion.adminMetodoPagoByCodigo(codigo),
      {
        method: "PATCH",
        body: payload,
      },
    ),

  getMetodosPagoPOS: () =>
    apiFetch<MetodosPagoResponse>(API_ENDPOINTS.configuracion.posMetodosPago, {
      method: "GET",
    }),

  getParametrosTienda: () =>
    apiFetch<ParametrosResponse>(API_ENDPOINTS.configuracion.tiendaParametros, {
      method: "GET",
      withAuth: false,
    }),

  getMetodosPagoWeb: () =>
    apiFetch<MetodosPagoResponse>(
      API_ENDPOINTS.configuracion.tiendaMetodosPagoWeb,
      {
        method: "GET",
        withAuth: false,
      },
    ),
};