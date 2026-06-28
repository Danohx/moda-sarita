import type {
  CreditoTabData,
  ReporteCuentaCobrar,
  ReporteValor,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/CreditoTab.module.css";

type CreditoTabProps = {
  data: CreditoTabData | null;
  loading: boolean;
};

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "CL";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function getUsoCredito(cliente: ReporteCuentaCobrar): number {
  const limite = toNumber(cliente.limite_credito);
  const saldo = toNumber(cliente.saldo_deudor);

  if (limite <= 0) {
    return saldo > 0 ? 100 : 0;
  }

  return Math.min((saldo / limite) * 100, 100);
}

function getEstadoCredito(cliente: ReporteCuentaCobrar): {
  label: string;
  className: string;
} {
  const uso = getUsoCredito(cliente);

  if (uso >= 90) {
    return {
      label: "Crítico",
      className: `${styles.badge} ${styles.badgeDanger}`,
    };
  }

  if (uso >= 60) {
    return {
      label: "Alto",
      className: `${styles.badge} ${styles.badgeWarning}`,
    };
  }

  return {
    label: "Controlado",
    className: `${styles.badge} ${styles.badgeOk}`,
  };
}

function CreditoMetricCard({
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

function CuentasCobrarTable({
  clientes,
}: {
  clientes: ReporteCuentaCobrar[];
}) {
  if (clientes.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay clientes con saldo deudor actualmente.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Límite crédito</th>
            <th>Saldo deudor</th>
            <th>Disponible</th>
            <th>Uso crédito</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cliente) => {
            const usoCredito = getUsoCredito(cliente);
            const estado = getEstadoCredito(cliente);

            return (
              <tr key={cliente.cliente_id}>
                <td>
                  <div className={styles.clientCell}>
                    <div className={styles.avatar}>
                      {getInitials(cliente.cliente)}
                    </div>

                    <div>
                      <span className={styles.clientName}>
                        {cliente.cliente}
                      </span>
                      <span className={styles.clientMeta}>
                        ID: {cliente.cliente_id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </td>

                <td>{cliente.telefono ?? "Sin teléfono"}</td>

                <td>{cliente.email ?? "Sin email"}</td>

                <td>{formatMoney(cliente.limite_credito)}</td>

                <td className={styles.debtText}>
                  {formatMoney(cliente.saldo_deudor)}
                </td>

                <td className={styles.availableText}>
                  {formatMoney(cliente.credito_disponible)}
                </td>

                <td className={styles.progressCell}>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${usoCredito}%` }}
                    />
                  </div>

                  <div className={styles.progressMeta}>
                    <span>{usoCredito.toFixed(1)}%</span>
                    <span>{formatMoney(cliente.saldo_deudor)}</span>
                  </div>
                </td>

                <td>
                  <span className={estado.className}>{estado.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CreditoTab({ data, loading }: CreditoTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando crédito...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información de crédito.
      </div>
    );
  }

  const resumen = data.resumen;
  const cuentas = data.cuentasCobrar;

  const totalSaldoDeudor = cuentas.reduce(
    (sum, cliente) => sum + toNumber(cliente.saldo_deudor),
    0,
  );

  const totalLimiteCredito = cuentas.reduce(
    (sum, cliente) => sum + toNumber(cliente.limite_credito),
    0,
  );

  const totalDisponible = cuentas.reduce(
    (sum, cliente) => sum + toNumber(cliente.credito_disponible),
    0,
  );

  const usoPromedio =
    totalLimiteCredito > 0 ? (totalSaldoDeudor / totalLimiteCredito) * 100 : 0;

  return (
    <section className={styles.creditoTab}>
      <div className={styles.metricsGrid}>
        <CreditoMetricCard
          label="Cuentas por cobrar"
          value={formatMoney(resumen.cuentas_por_cobrar)}
          helper="Saldo pendiente actual"
        />

        <CreditoMetricCard
          label="Clientes deudores"
          value={formatNumber(cuentas.length)}
          helper="Clientes con saldo pendiente"
        />

        <CreditoMetricCard
          label="Límite autorizado"
          value={formatMoney(totalLimiteCredito)}
          helper="Suma de límites de clientes deudores"
        />

        <CreditoMetricCard
          label="Crédito disponible"
          value={formatMoney(totalDisponible)}
          helper="Disponible de clientes con deuda"
        />

        <CreditoMetricCard
          label="Uso promedio"
          value={`${usoPromedio.toFixed(1)}%`}
          helper="Saldo deudor vs límite autorizado"
        />

        <CreditoMetricCard
          label="Pagos confirmados"
          value={formatNumber(resumen.pagos_confirmados)}
          helper="Pagos confirmados en el periodo"
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Resumen de crédito</h3>
          <p className={styles.cardSubtitle}>
            Vista rápida del saldo pendiente y capacidad de crédito de clientes.
          </p>
        </header>

        <div className={styles.cardBody}>
          <div className={styles.summaryStrip}>
            <SummaryItem
              label="Saldo deudor"
              value={formatMoney(totalSaldoDeudor)}
            />

            <SummaryItem
              label="Límite acumulado"
              value={formatMoney(totalLimiteCredito)}
            />

            <SummaryItem
              label="Disponible acumulado"
              value={formatMoney(totalDisponible)}
            />

            <SummaryItem
              label="Uso promedio"
              value={`${usoPromedio.toFixed(1)}%`}
            />
          </div>
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Cuentas por cobrar</h3>
          <p className={styles.cardSubtitle}>
            Clientes con saldo deudor, límite autorizado y crédito disponible.
          </p>
        </header>

        <div className={styles.cardBody}>
          <CuentasCobrarTable clientes={cuentas} />
        </div>
      </article>
    </section>
  );
}