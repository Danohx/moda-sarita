import { Facebook, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@web/components/brand/BrandLogo";
import { STORE_CONFIG } from "@web/config/store.config";
import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${styles.grid} container`}>
        <div className={styles.brandColumn}>
          <BrandLogo compact />
          <p>{STORE_CONFIG.tagline}</p>
          <a
            className={styles.facebook}
            href={STORE_CONFIG.facebookUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Facebook size={18} />
            Síguenos en Facebook
          </a>
        </div>

        <div>
          <h2>Compra</h2>
          <nav className={styles.links} aria-label="Enlaces de compra">
            <Link to="/catalogo">Catálogo</Link>
            <Link to="/#destacados">Productos destacados</Link>
            <Link to="/carrito">Carrito</Link>
            <Link to="/mi-cuenta/pedidos">Mis pedidos</Link>
          </nav>
        </div>

        <div>
          <h2>Ayuda</h2>
          <nav className={styles.links} aria-label="Enlaces de ayuda">
            <Link to="/contacto">Contacto</Link>
            <Link to="/preguntas-frecuentes">Preguntas frecuentes</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/politica-de-cambios">Política de cambios</Link>
          </nav>
        </div>

        <div>
          <h2>Boutique</h2>
          <div className={styles.contactList}>
            <a href={`tel:${STORE_CONFIG.phoneHref}`}>
              <Phone size={18} />
              <span>{STORE_CONFIG.phoneDisplay}</span>
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.%20Ju%C3%A1rez%2014%20B%20Huejutla"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={18} />
              <span>{STORE_CONFIG.address}</span>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`${styles.bottomInner} container`}>
          <p>© {currentYear} Moda Sarita. Todos los derechos reservados.</p>
          <p>{STORE_CONFIG.finalSaleMessage}</p>
        </div>
      </div>
    </footer>
  );
}
