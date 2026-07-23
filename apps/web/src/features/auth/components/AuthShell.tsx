import type { ReactNode } from "react";
import { LockKeyhole, PackageCheck, Store } from "lucide-react";
import styles from "@web/features/auth/pages/AuthPage.module.css";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <aside className={styles.visual}>
          <div>
            <small>Moda Sarita</small>
            <h1>Tu boutique, ahora también en línea.</h1>
            <p>
              Consulta existencias reales, reserva tus prendas favoritas y elige
              entre recoger en tienda o recibir en tu domicilio.
            </p>
          </div>
          <div className={styles.benefits}>
            <span><PackageCheck size={18} /> Inventario actualizado</span>
            <span><Store size={18} /> Recolección sin costo</span>
            <span><LockKeyhole size={18} /> Compra protegida con tu cuenta</span>
          </div>
        </aside>
        <div className={styles.formPanel}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2>{title}</h2>
          <p className={styles.intro}>{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
