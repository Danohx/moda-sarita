import { Link } from "react-router-dom";
import type { CreditoTabData } from "@admin/types/reportes.types";
import type {
  CreditoResumen,
  ReporteCreditoOperativo,
} from "@admin/types/credito.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import CreditStatusChip from "@admin/components/components/creditos/CreditStatusChip";
import styles from "../../../../styles/components/reportes/CreditoTab.module.css";
import creditStyles from "../../../../styles/components/reportes/CreditoTabCredito.module.css";

type Props = { data: CreditoTabData | null; loading: boolean };

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <strong className={styles.metricValue}>{value}</strong>
      <span className={styles.metricHelper}>{helper}</span>
    </article>
  );
}

function dateLabel(value?: string | null) {
  if (!value) return "Sin fecha";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString("es-MX");
}

function AccountsTable({ rows }: { rows: CreditoResumen[] }) {
  if (!rows.length) {
    return <div className={styles.emptyState}>No existen saldos pendientes.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Pedido</th>
            <th>Estado</th>
            <th>Financiado</th>
            <th>Saldo</th>
            <th>Vencido</th>
            <th>Próximo pago</th>
            <th>Origen</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.credito_id}>
              <td>
                <strong>{item.cliente_nombre}</strong>
                <span className={creditStyles.subtext}>
                  {item.telefono || "Sin teléfono"}
                </span>
              </td>
              <td>{item.pedido_folio ? `#${item.pedido_folio}` : "Legacy"}</td>
              <td><CreditStatusChip estado={item.estado} /></td>
              <td>{formatMoney(item.monto_financiado)}</td>
              <td className={creditStyles.strong}>{formatMoney(item.saldo_pendiente)}</td>
              <td className={Number(item.total_vencido) > 0 ? creditStyles.danger : ""}>
                {formatMoney(item.total_vencido)}
              </td>
              <td>
                {item.datos_calendario_completos ? (
                  <>
                    <span>{dateLabel(item.proximo_vencimiento)}</span>
                    <span className={creditStyles.subtext}>
                      {formatMoney(item.monto_proxima_cuota)}
                    </span>
                  </>
                ) : (
                  <span className={creditStyles.legacy}>Sin calendario</span>
                )}
              </td>
              <td>{item.origen}</td>
              <td><Link className={creditStyles.link} to={`/credits/${item.credito_id}`}>Detalle</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CreditoTab({ data, loading }: Props) {
  if (loading) return <div className={styles.loadingState}>Cargando crédito...</div>;
  if (!data) return <div className={styles.emptyState}>No se pudo cargar crédito.</div>;

  const operativo = data as unknown as ReporteCreditoOperativo;
  const resumen = operativo.resumen;
  const rows = operativo.cuentasCobrar || [];

  return (
    <section className={styles.creditoTab}>
      <div className={styles.metricsGrid}>
        <Metric label="Créditos activos" value={formatNumber(resumen.creditos_activos)} helper="Al corriente o pendientes" />
        <Metric label="En mora" value={formatNumber(resumen.creditos_en_mora)} helper="Con al menos una cuota vencida" />
        <Metric label="Incumplidos" value={formatNumber(resumen.creditos_incumplidos)} helper="Atraso grave configurado" />
        <Metric label="Saldo por cobrar" value={formatMoney(resumen.saldo_pendiente_total)} helper="Cartera actual" />
        <Metric label="Saldo vencido" value={formatMoney(resumen.saldo_vencido_total)} helper="Cuotas exigibles no cubiertas" />
        <Metric label="Financiado" value={formatMoney(resumen.monto_financiado_periodo)} helper="Créditos otorgados en el periodo" />
        <Metric label="Cobranza" value={formatMoney(resumen.cobranza_periodo)} helper="Enganches y abonos recibidos" />
        <Metric label="Cobranza / financiado" value={`${Number(resumen.tasa_recuperacion || 0).toFixed(1)}%`} helper="Indicador del periodo, no cohorte" />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Separación financiera</h3>
          <p className={styles.cardSubtitle}>
            Lo financiado no se cuenta como dinero cobrado. Solo enganches, abonos y liquidaciones confirmadas ingresan a caja.
          </p>
        </header>
        <div className={styles.cardBody}>
          <div className={creditStyles.strip}>
            <div><span>Enganches</span><strong>{formatMoney(resumen.enganches_periodo)}</strong></div>
            <div><span>Abonos</span><strong>{formatMoney(resumen.abonos_periodo)}</strong></div>
            <div><span>Liquidados</span><strong>{formatNumber(resumen.creditos_liquidados_periodo)}</strong></div>
            <div><span>Cuentas activas</span><strong>{formatNumber(rows.length)}</strong></div>
          </div>
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Cuentas por cobrar</h3>
          <p className={styles.cardSubtitle}>Créditos individuales ordenados por riesgo y vencimiento.</p>
        </header>
        <div className={styles.cardBody}><AccountsTable rows={rows} /></div>
      </article>
    </section>
  );
}
