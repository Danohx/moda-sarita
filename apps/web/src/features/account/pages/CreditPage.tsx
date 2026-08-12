import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  History,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  cuentaApi,
  type CuentaCredito,
  type CuentaCreditoResumenGlobal,
  type CuentaMovimientoCredito,
} from "@shared/api/cuenta.api";
import { isApiError } from "@shared/api/errors";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

const MOVEMENT_PAGE_SIZE = 5;
const CREDIT_PAGE_SIZE = 3;

const STATUS_LABELS: Record<string, string> = {
  SIN_CREDITO: "No habilitado",
  SIN_ADEUDO: "Sin adeudo",
  AL_CORRIENTE: "Al corriente",
  EN_MORA: "En mora",
  INCUMPLIDO: "Incumplido",
  AL_LIMITE: "Límite alcanzado",
  ACTIVO: "Activo",
  LIQUIDADO: "Liquidado",
  CANCELADO: "Cancelado",
};

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "Sin registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin registro";
  return date.toLocaleString("es-MX", withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" });
}

function movementLabel(type: string) {
  const normalized = type.toUpperCase();
  if (normalized === "COMPRA") return "Compra a crédito";
  if (normalized === "ABONO") return "Abono";
  return "Ajuste";
}

function creditReference(credit: CuentaCredito) {
  return credit.pedido_folio ? `Pedido #${credit.pedido_folio}` : `Crédito ${credit.credito_id.slice(0, 8)}`;
}

