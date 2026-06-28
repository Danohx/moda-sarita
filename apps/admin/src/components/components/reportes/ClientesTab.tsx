import type {
  ClientesTabData,
  ReporteClienteFrecuente,
  ReporteClienteTendencia,
  ReporteValor,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/ClientesTab.module.css";

type ClientesTabProps = {
  data: ClientesTabData | null;
  loading: boolean;
};

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Mexico_City",
  }).format(date);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Sin registro";
  }

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

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "CL";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function ClientesMetricCard({
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

function ClientesNuevosChart({ data }: { data: ReporteClienteTendencia[] }) {
  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay clientes nuevos en este periodo.
      </div>
    );
  }

  // Pocos datos — muestra lista simple en lugar de gráfica horrible
  if (data.length <= 2) {
    const total = data.reduce((s, d) => s + toNumber(d.clientes_nuevos), 0);
    return (
      <div className={styles.chartSinglePoint}>
        <span className={styles.chartSingleLabel}>
          Clientes nuevos en el periodo
        </span>
        <strong className={styles.chartSingleValue}>
          {formatNumber(total)}
        </strong>
        <div className={styles.chartSingleBreakdown}>
          {data.map((d) => (
            <span key={d.periodo} className={styles.chartSingleItem}>
              <b>{formatDateLabel(d.periodo)}</b>:{" "}
              {formatNumber(d.clientes_nuevos)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const W = 800,
    H = 240;
  const padL = 48,
    padR = 24,
    padT = 28,
    padB = 44;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const values = data.map((d) => toNumber(d.clientes_nuevos));
  const maxVal = Math.max(...values, 1);

  // Eje Y con valores enteros
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    ratio: t,
    y: padT + chartH - t * chartH,
    label: Math.round(t * maxVal).toString(),
  }));

  const gap = Math.max(3, Math.min(10, chartW / data.length / 5));
  const barW = Math.max(6, (chartW - gap * (data.length - 1)) / data.length);

  const bars = data.map((d, i) => {
    const ratio = toNumber(d.clientes_nuevos) / maxVal;
    // Limita la altura máxima al 90% del área para que nunca tape todo
    const barH = ratio * chartH * 0.9;
    return {
      x: padL + i * (barW + gap),
      y: padT + chartH - barH,
      h: barH,
      label: formatDateLabel(d.periodo),
      value: toNumber(d.clientes_nuevos),
    };
  });

  const step = Math.ceil(data.length / 7);
  const xLabels = bars.filter(
    (_, i) => i % step === 0 || i === bars.length - 1,
  );

  return (
    <div className={styles.chartBox}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Clientes nuevos"
      >
        {yTicks.map((tick) => (
          <g key={tick.ratio}>
            <line
              x1={padL}
              y1={tick.y}
              x2={W - padR}
              y2={tick.y}
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray={tick.ratio === 0 ? "none" : "4 4"}
            />
            <text
              x={padL - 6}
              y={tick.y + 4}
              textAnchor="end"
              className={styles.chartLabel}
            >
              {tick.label}
            </text>
          </g>
        ))}

        {bars.map((bar, i) => (
          <rect
            key={`${bar.label}-${i}`}
            x={bar.x}
            y={bar.h < 2 ? padT + chartH - 2 : bar.y}
            width={barW}
            height={Math.max(bar.h, 2)}
            rx="5"
            fill="var(--color-primary-vibrant)"
            opacity={i % 2 === 0 ? "0.85" : "0.55"}
          />
        ))}

        {data.length <= 12
          ? bars.map((bar, i) =>
              bar.value > 0 ? (
                <text
                  key={`v-${i}`}
                  x={bar.x + barW / 2}
                  y={bar.y - 6}
                  textAnchor="middle"
                  className={styles.chartValue}
                >
                  {bar.value}
                </text>
              ) : null,
            )
          : null}

        {xLabels.map((bar) => (
          <text
            key={`xl-${bar.x}`}
            x={bar.x + barW / 2}
            y={H - 6}
            textAnchor="middle"
            className={styles.chartLabel}
          >
            {bar.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function ClientesFrecuentesTable({
  clients,
}: {
  clients: ReporteClienteFrecuente[];
}) {
  if (clients.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay clientes con compras registradas en este periodo.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Compras</th>
            <th>Total comprado</th>
            <th>Última compra</th>
            <th>Promedio</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => {
            const compras = toNumber(client.compras);
            const totalComprado = toNumber(client.total_comprado);
            const promedio = compras > 0 ? totalComprado / compras : 0;

            return (
              <tr key={client.cliente_id}>
                <td>
                  <div className={styles.clientCell}>
                    <div className={styles.avatar}>
                      {getInitials(client.cliente)}
                    </div>

                    <div>
                      <span className={styles.clientName}>
                        {client.cliente}
                      </span>
                      <span className={styles.clientMeta}>
                        ID: {client.cliente_id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className={styles.badge}>
                    {formatNumber(client.compras)}
                  </span>
                </td>

                <td className={styles.tableStrong}>
                  {formatMoney(client.total_comprado)}
                </td>

                <td>{formatDateTime(client.ultima_compra)}</td>

                <td>{formatMoney(promedio)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ClientesTab({ data, loading }: ClientesTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando clientes...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información de clientes.
      </div>
    );
  }

  const resumen = data.resumen;

  return (
    <section className={styles.clientesTab}>
      <div className={styles.metricsGrid}>
        <ClientesMetricCard
          label="Total clientes"
          value={formatNumber(resumen.total_clientes)}
          helper="Clientes registrados"
        />

        <ClientesMetricCard
          label="Clientes activos"
          value={formatNumber(resumen.clientes_activos)}
          helper="Clientes disponibles para operación"
        />

        <ClientesMetricCard
          label="Clientes nuevos"
          value={formatNumber(resumen.clientes_nuevos)}
          helper="Registrados en el periodo"
        />

        <ClientesMetricCard
          label="Con crédito"
          value={formatNumber(resumen.clientes_con_credito)}
          helper="Clientes con crédito habilitado"
        />

        <ClientesMetricCard
          label="Con saldo deudor"
          value={formatNumber(resumen.clientes_con_saldo_deudor)}
          helper="Clientes con adeudo pendiente"
        />

        <ClientesMetricCard
          label="Saldo deudor total"
          value={formatMoney(resumen.saldo_deudor_total)}
          helper="Cuentas por cobrar actuales"
        />

        <ClientesMetricCard
          label="Compraron en periodo"
          value={formatNumber(resumen.clientes_con_compras_periodo)}
          helper="Clientes con ventas registradas"
        />

        <ClientesMetricCard
          label="Apartados activos"
          value={formatNumber(resumen.clientes_con_apartados_activos)}
          helper="Clientes con apartados vigentes"
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Clientes nuevos</h3>
          <p className={styles.cardSubtitle}>
            Altas de clientes agrupadas por el periodo seleccionado.
          </p>
        </header>

        <div className={styles.cardBody}>
          <ClientesNuevosChart data={data.tendencia} />
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Clientes frecuentes</h3>
          <p className={styles.cardSubtitle}>
            Clientes con mayor monto comprado dentro del periodo seleccionado.
          </p>
        </header>

        <div className={styles.cardBody}>
          <ClientesFrecuentesTable clients={data.frecuentes} />
        </div>
      </article>
    </section>
  );
}
