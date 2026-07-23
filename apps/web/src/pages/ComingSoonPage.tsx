import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./ComingSoonPage.module.css";

type ComingSoonPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ComingSoonPage({
  eyebrow,
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <section className={`${styles.section} container`}>
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          <Sparkles size={28} />
        </span>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
        <Link className="button button-primary" to="/">
          <ArrowLeft size={18} />
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
