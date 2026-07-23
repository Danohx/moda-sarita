import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, MapPin, PackageCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toApiError } from "@shared/api/errors";
import { tiendaApi, type TiendaPedidoDetalle } from "@shared/api/tienda.api";
import { formatMoney } from "@web/lib/formatters";
import styles from "./OrderConfirmationPage.module.css";

export function OrderConfirmationPage() {
  const { orderId = "" } = useParams();
  const [data, setData] = useState<TiendaPedidoDetalle | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    tiendaApi.getPedidoById(orderId).then((response) => setData(response.data)).catch((cause) => setError(toApiError(cause, "No se pudo cargar el pedido.").message));
  }, [orderId]);

  if (!data && !error) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando confirmación...</p></div>;
  if (error || !data) return <section className={`${styles.page} container`}><div className={styles.card}><h1>No pudimos mostrar la confirmación</h1><p>{error}</p><Link className="button button-primary" to="/mi-cuenta/pedidos">Ver mis pedidos</Link></div></section>;

  const { pedido } = data;
  return (
    <main className={`${styles.page} container`}>
      <section className={styles.card}>
        <span className={styles.icon}><CheckCircle2 size={42} /></span>
        <p className={styles.eyebrow}>Pedido recibido</p>
        <h1>¡Gracias por tu compra!</h1>
        <p className={styles.intro}>Tu folio es <strong>#{pedido.folio}</strong>. Conserva este número para cualquier aclaración.</p>
        <div className={styles.statusGrid}>
          <div><Clock3 size={22} /><span><strong>Estado</strong>{pedido.estado}</span></div>
          <div><PackageCheck size={22} /><span><strong>Total actual</strong>{formatMoney(Number(pedido.total))}</span></div>
          <div><MapPin size={22} /><span><strong>Entrega</strong>{pedido.tipo_entrega === "RECOGER" ? "Recoger en tienda" : "Domicilio"}</span></div>
        </div>
        {!pedido.costo_envio_confirmado && <div className={styles.notice}>El costo de envío aún está pendiente. Moda Sarita actualizará el total antes de confirmar el pago.</div>}
        <div className={styles.actions}><Link className="button button-primary" to={`/mi-cuenta/pedidos/${pedido.id}`}>Ver detalle del pedido</Link><Link className="button button-outline" to="/catalogo">Seguir comprando</Link></div>
      </section>
    </main>
  );
}
