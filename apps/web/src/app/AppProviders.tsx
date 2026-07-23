import type { ReactNode } from "react";
import { AuthProvider } from "@shared/context/AuthProvider";
import { CartProvider } from "@web/features/cart/context/CartContext";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
