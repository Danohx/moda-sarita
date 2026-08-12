import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileText,
  Package,
  ReceiptText,
  RefreshCw,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  cuentaApi,
  type CuentaCreditoCuota,
  type CuentaCreditoDetalle,
  type CuentaCreditoPago,
  type CuentaMovimientoCredito,
} from "@shared/api/cuenta.api";
import { toApiError } from "@shared/api/errors";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

const SECTION_PAGE_SIZE = 4;
const INSTALLMENT_PAGE_SIZE = 12;

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-MX", withTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" });
}

function cleanLabel(value?: string | null) {
  return String(value || "—").replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

export function CreditDetailPage() {
  const { creditId = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CuentaCreditoDetalle | null>(null);
  const [pagos, setPagos] = useState<CuentaCreditoPago[]>([]);
  const [movimientos, setMovimientos] = useState<CuentaMovimientoCredito[]>([]);
  const [pagosTotal, setPagosTotal] = useState(0);
  const [movimientosTotal, setMovimientosTotal] = useState(0);
  const [pagosHasMore, setPagosHasMore] = useState(false);
  const [movimientosHasMore, setMovimientosHasMore] = useState(false);
  const [cuotas, setCuotas] = useState<CuentaCreditoCuota[]>([]);
  const [cuotasTotal, setCuotasTotal] = useState(0);
  const [cuotasHasMore, setCuotasHasMore] = useState(false);
  const [showCuotas, setShowCuotas] = useState(false);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [loadingMore, setLoadingMore] = useState<"pagos" | "movimientos" | "cuotas" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      cuentaApi.getCreditoById(creditId),
      cuentaApi.getCreditoPagos(creditId, { limit: SECTION_PAGE_SIZE, offset: 0 }),
      cuentaApi.getCreditoMovimientos(creditId, { limit: SECTION_PAGE_SIZE, offset: 0 }),
    ])
      .then(([detailResponse, paymentsResponse, movementsResponse]) => {
        if (!active) return;
        setData(detailResponse.data);
        setPagos(paymentsResponse.data ?? []);
        setPagosTotal(paymentsResponse.pagination?.total ?? paymentsResponse.data.length);
        setPagosHasMore(Boolean(paymentsResponse.pagination?.hasMore));
        setMovimientos(movementsResponse.data ?? []);
        setMovimientosTotal(movementsResponse.pagination?.total ?? movementsResponse.data.length);
        setMovimientosHasMore(Boolean(movementsResponse.pagination?.hasMore));
      })
      .catch((cause) => { if (active) setError(toApiError(cause, "No se pudo cargar el crédito.").message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [creditId]);

  async function openInstallments() {
    setShowCuotas(true);
    if (cuotas.length > 0 || loadingCuotas) return;
    setLoadingCuotas(true);
    try {
      const response = await cuentaApi.getCreditoCuotas(creditId, { limit: INSTALLMENT_PAGE_SIZE, offset: 0 });
      setCuotas(response.data ?? []);
      setCuotasTotal(response.pagination?.total ?? response.data.length);
      setCuotasHasMore(Boolean(response.pagination?.hasMore));
    } catch (cause) {
      setError(toApiError(cause, "No se pudo cargar el calendario de cuotas.").message);
    } finally {
      setLoadingCuotas(false);
    }
  }

  async function loadMorePayments() {
    if (!pagosHasMore || loadingMore) return;
    setLoadingMore("pagos");
    try {
      const response = await cuentaApi.getCreditoPagos(creditId, { limit: SECTION_PAGE_SIZE, offset: pagos.length });
      setPagos((current) => [...current, ...(response.data ?? [])]);
      setPagosTotal(response.pagination?.total ?? pagosTotal);
      setPagosHasMore(Boolean(response.pagination?.hasMore));
    } finally { setLoadingMore(null); }
  }

  async function loadMoreMovements() {
    if (!movimientosHasMore || loadingMore) return;
    setLoadingMore("movimientos");
    try {
      const response = await cuentaApi.getCreditoMovimientos(creditId, { limit: SECTION_PAGE_SIZE, offset: movimientos.length });
      setMovimientos((current) => [...current, ...(response.data ?? [])]);
      setMovimientosTotal(response.pagination?.total ?? movimientosTotal);
      setMovimientosHasMore(Boolean(response.pagination?.hasMore));
    } finally { setLoadingMore(null); }
  }

  async function loadMoreInstallments() {
    if (!cuotasHasMore || loadingMore) return;
    setLoadingMore("cuotas");
    try {
      const response = await cuentaApi.getCreditoCuotas(creditId, { limit: INSTALLMENT_PAGE_SIZE, offset: cuotas.length });
      setCuotas((current) => [...current, ...(response.data ?? [])]);
      setCuotasTotal(response.pagination?.total ?? cuotasTotal);
      setCuotasHasMore(Boolean(response.pagination?.hasMore));
    } finally { setLoadingMore(null); }
  }

  const applicationsSorted = useMemo(() => (payment: CuentaCreditoPago) =>
    [...(payment.aplicaciones ?? [])].sort((a, b) => Number(a.numero_cuota ?? 9999) - Number(b.numero_cuota ?? 9999)), []);

  if (loading) return <div className={styles.creditLoading}><RefreshCw size={24} className={styles.spin} /><p>Cargando detalle del crédito...</p></div>;
  if (error && !data) return <section className={`${styles.card} ${styles.empty}`}><CreditCard size={36} /><h2>No pudimos cargar este crédito</h2><p>{error}</p><button className={styles.secondary} onClick={() => navigate(-1)}>Volver</button></section>;
  if (!data) return null;

  const { credito, pedido } = data;
  const orderFolio = credito.pedido_folio ?? pedido?.pedido.folio;

  return (
    <>
      <header className={styles.header}>
        <div><p>Mi crédito</p><h1>{orderFolio ? `Crédito del pedido #${orderFolio}` : "Detalle del crédito"}</h1></div>
        <span className={styles.badge}>{cleanLabel(credito.estado)}</span>
      </header>
      <Link className={styles.inlineBack} to="/mi-cuenta/credito"><ArrowLeft size={17} />Volver a Mi Crédito</Link>
      {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}

      <section className={`${styles.card} ${styles.creditDetailHero}`}>
        <div><span><CircleDollarSign size={22} /></span><small>Monto financiado</small><strong>{formatMoney(Number(credito.monto_financiado || 0))}</strong></div>
        <div><span><CreditCard size={22} /></span><small>Saldo pendiente</small><strong>{formatMoney(Number(credito.saldo_pendiente || 0))}</strong></div>
        <div><span><ReceiptText size={22} /></span><small>Enganche</small><strong>{formatMoney(Number(credito.enganche || 0))}</strong></div>
        <div><span><CalendarDays size={22} /></span><small>Plan</small><strong>{credito.numero_cuotas ?? "—"} cuota(s) · {cleanLabel(credito.frecuencia_pago)}</strong></div>
      </section>

      <div className={styles.detailGrid}>
        <div className={styles.creditDetailMain}>
          <section className={`${styles.card} ${styles.installmentPreview}`}>
            <div className={styles.sectionTitle}><div><p>Calendario</p><h2>Cuotas</h2></div><span>{credito.numero_cuotas ?? 0}</span></div>
            <p>El calendario se carga únicamente cuando lo consultas para mantener esta pantalla ligera.</p>
            <button className={styles.secondary} type="button" onClick={() => void openInstallments()}><CalendarDays size={17} />Ver calendario de cuotas</button>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}><div><p>Cobros</p><h2>Historial de pagos</h2></div><span>{pagosTotal}</span></div>
            {pagos.length === 0 ? <div className={styles.empty}><ReceiptText size={30} /><h2>Sin pagos registrados</h2></div> : (
              <div className={styles.paymentList}>{pagos.map((pago) => <article key={pago.id} className={styles.paymentItem}><div className={styles.paymentIcon}><ReceiptText size={19} /></div><div><strong>{cleanLabel(pago.concepto)}</strong><p>{formatDate(pago.fecha_pago, true)} · {cleanLabel(pago.metodo)} · {cleanLabel(pago.estado)}</p>{pago.referencia_externa && <small>Referencia: {pago.referencia_externa}</small>}{(pago.aplicaciones?.length ?? 0) > 0 && <div className={styles.paymentApplications}>{applicationsSorted(pago).map((application) => <span key={application.aplicacion_id || `${pago.id}-${application.cuota_id}`}>Cuota {application.numero_cuota ?? "—"}: {formatMoney(Number(application.monto_aplicado))}</span>)}</div>}</div><strong>{formatMoney(Number(pago.monto))}</strong></article>)}</div>
            )}
            {pagosHasMore && <button className={styles.loadMoreButton} type="button" disabled={Boolean(loadingMore)} onClick={() => void loadMorePayments()}>{loadingMore === "pagos" ? "Cargando..." : "Ver más pagos"}</button>}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}><div><p>Auditoría financiera</p><h2>Movimientos</h2></div><span>{movimientosTotal}</span></div>
            {movimientos.length === 0 ? <div className={styles.empty}><FileText size={30} /><h2>Sin movimientos</h2></div> : <div className={styles.creditMovementList}>{movimientos.map((movement) => <article key={movement.id} className={styles.creditMovementCompact}><div><strong>{cleanLabel(movement.tipo)}</strong><span>{formatDate(movement.fecha, true)}</span><p>{movement.descripcion}</p></div><div><strong>{Number(movement.monto) > 0 ? "+" : ""}{formatMoney(Number(movement.monto))}</strong><span>{formatMoney(Number(movement.saldo_resultante ?? movement.saldoResultante ?? 0))} saldo</span></div></article>)}</div>}
            {movimientosHasMore && <button className={styles.loadMoreButton} type="button" disabled={Boolean(loadingMore)} onClick={() => void loadMoreMovements()}>{loadingMore === "movimientos" ? "Cargando..." : "Ver más movimientos"}</button>}
          </section>
        </div>

        <aside>
          <section className={styles.card}><h2>Condiciones</h2><div className={styles.meta}>
            <div><CalendarDays size={18} /><span><strong>Otorgado</strong>{formatDate(credito.fecha_otorgamiento)}</span></div>
            <div><CalendarDays size={18} /><span><strong>Primer vencimiento</strong>{formatDate(credito.fecha_primer_vencimiento)}</span></div>
            <div><CalendarDays size={18} /><span><strong>Vencimiento final</strong>{formatDate(credito.fecha_vencimiento_final)}</span></div>
            <div><ReceiptText size={18} /><span><strong>Cuotas vencidas</strong>{Number(credito.cuotas_vencidas || 0)} · {formatMoney(Number(credito.total_vencido || 0))}</span></div>
          </div></section>
          {credito.pedido_id && <Link className={`${styles.card} ${styles.relatedOrder}`} to={`/mi-cuenta/pedidos/${credito.pedido_id}`}><Package size={21} /><div><small>Compra relacionada</small><strong>{orderFolio ? `Pedido #${orderFolio}` : "Ver pedido"}</strong><span>Productos, pago y entrega</span></div></Link>}
          <section className={`${styles.card} ${styles.readOnlyNotice}`}><FileText size={20} /><div><strong>Consulta de solo lectura</strong><p>Los abonos y ajustes de crédito se realizan en la boutique y quedan registrados aquí automáticamente.</p></div></section>
        </aside>
      </div>

      {showCuotas && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCuotas(false); }}>
        <section className={styles.installmentModal} role="dialog" aria-modal="true" aria-labelledby="installment-title">
          <header><div><p>Calendario</p><h2 id="installment-title">Cuotas del crédito</h2><span>{cuotasTotal || credito.numero_cuotas || 0} cuota(s)</span></div><button type="button" onClick={() => setShowCuotas(false)} aria-label="Cerrar"><X size={20} /></button></header>
          {loadingCuotas ? <div className={styles.creditLoading}><RefreshCw size={22} className={styles.spin} /><p>Cargando cuotas...</p></div> : cuotas.length === 0 ? <div className={styles.empty}><CalendarDays size={30} /><h2>Sin calendario disponible</h2></div> : <div className={styles.modalTableWrap}><table className={styles.table}><thead><tr><th>#</th><th>Vencimiento</th><th>Programado</th><th>Pagado</th><th>Pendiente</th><th>Estado</th></tr></thead><tbody>{cuotas.map((cuota) => <tr key={cuota.id}><td><strong>{cuota.numero_cuota}</strong></td><td>{formatDate(cuota.fecha_vencimiento)}</td><td>{formatMoney(Number(cuota.monto_programado))}</td><td>{formatMoney(Number(cuota.monto_pagado))}</td><td>{formatMoney(Number(cuota.saldo_pendiente))}</td><td><span className={styles.badge}>{cleanLabel(cuota.estado)}</span></td></tr>)}</tbody></table></div>}
          {cuotasHasMore && <button className={styles.loadMoreButton} type="button" disabled={Boolean(loadingMore)} onClick={() => void loadMoreInstallments()}>{loadingMore === "cuotas" ? "Cargando..." : "Ver más cuotas"}</button>}
        </section>
      </div>}
    </>
  );
}
