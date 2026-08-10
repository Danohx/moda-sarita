import { apiFetch } from "./client";
import type { ValidarCuponResponse } from "./tienda.api";

const CHECKOUT_ENDPOINTS = {
  pedidos: "/checkout/pedidos",
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
};

type CheckoutResponse = {
  ok: boolean;
  msg: string;
  data: CheckoutPedidoResult;
};

export const checkoutApi = {
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