export function CreditPage() {
  const [credito, setCredito] = useState<CuentaCreditoResumenGlobal | null>(null);
  const [creditos, setCreditos] = useState<CuentaCredito[]>([]);
  const [totalCreditos, setTotalCreditos] = useState(0);
  const [hasMoreCreditos, setHasMoreCreditos] = useState(false);
  const [loadingMoreCreditos, setLoadingMoreCreditos] = useState(false);
  const [movimientos, setMovimientos] = useState<CuentaMovimientoCredito[]>([]);
  const [totalMovimientos, setTotalMovimientos] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCredit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryResponse, creditsResponse, movementsResponse] = await Promise.all([
        cuentaApi.getCredito(),
        cuentaApi.getCreditos({ limit: CREDIT_PAGE_SIZE, offset: 0 }),
        cuentaApi.getMovimientosCredito({ limit: MOVEMENT_PAGE_SIZE, offset: 0 }),
      ]);

      setCredito(summaryResponse.data);
      setCreditos(creditsResponse.data.items ?? []);
      setTotalCreditos(Number(creditsResponse.data.total ?? creditsResponse.data.items?.length ?? 0));
      setHasMoreCreditos(Boolean(creditsResponse.data.hasMore));
      setMovimientos(movementsResponse.data ?? []);
      setTotalMovimientos(movementsResponse.pagination?.total ?? movementsResponse.data.length);
      setHasMore(Boolean(movementsResponse.pagination?.hasMore));
    } catch (requestError) {
      setError(isApiError(requestError) ? requestError.message : "No se pudo consultar tu información de crédito.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCredit(); }, [loadCredit]);

  const usedPercent = useMemo(
    () => Math.min(Math.max(Number(credito?.porcentaje_utilizado ?? 0), 0), 100),
    [credito?.porcentaje_utilizado],
  );

  async function loadMoreCredits() {
    if (!hasMoreCreditos || loadingMoreCreditos) return;
    setLoadingMoreCreditos(true);
    setError(null);
    try {
      const response = await cuentaApi.getCreditos({
        limit: CREDIT_PAGE_SIZE,
        offset: creditos.length,
      });
      setCreditos((current) => [...current, ...(response.data.items ?? [])]);
      setTotalCreditos(Number(response.data.total ?? totalCreditos));
      setHasMoreCreditos(Boolean(response.data.hasMore));
    } catch (requestError) {
      setError(isApiError(requestError) ? requestError.message : "No se pudieron cargar más créditos.");
    } finally {
      setLoadingMoreCreditos(false);
    }
  }

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const response = await cuentaApi.getMovimientosCredito({ limit: MOVEMENT_PAGE_SIZE, offset: movimientos.length });
      setMovimientos((current) => [...current, ...(response.data ?? [])]);
      setTotalMovimientos(response.pagination?.total ?? totalMovimientos);
      setHasMore(Boolean(response.pagination?.hasMore));
    } catch (requestError) {
      setError(isApiError(requestError) ? requestError.message : "No se pudieron cargar más movimientos.");
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return <div className={styles.creditLoading} role="status"><RefreshCw size={24} className={styles.spin} /><p>Consultando tu crédito...</p></div>;
  }

  if (!credito) {
    return <section className={`${styles.card} ${styles.creditError}`}><CreditCard size={36} /><h1>No pudimos mostrar tu crédito</h1><p>{error || "Intenta nuevamente en unos momentos."}</p><button className={styles.primary} onClick={() => void loadCredit()}><RefreshCw size={17} />Reintentar</button></section>;
  }

  const hasOverdue = credito.cuotas_vencidas > 0 || credito.creditos_en_mora > 0 || credito.creditos_incumplidos > 0;

  return (
    <>
      <header className={`${styles.header} ${styles.accountTitleStack}`}>
        <div>
          <p>Mi cuenta</p>
          <h1>Mi crédito Sarita</h1>
          <span className={styles.accountSubtitle}>Información financiera de solo lectura. Los abonos se registran directamente en la boutique.</span>
        </div>
      </header>

      {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}

      <section className={`${styles.card} ${styles.creditHero}`}>
        <div className={styles.creditHeroTop}>
          <div>
            <span className={`${styles.creditStatus} ${styles[`creditStatus_${credito.estado}`] ?? ""}`}>{STATUS_LABELS[credito.estado] || credito.estado}</span>
            <h2>{credito.habilitado ? "Consulta tu línea, próximos vencimientos y el detalle de cada financiamiento." : "Tu cuenta todavía no tiene una línea de crédito habilitada."}</h2>
          </div>
          <span className={styles.creditHeroIcon}><CreditCard size={30} /></span>
        </div>
        <div className={styles.creditAmounts}>
          <div><small>Límite autorizado</small><strong>{formatMoney(credito.limite_credito)}</strong></div>
          <div><small>Saldo utilizado</small><strong>{formatMoney(credito.saldo_deudor)}</strong></div>
          <div><small>Crédito disponible</small><strong>{formatMoney(credito.credito_disponible)}</strong></div>
        </div>
        <div className={styles.creditProgressBlock}>
          <div><span>Uso de la línea</span><strong>{Number(credito.porcentaje_utilizado || 0).toFixed(1)}%</strong></div>
          <div className={styles.creditProgress} role="progressbar" aria-valuenow={usedPercent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${usedPercent}%` }} /></div>
        </div>
      </section>

      <div className={styles.creditInfoGrid}>
        <section className={`${styles.card} ${styles.creditInfoCard}`}><span><CalendarClock size={22} /></span><div><small>Próximo pago</small><strong>{credito.proxima_fecha_pago ? `${formatDate(credito.proxima_fecha_pago)} · ${formatMoney(credito.monto_proximo_pago || 0)}` : "Sin pago próximo"}</strong></div></section>
        <section className={`${styles.card} ${styles.creditInfoCard}`}><span><ReceiptText size={22} /></span><div><small>Créditos activos</small><strong>{credito.creditos_activos}</strong></div></section>
        <section className={`${styles.card} ${styles.creditInfoCard}`}><span>{hasOverdue ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}</span><div><small>Vencido</small><strong>{credito.cuotas_vencidas} cuota(s) · {formatMoney(credito.total_vencido)}</strong></div></section>
      </div>

      <section className={`${styles.card} ${styles.creditSection}`}>
        <div className={styles.creditHistoryHeader}>
          <div><p>Financiamientos</p><h2>Mis créditos</h2></div>
          <span>{totalCreditos} {totalCreditos === 1 ? "crédito" : "créditos"}</span>
        </div>
        {creditos.length === 0 ? (
          <div className={styles.empty}><CircleDollarSign size={34} /><h2>No hay créditos individuales registrados</h2><p>{credito.habilitado ? "Cuando una compra financiada sea registrada, aparecerá aquí con sus cuotas y pagos." : "La boutique debe habilitar una línea de crédito para tu cuenta."}</p></div>
        ) : (
          <div className={styles.creditList}>
            {creditos.map((item) => (
              <Link key={item.credito_id} className={styles.creditListItem} to={`/mi-cuenta/credito/${item.credito_id}`}>
                <div>
                  <div className={styles.creditListTitle}><strong>{creditReference(item)}</strong><span className={styles.badge}>{STATUS_LABELS[item.estado] || item.estado}</span></div>
                  <p>{formatDate(item.fecha_otorgamiento)} · {item.frecuencia_pago || "Sin frecuencia"} · {item.numero_cuotas ?? "—"} cuota(s)</p>
                </div>
                <div className={styles.creditListAmounts}><small>Saldo pendiente</small><strong>{formatMoney(Number(item.saldo_pendiente || 0))}</strong><span>Ver detalle</span></div>
              </Link>
            ))}
          </div>
        )}
        {hasMoreCreditos && <button className={styles.loadMoreButton} type="button" disabled={loadingMoreCreditos} onClick={() => void loadMoreCredits()}>{loadingMoreCreditos && <RefreshCw size={16} className={styles.spin} />}{loadingMoreCreditos ? "Cargando..." : "Ver más créditos"}</button>}
      </section>

      <section className={`${styles.card} ${styles.creditHistory}`}>
        <div className={styles.creditHistoryHeader}><div><p>Estado de cuenta</p><h2>Movimientos de crédito</h2></div><span>{totalMovimientos} {totalMovimientos === 1 ? "movimiento" : "movimientos"}</span></div>
        {movimientos.length === 0 ? <div className={styles.empty}><History size={34} /><h2>Aún no hay movimientos</h2></div> : (
          <div className={styles.creditMovementList}>
            {movimientos.map((movement) => {
              const type = String(movement.tipo).toUpperCase();
              const amount = Number(movement.monto || 0);
              return <article className={styles.creditMovement} key={movement.id}>
                <span className={`${styles.movementIcon} ${type === "COMPRA" ? styles.movementPurchase : type === "ABONO" ? styles.movementPayment : styles.movementAdjustment}`}><ReceiptText size={19} /></span>
                <div className={styles.movementMain}><div><strong>{movementLabel(type)}</strong><span>{formatDate(movement.fecha, true)}</span></div><p>{movement.descripcion}</p><div className={styles.movementMeta}>{movement.pedido_folio && <span>Pedido #{movement.pedido_folio}</span>}{movement.metodo_pago && <span>{movement.metodo_pago.replaceAll("_", " ")}</span>}{movement.referencia_externa && <span>Ref. {movement.referencia_externa}</span>}{movement.credito_id && <Link to={`/mi-cuenta/credito/${movement.credito_id}`}>Ver crédito</Link>}</div></div>
                <div className={styles.movementAmount}><strong className={amount < 0 ? styles.amountNegative : styles.amountPositive}>{amount > 0 ? "+" : ""}{formatMoney(amount)}</strong><span>Saldo: {formatMoney(Number(movement.saldoResultante ?? movement.saldo_resultante ?? 0))}</span></div>
              </article>;
            })}
          </div>
        )}
        {hasMore && <button className={styles.creditLoadMore} type="button" disabled={loadingMore} onClick={() => void loadMore()}>{loadingMore ? <RefreshCw size={16} className={styles.spin} /> : null}{loadingMore ? "Cargando..." : "Ver más movimientos"}</button>}
      </section>
    </>
  );
}
