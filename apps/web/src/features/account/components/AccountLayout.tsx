import { useState } from "react";
import { BookmarkCheck, ChevronRight, CreditCard, Home, LogOut, MapPin, Menu, Package, UserRound, X } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import styles from "./AccountLayout.module.css";

const navItems = [
  { to: "/mi-cuenta", label: "Resumen", icon: Home, end: true },
  { to: "/mi-cuenta/perfil", label: "Mi perfil", icon: UserRound },
  { to: "/mi-cuenta/direcciones", label: "Direcciones", icon: MapPin },
  { to: "/mi-cuenta/credito", label: "Mi crédito", icon: CreditCard },
  { to: "/mi-cuenta/apartados", label: "Mis apartados", icon: BookmarkCheck },
  { to: "/mi-cuenta/pedidos", label: "Mis pedidos", icon: Package },
];

export function AccountLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <main className={`${styles.page} container`}>
      <button className={styles.mobileToggle} type="button" onClick={() => setOpen((current) => !current)}>
        {open ? <X size={19} /> : <Menu size={19} />} Menú de mi cuenta
      </button>
      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
          <div className={styles.identity}>
            <span><UserRound size={26} /></span>
            <div><small>Mi cuenta</small><strong>{user?.nombre || user?.correo || user?.email || "Cliente Moda Sarita"}</strong></div>
          </div>
          <nav>
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} end={end} to={to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? styles.active : ""}>
                <Icon size={18} /><span>{label}</span><ChevronRight size={16} />
              </NavLink>
            ))}
          </nav>
          <button className={styles.logout} type="button" onClick={handleLogout}><LogOut size={18} />Cerrar sesión</button>
        </aside>
        <section className={styles.content}><Outlet /></section>
      </div>
    </main>
  );
}
