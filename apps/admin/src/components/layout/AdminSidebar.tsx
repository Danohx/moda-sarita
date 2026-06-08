import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Settings,
  LogOut,
  Truck,
  BarChart3,
  Menu,
  // Database,
  Tag,
  DollarSign,
} from "lucide-react";
import styles from "../../../styles/AdminSidebar.module.css";
import { useAuth } from "@shared/context/AuthContext";

interface AdminSidebarProps {
  role: "admin" | "empleado";
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const getLinkClass = (path: string) => {
    return location.pathname === path
      ? `${styles.navLink} ${styles.navLinkActive}`
      : styles.navLink;
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
    >
      <div className={styles.toggleRow}>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <Menu size={18} />
        </button>
      </div>

      <div className={styles.profileSection}>
        <div className={styles.avatar}>{role === "admin" ? "AD" : "EM"}</div>

        {!collapsed && (
          <>
            <div className={styles.userName}>
              {role === "admin" ? "Administrador" : "Empleado"}
            </div>
            <div className={styles.userRole}>Panel de Control</div>
          </>
        )}
      </div>

      <nav className={styles.navigation}>
        <Link to="/dashboard" className={getLinkClass("/dashboard")}>
          <LayoutDashboard size={20} className={styles.icon} />
          {!collapsed && <span>Inicio</span>}
        </Link>

        <Link to="/pos" className={getLinkClass("/pos")}>
          <Store size={20} className={styles.icon} />
          {!collapsed && <span>Punto de Venta</span>}
        </Link>
        
        <Link to="/corte" className={getLinkClass("/corte")}>
          <DollarSign size={20} className={styles.icon} />
          {!collapsed && <span>Corte de Caja</span>}
        </Link>

        <Link to="/orders" className={getLinkClass("/orders")}>
          <Truck size={20} className={styles.icon} />
          {!collapsed && <span>Pedidos</span>}
        </Link>

        <Link to="/products" className={getLinkClass("/products")}>
          <Tag size={20} className={styles.icon} />
          {!collapsed && <span>Productos</span>}
        </Link>

        <Link to="/inventory" className={getLinkClass("/inventory")}>
          <Package size={20} className={styles.icon} />
          {!collapsed && <span>Inventario</span>}
        </Link>

        <Link to="/customers" className={getLinkClass("/customers")}>
          <Users size={20} className={styles.icon} />
          {!collapsed && <span>Gestión de Clientes</span>}
        </Link>

        {role === "admin" && (
          <>
            {!collapsed && (
              <div className={styles.adminSectionTitle}>Administración</div>
            )}

            <Link to="/reports" className={getLinkClass("/reports")}>
              <BarChart3 size={20} className={styles.icon} />
              {!collapsed && <span>Reportes</span>}
            </Link>

            <Link to="/settings" className={getLinkClass("/settings")}>
              <Settings size={20} className={styles.icon} />
              {!collapsed && <span>Ajustes</span>}
            </Link>

            {/* <Link to="/bd-monitor" className={getLinkClass("/bd-monitor")}>
              <Database size={20} className={styles.icon} />
              {!collapsed && <span>Monitoreo BD</span>}
            </Link> */}
          </>
        )}
      </nav>

      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
        disabled={loggingOut}
      >
        <LogOut size={20} className={styles.icon} />
        {!collapsed && (
          <span>{loggingOut ? "Saliendo..." : "Cerrar Sesión"}</span>
        )}
      </button>
    </aside>
  );
};

export default AdminSidebar;
