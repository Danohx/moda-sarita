import type {
  FinancieroTabData,
  ReporteMetodoPago,
  ReporteValor,
} from "@admin/types/reportes.types";
import type { ReporteFinancieroCredito } from "@admin/types/credito.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/FinancieroTab.module.css";
import creditStyles from "../../../../styles/components/reportes/FinancieroCredito.module.css";

type Props = { data: FinancieroTabData | null; loading: boolean };

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function Metric({ label, value, helper, tone }: { label: string; value: string; helper: string; tone?: string }) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <strong className={`${styles.metricValue} ${tone || ""}`}>{value}</strong>
      <span className={styles.metricHelper}>{helper}</span>
    </article>
  );
}

function PaymentTable({ rows }: { rows: ReporteMetodoPago[] }) {
  if (!rows.length) return <div className={styles.emptyState}>Sin pagos confirmados.</div>;
  const total = rows.reduce((sum, row) => sum + toNumber(row.total), 0);
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead><tr><th>Método</th><th>Operaciones</th><th>Total</th><th>Participación</th></tr></thead>
        <tbody>{rows.map((row) => {
          const amount = toNumber(row.total);
          const percent = total > 0 ? (amount / total) * 100 : 0;
          return <tr key={row.metodo}><td>{row.metodo}</td><td>{formatNumber(row.pagos)}</td><td>{formatMoney(amount)}</td><td>{percent.toFixed(1)}%</td></tr>;
        })}</tbody>
      </table>
    </div>
  );
}

export default function FinancieroTab({ data, loading }: Props) {
  if (loading) return <div className={styles.loadingState}>Cargando información financiera...</div>;
  if (!data) return <div className={styles.emptyState}>No se pudo cargar el reporte financiero.</div>;

  const resumen = data.resumen as unknown as typeof data.resumen & ReporteFinancieroCredito;
  const diferenciaVentaCobro = Number(resumen.ventas_realizadas || 0) - Number(resumen.dinero_cobrado || 0);

  return (
    <section className={styles.financieroTab}>
      <div className={styles.metricsGrid}>
        <Metric label="Ventas realizadas" value={formatMoney(resumen.ventas_realizadas)} helper="Valor de pedidos no cancelados" />
        <Metric label="Dinero cobrado" value={formatMoney(resumen.dinero_cobrado)} helper="Pagos confirmados reales" />
        <Metric label="Monto financiado" value={formatMoney(resumen.monto_financiado)} helper="Capital otorgado a crédito" />
        <Metric label="Saldo pendiente" value={formatMoney(resumen.saldo_pendiente)} helper="Cartera actual por cobrar" />
        <Metric label="Saldo vencido" value={formatMoney(resumen.saldo_vencido)} helper="Cuotas vencidas no cubiertas" tone={Number(resumen.saldo_vencido) > 0 ? styles.negative : ""} />
        <Metric label="Cobranza de crédito" value={formatMoney(resumen.cobranza_credito)} helper="Enganches, abonos y liquidaciones" />
        <Metric label="Pagos confirmados" value={formatNumber((resumen as unknown as { pagos_confirmados?: number }).pagos_confirmados)} helper="Operaciones cobradas" />
        <Metric label="Diferencia venta/cobro" value={formatMoney(diferenciaVentaCobro)} helper="Incluye cartera y otros pendientes" />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Flujo del crédito</h3>
          <p className={styles.cardSubtitle}>Separación entre financiamiento concedido y efectivo realmente recibido.</p>
        </header>
        <div className={styles.cardBody}>
          <div className={creditStyles.flow}>
            <div><span>Enganches</span><strong>{formatMoney(resumen.enganches_credito)}</strong></div>
            <div><span>Abonos y liquidaciones</span><strong>{formatMoney(resumen.abonos_credito)}</strong></div>
            <div><span>Cobranza total</span><strong>{formatMoney(resumen.cobranza_credito)}</strong></div>
            <div><span>Financiado</span><strong>{formatMoney(resumen.monto_financiado)}</strong></div>
          </div>
          <p className={creditStyles.note}>
            El método CREDITO_TIENDA ya no representa un pago confirmado. El ingreso aparece cuando se recibe el enganche o un abono real.
          </p>
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Métodos de pago</h3>
          <p className={styles.cardSubtitle}>Distribución de dinero confirmado en el periodo.</p>
        </header>
        <div className={styles.cardBody}><PaymentTable rows={data.metodosPago} /></div>
      </article>
    </section>
  );
}
