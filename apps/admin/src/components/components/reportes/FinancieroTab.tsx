import type {
  FinancieroTabData,
  ReporteMetodoPago,
  ReporteValor,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/FinancieroTab.module.css";

type FinancieroTabProps = {
  data: FinancieroTabData | null;
  loading: boolean;
};

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
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

function getDiferenciaClass(value: ReporteValor | undefined): string {
  const diferencia = toNumber(value);

  if (diferencia > 0) return styles.positive;
  if (diferencia < 0) return styles.negative;

  return styles.neutral;
}

function getDiferenciaHelper(value: ReporteValor | undefined): string {
  const diferencia = toNumber(value);

  if (diferencia > 0) return "Sobrante acumulado en cortes";
  if (diferencia < 0) return "Faltante acumulado en cortes";

  return "Sin diferencia acumulada";
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function FinancieroMetricCard({
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

function MetodoPagoBars({ metodos }: { metodos: ReporteMetodoPago[] }) {
  if (metodos.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay pagos confirmados en este periodo.
      </div>
    );
  }

  const totalGeneral = metodos.reduce(
    (sum, metodo) => sum + toNumber(metodo.total),
    0,
  );

  return (
    <div className={styles.methodList}>
      {metodos.map((metodo) => {
        const total = toNumber(metodo.total);
        const porcentaje = totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;
        const operaciones = metodo.pagos ?? metodo.transacciones ?? 0;

        return (
          <article key={metodo.metodo} className={styles.methodItem}>
            <div className={styles.methodTop}>
              <span className={styles.methodName}>
                {getMetodoPagoLabel(metodo.metodo)}
              </span>

              <strong className={styles.methodAmount}>
                {formatMoney(metodo.total)}
              </strong>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${porcentaje}%` }}
              />
            </div>

            <div className={styles.methodMeta}>
              <span>{formatPercent(porcentaje)}</span>
              <span>{formatNumber(operaciones)} operaciones</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MetodosPagoTable({ metodos }: { metodos: ReporteMetodoPago[] }) {
  if (metodos.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay métodos de pago para mostrar.
      </div>
    );
  }

  const totalGeneral = metodos.reduce(
    (sum, metodo) => sum + toNumber(metodo.total),
    0,
  );

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Método</th>
            <th>Total</th>
            <th>Pagos</th>
            <th>Participación</th>
          </tr>
        </thead>

        <tbody>
          {metodos.map((metodo) => {
            const total = toNumber(metodo.total);
            const porcentaje =
              totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;
            const operaciones = metodo.pagos ?? metodo.transacciones ?? 0;

            return (
              <tr key={metodo.metodo}>
                <td>
                  <span className={styles.badge}>
                    {getMetodoPagoLabel(metodo.metodo)}
                  </span>
                </td>

                <td className={styles.tableStrong}>
                  {formatMoney(metodo.total)}
                </td>

                <td>{formatNumber(operaciones)}</td>

                <td>{formatPercent(porcentaje)}</td>
              </tr>
            );
          })}

          <tr>
            <td className={styles.tableStrong}>Total</td>
            <td className={styles.tableStrong}>{formatMoney(totalGeneral)}</td>
            <td className={styles.tableStrong}>
              {formatNumber(
                metodos.reduce(
                  (sum, metodo) =>
                    sum + toNumber(metodo.pagos ?? metodo.transacciones ?? 0),
                  0,
                ),
              )}
            </td>
            <td className={styles.tableStrong}>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function FinancieroTab({ data, loading }: FinancieroTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando financiero...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información financiera.
      </div>
    );
  }

  const resumen = data.resumen;
  const diferenciaClass = getDiferenciaClass(resumen.diferencia_cortes_total);

  const totalTarjetas =
    toNumber(resumen.tarjeta);

  const totalOtros =
    toNumber(resumen.otros);

  return (
    <section className={styles.financieroTab}>
      <div className={styles.metricsGrid}>
        <FinancieroMetricCard
          label="Ingresos confirmados"
          value={formatMoney(resumen.ingresos_confirmados)}
          helper="Pagos confirmados en el periodo"
          toneClassName={styles.positive}
        />

        <FinancieroMetricCard
          label="Pagos confirmados"
          value={formatNumber(resumen.pagos_confirmados)}
          helper="Número de pagos registrados"
        />

        <FinancieroMetricCard
          label="Efectivo"
          value={formatMoney(resumen.efectivo)}
          helper="Ingreso confirmado en efectivo"
        />

        <FinancieroMetricCard
          label="Tarjetas"
          value={formatMoney(totalTarjetas)}
          helper="Crédito y débito"
        />

        <FinancieroMetricCard
          label="Transferencias"
          value={formatMoney(resumen.transferencia)}
          helper="Pagos por transferencia"
        />

        <FinancieroMetricCard
          label="Crédito tienda"
          value={formatMoney(resumen.credito_tienda)}
          helper="Pagos registrados como crédito tienda"
        />

        <FinancieroMetricCard
          label="Otros"
          value={formatMoney(totalOtros)}
          helper="Otros métodos de pago"
        />

        <FinancieroMetricCard
          label="Cuentas por cobrar"
          value={formatMoney(resumen.cuentas_por_cobrar)}
          helper="Saldo deudor actual"
          toneClassName={styles.negative}
        />

        <FinancieroMetricCard
          label="Cortes cerrados"
          value={formatNumber(resumen.cortes_cerrados)}
          helper="Cortes cerrados en el periodo"
        />

        <FinancieroMetricCard
          label="Diferencia cortes"
          value={formatMoney(resumen.diferencia_cortes_total)}
          helper={getDiferenciaHelper(resumen.diferencia_cortes_total)}
          toneClassName={diferenciaClass}
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Resumen financiero</h3>
          <p className={styles.cardSubtitle}>
            Concentrado de ingresos confirmados, cuentas por cobrar y diferencias de cortes.
          </p>
        </header>

        <div className={styles.cardBody}>
          <div className={styles.summaryStrip}>
            <SummaryItem
              label="Ingresos"
              value={formatMoney(resumen.ingresos_confirmados)}
              toneClassName={styles.positive}
            />

            <SummaryItem
              label="Cuentas por cobrar"
              value={formatMoney(resumen.cuentas_por_cobrar)}
              toneClassName={styles.negative}
            />

            <SummaryItem
              label="Diferencia cortes"
              value={formatMoney(resumen.diferencia_cortes_total)}
              toneClassName={diferenciaClass}
            />

            <SummaryItem
              label="Cortes cerrados"
              value={formatNumber(resumen.cortes_cerrados)}
            />
          </div>
        </div>
      </article>

      <div className={styles.paymentGrid}>
        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Distribución de pagos</h3>
            <p className={styles.cardSubtitle}>
              Participación de cada método sobre los ingresos confirmados.
            </p>
          </header>

          <div className={styles.cardBody}>
            <MetodoPagoBars metodos={data.metodosPago} />
          </div>
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Métodos de pago</h3>
            <p className={styles.cardSubtitle}>
              Total cobrado, operaciones y participación por método.
            </p>
          </header>

          <div className={styles.cardBody}>
            <MetodosPagoTable metodos={data.metodosPago} />
          </div>
        </article>
      </div>
    </section>
  );
}