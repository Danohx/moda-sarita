import { Shirt } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./BrandLogo.module.css";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <Link
      className={styles.brand}
      to="/"
      aria-label="Ir al inicio de Moda Sarita"
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <Shirt size={compact ? 20 : 23} strokeWidth={2.15} />
      </span>

      <span className={compact ? styles.nameCompact : styles.name}>
        Moda Sarita
      </span>
    </Link>
  );
}
