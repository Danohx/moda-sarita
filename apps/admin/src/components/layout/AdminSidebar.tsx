import React, { useEffect, useMemo, useState } from "react";
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
  Tag,
  DollarSign,
  FileClock,
  ScrollText,
  MessageSquare,
  Megaphone,
  HandCoins,
  BrainCircuit,
} from "lucide-react";

import styles from "../../../styles/AdminSidebar.module.css";
import { useAuth } from "@shared/context/AuthContext";
import { getResumenMensajesContacto } from "@admin/services/contacto.service";
import { canAccess } from "../../utils/permissions";

interface AdminSidebarProps {
  role: "admin" | "empleado";
}

type SidebarUser = {
  nombres?: string;
  nombre?: string;
  name?: string;
  fullName?: string;
  apellido_paterno?: string;
  apellidoPaterno?: string;
  apellido_materno?: string;
  apellidoMaterno?: string;
  rol?: string;
  role?: string;
  rol_nombre?: string;
  rolName?: string;
  roleName?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  foto_url?: string | null;
};

type SidebarItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  permissions?: string | string[];
  activePaths?: string[];
  badge?: number;
};

function getUserDisplayName(user: unknown): string {
  const raw = user as SidebarUser | null;

  const fullName = String(raw?.fullName || raw?.name || "").trim();

  if (fullName) return fullName;

  const nombres = String(raw?.nombres || raw?.nombre || "").trim();
  const apellidoPaterno = String(
    raw?.apellido_paterno || raw?.apellidoPaterno || "",
  ).trim();
  const apellidoMaterno = String(
    raw?.apellido_materno || raw?.apellidoMaterno || "",
  ).trim();

  const composedName = [nombres, apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(" ")
    .trim();

  return composedName || "Usuario";
}

function getUserRoleLabel(user: unknown, fallbackRole: string): string {
  const raw = user as SidebarUser | null;

  const role = String(
    raw?.rol_nombre ||
      raw?.rolName ||
      raw?.roleName ||
      raw?.rol ||
      raw?.role ||
      fallbackRole ||
      "",
  )
    .trim()
    .replaceAll("_", " ");

  if (!role) return "Sin rol";

  return role
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getUserInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "US";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function getUserAvatarUrl(user: unknown): string | null {
  const raw = user as SidebarUser | null;

  return raw?.avatar_url || raw?.avatarUrl || raw?.foto_url || null;
}

const MAIN_ITEMS: SidebarItem[] = [
  {
    label: "Inicio",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Punto de Venta",
    to: "/pos",
    icon: Store,
    permissions: ["ventas.pedidos.create", "ventas.pedidos.read"],
  },
  {
    label: "Historial de Ventas",
    to: "/historial-ventas",
    icon: FileClock,
    permissions: ["ventas.pedidos.read", "ventas.pagos.read"],
  },
  {
    label: "Corte de Caja",
    to: "/corte",
    icon: DollarSign,
    permissions: [
      "ventas.corte_caja.read",
      "ventas.corte_caja.create",
      "ventas.corte_caja.close",
    ],
    activePaths: ["/corte", "/corte/history"],
  },
  {
    label: "Pedidos",
    to: "/orders",
    icon: Truck,
    permissions: [
      "ventas.pedidos.read",
      "ventas.pedidos.update",
      "ventas.pedidos.cancel",
    ],
  },
  {
    label: "Productos",
    to: "/products",
    icon: Tag,
    permissions: ["inventario.productos.read"],
    activePaths: ["/products"],
  },
  {
    label: "Inventario",
    to: "/inventory",
    icon: Package,
    permissions: [
      "inventario.productos.read",
      "inventario.movimientos.read",
      "inventario.movimientos.create",
    ],
    activePaths: ["/inventory"],
  },
  {
    label: "Gestión de Clientes",
    to: "/customers",
    icon: Users,
    permissions: [
      "clientes.clientes.read",
      "clientes.clientes.create",
      "clientes.clientes.update",
    ],
    activePaths: ["/customers"],
  },
  {
    label: "Créditos",
    to: "/credits",
    icon: HandCoins,
    permissions: ["credito.view"],
    activePaths: ["/credits"],
  },
];

function buildAdminItems(mensajesNuevos: number): SidebarItem[] {
  return [
    {
      label: "Reportes",
      to: "/reports",
      icon: BarChart3,
      permissions: [
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
    },
    {
      label: "Analítica",
      to: "/analytics",
      icon: BrainCircuit,
      permissions: [
        "clientes.clientes.credito.manage",
        "credito.view",
        "reportes.productos.view",
        "inventario.productos.read",
      ],
    },
    {
      label: "Contenido Legal",
      to: "/content",
      icon: ScrollText,
      permissions: ["contenido.paginas.view", "contenido.faq.view"],
    },
    {
      label: "Contacto",
      to: "/contact",
      icon: MessageSquare,
      permissions: ["contenido.contacto.view"],
      badge: mensajesNuevos,
    },
    {
      label: "Marketing",
      to: "/marketing",
      icon: Megaphone,
      permissions: [
        "marketing.suscripciones.view",
        "marketing.cupones.view",
        "marketing.segmentos.view",
        "marketing.plantillas.view",
      ],
    },
    {
      label: "Ajustes",
      to: "/settings",
      icon: Settings,
      permissions: [
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
    },
  ];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mensajesNuevos, setMensajesNuevos] = useState(0);

  const displayName = getUserDisplayName(user);
  const roleLabel = getUserRoleLabel(user, role);
  const initials = getUserInitials(displayName);
  const avatarUrl = getUserAvatarUrl(user);

  const canViewContact = canAccess(user, {
    permissions: "contenido.contacto.view",
  });

  const visibleMainItems = useMemo(() => {
    return MAIN_ITEMS.filter((item) =>
      canAccess(user, { permissions: item.permissions }),
    );
  }, [user]);

  const visibleAdminItems = useMemo(() => {
    return buildAdminItems(mensajesNuevos).filter((item) =>
      canAccess(user, { permissions: item.permissions }),
    );
  }, [mensajesNuevos, user]);

  const getLinkClass = (item: SidebarItem) => {
    const paths = item.activePaths?.length ? item.activePaths : [item.to];

    const isActive = paths.some((path) => {
      return (
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );
    });

    return isActive
      ? `${styles.navLink} ${styles.navLinkActive}`
      : styles.navLink;
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesiÃ³n:", error);
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  async function loadMensajesBadge() {
    if (!canViewContact) {
      setMensajesNuevos(0);
      return;
    }

    try {
      const resumen = await getResumenMensajesContacto();
      setMensajesNuevos(resumen.nuevos || 0);
    } catch (error) {
      console.error("No se pudo cargar contador de mensajes:", error);
      setMensajesNuevos(0);
    }
  }

  useEffect(() => {
    if (!canViewContact) {
      setMensajesNuevos(0);
      return;
    }

    void loadMensajesBadge();

    const intervalId = window.setInterval(() => {
      void loadMensajesBadge();
    }, 60_000);

    const onResumenUpdated = () => {
      void loadMensajesBadge();
    };

    window.addEventListener("contacto:resumen-updated", onResumenUpdated);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("contacto:resumen-updated", onResumenUpdated);
    };
  }, [canViewContact]);

  useEffect(() => {
    document.title =
      canViewContact && mensajesNuevos > 0
        ? `(${mensajesNuevos}) Dashboard - Moda Sarita`
        : "Dashboard - Moda Sarita";
  }, [canViewContact, mensajesNuevos]);

  const renderItem = (item: SidebarItem) => {
    const Icon = item.icon;
    const badge = item.badge ?? 0;

    return (
      <Link key={item.to} to={item.to} className={getLinkClass(item)}>
        <Icon size={20} className={styles.icon} />

        {!collapsed && (
          <>
            <span>{item.label}</span>

            {badge > 0 && (
              <span className={styles.badgeCount}>
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </>
        )}

        {collapsed && badge > 0 && (
          <span className={styles.badgeDot}>{badge > 9 ? "9+" : badge}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`${styles.sidebar} ${
        collapsed ? styles.sidebarCollapsed : ""
      }`}
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
        <div className={styles.avatar}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className={styles.avatarImage}
            />
          ) : (
            initials
          )}
        </div>

        {!collapsed && (
          <>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userRole}>{roleLabel}</div>
            <div className={styles.userPanelLabel}>Panel de Control</div>
          </>
        )}
      </div>

      <nav className={styles.navigation}>
        {visibleMainItems.map(renderItem)}

        {visibleAdminItems.length > 0 && (
          <>
            {!collapsed && (
              <div className={styles.adminSectionTitle}>Administración</div>
            )}

            {visibleAdminItems.map(renderItem)}
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


