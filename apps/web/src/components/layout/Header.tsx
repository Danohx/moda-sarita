import { useState, type FormEvent } from "react";
import {
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import { BrandLogo } from "@web/components/brand/BrandLogo";
import { useCartCount } from "@web/hooks/useCartCount";
import styles from "./Header.module.css";

const navigationItems = [
  { label: "Inicio", to: "/" },
  { label: "Catálogo", to: "/catalogo" },
  // { label: "Novedades", to: "/#destacados" },
  { label: "Contacto", to: "/contacto" },
];

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cartCount = useCartCount();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/catalogo?q=${encodeURIComponent(query)}` : "/catalogo");
    setMenuOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <BrandLogo />

        <nav className={styles.desktopNav} aria-label="Navegación principal">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive && !item.to.includes("#") ? styles.navLinkActive : ""}`
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <form className={styles.searchForm} onSubmit={handleSearch} role="search">
            <label className="sr-only" htmlFor="store-search">
              Buscar productos
            </label>
            <input
              id="store-search"
              type="search"
              placeholder="Buscar prendas..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="submit" aria-label="Buscar">
              <Search size={19} />
            </button>
          </form>

          <Link
            className={styles.iconButton}
            to="/carrito"
            aria-label={`Carrito con ${cartCount} productos`}
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && <span className={styles.badge}>{Math.min(cartCount, 99)}</span>}
          </Link>

          <Link
            className={styles.iconButton}
            to={isAuthenticated ? "/mi-cuenta" : "/login"}
            aria-label={isAuthenticated ? "Ir a mi cuenta" : "Iniciar sesión"}
          >
            <UserRound size={21} />
          </Link>

          <button
            className={`${styles.iconButton} ${styles.menuButton}`}
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ""}`}
      >
        <div className="container">
          <form className={styles.mobileSearch} onSubmit={handleSearch} role="search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar productos..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar productos"
            />
          </form>

          <nav className={styles.mobileNav} aria-label="Navegación móvil">
            {navigationItems.map((item) => (
              <Link key={item.label} to={item.to} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
            <Link to={isAuthenticated ? "/mi-cuenta" : "/login"} onClick={closeMenu}>
              {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
