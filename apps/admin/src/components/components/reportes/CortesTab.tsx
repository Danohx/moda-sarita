import type {
  CortesTabData,
  ReporteCorteDetalle,
  ReporteValor,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/CortesTab.module.css";

type CortesTabProps = {
  data: CortesTabData | null;
  loading: boolean;
};

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "SC";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Sin cierre";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDiferenciaClass(value: ReporteValor | undefined): string {
  const diferencia = toNumber(value);

  if (diferencia > 0) return styles.positive;
  if (diferencia < 0) return styles.negative;

  return styles.neutral;
}

function getDiferenciaHelper(value: ReporteValor | undefined): string {
  const diferencia = toNumber(value);

  if (diferencia > 0) return "Sobrante de efectivo";
  if (diferencia < 0) return "Faltante de efectivo";

  return "Sin diferencia";
}

function getDiferenciaBadge(value: ReporteValor | undefined): {
  label: string;
  className: string;
} {
  const diferencia = toNumber(value);

  if (diferencia > 0) {
    return {
      label: "Sobrante",
      className: `${styles.badge} ${styles.badgePositive}`,
    };
  }

  if (diferencia < 0) {
    return {
      label: "Faltante",
      className: `${styles.badge} ${styles.badgeNegative}`,
    };
  }

  return {
    label: "Cuadrado",
    className: `${styles.badge} ${styles.badgeNeutral}`,
  };
}

function getDuracionTurno(inicio: string, fin: string | null): string {
  if (!fin) {
    return "Turno abierto";
  }

  const inicioDate = new Date(inicio);
  const finDate = new Date(fin);

  if (Number.isNaN(inicioDate.getTime()) || Number.isNaN(finDate.getTime())) {
    return "No disponible";
  }

  const diffMs = finDate.getTime() - inicioDate.getTime();

  if (diffMs <= 0) {
    return "No disponible";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  return `${hours} h ${minutes} min`;
}

function CortesMetricCard({
  label,
  value,
  helper,
  toneClassName,
}: {
  label: string;
  value: string;
  helper: string;
  toneClassName?: string;
}) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <strong className={`${styles.metricValue} ${toneClassName ?? ""}`}>
        {value}
      </strong>
      <span className={styles.metricHelper}>{helper}</span>
    </article>
  );
}

function SummaryItem({
  label,
  value,
  toneClassName,
}: {
  label: string;
  value: string;
  toneClassName?: string;
}) {
  return (
    <article className={styles.summaryItem}>
      <p className={styles.summaryLabel}>{label}</p>
      <strong className={`${styles.summaryValue} ${toneClassName ?? ""}`}>
        {value}
      </strong>
    </article>
  );
}

function CortesDetalleTable({ cortes }: { cortes: ReporteCorteDetalle[] }) {
  if (cortes.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay cortes cerrados en este periodo.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Responsable</th>
            <th>Corte</th>
            <th>Inicio</th>
            <th>Cierre</th>
            <th>Duración</th>
            <th>Fondo inicial</th>
            <th>Total sistema</th>
            <th>Total real</th>
            <th>Diferencia</th>
            <th>Estado</th>
            <th>Observaciones</th>
          </tr>
        </thead>

        <tbody>
          {cortes.map((corte) => {
            const diferenciaBadge = getDiferenciaBadge(corte.diferencia);
            const diferenciaClass = getDiferenciaClass(corte.diferencia);

            return (
              <tr key={corte.corte_id}>
                <td>
                  <div className={styles.responsableCell}>
                    <div className={styles.avatar}>
                      {getInitials(corte.responsable)}
                    </div>

                    <div>
                      <span className={styles.responsableName}>
                        {corte.responsable}
                      </span>
                      <span className={styles.responsableMeta}>
                        {corte.usuario_id
                          ? `ID: ${corte.usuario_id.slice(0, 8)}`
                          : "Sin usuario"}
                      </span>
                    </div>
                  </div>
                </td>

                <td className={styles.tableStrong}>#{corte.corte_id}</td>

                <td>{formatDateTime(corte.inicio_turno)}</td>

                <td>{formatDateTime(corte.fin_turno)}</td>

                <td>{getDuracionTurno(corte.inicio_turno, corte.fin_turno)}</td>

                <td>{formatMoney(corte.fondo_inicial)}</td>

                <td className={styles.tableStrong}>
                  {formatMoney(corte.total_sistema)}
                </td>

                <td className={styles.tableStrong}>
                  {formatMoney(corte.total_real)}
                </td>

                <td className={diferenciaClass}>
                  {formatMoney(corte.diferencia)}
                </td>

                <td>
                  <span className={diferenciaBadge.className}>
                    {diferenciaBadge.label}
                  </span>
                </td>

                <td
                  className={styles.observaciones}
                  title={corte.observaciones ?? ""}
                >
                  {corte.observaciones ?? "Sin observaciones"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CortesTab({ data, loading }: CortesTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando cortes...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información de cortes.
      </div>
    );
  }

  const resumen = data.resumen;
  const diferenciaClass = getDiferenciaClass(resumen.diferencia_total);

  const totalSistema = toNumber(resumen.total_sistema);
  const totalReal = toNumber(resumen.total_real);
  const diferenciaTotal = toNumber(resumen.diferencia_total);

  const porcentajeDiferencia =
    totalSistema > 0 ? (Math.abs(diferenciaTotal) / totalSistema) * 100 : 0;

  return (
    <section className={styles.cortesTab}>
      <div className={styles.metricsGrid}>
        <CortesMetricCard
          label="Cortes cerrados"
          value={formatNumber(resumen.cortes_cerrados)}
          helper="Cortes finalizados en el periodo"
        />

        <CortesMetricCard
          label="Total sistema"
          value={formatMoney(resumen.total_sistema)}
          helper="Monto esperado por sistema"
        />

        <CortesMetricCard
          label="Total real"
          value={formatMoney(resumen.total_real)}
          helper="Monto contado al cierre"
        />

        <CortesMetricCard
          label="Diferencia total"
          value={formatMoney(resumen.diferencia_total)}
          helper={getDiferenciaHelper(resumen.diferencia_total)}
          toneClassName={diferenciaClass}
        />

        <CortesMetricCard
          label="Sobrantes"
          value={formatMoney(resumen.sobrantes)}
          helper="Diferencias positivas"
          toneClassName={styles.positive}
        />

        <CortesMetricCard
          label="Faltantes"
          value={formatMoney(resumen.faltantes)}
          helper="Diferencias negativas"
          toneClassName={styles.negative}
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Resumen de cortes</h3>
          <p className={styles.cardSubtitle}>
            Comparación entre el total esperado por sistema y el total contado.
          </p>
        </header>

        <div className={styles.cardBody}>
          <div className={styles.summaryStrip}>
            <SummaryItem
              label="Total sistema"
              value={formatMoney(totalSistema)}
            />

            <SummaryItem
              label="Total real"
              value={formatMoney(totalReal)}
            />

            <SummaryItem
              label="Diferencia"
              value={formatMoney(diferenciaTotal)}
              toneClassName={diferenciaClass}
            />

            <SummaryItem
              label="Variación"
              value={`${porcentajeDiferencia.toFixed(2)}%`}
              toneClassName={diferenciaClass}
            />
          </div>
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Detalle de cortes</h3>
          <p className={styles.cardSubtitle}>
            Cortes cerrados con responsable, totales, diferencias y observaciones.
          </p>
        </header>

        <div className={styles.cardBody}>
          <CortesDetalleTable cortes={data.detalle} />
        </div>
      </article>
    </section>
  );
}