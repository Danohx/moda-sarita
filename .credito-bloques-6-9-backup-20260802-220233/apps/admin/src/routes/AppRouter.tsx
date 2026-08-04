import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../components/layout/AdminLayout";
import AdminLogin from "../pages/admin/AdminLogin";

import { Dashboard } from "../pages/admin/Dashboard";
import { POS } from "../pages/admin/PuntoVenta";
import HistorialVentasPOS from "@admin/pages/admin/HistorialVentas";
import CorteCaja from "@admin/pages/admin/CorteCaja";
import HistorialCortes from "@admin/pages/admin/HistorialCortes";
import OrdersManager from "../pages/admin/OrdersManager";

import AdminProducts from "../pages/admin/AdminProducts";
import ProductForm from "../pages/admin/ProductForm";
import ProductDetailAdmin from "../pages/admin/ProductDetailAdmin";
import ProductVariantsManager from "../pages/admin/ProductVariantsManager";
import ProductImagesManager from "../pages/admin/ProductImagesManager";
import ProductCatalogs from "../pages/admin/ProductCategorias";

import Inventory from "../pages/admin/Inventory";
import InventoryMovements from "../pages/admin/InventoryMovements";

import AdminCustomers from "../pages/admin/AdminCustomers";
import CustomerCreditPanel from "@admin/pages/admin/CustomCreditPanel";

import AdminUsers from "../pages/admin/AdminUsers";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminReports from "../pages/admin/AdminReports";
import AdminContent from "@admin/pages/admin/AdminContent";
import AdminContactMessages from "@admin/pages/admin/AdminContactMessages";
import Marketing from "@admin/pages/admin/Marketing";

import AdminRoute from "../guards/AdminRoute";
import GuestRoute from "../guards/GuestRoute";
import PermissionRoute from "../guards/PermissionRoute";

const PERMS = {
  pos: ["ventas.pedidos.create", "ventas.pedidos.read"],

  ventasHistorial: ["ventas.pedidos.read", "ventas.pagos.read"],

  corteCaja: [
    "ventas.corte_caja.read",
    "ventas.corte_caja.create",
    "ventas.corte_caja.close",
  ],

  pedidos: [
    "ventas.pedidos.read",
    "ventas.pedidos.update",
    "ventas.pedidos.cancel",
  ],

  productosRead: ["inventario.productos.read"],

  productosManage: [
    "inventario.productos.create",
    "inventario.productos.update",
    "inventario.productos.deactivate",
  ],

  catalogos: [
    "inventario.categorias.read",
    "inventario.categorias.create",
    "inventario.categorias.update",
    "inventario.categorias.delete",
  ],

  inventario: [
    "inventario.productos.read",
    "inventario.movimientos.read",
    "inventario.movimientos.create",
  ],

  clientes: [
    "clientes.clientes.read",
    "clientes.clientes.create",
    "clientes.clientes.update",
  ],

  creditoClientes: ["clientes.clientes.credito.manage"],

  usuarios: [
    "seguridad.usuarios.read",
    "seguridad.usuarios.manage",
    "seguridad.empleados.view",
    "seguridad.empleados.manage",
  ],

  ajustes: [
    "seguridad.empleados.view",
    "seguridad.empleados.manage",
    "seguridad.roles.view",
    "seguridad.roles.manage",
    "seguridad.permisos.view",
    "seguridad.permisos.manage",
    "configuracion.ajustes.view",
    "configuracion.ajustes.manage",
    "configuracion.metodos_pago.view",
    "configuracion.metodos_pago.manage",
    "seguridad.sesiones.read",
    "seguridad.sesiones.revoke",
  ],

  reportes: [
    "reportes.view",
    "reportes.resumen.view",
    "reportes.ventas.view",
    "reportes.productos.view",
    "reportes.inventario.view",
    "reportes.empleados.view",
    "reportes.clientes.view",
    "reportes.credito.view",
    "reportes.apartados.view",
    "reportes.cortes.view",
    "reportes.financiero.view",
    "reportes.marketing.view",
  ],

  marketing: [
    "marketing.suscripciones.view",
    "marketing.cupones.view",
    "marketing.segmentos.view",
    "marketing.plantillas.view",
  ],

  contenido: ["contenido.paginas.view", "contenido.faq.view"],

  contacto: ["contenido.contacto.view"],
};

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

            <Route element={<PermissionRoute permissions="dashboard.view" />}>
              <Route path="dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.pos} />}>
              <Route path="pos" element={<POS />} />
            </Route>

            <Route
              element={<PermissionRoute permissions={PERMS.ventasHistorial} />}
            >
              <Route path="historial-ventas" element={<HistorialVentasPOS />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.corteCaja} />}>
              <Route path="corte" element={<CorteCaja />} />
              <Route path="corte/history" element={<HistorialCortes />} />
              <Route path="corte/history/:id" element={<CorteCaja />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.pedidos} />}>
              <Route path="orders" element={<OrdersManager />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.usuarios} />}>
              <Route path="users" element={<AdminUsers />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.ajustes} />}>
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.reportes} />}>
              <Route path="reports" element={<AdminReports />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.marketing} />}>
              <Route path="marketing" element={<Marketing />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.clientes} />}>
              <Route path="customers" element={<AdminCustomers />} />
            </Route>

            <Route
              element={<PermissionRoute permissions={PERMS.creditoClientes} />}
            >
              <Route
                path="customers/:id/credit"
                element={<CustomerCreditPanel />}
              />
            </Route>

            <Route
              element={<PermissionRoute permissions={PERMS.productosRead} />}
            >
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/:id" element={<ProductDetailAdmin />} />
            </Route>

            <Route
              element={<PermissionRoute permissions={PERMS.productosManage} />}
            >
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route
                path="products/:id/variants"
                element={<ProductVariantsManager />}
              />
              <Route
                path="products/:id/images"
                element={<ProductImagesManager />}
              />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.catalogos} />}>
              <Route path="products/catalogs" element={<ProductCatalogs />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.inventario} />}>
              <Route path="inventory" element={<Inventory />} />
              <Route
                path="inventory/variants/:id/movements"
                element={<InventoryMovements />}
              />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.contenido} />}>
              <Route path="content" element={<AdminContent />} />
            </Route>

            <Route element={<PermissionRoute permissions={PERMS.contacto} />}>
              <Route path="contact" element={<AdminContactMessages />} />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <h1 style={{ color: "black" }}>ERROR 404: La ruta no existe</h1>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
