import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { adminRoutePreloaders } from "./routePreloaders";

import AdminLayout from "../components/layout/AdminLayout";
import AdminRoute from "../guards/AdminRoute";
import GuestRoute from "../guards/GuestRoute";
import PermissionRoute from "../guards/PermissionRoute";

const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));

const Dashboard = lazy(adminRoutePreloaders.dashboard);
const POS = lazy(adminRoutePreloaders.pos);
const OrdersManager = lazy(adminRoutePreloaders.orders);
const HistorialVentasPOS = lazy(adminRoutePreloaders.historyOrders);
const CorteCaja = lazy(adminRoutePreloaders.corteCaja);
const AdminProducts = lazy(adminRoutePreloaders.products);
const Inventory = lazy(adminRoutePreloaders.inventory);
const AdminCustomers = lazy(adminRoutePreloaders.customers);
const CreditsManager = lazy(adminRoutePreloaders.credits);
const AdminReports = lazy(adminRoutePreloaders.reports);
// const AdminAnalytics = lazy(adminRoutePreloaders.analytics);
const Marketing = lazy(adminRoutePreloaders.marketing);
const AdminSettings = lazy(adminRoutePreloaders.settings);
const AdminContent = lazy(adminRoutePreloaders.legalContent);
const AdminContactMessages = lazy(adminRoutePreloaders.contactMessages);

const HistorialCortes = lazy(() => import("../pages/admin/HistorialCortes"));
const ProductForm = lazy(() => import("../pages/admin/ProductForm"));
const ProductDetailAdmin = lazy(() => import("../pages/admin/ProductDetailAdmin"));
const ProductVariantsManager = lazy(() => import("../pages/admin/ProductVariantsManager"));
const ProductImagesManager = lazy(() => import("../pages/admin/ProductImagesManager"));
const ProductCatalogs = lazy(() => import("../pages/admin/ProductCategorias"));
const InventoryMovements = lazy(() => import("../pages/admin/InventoryMovements"));
const CustomerCreditPanel = lazy(() => import("@admin/pages/admin/CustomCreditPanel"));
const CreditDetail = lazy(() => import("../pages/admin/CreditDetail"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));



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

  creditos: ["credito.view"],

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

  analitica: [
    "clientes.clientes.credito.manage",
    "credito.view",
    "reportes.productos.view",
    "inventario.productos.read",
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
            <Route path="/login" element={
              <Suspense fallback={<div>Cargando...</div>}>
                <AdminLogin />
              </Suspense>
              } />
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

              {/* <Route element={<PermissionRoute permissions={PERMS.analitica} />}>
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route> */}

              <Route element={<PermissionRoute permissions={PERMS.marketing} />}>
                <Route path="marketing" element={<Marketing />} />
              </Route>

              <Route element={<PermissionRoute permissions={PERMS.clientes} />}>
                <Route path="customers" element={<AdminCustomers />} />
              </Route>

              <Route element={<PermissionRoute permissions={PERMS.creditos} />}>
                <Route path="credits" element={<CreditsManager />} />
                <Route path="credits/:creditoId" element={<CreditDetail />} />
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
