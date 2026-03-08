import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "../pages/general/NotFound";
import ServerError from "../pages/general/ServerError";
import BadRequest from "../pages/general/BadRequest";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ConfigurationPage from "../pages/auth/ConfigurationPage";
import ContactPage from "../pages/general/ContactPage";
import HomePage from "../pages/general/HomePage";
import CatalogPage from "../pages/general/CatalogPage";
import ProductDetailPage from "../pages/general/ProductDetail";
import AdminLayout from "../components/layout/AdminLayout";
import PublicLayout from "../components/layout/PublicLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import { Dashboard } from "../pages/admin/Dashboard";
import { POS } from "../pages/admin/PuntoVenta";
import { Inventory  } from "../pages/admin/Inventory";
import OrdersManager from "../pages/admin/OrdersManager";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSettings from "../pages/admin/AdminSettings";
import { AdminReports } from "../pages/admin/AdminReports";
import AdminMarketing from "../pages/admin/AdminMarketing";
import AdminCustomers from "../pages/admin/AdminCustomers";
// import AdminPanel from "../pages/admin/AdminPanel";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/catalogo/:id" element={<ProductDetailPage />} />
          <Route path="/configuracion" element={<ConfigurationPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout role="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="marketing" element={<AdminMarketing />} />
          <Route path="customers" element={<AdminCustomers />} />
          {/* <Route path="panel" element={<AdminPanel />} /> */}
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="/400" element={<BadRequest />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};