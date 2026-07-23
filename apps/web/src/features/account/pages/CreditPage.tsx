import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  CreditCard,
  Info,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import {
  tiendaApi,
  type TiendaCreditoEstado,
  type TiendaCreditoResumen,
  type TiendaMovimientoCredito,
} from "@shared/api/tienda.api";
import { isApiError } from "@shared/api/errors";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

const PAGE_SIZE = 20;

const STATUS_COPY: Record<
  TiendaCreditoEstado,
  { label: string; description: string }
> = {
  NO_HABILITADO: {
    label: "No habilitado",
    description:
      "Tu línea de crédito no está activa. La boutique decide qué clientes pueden utilizar este beneficio.",
  },
  SIN_LIMITE: {
    label: "Pendiente de configuración",
    description:
      "Tu crédito está habilitado, pero todavía no tiene un límite autorizado.",
  },
  SIN_DEUDA: {
    label: "Sin saldo pendiente",
    description: "Tienes disponible el total de tu línea de crédito autorizada.",
  },
  CON_SALDO: {
    label: "Con saldo pendiente",
    description:
      "Tu cuenta tiene saldo utilizado. Los abonos registrados aparecerán en el historial.",
  },
  LIMITE_ALCANZADO: {
    label: "Límite alcanzado",
    description:
      "Actualmente no tienes crédito disponible. Consulta con la boutique para registrar tus abonos.",
  },
  SOBREGIRADO: {
    label: "Saldo superior al límite",
    description:
      "El saldo registrado supera el límite autorizado. Comunícate con la boutique para revisar tu cuenta.",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "Sin registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin registro";

  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function movementLabel(type: TiendaMovimientoCredito["tipo"]) {
  if (type === "COMPRA") return "Compra a crédito";
  if (type === "ABONO") return "Abono";
  return "Ajuste";
}

function movementClass(type: TiendaMovimientoCredito["tipo"]) {
  if (type === "COMPRA") return styles.movementPurchase;
  if (type === "ABONO") return styles.movementPayment;
  return styles.movementAdjustment;
}

export function CreditPage() {
  const [credito, setCredito] = useState<TiendaCreditoResumen | null>(null);
  const [movimientos, setMovimientos] = useState<TiendaMovimientoCredito[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCredit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [creditResponse, movementResponse] = await Promise.all([
        tiendaApi.getCredito(),
        tiendaApi.getMovimientosCredito({ limit: PAGE_SIZE, offset: 0 }),
      ]);

      setCredito(creditResponse.data);
      setMovimientos(movementResponse.data.items);
      setTotal(movementResponse.data.total);
      setHasMore(movementResponse.data.has_more);
    } catch (requestError) {
      setError(
        isApiError(requestError)
          ? requestError.message
          : "No se pudo consultar tu información de crédito.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCredit();
  }, [loadCredit]);

  const usedPercent = useMemo(
    () => Math.min(Math.max(credito?.porcentaje_utilizado ?? 0, 0), 100),
    [credito?.porcentaje_utilizado],
  );

  async function loadMore() {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const response = await tiendaApi.getMovimientosCredito({
        limit: PAGE_SIZE,
        offset: movimientos.length,
      });

      setMovimientos((current) => [...current, ...response.data.items]);
      setTotal(response.data.total);
      setHasMore(response.data.has_more);
    } catch (requestError) {
      setError(
        isApiError(requestError)
          ? requestError.message
          : "No se pudieron cargar más movimientos.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.creditLoading} role="status" aria-live="polite">
        <RefreshCw size={24} className={styles.spin} />
        <p>Consultando tu crédito...</p>
      </div>
    );
  }

  if (!credito) {
    return (
      <section className={`${styles.card} ${styles.creditError}`}>
        <CreditCard size={36} />
        <h1>No pudimos mostrar tu crédito</h1>
        <p>{error || "Intenta nuevamente en unos momentos."}</p>
        <button className={styles.primary} type="button" onClick={() => void loadCredit()}>
          <RefreshCw size={17} /> Reintentar
        </button>
      </section>
    );
  }

  const status = STATUS_COPY[credito.estado];

  return (
    <>
      <header className={styles.header}>
        <div>
          <p>Mi cuenta</p>
          <h1>Mi crédito Sarita</h1>
        </div>
        <span>Consulta tu límite, saldo e historial. Esta sección es únicamente informativa.</span>
      </header>

      {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}

      <section className={`${styles.card} ${styles.creditHero}`}>
        <div className={styles.creditHeroTop}>
          <div>
            <span className={`${styles.creditStatus} ${styles[`creditStatus_${credito.estado}`]}`}>
              {status.label}
            </span>
            <h2>{status.description}</h2>
          </div>
          <span className={styles.creditHeroIcon}><CreditCard size={30} /></span>
        </div>

        <div className={styles.creditAmounts}>
          <div>
            <small>Límite autorizado</small>
            <strong>{formatMoney(credito.limite_credito)}</strong>
          </div>
          <div>
            <small>Saldo utilizado</small>
            <strong>{formatMoney(credito.saldo_deudor)}</strong>
          </div>
          <div>
            <small>Crédito disponible</small>
            <strong>{formatMoney(credito.credito_disponible)}</strong>
          </div>
        </div>

        <div className={styles.creditProgressBlock}>
          <div>
            <span>Uso de la línea</span>
            <strong>{credito.porcentaje_utilizado.toFixed(1)}%</strong>
          </div>
          <div
            className={styles.creditProgress}
            role="progressbar"
            aria-label="Porcentaje de crédito utilizado"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={usedPercent}
          >
            <span style={{ width: `${usedPercent}%` }} />
          </div>
          {credito.monto_excedido > 0 && (
            <p className={styles.creditExceeded}>
              El saldo excede el límite por {formatMoney(credito.monto_excedido)}.
            </p>
          )}
        </div>
      </section>

      <div className={styles.creditInfoGrid}>
        <section className={`${styles.card} ${styles.creditInfoCard}`}>
          <span><CircleDollarSign size={22} /></span>
          <div>
            <small>Última actualización</small>
            <strong>{formatDate(credito.fecha_actualizacion_credito || credito.ultima_actividad)}</strong>
          </div>
        </section>
        <section className={`${styles.card} ${styles.creditInfoCard}`}>
          <span><ReceiptText size={22} /></span>
          <div>
            <small>Movimientos registrados</small>
            <strong>{credito.total_movimientos}</strong>
          </div>
        </section>
        <section className={`${styles.card} ${styles.creditInfoCard}`}>
          <span><Info size={22} /></span>
          <div>
            <small>Fechas de pago</small>
            <strong>No configuradas</strong>
          </div>
        </section>
      </div>

      {!credito.calendario_configurado && (
        <section className={styles.creditNotice}>
          <Info size={21} />
          <div>
            <strong>La cuenta todavía no tiene calendario de vencimientos.</strong>
            <p>
              Por ahora no se muestran próximas fechas de pago, días de atraso ni estado “al corriente”.
              Esos datos requieren un calendario de crédito configurado por la boutique.
            </p>
          </div>
        </section>
      )}

      <section className={`${styles.card} ${styles.creditHistory}`}>
        <div className={styles.creditHistoryHeader}>
          <div>
            <p>Historial</p>
            <h2>Movimientos de crédito</h2>
          </div>
          <span>{total} {total === 1 ? "movimiento" : "movimientos"}</span>
        </div>

        {movimientos.length === 0 ? (
          <div className={styles.empty}>
            <ReceiptText size={36} />
            <h2>Aún no hay movimientos</h2>
            <p>Las compras, los abonos y los ajustes aparecerán en esta sección.</p>
          </div>
        ) : (
          <div className={styles.creditMovementList}>
            {movimientos.map((movement) => (
              <article className={styles.creditMovement} key={movement.id}>
                <span className={`${styles.movementIcon} ${movementClass(movement.tipo)}`}>
                  {movement.tipo === "COMPRA" ? <ShoppingBag size={19} /> : <CircleDollarSign size={19} />}
                </span>
                <div className={styles.movementMain}>
                  <div>
                    <strong>{movementLabel(movement.tipo)}</strong>
                    <span>{formatDate(movement.fecha)}</span>
                  </div>
                  <p>{movement.descripcion}</p>
                  <div className={styles.movementMeta}>
                    {movement.pedido_folio && <span>Pedido #{movement.pedido_folio}</span>}
                    {movement.metodo_pago && <span>{movement.metodo_pago.replaceAll("_", " ")}</span>}
                    {movement.referencia_externa && <span>Ref. {movement.referencia_externa}</span>}
                  </div>
                </div>
                <div className={styles.movementAmount}>
                  <strong className={movement.monto < 0 ? styles.amountNegative : styles.amountPositive}>
                    {movement.monto > 0 ? "+" : ""}{formatMoney(movement.monto)}
                  </strong>
                  <span>Saldo: {formatMoney(movement.saldo_resultante)}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {hasMore && (
          <button className={styles.creditLoadMore} type="button" onClick={() => void loadMore()} disabled={loadingMore}>
            <RefreshCw size={17} className={loadingMore ? styles.spin : undefined} />
            {loadingMore ? "Cargando..." : "Cargar más movimientos"}
          </button>
        )}
      </section>
    </>
  );
}
