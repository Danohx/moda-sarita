import type {
  ApartadosTabData,
  ReporteApartadoDetalle,
  ReporteValor,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/ApartadosTab.module.css";

type ApartadosTabProps = {
  data: ApartadosTabData | null;
  loading: boolean;
};

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function getInitials(name: string | null): string {
  if (!name) return "CL";

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "CL";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function formatDate(value: string | null): string {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDaysUntil(dateValue: string | null): number | null {
  if (!dateValue) return null;

  const today = new Date();
  const target = new Date(`${dateValue.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  today.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getEstadoBadge(estado: string): {
  label: string;
  className: string;
} {
  const normalized = estado.toUpperCase();

  if (normalized === "ACTIVO") {
    return {
      label: "Activo",
      className: `${styles.badge} ${styles.badgeActive}`,
    };
  }

  if (normalized === "LIQUIDADO" || normalized === "PAGADO") {
    return {
      label: "Liquidado",
      className: `${styles.badge} ${styles.badgePaid}`,
    };
  }

  if (normalized === "CANCELADO") {
    return {
      label: "Cancelado",
      className: `${styles.badge} ${styles.badgeCanceled}`,
    };
  }

  if (normalized === "VENCIDO") {
    return {
      label: "Vencido",
      className: `${styles.badge} ${styles.badgeExpired}`,
    };
  }

  return {
    label: estado,
    className: `${styles.badge} ${styles.badgeNeutral}`,
  };
}

function getVencimientoInfo(item: ReporteApartadoDetalle): {
  label: string;
  className: string;
} {
  const estado = item.estado.toUpperCase();

  if (estado === "LIQUIDADO" || estado === "PAGADO") {
    return {
      label: "Liquidado",
      className: styles.dueOk,
    };
  }

  if (estado === "CANCELADO") {
    return {
      label: "Cancelado",
      className: styles.dueDanger,
    };
  }

  if (estado === "VENCIDO") {
    return {
      label: "Vencido",
      className: styles.dueDanger,
    };
  }

  const days = getDaysUntil(item.fecha_limite_apartado);

  if (days === null) {
    return {
      label: "Sin fecha límite",
      className: styles.dueWarning,
    };
  }

  if (days < 0) {
    return {
      label: `Venció hace ${Math.abs(days)} día(s)`,
      className: styles.dueDanger,
    };
  }

  if (days === 0) {
    return {
      label: "Vence hoy",
      className: styles.dueWarning,
    };
  }

  if (days <= 3) {
    return {
      label: `Vence en ${days} día(s)`,
      className: styles.dueWarning,
    };
  }

  return {
    label: `Vence en ${days} día(s)`,
    className: styles.dueOk,
  };
}

function getPagoPorcentaje(item: ReporteApartadoDetalle): number {
  const total = toNumber(item.total);
  const pagado = toNumber(item.total_pagado);

  if (total <= 0) return 0;

  return Math.min((pagado / total) * 100, 100);
}

function ApartadoMetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <strong className={styles.metricValue}>{value}</strong>
      <span className={styles.metricHelper}>{helper}</span>
    </article>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className={styles.summaryItem}>
      <p className={styles.summaryLabel}>{label}</p>
      <strong className={styles.summaryValue}>{value}</strong>
    </article>
  );
}

function ApartadosDetalleTable({
  apartados,
}: {
  apartados: ReporteApartadoDetalle[];
}) {
  if (apartados.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay apartados registrados en este periodo.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Folio</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Pagado</th>
            <th>Pendiente</th>
            <th>Avance</th>
            <th>Fecha límite</th>
            <th>Vencimiento</th>
            <th>Creado</th>
          </tr>
        </thead>

        <tbody>
          {apartados.map((apartado) => {
            const estadoBadge = getEstadoBadge(apartado.estado);
            const vencimiento = getVencimientoInfo(apartado);
            const pagoPorcentaje = getPagoPorcentaje(apartado);

            return (
              <tr key={apartado.pedido_id}>
                <td>
                  <div className={styles.clientCell}>
                    <div className={styles.avatar}>
                      {getInitials(apartado.cliente)}
                    </div>

                    <div>
                      <span className={styles.clientName}>
                        {apartado.cliente ?? "Cliente no registrado"}
                      </span>
                      <span className={styles.clientMeta}>
                        {apartado.telefono ?? "Sin teléfono"}
                      </span>
                    </div>
                  </div>
                </td>

                <td className={styles.tableStrong}>#{apartado.folio}</td>

                <td>
                  <span className={estadoBadge.className}>
                    {estadoBadge.label}
                  </span>
                </td>

                <td className={styles.tableStrong}>
                  {formatMoney(apartado.total)}
                </td>

                <td className={styles.paidText}>
                  {formatMoney(apartado.total_pagado)}
                </td>

                <td className={styles.pendingText}>
                  {formatMoney(apartado.saldo_pendiente)}
                </td>

                <td className={styles.progressCell}>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${pagoPorcentaje}%` }}
                    />
                  </div>

                  <div className={styles.progressMeta}>
                    <span>{pagoPorcentaje.toFixed(1)}%</span>
                    <span>{formatMoney(apartado.total_pagado)}</span>
                  </div>
                </td>

                <td>{formatDate(apartado.fecha_limite_apartado)}</td>

                <td className={vencimiento.className}>
                  {vencimiento.label}
                </td>

                <td>{formatDate(apartado.fecha_creacion)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ApartadosTab({ data, loading }: ApartadosTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando apartados...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información de apartados.
      </div>
    );
  }

  const resumen = data.resumen;

  const totalApartados =
    toNumber(resumen.apartados_activos) +
    toNumber(resumen.apartados_liquidados) +
    toNumber(resumen.apartados_cancelados) +
    toNumber(resumen.apartados_vencidos);

  const porcentajeCobrado =
    toNumber(resumen.total_apartado) > 0
      ? (toNumber(resumen.total_pagado) / toNumber(resumen.total_apartado)) *
        100
      : 0;

  return (
    <section className={styles.apartadosTab}>
      <div className={styles.metricsGrid}>
        <ApartadoMetricCard
          label="Apartados activos"
          value={formatNumber(resumen.apartados_activos)}
          helper="Apartados vigentes"
        />

        <ApartadoMetricCard
          label="Liquidados"
          value={formatNumber(resumen.apartados_liquidados)}
          helper="Apartados pagados completamente"
        />

        <ApartadoMetricCard
          label="Cancelados"
          value={formatNumber(resumen.apartados_cancelados)}
          helper="Apartados cancelados"
        />

        <ApartadoMetricCard
          label="Vencidos"
          value={formatNumber(resumen.apartados_vencidos)}
          helper="Apartados fuera de fecha límite"
        />

        <ApartadoMetricCard
          label="Total apartado"
          value={formatMoney(resumen.total_apartado)}
          helper="Monto total de apartados"
        />

        <ApartadoMetricCard
          label="Total pagado"
          value={formatMoney(resumen.total_pagado)}
          helper="Abonos confirmados"
        />

        <ApartadoMetricCard
          label="Saldo pendiente"
          value={formatMoney(resumen.saldo_pendiente)}
          helper="Monto pendiente por cobrar"
        />

        <ApartadoMetricCard
          label="Cobrado"
          value={`${porcentajeCobrado.toFixed(1)}%`}
          helper="Porcentaje pagado del total apartado"
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Resumen de apartados</h3>
          <p className={styles.cardSubtitle}>
            Estado general de los apartados y saldos pendientes.
          </p>
        </header>

        <div className={styles.cardBody}>
          <div className={styles.summaryStrip}>
            <SummaryItem
              label="Total registros"
              value={formatNumber(totalApartados)}
            />

            <SummaryItem
              label="Monto apartado"
              value={formatMoney(resumen.total_apartado)}
            />

            <SummaryItem
              label="Pagado"
              value={formatMoney(resumen.total_pagado)}
            />

            <SummaryItem
              label="Pendiente"
              value={formatMoney(resumen.saldo_pendiente)}
            />

            <SummaryItem
              label="Avance cobro"
              value={`${porcentajeCobrado.toFixed(1)}%`}
            />
          </div>
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Detalle de apartados</h3>
          <p className={styles.cardSubtitle}>
            Apartados con cliente, saldo pendiente y fecha límite.
          </p>
        </header>

        <div className={styles.cardBody}>
          <ApartadosDetalleTable apartados={data.detalle} />
        </div>
      </article>
    </section>
  );
}