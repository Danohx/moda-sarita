import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StoreLayout } from "@web/components/layout/StoreLayout";
import { ProtectedRoute } from "@web/components/navigation/ProtectedRoute";
import { AccountLayout } from "@web/features/account/components/AccountLayout";
import { AccountHomePage } from "@web/features/account/pages/AccountHomePage";
import { AddressesPage } from "@web/features/account/pages/AddressesPage";
import { CreditPage } from "@web/features/account/pages/CreditPage";
import { OrderDetailPage } from "@web/features/account/pages/OrderDetailPage";
import { OrdersPage } from "@web/features/account/pages/OrdersPage";
import { ProfilePage } from "@web/features/account/pages/ProfilePage";
import { ForgotPasswordPage } from "@web/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@web/features/auth/pages/LoginPage";
import { MagicVerifyPage } from "@web/features/auth/pages/MagicVerifyPage";
import { RegisterPage } from "@web/features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "@web/features/auth/pages/ResetPasswordPage";
import { CartPage } from "@web/features/cart/pages/CartPage";
import { CatalogPage } from "@web/features/catalog/pages/CatalogPage";
import { CheckoutPage } from "@web/features/checkout/pages/CheckoutPage";
import { OrderConfirmationPage } from "@web/features/checkout/pages/OrderConfirmationPage";
import { ContactPage } from "@web/features/contact/pages/ContactPage";
import { FAQPage } from "@web/features/content/pages/FAQPage";
import { PublicContentPage } from "@web/features/content/pages/PublicContentPage";
import { HomePage } from "@web/features/home/pages/HomePage";
import { ProductDetailPage } from "@web/features/product/pages/ProductDetailPage";
import { NotFoundPage } from "@web/pages/NotFoundPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="producto/:productId" element={<ProductDetailPage />} />
          <Route path="carrito" element={<CartPage />} />

          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="restablecer-contrasena/:token" element={<ResetPasswordPage />} />
          <Route path="magic-verify/:token" element={<MagicVerifyPage />} />

          <Route
            path="checkout"
            element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
          />
          <Route
            path="checkout/confirmacion/:orderId"
            element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>}
          />

          <Route
            path="mi-cuenta"
            element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}
          >
            <Route index element={<AccountHomePage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="direcciones" element={<AddressesPage />} />
            <Route path="credito" element={<CreditPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pedidos/:orderId" element={<OrderDetailPage />} />
          </Route>

          <Route path="contacto" element={<ContactPage />} />
          <Route path="preguntas-frecuentes" element={<FAQPage />} />
          <Route path="privacidad" element={<PublicContentPage contentKey="PRIVACIDAD" eyebrow="Información legal" fallbackTitle="Política de privacidad" fallbackText="La política de privacidad definitiva se encuentra pendiente de publicación por Moda Sarita." />} />
          <Route path="politica-de-cambios" element={<PublicContentPage contentKey="POLITICA_CAMBIOS" eyebrow="Compras" fallbackTitle="Política de cambios" fallbackText="Actualmente todas las ventas son finales y Moda Sarita no realiza cambios. Contacta a la boutique antes de comprar si tienes dudas sobre talla, color o disponibilidad." />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
