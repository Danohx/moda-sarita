import { useCart } from "@web/features/cart/context/CartContext";

export function useCartCount() {
  return useCart().totalItems;
}
