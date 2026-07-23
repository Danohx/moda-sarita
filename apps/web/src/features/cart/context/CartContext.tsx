import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { productoDetalleApi } from "@shared/api/productoDetalle.api";
import type { ProductoDetalleResponseData } from "@shared/api/productoDetalle.api";
import {
  CART_EVENT_NAME,
  CART_STORAGE_KEY,
  readStoredCart,
  writeStoredCart,
} from "@web/features/cart/lib/cart.storage";
import type {
  AddCartItemInput,
  CartItem,
  CartMutationResult,
  CartValidationIssue,
} from "@web/features/cart/types";

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isValidating: boolean;
  hasStockIssues: boolean;
  addItem: (input: AddCartItemInput) => CartMutationResult;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  validateCart: () => Promise<CartValidationIssue[]>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function sameId(left: unknown, right: unknown) {
  return String(left ?? "") === String(right ?? "");
}

function getVariantStock(variant: ProductoDetalleResponseData["variantes"][number]) {
  const physical = Number(variant.stock_fisico ?? 0);
  const reserved = Number(variant.stock_apartado ?? 0);
  return Math.max(physical - reserved, 0);
}

function getPrimaryImage(detail: ProductoDetalleResponseData) {
  return (
    detail.imagen_principal?.url ||
    detail.imagenes.find((image) => image.es_principal)?.url ||
    detail.imagenes[0]?.url ||
    null
  );
}

