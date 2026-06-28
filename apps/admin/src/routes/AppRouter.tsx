import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import AdminLogin from "../pages/admin/AdminLogin";
import { Dashboard } from "../pages/admin/Dashboard";
import { POS } from "../pages/admin/PuntoVenta";
import Inventory from "../pages/admin/Inventory";
import OrdersManager from "../pages/admin/OrdersManager";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminReports  from "../pages/admin/AdminReports";
import AdminMarketing from "../pages/admin/AdminMarketing";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminRoute from "../guards/AdminRoute";
import GuestRoute from "../guards/GuestRoute";
import AdminProducts from "../pages/admin/AdminProducts";
import ProductForm from "../pages/admin/ProductForm";
import ProductDetailAdmin from "../pages/admin/ProductDetailAdmin";
import ProductVariantsManager from "../pages/admin/ProductVariantsManager";
import ProductImagesManager from "../pages/admin/ProductImagesManager";
import ProductCatalogs from "../pages/admin/ProductCategorias";
import InventoryMovements from "../pages/admin/InventoryMovements";
// import AdminDatabaseMonitoring from "../pages/bd-monitor/AdminDatabaseMonitoring";
// import AdminBackups from "@admin/pages/admin/AdminBackups";
// import AdminMaintenance from "@admin/pages/admin/AdminMaintenance";
// import AdminMonitoringLogs from "@admin/pages/admin/AdminMonitoringLogs";
// import AdminMaintenanceRunner from "@admin/pages/bd-monitor/AdminMaintenanceRunner";
import CorteCaja from "@admin/pages/admin/CorteCaja";
import HistorialCortes from "@admin/pages/admin/HistorialCortes";
import CustomerCreditPanel from "@admin/pages/admin/CustomCreditPanel";
import HistorialVentasPOS from "@admin/pages/admin/HistorialVentas";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<AdminLogin />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="historial-ventas" element={<HistorialVentasPOS />} />
            <Route path="corte" element={<CorteCaja />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="corte/history/" element={<HistorialCortes />} />
            <Route path="corte/history/:id" element={<CorteCaja />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id/credit" element={<CustomerCreditPanel />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/catalogs" element={<ProductCatalogs />} />
            <Route path="products/:id" element={<ProductDetailAdmin />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route
              path="products/:id/variants"
              element={<ProductVariantsManager />}
            />
            <Route
              path="products/:id/images"
              element={<ProductImagesManager />}
            />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/variants/:id/movements" element={<InventoryMovements />} />
            {/* <Route path="bd-monitor" element={<AdminDatabaseMonitoring />} /> */}
            {/* <Route path="backups" element={<AdminBackups />} />
            <Route path="maintenance" element={<AdminMaintenance />} />
            <Route path="maintenance/run" element={<AdminMaintenanceRunner />} />
            <Route path="monitoring-logs" element={<AdminMonitoringLogs />} /> */}
          </Route>
        </Route>
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
        <Route path="*" element={<h1 style={{color: 'black'}}>ERROR 404: La ruta no existe</h1>} />
      </Routes>
    </BrowserRouter>
  );
};