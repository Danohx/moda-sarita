import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, MapPin, Package, ReceiptText, Truck, WalletCards } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cuentaApi, type CuentaPedidoDetalle } from "@shared/api/cuenta.api";
import { toApiError } from "@shared/api/errors";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

function clean(value?: string | null) {
  return String(value || "Pendiente").replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

export function OrderDetailPage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CuentaPedidoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMorePayments, setLoadingMorePayments] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cuentaApi.getPedidoById(orderId)
      .then((response) => setData(response.data))
      .catch((cause) => setError(toApiError(cause).message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando pedido...</p></div>;
  if (error || !data) return <div className={`${styles.card} ${styles.empty}`}><h2>No pudimos cargar el pedido</h2><p>{error}</p><button className={styles.secondary} onClick={() => navigate(-1)}>Volver</button></div>;

  const { pedido, detalles, pagos, credito } = data;
  const pagosTotal = data.pagos_pagination?.total ?? pagos.length;
  const pagosHasMore = Boolean(data.pagos_pagination?.hasMore);
  const paidNet = Number(pedido.total_pagado ?? 0);

  async function loadMorePayments() {
    if (!pagosHasMore || loadingMorePayments) return;
    setLoadingMorePayments(true);
    try {
      const response = await cuentaApi.getPedidoPagos(orderId, { limit: 4, offset: pagos.length });
      setData((current) => current ? {
        ...current,
        pagos: [...current.pagos, ...(response.data ?? [])],
        pagos_pagination: response.pagination,
      } : current);
    } catch (cause) {
      setError(toApiError(cause, "No se pudieron cargar más pagos.").message);
    } finally {
      setLoadingMorePayments(false);
    }
  }

  return <>
    <header className={styles.header}><div><p>Detalle de compra</p><h1>Pedido #{pedido.folio}</h1></div><span className={styles.badge}>{clean(pedido.estado)}</span></header>
    <div className={styles.detailGrid}>
      <div className={styles.creditDetailMain}>
        <section className={styles.card}><h2>Productos</h2><div className={styles.productList}>{detalles.map((item) => <div className={styles.product} key={item.id}><img src={item.imagen_principal || "/product-placeholder.svg"} alt={item.producto_nombre} /><div><strong>{item.producto_nombre}</strong><p>{[item.talla_nombre,item.color_nombre].filter(Boolean).join(" · ")}</p>{item.sku && <p>SKU: {item.sku}</p>}<p>{item.cantidad} × {formatMoney(Number(item.precio_unitario))}</p></div><span>{formatMoney(Number(item.importe))}</span></div>)}</div></section>

        <section className={styles.card}>
          <div className={styles.sectionTitle}><div><p>Transacciones</p><h2>Pagos del pedido</h2></div><span>{pagosTotal}</span></div>
          {pagos.length === 0 ? <div className={styles.empty}><ReceiptText size={30} /><h2>Aún no hay pagos registrados</h2></div> : <div className={styles.paymentList}>{pagos.map((pago) => <article className={styles.paymentItem} key={pago.id}><div className={styles.paymentIcon}><WalletCards size={19} /></div><div><strong>{clean(pago.concepto)}</strong><p>{formatDate(pago.fecha_pago)} · {clean(pago.metodo)} · {clean(pago.estado)}</p>{pago.referencia_externa && <small>Referencia: {pago.referencia_externa}</small>}</div><strong>{formatMoney(Number(pago.monto))}</strong></article>)}</div>}
          {pagosHasMore && <button className={styles.loadMoreButton} type="button" disabled={loadingMorePayments} onClick={() => void loadMorePayments()}>{loadingMorePayments ? "Cargando..." : "Ver más pagos"}</button>}
        </section>
      </div>

      <aside>
        <section className={styles.card}><h2>Resumen</h2><div className={styles.meta}><div><CalendarDays size={18} /><span><strong>Fecha</strong>{formatDate(pedido.fecha_creacion)}</span></div><div><Truck size={18} /><span><strong>Origen / entrega</strong>{pedido.tipo === "PUNTO_VENTA" ? "Compra en tienda física" : pedido.tipo === "APARTADO" ? "Apartado" : pedido.tipo_entrega === "DOMICILIO" ? "Entrega a domicilio" : "Recoger en tienda"}</span></div><div><WalletCards size={18} /><span><strong>Pago solicitado</strong>{clean(pedido.metodo_pago_solicitado || pagos[0]?.metodo)} · {clean(pedido.pago_estado || pagos[0]?.estado)}</span></div>{pedido.direccion && <div><MapPin size={18} /><span><strong>Dirección</strong>{pedido.direccion.calle} {pedido.direccion.numero_exterior}, {pedido.direccion.colonia ? `${pedido.direccion.colonia}, ` : ""}{pedido.direccion.ciudad}, {pedido.direccion.estado} C.P. {pedido.direccion.codigo_postal}</span></div>}</div>
          <div className={styles.summaryRows}><div><span>Subtotal</span><strong>{formatMoney(Number(pedido.subtotal || 0))}</strong></div>{Number(pedido.descuento || 0) > 0 && <div><span>Descuento</span><strong>-{formatMoney(Number(pedido.descuento))}</strong></div>}<div><span>Envío</span><span>{formatMoney(Number(pedido.costo_envio || 0))}</span></div><div><span>Pagado neto</span><strong>{formatMoney(paidNet)}</strong></div><div className={styles.total}><strong>Total</strong><strong>{formatMoney(Number(pedido.total || 0))}</strong></div>{pedido.tipo === "APARTADO" && <div><span>Saldo pendiente</span><strong>{formatMoney(Number(pedido.saldo_pendiente || 0))}</strong></div>}</div>
        </section>

        {credito && <Link className={`${styles.card} ${styles.relatedOrder}`} to={`/mi-cuenta/credito/${credito.credito_id}`}><CreditCard size={21} /><div><small>Financiamiento relacionado</small><strong>{clean(credito.credito_estado)}</strong><span>Saldo {formatMoney(Number(credito.saldo_pendiente || 0))}</span></div></Link>}

        <Link className="button button-outline" style={{ width: "100%", marginTop: ".8rem" }} to={pedido.tipo === "APARTADO" ? "/mi-cuenta/apartados" : "/mi-cuenta/pedidos"}><Package size={17} />Volver</Link>
      </aside>
    </div>
  </>;
}
