import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Package, Truck, WalletCards } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toApiError } from "@shared/api/errors";
import { tiendaApi, type TiendaPedidoDetalle } from "@shared/api/tienda.api";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

export function OrderDetailPage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<TiendaPedidoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);

  useEffect(() => { tiendaApi.getPedidoById(orderId).then((response) => setData(response.data)).catch((cause) => setError(toApiError(cause).message)).finally(() => setLoading(false)); }, [orderId]);

  async function cancelOrder() {
    const reason = window.prompt("Escribe el motivo de cancelación:");
    if (!reason?.trim()) return;
    setCanceling(true);
    try { const response = await tiendaApi.cancelarPedido(orderId, reason.trim()); setData(response.data); }
    catch (cause) { setError(toApiError(cause, "No se pudo cancelar el pedido.").message); }
    finally { setCanceling(false); }
  }

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando pedido...</p></div>;
  if (error || !data) return <div className={`${styles.card} ${styles.empty}`}><h2>No pudimos cargar el pedido</h2><p>{error}</p><button className={styles.secondary} onClick={() => navigate(-1)}>Volver</button></div>;
  const { pedido, detalles, pagos } = data;
  const canCancel = pedido.estado === "PENDIENTE";

  return <><header className={styles.header}><div><p>Detalle del pedido</p><h1>Pedido #{pedido.folio}</h1></div><span className={styles.badge}>{pedido.estado}</span></header><div className={styles.detailGrid}><div><section className={styles.card}><h2>Productos</h2><div className={styles.productList}>{detalles.map((item) => <div className={styles.product} key={item.id}><img src={item.imagen_principal || "/images/product-placeholder.svg"} alt="" /><div><strong>{item.producto_nombre}</strong><p>{[item.talla_nombre,item.color_nombre].filter(Boolean).join(" · ")}</p><p>{item.cantidad} × {formatMoney(Number(item.precio_unitario))}</p></div><span>{formatMoney(Number(item.importe))}</span></div>)}</div></section></div><aside><section className={styles.card}><h2>Resumen</h2><div className={styles.meta}><div><CalendarDays size={18} /><span><strong>Fecha</strong>{new Date(pedido.fecha_creacion).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</span></div><div><Truck size={18} /><span><strong>Entrega</strong>{pedido.tipo_entrega === "RECOGER" ? "Recoger en tienda" : "Entrega a domicilio"}</span></div><div><WalletCards size={18} /><span><strong>Pago</strong>{pedido.metodo_pago_solicitado || pagos[0]?.metodo || "Pendiente"} · {pedido.pago_estado || pagos[0]?.estado || "PENDIENTE"}</span></div>{pedido.direccion && <div><MapPin size={18} /><span><strong>Dirección</strong>{pedido.direccion.calle} {pedido.direccion.numero_exterior}, {pedido.direccion.ciudad}, {pedido.direccion.estado}</span></div>}</div><div className={styles.summaryRows}><div><span>Subtotal</span><strong>{formatMoney(Number(pedido.subtotal))}</strong></div><div><span>Envío</span><span>{pedido.costo_envio_confirmado ? formatMoney(Number(pedido.costo_envio)) : "Por confirmar"}</span></div><div className={styles.total}><strong>Total</strong><strong>{pedido.costo_envio_confirmado ? formatMoney(Number(pedido.total)) : `${formatMoney(Number(pedido.subtotal))} + envío`}</strong></div></div>{canCancel && <button className={styles.danger} style={{ width: "100%", marginTop: "1rem" }} type="button" disabled={canceling} onClick={cancelOrder}>{canceling ? "Cancelando..." : "Cancelar pedido"}</button>}</section><Link className="button button-outline" style={{ width: "100%", marginTop: ".8rem" }} to="/mi-cuenta/pedidos"><Package size={17} />Volver a pedidos</Link></aside></div></>;
}
