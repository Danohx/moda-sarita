import type {
  ReporteMetodoPago,
  ReporteTendenciaVenta,
  ReporteValor,
  ReporteVentasEmpleado,
  VentasTabData,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/VentasTab.module.css";

type VentasTabProps = {
  data: VentasTabData | null;
  loading: boolean;
};

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
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

function getMetodoPagoLabel(metodo: string): string {
  const labels: Record<string, string> = {
    EFECTIVO: "Efectivo",
    TARJETA_CREDITO: "Tarjeta crédito",
    TARJETA_DEBITO: "Tarjeta débito",
    TRANSFERENCIA: "Transferencia",
    CREDITO_TIENDA: "Crédito tienda",
    PAYPAL: "PayPal",
    MERCADO_PAGO: "Mercado Pago",
  };

  return labels[metodo] ?? metodo;
}

function VentasMetricCard({
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

function VentasTrendChart({ data }: { data: ReporteTendenciaVenta[] }) {
  if (data.length === 0) {
    return (
      <div className={styles.chartEmpty}>
        No hay ventas registradas en este periodo.
      </div>
    );
  }

  // Con 1 solo punto no tiene sentido una línea — muestra tarjeta simple
  if (data.length === 1) {
    const item = data[0];
    return (
      <div className={styles.chartSinglePoint}>
        <span className={styles.chartSingleLabel}>
          {formatDateLabel(item.periodo)}
        </span>
        <strong className={styles.chartSingleValue}>
          {formatMoney(toNumber(item.ventas_totales))}
        </strong>
        <span className={styles.chartSingleHelper}>
          único registro en el periodo
        </span>
      </div>
    );
  }

  const W = 800,
    H = 240;
  const padL = 88,
    padR = 24,
    padT = 28,
    padB = 44;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const values = data.map((d) => toNumber(d.ventas_totales));
  const maxVal = Math.max(...values, 1);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    ratio: t,
    y: padT + chartH - t * chartH,
    label: formatMoney(t * maxVal),
  }));

  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - (toNumber(d.ventas_totales) / maxVal) * chartH,
    label: formatDateLabel(d.periodo),
    value: toNumber(d.ventas_totales),
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPath = [
    `M ${points[0].x} ${padT + chartH}`,
    ...points.map((p) => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${padT + chartH}`,
    "Z",
  ].join(" ");

  const step = Math.ceil(data.length / 7);
  const xLabels = points.filter(
    (_, i) => i % step === 0 || i === points.length - 1,
  );

  return (
    <div className={styles.chartBox}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Tendencia de ventas"
      >
        <defs>
          <linearGradient id="areaGradVentas" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary-vibrant)"
              stopOpacity="0.15"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary-vibrant)"
              stopOpacity="0.01"
            />
          </linearGradient>
        </defs>

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
              x={padL - 8}
              y={tick.y + 4}
              textAnchor="end"
              className={styles.chartLabel}
            >
              {tick.label}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#areaGradVentas)" />
        <polyline className={styles.chartLine} points={polyline} />

        {points.map((p) => (
          <circle
            key={`${p.label}-${p.x}`}
            className={styles.chartPoint}
            cx={p.x}
            cy={p.y}
            r="4"
          />
        ))}

        {xLabels.map((p) => (
          <text
            key={`xl-${p.x}`}
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            className={styles.chartLabel}
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function MetodosPagoTable({ data }: { data: ReporteMetodoPago[] }) {
  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay pagos confirmados en este periodo.
      </div>
    );
  }

  const totalGeneral = data.reduce(
    (accumulator, item) => accumulator + toNumber(item.total),
    0,
  );

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Método</th>
            <th>Total</th>
            <th>Operaciones</th>
            <th>Participación</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => {
            const total = toNumber(item.total);
            const operaciones = item.transacciones ?? item.pagos ?? 0;
            const porcentaje =
              totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;

            return (
              <tr key={item.metodo}>
                <td>
                  <span className={styles.badge}>
                    {getMetodoPagoLabel(item.metodo)}
                  </span>
                </td>
                <td className={styles.tableStrong}>{formatMoney(total)}</td>
                <td>{formatNumber(operaciones)}</td>
                <td>{formatPercent(porcentaje)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmpleadosTable({ data }: { data: ReporteVentasEmpleado[] }) {
  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay ventas asociadas a empleados en este periodo.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Ventas</th>
            <th>Productos</th>
            <th>Total vendido</th>
            <th>Ticket promedio</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.vendedor_id ?? item.vendedor}>
              <td className={styles.tableStrong}>{item.vendedor}</td>
              <td>{formatNumber(item.ventas)}</td>
              <td>{formatNumber(item.productos_vendidos)}</td>
              <td className={styles.tableStrong}>
                {formatMoney(item.total_vendido)}
              </td>
              <td>{formatMoney(item.ticket_promedio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function VentasTab({ data, loading }: VentasTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando ventas...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información de ventas.
      </div>
    );
  }

  const resumen = data.resumen;

  return (
    <section className={styles.ventasTab}>
      <div className={styles.metricsGrid}>
        <VentasMetricCard
          label="Ventas totales"
          value={formatMoney(resumen.ventas_totales)}
          helper="Total vendido en el periodo"
        />

        <VentasMetricCard
          label="Ingresos confirmados"
          value={formatMoney(resumen.ingresos_confirmados)}
          helper="Pagos confirmados"
        />

        <VentasMetricCard
          label="Transacciones"
          value={formatNumber(resumen.transacciones)}
          helper="Ventas registradas"
        />

        <VentasMetricCard
          label="Ticket promedio"
          value={formatMoney(resumen.ticket_promedio)}
          helper="Promedio por venta"
        />

        <VentasMetricCard
          label="Productos vendidos"
          value={formatNumber(resumen.productos_vendidos)}
          helper="Unidades vendidas"
        />

        <VentasMetricCard
          label="Descuentos"
          value={formatMoney(resumen.descuentos_totales)}
          helper="Total descontado"
        />

        <VentasMetricCard
          label="Costo de envío"
          value={formatMoney(resumen.costo_envio_total)}
          helper="Envíos cobrados"
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Tendencia de ventas</h3>
            <p className={styles.cardSubtitle}>
              Evolución del total vendido según el periodo seleccionado.
            </p>
          </div>
        </header>

        <VentasTrendChart data={data.tendencia} />
      </article>

      <div className={styles.tablesGrid}>
        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Métodos de pago</h3>
              <p className={styles.cardSubtitle}>
                Distribución de ingresos confirmados.
              </p>
            </div>
          </header>

          <MetodosPagoTable data={data.metodosPago} />
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Ventas por empleado</h3>
              <p className={styles.cardSubtitle}>
                Rendimiento del personal durante el periodo.
              </p>
            </div>
          </header>

          <EmpleadosTable data={data.empleados} />
        </article>
      </div>
    </section>
  );
}
