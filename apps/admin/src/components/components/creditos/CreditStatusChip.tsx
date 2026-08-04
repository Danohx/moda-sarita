import type { EstadoCredito } from "@admin/types/credito.types";
import styles from "../../../../styles/CreditStatusChip.module.css";

const LABELS: Record<EstadoCredito, string> = {
  ACTIVO: "Activo",
  EN_MORA: "En mora",
  LIQUIDADO: "Liquidado",
  INCUMPLIDO: "Incumplido",
  CANCELADO: "Cancelado",
};

export default function CreditStatusChip({ estado }: { estado: EstadoCredito }) {
  return (
    <span className={`${styles.chip} ${styles[`chip_${estado}`]}`}>
      {LABELS[estado] ?? estado}
    </span>
  );
}
