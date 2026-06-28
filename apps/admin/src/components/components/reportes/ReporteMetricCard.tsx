import type { ReactNode } from "react";
import styles from "../../../../styles/AdminReports.module.css";

type ReporteMetricCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

export default function ReporteMetricCard({
  title,
  value,
  helper,
  icon,
}: ReporteMetricCardProps) {
  return (
    <article className={styles.summaryCard}>
      <div className={styles.summaryIcon}>{icon ?? "•"}</div>

      <div className={styles.summaryContent}>
        <p className={styles.summaryLabel}>{title}</p>
        <strong className={styles.summaryValue}>{value}</strong>

        {helper ? <span className={styles.summaryHelper}>{helper}</span> : null}
      </div>
    </article>
  );
}