import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { STORE_CONFIG } from "@web/config/store.config";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return (
    <section className={styles.section} aria-labelledby="hero-title">
      <div className={`${styles.card} container`}>
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <Sparkles size={16} />
            Nueva colección 2026
          </div>
          <h1 id="hero-title">
            Encuentra prendas que <span>hablen de ti.</span>
          </h1>
          <p>
            Descubre ropa y accesorios elegidos para acompañarte todos los días,
            con atención cercana desde Huejutla.
          </p>

          <div className={styles.actions}>
            <Link className="button button-primary" to="/catalogo">
              Explorar catálogo
              <ArrowRight size={19} />
            </Link>
            <a
              className="button button-secondary"
              href="https://www.google.com/maps/search/?api=1&query=Av.%20Ju%C3%A1rez%2014%20B%20Huejutla"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={18} />
              Visitar boutique
            </a>
          </div>

          <div className={styles.meta}>
            <span>{STORE_CONFIG.pickupLabel}</span>
            <span>{STORE_CONFIG.deliveryLabel}</span>
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <img src="/hero-boutique.svg" alt="" />
          <div className={styles.floatingCard}>
            <span>Selección boutique</span>
            <strong>Moda con personalidad</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