type CartProviderProps = {
  children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());
  const [isValidating, setIsValidating] = useState(false);
  const itemsRef = useRef(items);

  const commitItems = useCallback((nextItems: CartItem[]) => {
    itemsRef.current = nextItems;
    setItems(nextItems);
    writeStoredCart(nextItems);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const nextItems = readStoredCart();
      itemsRef.current = nextItems;
      setItems(nextItems);
    };

    function handleStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) syncFromStorage();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CART_EVENT_NAME, syncFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CART_EVENT_NAME, syncFromStorage);
    };
  }, []);

  const addItem = useCallback(
    (input: AddCartItemInput): CartMutationResult => {
      const stock = Math.max(0, Math.floor(Number(input.stockAvailable ?? 0)));
      const requested = Math.max(1, Math.floor(Number(input.quantity ?? 1)));

      if (stock <= 0) {
        return {
          ok: false,
          quantityAdded: 0,
          message: "Esta variante no tiene existencias disponibles.",
        };
      }

      const currentItems = itemsRef.current;
      const existing = currentItems.find(
        (item) => item.variantId === String(input.variantId),
      );
      const currentQuantity = existing?.quantity ?? 0;
      const nextQuantity = Math.min(currentQuantity + requested, stock);
      const quantityAdded = Math.max(nextQuantity - currentQuantity, 0);

      if (quantityAdded <= 0) {
        return {
          ok: false,
          quantityAdded: 0,
          message: "Ya tienes la cantidad máxima disponible en el carrito.",
        };
      }

      const normalizedItem: CartItem = {
        ...input,
        variantId: String(input.variantId),
        productId: String(input.productId),
        price: Math.max(0, Number(input.price ?? 0)),
        stockAvailable: stock,
        quantity: nextQuantity,
      };

      const nextItems = existing
        ? currentItems.map((item) =>
            item.variantId === normalizedItem.variantId
              ? { ...normalizedItem, quantity: nextQuantity }
              : item,
          )
        : [...currentItems, normalizedItem];

      commitItems(nextItems);

      return {
        ok: true,
        quantityAdded,
        message:
          quantityAdded < requested
            ? "Se agregó únicamente la cantidad disponible."
            : "Producto agregado al carrito.",
      };
    },
    [commitItems],
  );

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      const currentItems = itemsRef.current;
      const nextItems = currentItems.map((item) => {
        if (item.variantId !== variantId) return item;

        const maximum = Math.max(item.stockAvailable, 1);
        const normalizedQuantity = Math.min(
          Math.max(1, Math.floor(Number(quantity) || 1)),
          maximum,
        );

        return { ...item, quantity: normalizedQuantity };
      });

      commitItems(nextItems);
    },
    [commitItems],
  );

  const removeItem = useCallback(
    (variantId: string) => {
      commitItems(itemsRef.current.filter((item) => item.variantId !== variantId));
    },
    [commitItems],
  );

  const clearCart = useCallback(() => {
    commitItems([]);
  }, [commitItems]);

  const validateCart = useCallback(async () => {
    const currentItems = itemsRef.current;
    if (currentItems.length === 0) return [];

    setIsValidating(true);

    try {
      const productIds = [...new Set(currentItems.map((item) => item.productId))];
      const responses = await Promise.allSettled(
        productIds.map(async (productId) => {
          const response = await productoDetalleApi.getByProductoIdPublic(productId);
          return [productId, response.data] as const;
        }),
      );

      const details = new Map<string, ProductoDetalleResponseData>();

      responses.forEach((response) => {
        if (response.status === "fulfilled") {
          details.set(response.value[0], response.value[1]);
        }
      });

      const issues: CartValidationIssue[] = [];
      const nextItems = currentItems.map((item) => {
        const detail = details.get(item.productId);

        if (!detail) {
          issues.push({
            variantId: item.variantId,
            productName: item.productName,
            type: "UNAVAILABLE",
            message: `No se pudo validar ${item.productName}. Intenta actualizar nuevamente.`,
          });
          return item;
        }

        const variant = detail.variantes.find(
          (candidate) => sameId(candidate.id, item.variantId),
        );

        if (!variant || variant.activo === false || detail.producto.activo === false) {
          issues.push({
            variantId: item.variantId,
            productName: item.productName,
            type: "UNAVAILABLE",
            message: `${item.productName} ya no está disponible.`,
          });
          return { ...item, stockAvailable: 0 };
        }

        const stockAvailable = getVariantStock(variant);
        const currentPrice = Math.max(0, Number(variant.precio_venta ?? item.price));
        const nextQuantity =
          stockAvailable > 0 ? Math.min(item.quantity, stockAvailable) : item.quantity;

        if (stockAvailable <= 0) {
          issues.push({
            variantId: item.variantId,
            productName: item.productName,
            type: "OUT_OF_STOCK",
            message: `${item.productName} se quedó sin existencias.`,
          });
        } else if (item.quantity > stockAvailable) {
          issues.push({
            variantId: item.variantId,
            productName: item.productName,
            type: "QUANTITY_ADJUSTED",
            message: `La cantidad de ${item.productName} se ajustó a ${stockAvailable}.`,
          });
        }

        if (Math.abs(currentPrice - item.price) > 0.001) {
          issues.push({
            variantId: item.variantId,
            productName: item.productName,
            type: "PRICE_UPDATED",
            message: `El precio de ${item.productName} fue actualizado.`,
          });
        }

        return {
          ...item,
          productName: detail.producto.nombre,
          productSlug: detail.producto.slug ?? item.productSlug,
          imageUrl: getPrimaryImage(detail) ?? item.imageUrl,
          price: currentPrice,
          quantity: nextQuantity,
          stockAvailable,
          sku: variant.sku ?? item.sku,
        };
      });

      commitItems(nextItems);
      return issues;
    } finally {
      setIsValidating(false);
    }
  }, [commitItems]);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const hasStockIssues = useMemo(
    () =>
      items.some(
        (item) => item.stockAvailable <= 0 || item.quantity > item.stockAvailable,
      ),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      subtotal,
      isValidating,
      hasStockIssues,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      validateCart,
    }),
    [
      items,
      totalItems,
      subtotal,
      isValidating,
      hasStockIssues,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      validateCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe utilizarse dentro de CartProvider");
  }

  return context;
}
