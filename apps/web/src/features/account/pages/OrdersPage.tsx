import { useEffect, useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { cuentaApi, type CuentaPedidoResumen } from "@shared/api/cuenta.api";
import { toApiError } from "@shared/api/errors";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

const PAGE_SIZE = 8;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-MX", { dateStyle: "medium" });
}

function clean(value?: string | null) {
  return String(value || "Pendiente").replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

export function OrdersPage() {
  const [orders, setOrders] = useState<CuentaPedidoResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    cuentaApi.getPedidos({ limit: PAGE_SIZE, offset: 0 })
      .then((response) => {
        if (!active) return;
        setOrders(response.data ?? []);
        setTotal(response.pagination?.total ?? response.data?.length ?? 0);
        setHasMore(Boolean(response.pagination?.hasMore));
      })
      .catch((cause) => { if (active) setError(toApiError(cause).message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await cuentaApi.getPedidos({ limit: PAGE_SIZE, offset: orders.length });
      setOrders((current) => [...current, ...(response.data ?? [])]);
      setTotal(response.pagination?.total ?? total);
      setHasMore(Boolean(response.pagination?.hasMore));
    } catch (cause) {
      setError(toApiError(cause).message);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando pedidos...</p></div>;

  return <>
    <header className={styles.header}><div><p>Historial</p><h1>Mis pedidos</h1></div><span>{total} {total === 1 ? "pedido" : "pedidos"}</span></header>
    {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}
    {orders.length > 0 ? <>
      <div className={styles.orderCards}>{orders.map((order) => <Link className={styles.orderCard} to={`/mi-cuenta/pedidos/${order.id}`} key={order.id}>
        <div className={styles.orderCardIcon}><Package size={22} /></div>
        <div className={styles.orderCardMain}><div><strong>Pedido #{order.folio}</strong><span className={styles.badge}>{clean(order.estado)}</span></div><p>{formatDate(order.fecha_creacion)} · {order.tipo === "PUNTO_VENTA" ? "Compra en tienda" : order.tipo_entrega === "DOMICILIO" ? "Entrega a domicilio" : "Recoger en tienda"}</p><small>{Number(order.items_count || 0)} pieza(s) · Pago {clean(order.pago_estado)}</small></div>
        <div className={styles.orderCardAmount}><strong>{formatMoney(Number(order.total || 0))}</strong><span>Ver detalle</span></div>
      </Link>)}</div>
      {hasMore && <button className={styles.loadMoreButton} type="button" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore && <RefreshCw size={16} className={styles.spin} />}{loadingMore ? "Cargando..." : "Ver más pedidos"}</button>}
    </> : <div className={`${styles.card} ${styles.empty}`}><Package size={36} /><h2>Aún no tienes compras finalizadas</h2><p>Los apartados activos se muestran en una sección independiente.</p><Link className="button button-primary" to="/catalogo">Comprar ahora</Link></div>}
  </>;
}
