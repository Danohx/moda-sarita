import { CreditCard, ShieldCheck, Store, Truck } from "lucide-react";
import styles from "./BenefitsSection.module.css";

const benefits = [
  {
    icon: Store,
    title: "Recoge en boutique",
    description: "Aparta tu compra en línea y recógela sin costo en nuestra tienda.",
  },
  {
    icon: Truck,
    title: "Entrega según tu zona",
    description: "Cotizamos el costo de entrega de acuerdo con tu ubicación.",
  },
  {
    icon: CreditCard,
    title: "Pago flexible",
    description: "Paga mediante transferencia o tarjeta cuando el método esté habilitado.",
  },
  {
    icon: ShieldCheck,
    title: "Compra con confianza",
    description: "Tu cuenta y tus pedidos se protegen mediante sesiones seguras.",
  },
];

export function BenefitsSection() {
  return (
    <section className={styles.section} aria-label="Beneficios de comprar en Moda Sarita">
      <div className={`${styles.grid} container`}>
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article className={styles.item} key={benefit.title}>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={23} strokeWidth={1.8} />
              </span>
              <div>
                <h2>{benefit.title}</h2>
                <p>{benefit.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
