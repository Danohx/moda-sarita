import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Landmark,
  Package,
  ReceiptText,
  RefreshCw,
  WalletCards,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  cuentaApi,
  type CuentaCreditoCuota,
  type CuentaCreditoDetalle,
  type CuentaCreditoPago,
  type CuentaMovimientoCredito,
  type CuentaPagoTransferenciaResult,
} from "@shared/api/cuenta.api";
import { toApiError } from "@shared/api/errors";
import {
  configuracionApi,
  type MetodoPagoConfig,
} from "@shared/api/configuracion.api";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

const SECTION_PAGE_SIZE = 4;
const INSTALLMENT_PAGE_SIZE = 12;

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(
    "es-MX",
    withTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" },
  );
}

function cleanLabel(value?: string | null) {
  return String(value || "—")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function configLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function publicConfigEntries(config?: Record<string, unknown> | null) {
  if (!config) return [];
  return Object.entries(config).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      ["string", "number", "boolean"].includes(typeof value),
  );
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
  const [loadingMore, setLoadingMore] = useState<
    "pagos" | "movimientos" | "cuotas" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethods, setPaymentMethods] = useState<MetodoPagoConfig[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] =
    useState<CuentaPagoTransferenciaResult | null>(null);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      cuentaApi.getCreditoById(creditId),
      cuentaApi.getCreditoPagos(creditId, {
        limit: SECTION_PAGE_SIZE,
        offset: 0,
      }),
      cuentaApi.getCreditoMovimientos(creditId, {
        limit: SECTION_PAGE_SIZE,
        offset: 0,
      }),
    ])
      .then(([detailResponse, paymentsResponse, movementsResponse]) => {
        if (!active) return;
        setData(detailResponse.data);
        setPagos(paymentsResponse.data ?? []);
        setPagosTotal(
          paymentsResponse.pagination?.total ?? paymentsResponse.data.length,
        );
        setPagosHasMore(Boolean(paymentsResponse.pagination?.hasMore));
        setMovimientos(movementsResponse.data ?? []);
        setMovimientosTotal(
          movementsResponse.pagination?.total ?? movementsResponse.data.length,
        );
        setMovimientosHasMore(Boolean(movementsResponse.pagination?.hasMore));
      })
      .catch((cause) => {
        if (active)
          setError(toApiError(cause, "No se pudo cargar el crédito.").message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [creditId]);

  useEffect(() => {
    let active = true;
    setPaymentMethodsLoading(true);

    configuracionApi
      .getMetodosPagoWeb()
      .then((response) => {
        if (!active) return;
        setPaymentMethods(
          (response.data ?? []).filter(
            (method) => String(method.codigo).toUpperCase() === "TRANSFERENCIA",
          ),
        );
      })
      .catch(() => {
        if (active) setPaymentMethods([]);
      })
      .finally(() => {
        if (active) setPaymentMethodsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function openInstallments() {
    setShowCuotas(true);
    if (cuotas.length > 0 || loadingCuotas) return;
    setLoadingCuotas(true);
    try {
      const response = await cuentaApi.getCreditoCuotas(creditId, {
        limit: INSTALLMENT_PAGE_SIZE,
        offset: 0,
      });
      setCuotas(response.data ?? []);
      setCuotasTotal(response.pagination?.total ?? response.data.length);
      setCuotasHasMore(Boolean(response.pagination?.hasMore));
    } catch (cause) {
      setError(
        toApiError(cause, "No se pudo cargar el calendario de cuotas.").message,
      );
    } finally {
      setLoadingCuotas(false);
    }
  }

  async function loadMorePayments() {
    if (!pagosHasMore || loadingMore) return;
    setLoadingMore("pagos");
    try {
      const response = await cuentaApi.getCreditoPagos(creditId, {
        limit: SECTION_PAGE_SIZE,
        offset: pagos.length,
      });
      setPagos((current) => [...current, ...(response.data ?? [])]);
      setPagosTotal(response.pagination?.total ?? pagosTotal);
      setPagosHasMore(Boolean(response.pagination?.hasMore));
    } finally {
      setLoadingMore(null);
    }
  }

  async function loadMoreMovements() {
    if (!movimientosHasMore || loadingMore) return;
    setLoadingMore("movimientos");
    try {
      const response = await cuentaApi.getCreditoMovimientos(creditId, {
        limit: SECTION_PAGE_SIZE,
        offset: movimientos.length,
      });
      setMovimientos((current) => [...current, ...(response.data ?? [])]);
      setMovimientosTotal(response.pagination?.total ?? movimientosTotal);
      setMovimientosHasMore(Boolean(response.pagination?.hasMore));
    } finally {
      setLoadingMore(null);
    }
  }

  async function loadMoreInstallments() {
    if (!cuotasHasMore || loadingMore) return;
    setLoadingMore("cuotas");
    try {
      const response = await cuentaApi.getCreditoCuotas(creditId, {
        limit: INSTALLMENT_PAGE_SIZE,
        offset: cuotas.length,
      });
      setCuotas((current) => [...current, ...(response.data ?? [])]);
      setCuotasTotal(response.pagination?.total ?? cuotasTotal);
      setCuotasHasMore(Boolean(response.pagination?.hasMore));
    } finally {
      setLoadingMore(null);
    }
  }

  function openPaymentModal() {
    if (!data) return;
    const suggested = Number(
      data.credito.monto_proximo_pago ??
        data.credito.monto_proxima_cuota ??
        data.credito.saldo_pendiente ??
        0,
    );

    setPaymentAmount(suggested > 0 ? suggested.toFixed(2) : "");
    setPaymentError("");

    const transferMethod = paymentMethods.find(
      (method) => String(method.codigo).toUpperCase() === "TRANSFERENCIA",
    );
    const pending = pagos.find(
      (payment) =>
        String(payment.estado).toUpperCase() === "PENDIENTE" &&
        String(payment.metodo).toUpperCase() === "TRANSFERENCIA" &&
        ["ABONO_CREDITO", "LIQUIDACION_CREDITO"].includes(
          String(payment.concepto).toUpperCase(),
        ),
    );

    setPaymentResult(
      pending && transferMethod
        ? {
            pago: pending,
            metodo: transferMethod,
            reutilizado: true,
          }
        : null,
    );
    setShowPayment(true);
  }

  async function submitTransferPayment() {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Ingresa un monto válido mayor a $0.");
      return;
    }

    if (!data || amount > Number(data.credito.saldo_pendiente || 0)) {
      setPaymentError("El monto no puede exceder el saldo pendiente.");
      return;
    }

    try {
      setPaymentSubmitting(true);
      setPaymentError("");
      const response = await cuentaApi.crearPagoCreditoTransferencia(
        creditId,
        amount,
      );
      setPaymentResult(response.data);

      const paymentsResponse = await cuentaApi.getCreditoPagos(creditId, {
        limit: SECTION_PAGE_SIZE,
        offset: 0,
      });
      setPagos(paymentsResponse.data ?? []);
      setPagosTotal(
        paymentsResponse.pagination?.total ?? paymentsResponse.data.length,
      );
      setPagosHasMore(Boolean(paymentsResponse.pagination?.hasMore));
    } catch (cause) {
      setPaymentError(
        toApiError(cause, "No se pudo registrar la transferencia.").message,
      );
    } finally {
      setPaymentSubmitting(false);
    }
  }

  async function copyTransferReference(reference?: string | null) {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      setPaymentError("No se pudo copiar la referencia automáticamente.");
    }
  }

  const applicationsSorted = useMemo(
    () => (payment: CuentaCreditoPago) =>
      [...(payment.aplicaciones ?? [])].sort(
        (a, b) =>
          Number(a.numero_cuota ?? 9999) - Number(b.numero_cuota ?? 9999),
      ),
    [],
  );

  if (loading)
    return (
      <div className={styles.creditLoading}>
        <RefreshCw size={24} className={styles.spin} />
        <p>Cargando detalle del crédito...</p>
      </div>
    );
  if (error && !data)
    return (
      <section className={`${styles.card} ${styles.empty}`}>
        <CreditCard size={36} />
        <h2>No pudimos cargar este crédito</h2>
        <p>{error}</p>
        <button className={styles.secondary} onClick={() => navigate(-1)}>
          Volver
        </button>
      </section>
    );
  if (!data) return null;

  const { credito, pedido } = data;
  const orderFolio = credito.pedido_folio ?? pedido?.pedido.folio;

  const transferMethod = paymentMethods.find(
    (method) => String(method.codigo).toUpperCase() === "TRANSFERENCIA",
  );
  const pendingTransfer = pagos.find(
    (payment) =>
      String(payment.estado).toUpperCase() === "PENDIENTE" &&
      String(payment.metodo).toUpperCase() === "TRANSFERENCIA" &&
      ["ABONO_CREDITO", "LIQUIDACION_CREDITO"].includes(
        String(payment.concepto).toUpperCase(),
      ),
  );
  const creditCanPay = ["ACTIVO", "EN_MORA", "INCUMPLIDO"].includes(
    String(credito.estado).toUpperCase(),
  );
  const modalPayment = paymentResult?.pago ?? pendingTransfer ?? null;
  const modalMethod = paymentResult?.metodo ?? transferMethod ?? null;
  const modalConfig = publicConfigEntries(modalMethod?.config_publica);

  return (
    <>
      <header className={styles.header}>
        <div>
          <p>Mi crédito</p>
          <h1>
            {orderFolio
              ? `Crédito del pedido #${orderFolio}`
              : "Detalle del crédito"}
          </h1>
        </div>
        <span className={styles.badge}>{cleanLabel(credito.estado)}</span>
      </header>
      <Link className={styles.inlineBack} to="/mi-cuenta/credito">
        <ArrowLeft size={17} />
        Volver a Mi Crédito
      </Link>
      {error && (
        <div className={`${styles.feedback} ${styles.error}`}>{error}</div>
      )}

      <section className={`${styles.card} ${styles.creditDetailHero}`}>
        <div>
          <span>
            <CircleDollarSign size={22} />
          </span>
          <small>Monto financiado</small>
          <strong>{formatMoney(Number(credito.monto_financiado || 0))}</strong>
        </div>
        <div>
          <span>
            <CreditCard size={22} />
          </span>
          <small>Saldo pendiente</small>
          <strong>{formatMoney(Number(credito.saldo_pendiente || 0))}</strong>
        </div>
        <div>
          <span>
            <ReceiptText size={22} />
          </span>
          <small>Enganche</small>
          <strong>{formatMoney(Number(credito.enganche || 0))}</strong>
        </div>
        <div>
          <span>
            <CalendarDays size={22} />
          </span>
          <small>Plan</small>
          <strong>
            {credito.numero_cuotas ?? "—"} cuota(s) ·{" "}
            {cleanLabel(credito.frecuencia_pago)}
          </strong>
        </div>
      </section>

      <div className={styles.detailGrid}>
        <div className={styles.creditDetailMain}>
          <section className={`${styles.card} ${styles.installmentPreview}`}>
            <div className={styles.sectionTitle}>
              <div>
                <p>Calendario</p>
                <h2>Cuotas</h2>
              </div>
              <span>{credito.numero_cuotas ?? 0}</span>
            </div>
            <p>
              El calendario se carga únicamente cuando lo consultas para
              mantener esta pantalla ligera.
            </p>
            <button
              className={styles.secondary}
              type="button"
              onClick={() => void openInstallments()}
            >
              <CalendarDays size={17} />
              Ver calendario de cuotas
            </button>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <div>
                <p>Cobros</p>
                <h2>Historial de pagos</h2>
              </div>
              <span>{pagosTotal}</span>
            </div>
            {pagos.length === 0 ? (
              <div className={styles.empty}>
                <ReceiptText size={30} />
                <h2>Sin pagos registrados</h2>
              </div>
            ) : (
              <div className={styles.paymentList}>
                {pagos.map((pago) => (
                  <article key={pago.id} className={styles.paymentItem}>
                    <div className={styles.paymentIcon}>
                      <ReceiptText size={19} />
                    </div>
                    <div>
                      <strong>{cleanLabel(pago.concepto)}</strong>
                      <p>
                        {formatDate(pago.fecha_pago, true)} ·{" "}
                        {cleanLabel(pago.metodo)} · {cleanLabel(pago.estado)}
                      </p>
                      {pago.referencia_externa && (
                        <small>Referencia: {pago.referencia_externa}</small>
                      )}
                      {(pago.aplicaciones?.length ?? 0) > 0 && (
                        <div className={styles.paymentApplications}>
                          {applicationsSorted(pago).map((application) => (
                            <span
                              key={
                                application.aplicacion_id ||
                                `${pago.id}-${application.cuota_id}`
                              }
                            >
                              Cuota {application.numero_cuota ?? "—"}:{" "}
                              {formatMoney(Number(application.monto_aplicado))}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <strong>{formatMoney(Number(pago.monto))}</strong>
                  </article>
                ))}
              </div>
            )}
            {pagosHasMore && (
              <button
                className={styles.loadMoreButton}
                type="button"
                disabled={Boolean(loadingMore)}
                onClick={() => void loadMorePayments()}
              >
                {loadingMore === "pagos" ? "Cargando..." : "Ver más pagos"}
              </button>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              <div>
                <p>Auditoría financiera</p>
                <h2>Movimientos</h2>
              </div>
              <span>{movimientosTotal}</span>
            </div>
            {movimientos.length === 0 ? (
              <div className={styles.empty}>
                <FileText size={30} />
                <h2>Sin movimientos</h2>
              </div>
            ) : (
              <div className={styles.creditMovementList}>
                {movimientos.map((movement) => (
                  <article
                    key={movement.id}
                    className={styles.creditMovementCompact}
                  >
                    <div>
                      <strong>{cleanLabel(movement.tipo)}</strong>
                      <span>{formatDate(movement.fecha, true)}</span>
                      <p>{movement.descripcion}</p>
                    </div>
                    <div>
                      <strong>
                        {Number(movement.monto) > 0 ? "+" : ""}
                        {formatMoney(Number(movement.monto))}
                      </strong>
                      <span>
                        {formatMoney(
                          Number(
                            movement.saldo_resultante ??
                              movement.saldoResultante ??
                              0,
                          ),
                        )}{" "}
                        saldo
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {movimientosHasMore && (
              <button
                className={styles.loadMoreButton}
                type="button"
                disabled={Boolean(loadingMore)}
                onClick={() => void loadMoreMovements()}
              >
                {loadingMore === "movimientos"
                  ? "Cargando..."
                  : "Ver más movimientos"}
              </button>
            )}
          </section>
        </div>

        <aside>
          <section className={styles.card}>
            <h2>Condiciones</h2>
            <div className={styles.meta}>
              <div>
                <CalendarDays size={18} />
                <span>
                  <strong>Otorgado</strong>
                  {formatDate(credito.fecha_otorgamiento)}
                </span>
              </div>
              <div>
                <CalendarDays size={18} />
                <span>
                  <strong>Primer vencimiento</strong>
                  {formatDate(credito.fecha_primer_vencimiento)}
                </span>
              </div>
              <div>
                <CalendarDays size={18} />
                <span>
                  <strong>Vencimiento final</strong>
                  {formatDate(credito.fecha_vencimiento_final)}
                </span>
              </div>
              <div>
                <ReceiptText size={18} />
                <span>
                  <strong>Cuotas vencidas</strong>
                  {Number(credito.cuotas_vencidas || 0)} ·{" "}
                  {formatMoney(Number(credito.total_vencido || 0))}
                </span>
              </div>
            </div>
          </section>
          {credito.pedido_id && (
            <Link
              className={`${styles.card} ${styles.relatedOrder}`}
              to={`/mi-cuenta/pedidos/${credito.pedido_id}`}
            >
              <Package size={21} />
              <div>
                <small>Compra relacionada</small>
                <strong>
                  {orderFolio ? `Pedido #${orderFolio}` : "Ver pedido"}
                </strong>
                <span>Productos, pago y entrega</span>
              </div>
            </Link>
          )}
          {creditCanPay ? (
            <section className={`${styles.card} ${styles.creditPaymentCard}`}>
              <div className={styles.creditPaymentCardIcon}>
                <WalletCards size={21} />
              </div>
              <div>
                <small>Pago en línea</small>
                <h2>
                  {pendingTransfer
                    ? "Transferencia pendiente"
                    : "Paga tu crédito"}
                </h2>
                <p>
                  {pendingTransfer
                    ? `Tienes una transferencia por ${formatMoney(Number(pendingTransfer.monto))} pendiente de confirmación.`
                    : "Por ahora puedes registrar tu pago mediante transferencia bancaria."}
                </p>
              </div>
              <button
                className={styles.primary}
                type="button"
                onClick={openPaymentModal}
                disabled={
                  paymentMethodsLoading || (!transferMethod && !pendingTransfer)
                }
              >
                <Landmark size={17} />
                {pendingTransfer
                  ? "Ver transferencia"
                  : paymentMethodsLoading
                    ? "Consultando..."
                    : "Pagar por transferencia"}
              </button>
              {!paymentMethodsLoading && !transferMethod && !pendingTransfer ? (
                <small className={styles.paymentUnavailable}>
                  Transferencia no está activa para pagos web en este momento.
                </small>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>

      {showPayment && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowPayment(false);
          }}
        >
          <section
            className={`${styles.installmentModal} ${styles.transferModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-payment-title"
          >
            <header>
              <div>
                <p>Pago de crédito</p>
                <h2 id="transfer-payment-title">Transferencia bancaria</h2>
                <span>
                  {orderFolio
                    ? `Crédito del pedido #${orderFolio}`
                    : "Mi crédito"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            {paymentError ? (
              <div className={`${styles.feedback} ${styles.error}`}>
                {paymentError}
              </div>
            ) : null}

            {!modalMethod && !modalPayment && paymentMethodsLoading ? (
              <div className={styles.creditLoading}>
                <RefreshCw size={22} className={styles.spin} />
                <p>Consultando transferencia...</p>
              </div>
            ) : !modalMethod && !modalPayment ? (
              <div className={styles.empty}>
                <Landmark size={32} />
                <h2>Transferencia no disponible</h2>
                <p>El método debe estar activo para la tienda en línea.</p>
              </div>
            ) : modalPayment ? (
              <div className={styles.transferPending}>
                <div className={styles.transferPendingStatus}>
                  <CheckCircle2 size={22} />
                  <div>
                    <small>Estado</small>
                    <strong>Pendiente de confirmación</strong>
                  </div>
                </div>

                <div className={styles.transferAmount}>
                  <small>Monto a transferir</small>
                  <strong>{formatMoney(Number(modalPayment.monto))}</strong>
                </div>

                <div className={styles.transferReference}>
                  <div>
                    <small>Usa esta referencia o concepto</small>
                    <strong>{modalPayment.referencia_externa || "—"}</strong>
                  </div>
                  {modalPayment.referencia_externa ? (
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() =>
                        void copyTransferReference(
                          modalPayment.referencia_externa,
                        )
                      }
                    >
                      <Copy size={16} /> Copiar
                    </button>
                  ) : null}
                </div>

                {modalMethod?.instrucciones_web ? (
                  <div className={styles.transferInstructions}>
                    <Landmark size={19} />
                    <p>{modalMethod.instrucciones_web}</p>
                  </div>
                ) : null}

                {modalConfig.length > 0 ? (
                  <div className={styles.transferBankData}>
                    {modalConfig.map(([key, value]) => (
                      <div key={key}>
                        <small>{configLabel(key)}</small>
                        <strong>{String(value)}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className={styles.transferNotice}>
                  <strong>¿Qué sigue?</strong>
                  <p>
                    Realiza la transferencia con la referencia indicada. Tu
                    saldo del crédito se actualizará únicamente cuando Moda
                    Sarita confirme el depósito.
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.transferForm}>
                <div className={styles.transferMethod}>
                  <Landmark size={22} />
                  <div>
                    <small>Método disponible</small>
                    <strong>{modalMethod.nombre || "Transferencia"}</strong>
                    <p>
                      {modalMethod.descripcion ||
                        "El pago quedará pendiente hasta que la boutique confirme el depósito."}
                    </p>
                  </div>
                </div>

                {modalMethod.instrucciones_web ? (
                  <div className={styles.transferInstructions}>
                    <Landmark size={19} />
                    <p>{modalMethod.instrucciones_web}</p>
                  </div>
                ) : null}

                {modalConfig.length > 0 ? (
                  <div className={styles.transferBankData}>
                    {modalConfig.map(([key, value]) => (
                      <div key={key}>
                        <small>{configLabel(key)}</small>
                        <strong>{String(value)}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}

                <label className={styles.transferAmountField}>
                  <span>Monto a pagar</span>
                  <div>
                    <span>$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={Number(credito.saldo_pendiente || 0)}
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      disabled={paymentSubmitting}
                    />
                  </div>
                  <small>
                    Saldo pendiente:{" "}
                    {formatMoney(Number(credito.saldo_pendiente || 0))}
                  </small>
                </label>

                <div className={styles.transferQuickAmounts}>
                  {Number(
                    credito.monto_proximo_pago ??
                      credito.monto_proxima_cuota ??
                      0,
                  ) > 0 ? (
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() =>
                        setPaymentAmount(
                          Number(
                            credito.monto_proximo_pago ??
                              credito.monto_proxima_cuota ??
                              0,
                          ).toFixed(2),
                        )
                      }
                    >
                      Próximo pago
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() =>
                      setPaymentAmount(
                        Number(credito.saldo_pendiente || 0).toFixed(2),
                      )
                    }
                  >
                    Liquidar saldo
                  </button>
                </div>

                <div className={styles.transferNotice}>
                  <strong>Importante</strong>
                  <p>
                    Al continuar se generará una referencia única. El registro
                    quedará como pendiente y todavía no reducirá tu saldo.
                  </p>
                </div>

                <button
                  className={styles.primary}
                  type="button"
                  disabled={paymentSubmitting || !paymentAmount}
                  onClick={() => void submitTransferPayment()}
                >
                  {paymentSubmitting ? (
                    <RefreshCw size={17} className={styles.spin} />
                  ) : (
                    <Landmark size={17} />
                  )}
                  {paymentSubmitting
                    ? "Generando..."
                    : "Generar referencia de transferencia"}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {showCuotas && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCuotas(false);
          }}
        >
          <section
            className={styles.installmentModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="installment-title"
          >
            <header>
              <div>
                <p>Calendario</p>
                <h2 id="installment-title">Cuotas del crédito</h2>
                <span>
                  {cuotasTotal || credito.numero_cuotas || 0} cuota(s)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCuotas(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>
            {loadingCuotas ? (
              <div className={styles.creditLoading}>
                <RefreshCw size={22} className={styles.spin} />
                <p>Cargando cuotas...</p>
              </div>
            ) : cuotas.length === 0 ? (
              <div className={styles.empty}>
                <CalendarDays size={30} />
                <h2>Sin calendario disponible</h2>
              </div>
            ) : (
              <div className={styles.modalTableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vencimiento</th>
                      <th>Programado</th>
                      <th>Pagado</th>
                      <th>Pendiente</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuotas.map((cuota) => (
                      <tr key={cuota.id}>
                        <td>
                          <strong>{cuota.numero_cuota}</strong>
                        </td>
                        <td>{formatDate(cuota.fecha_vencimiento)}</td>
                        <td>{formatMoney(Number(cuota.monto_programado))}</td>
                        <td>{formatMoney(Number(cuota.monto_pagado))}</td>
                        <td>{formatMoney(Number(cuota.saldo_pendiente))}</td>
                        <td>
                          <span className={styles.badge}>
                            {cleanLabel(cuota.estado)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {cuotasHasMore && (
              <button
                className={styles.loadMoreButton}
                type="button"
                disabled={Boolean(loadingMore)}
                onClick={() => void loadMoreInstallments()}
              >
                {loadingMore === "cuotas" ? "Cargando..." : "Ver más cuotas"}
              </button>
            )}
          </section>
        </div>
      )}
    </>
  );
}
