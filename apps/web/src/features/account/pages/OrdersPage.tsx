import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { toApiError } from "@shared/api/errors";
import { tiendaApi, type TiendaPedidoResumen } from "@shared/api/tienda.api";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

export function OrdersPage() {
  const [orders, setOrders] = useState<TiendaPedidoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { tiendaApi.getPedidos().then((response) => setOrders(response.data)).catch((cause) => setError(toApiError(cause).message)).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando pedidos...</p></div>;
  return <><header className={styles.header}><div><p>Historial</p><h1>Mis pedidos</h1></div><span>{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</span></header>{error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}{orders.length > 0 ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Folio</th><th>Fecha</th><th>Entrega</th><th>Estado</th><th>Total</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>#{order.folio}</strong></td><td>{new Date(order.fecha_creacion).toLocaleDateString("es-MX", { dateStyle: "medium" })}</td><td>{order.tipo_entrega === "RECOGER" ? "Recoger" : "Domicilio"}</td><td><span className={styles.badge}>{order.estado}</span></td><td>{order.costo_envio_confirmado ? formatMoney(Number(order.total)) : `${formatMoney(Number(order.subtotal))} + envío`}</td><td><Link to={`/mi-cuenta/pedidos/${order.id}`}>Ver detalle</Link></td></tr>)}</tbody></table></div> : <div className={`${styles.card} ${styles.empty}`}><Package size={36} /><h2>Aún no tienes pedidos</h2><Link className="button button-primary" to="/catalogo">Comprar ahora</Link></div>}</>;
}
