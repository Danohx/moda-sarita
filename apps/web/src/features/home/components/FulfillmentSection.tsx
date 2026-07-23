import { ArrowRight, MapPin, Store, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { STORE_CONFIG } from "@web/config/store.config";
import styles from "./FulfillmentSection.module.css";

export function FulfillmentSection() {
  return (
    <section className="section" aria-labelledby="fulfillment-title">
      <div className={`${styles.card} container`}>
        <div className={styles.intro}>
          <p>Compra como te resulte más cómodo</p>
          <h2 id="fulfillment-title">Recoge en tienda o solicita entrega.</h2>
          <span>
            El costo de envío se confirma según la zona antes de completar el pago.
          </span>
          <Link className="text-link" to="/catalogo">
            Empezar a comprar
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.options}>
          <article>
            <span className={styles.icon} aria-hidden="true">
              <Store size={25} />
            </span>
            <div>
              <h3>Recoger en boutique</h3>
              <p>Sin costo de envío. Te avisaremos cuando tu pedido esté listo.</p>
              <small>
                <MapPin size={15} />
                {STORE_CONFIG.address}
              </small>
            </div>
          </article>

          <article>
            <span className={styles.icon} aria-hidden="true">
              <Truck size={25} />
            </span>
            <div>
              <h3>Entrega a domicilio</h3>
              <p>Captura tu dirección y confirmaremos disponibilidad y costo.</p>
              <small>Cotización personalizada de acuerdo con la zona.</small>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
