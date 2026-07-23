import { useEffect, useMemo, useState } from "react";
import { CreditCard, MapPin, Package, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import {
  tiendaApi,
  type TiendaCreditoResumen,
  type TiendaDireccion,
  type TiendaPedidoResumen,
  type TiendaPerfil,
} from "@shared/api/tienda.api";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

export function AccountHomePage() {
  const [perfil, setPerfil] = useState<TiendaPerfil | null>(null);
  const [direcciones, setDirecciones] = useState<TiendaDireccion[]>([]);
  const [pedidos, setPedidos] = useState<TiendaPedidoResumen[]>([]);
  const [credito, setCredito] = useState<TiendaCreditoResumen | null>(null);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      tiendaApi.getPerfil(),
      tiendaApi.getDirecciones(),
      tiendaApi.getPedidos(),
      tiendaApi.getCredito(),
    ]).then(([profile, addresses, orders, credit]) => {
      if (!active) return;

      if (profile.status === "fulfilled") setPerfil(profile.value.data);
      if (addresses.status === "fulfilled") setDirecciones(addresses.value.data);
      if (orders.status === "fulfilled") setPedidos(orders.value.data);
      if (credit.status === "fulfilled") setCredito(credit.value.data);
    });

    return () => {
      active = false;
    };
  }, []);

  const pending = useMemo(
    () =>
      pedidos.filter((order) =>
        ["PENDIENTE", "PAGADO", "ENVIADO"].includes(order.estado),
      ).length,
    [pedidos],
  );

  return (
    <>
      <header className={styles.header}>
        <div>
          <p>Mi cuenta</p>
          <h1>Hola, {perfil?.nombres || "bienvenida"}</h1>
        </div>
        <span>Administra tus datos y compras en un solo lugar.</span>
      </header>

      <div className={styles.stats}>
        <div className={`${styles.card} ${styles.stat}`}>
          <span><ShoppingBag size={21} /></span>
          <div><small>Pedidos realizados</small><strong>{pedidos.length}</strong></div>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span><Package size={21} /></span>
          <div><small>Pedidos en proceso</small><strong>{pending}</strong></div>
        </div>
        <div className={`${styles.card} ${styles.stat}`}>
          <span><MapPin size={21} /></span>
          <div><small>Direcciones guardadas</small><strong>{direcciones.length}</strong></div>
        </div>
        <Link className={`${styles.card} ${styles.stat} ${styles.statLink}`} to="/mi-cuenta/credito">
          <span><CreditCard size={21} /></span>
          <div>
            <small>Crédito disponible</small>
            <strong>
              {credito?.habilitado
                ? formatMoney(credito.credito_disponible)
                : "No habilitado"}
            </strong>
          </div>
        </Link>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Pedidos recientes</h2>
          <div className={styles.orderList}>
            {pedidos.slice(0, 4).map((order) => (
              <Link className={styles.order} to={`/mi-cuenta/pedidos/${order.id}`} key={order.id}>
                <div>
                  <strong>Pedido #{order.folio}</strong>
                  <p>{new Date(order.fecha_creacion).toLocaleDateString("es-MX", { dateStyle: "medium" })}</p>
                  <span className={styles.badge}>{order.estado}</span>
                </div>
                <span>{formatMoney(Number(order.total))}</span>
              </Link>
            ))}
            {pedidos.length === 0 && (
              <div className={styles.empty}>
                <Package size={34} />
                <h2>Aún no tienes pedidos</h2>
                <Link className="button button-primary" to="/catalogo">Explorar catálogo</Link>
              </div>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <h2>Accesos rápidos</h2>
          <div className={styles.quickLinks}>
            <Link to="/mi-cuenta/perfil"><UserRound size={19} />Actualizar mis datos</Link>
            <Link to="/mi-cuenta/direcciones"><MapPin size={19} />Administrar direcciones</Link>
            <Link to="/mi-cuenta/credito"><CreditCard size={19} />Consultar mi crédito</Link>
            <Link to="/mi-cuenta/pedidos"><Package size={19} />Consultar todos los pedidos</Link>
            <Link to="/catalogo"><ShoppingBag size={19} />Continuar comprando</Link>
          </div>
        </section>
      </div>
    </>
  );
}
