import {
  configuracionApi,
  type ConfigParametro,
  type MetodoPagoConfig,
  type PatchMetodoPagoPayload,
} from "@shared/api/configuracion.api";

export type TicketParametroClave =
  | "ticket.nombre_tienda"
  | "ticket.telefono"
  | "ticket.direccion"
  | "ticket.mensaje_final"
  | "ticket.politica_cambios"
  | "ticket.politica_apartado"
  | "ticket.ancho_mm"
  | "ticket.mostrar_logo"
  | "ticket.mostrar_vendedor"
  | "ticket.mostrar_cliente";

export type InventarioParametroClave =
  | "inventario.stock_minimo_general"
  | "inventario.mostrar_alertas_bajo_stock"
  | "inventario.alertar_productos_sin_imagen"
  | "inventario.alertar_productos_sin_categoria";

export type ConfigParametroClave =
  | TicketParametroClave
  | InventarioParametroClave;

const TICKET_KEYS: TicketParametroClave[] = [
  "ticket.nombre_tienda",
  "ticket.telefono",
  "ticket.direccion",
  "ticket.mensaje_final",
  "ticket.politica_cambios",
  "ticket.politica_apartado",
  "ticket.ancho_mm",
  "ticket.mostrar_logo",
  "ticket.mostrar_vendedor",
  "ticket.mostrar_cliente",
];

const INVENTARIO_KEYS: InventarioParametroClave[] = [
  "inventario.stock_minimo_general",
  "inventario.mostrar_alertas_bajo_stock",
  "inventario.alertar_productos_sin_imagen",
  "inventario.alertar_productos_sin_categoria",
];

export const configuracionService = {
  async getMetodosPago() {
    const response = await configuracionApi.getMetodosPagoAdmin();
    return response.data ?? [];
  },

  async updateMetodoPago(codigo: string, payload: PatchMetodoPagoPayload) {
    const response = await configuracionApi.updateMetodoPago(codigo, payload);
    return response.data;
  },

  async getTicketParams() {
    const response = await configuracionApi.getParametrosModuloAdmin("TICKET");
    return response.data ?? [];
  },

  async updateParametro(clave: string, valor: unknown) {
    const response = await configuracionApi.updateParametro(clave, { valor });
    return response.data;
  },

  async saveTicketParams(params: ConfigParametro[]) {
    const paramsMap = new Map(params.map((p) => [p.clave, p]));

    const updates = TICKET_KEYS.map((clave) => paramsMap.get(clave))
      .filter((param): param is ConfigParametro => !!param && param.editable)
      .map((param) => this.updateParametro(param.clave, param.valor));

    return Promise.all(updates);
  },

  async getSettingsBase() {
    const [metodosPago, ticketParams] = await Promise.all([
      this.getMetodosPago(),
      this.getTicketParams(),
    ]);

    return {
      metodosPago,
      ticketParams,
    };
  },

  buildTicketMap(params: ConfigParametro[]) {
    return new Map(params.map((p) => [p.clave, p]));
  },

  getParamText(
    params: ConfigParametro[],
    clave: ConfigParametroClave,
    fallback = "",
  ) {
    const value = params.find((p) => p.clave === clave)?.valor;

    if (value === null || value === undefined) return fallback;

    return String(value);
  },

  getParamBool(
    params: ConfigParametro[],
    clave: ConfigParametroClave,
    fallback = false,
  ) {
    const value = params.find((p) => p.clave === clave)?.valor;

    if (typeof value === "boolean") return value;

    return fallback;
  },

  getParamNumber(
    params: ConfigParametro[],
    clave: ConfigParametroClave,
    fallback = 0,
  ) {
    const value = params.find((p) => p.clave === clave)?.valor;
    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : fallback;
  },

  updateLocalParam(
    params: ConfigParametro[],
    clave: ConfigParametroClave,
    valor: unknown,
  ) {
    return params.map((param) =>
      param.clave === clave ? { ...param, valor } : param,
    );
  },

  async getInventoryParams() {
    const response =
      await configuracionApi.getParametrosModuloAdmin("INVENTARIO");
    return response.data ?? [];
  },

  async saveInventoryParams(params: ConfigParametro[]) {
    const paramsMap = new Map(params.map((p) => [p.clave, p]));

    const updates = INVENTARIO_KEYS.map((clave) => paramsMap.get(clave))
      .filter((param): param is ConfigParametro => !!param && param.editable)
      .map((param) => this.updateParametro(param.clave, param.valor));

    return Promise.all(updates);
  },

  async getMetodosPagoPOS() {
    const response = await configuracionApi.getMetodosPagoPOS();
    return response.data ?? [];
  },
};

export type { ConfigParametro, MetodoPagoConfig, PatchMetodoPagoPayload };
