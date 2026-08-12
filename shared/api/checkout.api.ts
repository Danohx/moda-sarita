import { apiFetch } from "./client";
import type { ValidarCuponResponse } from "./tienda.api";

const CHECKOUT_ENDPOINTS = {
  pedidos: "/checkout/pedidos",
  creditoOpciones: "/checkout/credito/opciones",
} as const;

export type CheckoutItemPayload = {
  variante_id: string;
  cantidad: number;
};

export type CrearPedidoCheckoutPayload = {
  tipo_entrega: "RECOGER" | "DOMICILIO";
  direccion_id?: string | null;
  metodo_pago: string;
  referencia_externa?: string | null;
  cupon_codigo?: string | null;
  observaciones?: string | null;
  credito?: {
    plazo_meses: number;
    frecuencia_pago: "SEMANAL" | "QUINCENAL" | "MENSUAL";
  } | null;
  items: CheckoutItemPayload[];
};

export type CheckoutPedidoItem = {
  variante_id: string;
  cantidad: number;
  precio_unitario: number;
  producto_nombre: string;
};

export type CheckoutPedidoResult = {
  pedido_id: string;
  folio: number | string;
  estado: string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  metodo_pago: string;
  pago_estado: string;
  items: CheckoutPedidoItem[];
  replayed?: boolean;
  credito_id?: string | null;
};

type CheckoutResponse = {
  ok: boolean;
  msg: string;
  data: CheckoutPedidoResult;
};

export type CheckoutCreditoOpciones = {
  mostrar: boolean;
  elegible: boolean;
  motivo?: string | null;
  mensaje?: string | null;
  limite_credito?: number;
  saldo_deudor?: number;
  credito_disponible?: number;
  plazos?: number[];
  frecuencias?: Array<"SEMANAL" | "QUINCENAL" | "MENSUAL">;
  validaciones_incumplidas?: string[];
};

export const checkoutApi = {
  getCreditoOpciones: (total: number, signal?: AbortSignal) =>
    apiFetch<{ ok: boolean; data: CheckoutCreditoOpciones }>(CHECKOUT_ENDPOINTS.creditoOpciones, {
      method: "GET",
      query: { total },
      signal,
    }),

  createPedido: (payload: CrearPedidoCheckoutPayload, idempotencyKey: string) =>
    apiFetch<CheckoutResponse>(CHECKOUT_ENDPOINTS.pedidos, {
      method: "POST",
      body: payload,
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }),
  validarCupon: (payload: {
    codigo: string;
    items: {
      variante_id: string;
      cantidad: number;
    }[];
  }) =>
    apiFetch<ValidarCuponResponse>("/checkout/cupon/validar", {
      method: "POST",
      body: payload,
    }),
};
