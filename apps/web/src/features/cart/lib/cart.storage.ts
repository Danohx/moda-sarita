import type { CartItem } from "@web/features/cart/types";

export const CART_STORAGE_KEY = "moda_sarita_cart";
export const CART_EVENT_NAME = "moda-sarita:cart-updated";

function toFiniteNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toOptionalString(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;
  const variantId = String(raw.variantId ?? raw.variante_id ?? raw.id ?? "").trim();
  const productId = String(raw.productId ?? raw.productoId ?? raw.producto_id ?? "").trim();
  const productName = String(raw.productName ?? raw.nombre ?? "Producto").trim();
  const quantity = Math.max(1, Math.floor(toFiniteNumber(raw.quantity ?? raw.cantidad, 1)));
  const stockAvailable = Math.max(
    0,
    Math.floor(toFiniteNumber(raw.stockAvailable ?? raw.stock ?? raw.stock_disponible, 0)),
  );
  const price = Math.max(0, toFiniteNumber(raw.price ?? raw.precio, 0));

  if (!variantId || !productId || !productName) return null;

  return {
    variantId,
    productId,
    productName,
    productSlug: toOptionalString(raw.productSlug ?? raw.slug),
    imageUrl: toOptionalString(raw.imageUrl ?? raw.imagen),
    price,
    quantity,
    stockAvailable,
    sku: toOptionalString(raw.sku),
    sizeId: toOptionalString(raw.sizeId ?? raw.talla_id),
    sizeName: toOptionalString(raw.sizeName ?? raw.talla_nombre),
    colorId: toOptionalString(raw.colorId ?? raw.color_id),
    colorName: toOptionalString(raw.colorName ?? raw.color_nombre),
    colorHex: toOptionalString(raw.colorHex ?? raw.color_hex),
  };
}

export function readStoredCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeCartItem)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function writeStoredCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // El carrito sigue funcionando durante la sesión aunque localStorage falle.
  }

  window.dispatchEvent(new CustomEvent(CART_EVENT_NAME));
}
