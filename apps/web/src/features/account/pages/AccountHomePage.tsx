import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { tiendaApi, type TiendaPerfil } from "@shared/api/tienda.api";
import {
  cuentaApi,
  type CuentaPortalResumen,
} from "@shared/api/cuenta.api";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

export function AccountHomePage() {
  const [perfil, setPerfil] = useState<TiendaPerfil | null>(null);
  const [resumen, setResumen] = useState<CuentaPortalResumen | null>(null);

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      tiendaApi.getPerfil(),
      cuentaApi.getResumen(),
    ]).then(([profile, summary]) => {
      if (!active) return;

      if (profile.status === "fulfilled") setPerfil(profile.value.data);
      if (summary.status === "fulfilled") setResumen(summary.value.data);
    });

    return () => {
      active = false;
    };
  }, []);

  const pedidos = resumen?.pedidos_recientes ?? [];

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
        <Link className={`${styles.card} ${styles.stat} ${styles.statLink}`} to="/mi-cuenta/pedidos">
          <span><ShoppingBag size={21} /></span>
          <div><small>Pedidos realizados</small><strong>{resumen?.pedidos_total ?? "—"}</strong></div>
        </Link>
        <div className={`${styles.card} ${styles.stat}`}>
          <span><Package size={21} /></span>
          <div><small>Pedidos en proceso</small><strong>{resumen?.pedidos_en_proceso ?? "—"}</strong></div>
        </div>
        <Link className={`${styles.card} ${styles.stat} ${styles.statLink}`} to="/mi-cuenta/direcciones">
          <span><MapPin size={21} /></span>
          <div><small>Direcciones guardadas</small><strong>{resumen?.direcciones_total ?? "—"}</strong></div>
        </Link>
        <Link className={`${styles.card} ${styles.stat} ${styles.statLink}`} to="/mi-cuenta/credito">
          <span><CreditCard size={21} /></span>
          <div>
            <small>Crédito disponible</small>
            <strong>
              {resumen
                ? resumen.credito_habilitado
                  ? formatMoney(resumen.credito_disponible)
                  : "No habilitado"
                : "—"}
            </strong>
          </div>
        </Link>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.sectionHeaderCompact}>
            <h2>Pedidos recientes</h2>
            <Link className={styles.sectionLink} to="/mi-cuenta/pedidos">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.orderList}>
            {pedidos.map((order) => (
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
              <div className={styles.emptyCompact}>
                <Package size={30} />
                <div>
                  <strong>Aún no tienes pedidos</strong>
                  <Link to="/catalogo">Explorar catálogo</Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <h2>Accesos rápidos</h2>
          <div className={styles.quickLinks}>
            <Link to="/mi-cuenta/perfil"><UserRound size={19} /><span>Actualizar mis datos</span></Link>
            <Link to="/mi-cuenta/direcciones"><MapPin size={19} /><span>Administrar direcciones</span></Link>
            <Link to="/mi-cuenta/pedidos"><Package size={19} /><span>Ver todos mis pedidos</span><ArrowRight className={styles.quickArrow} size={16} /></Link>
            <Link to="/mi-cuenta/apartados"><BookmarkCheck size={19} /><span>Ver todos mis apartados</span><ArrowRight className={styles.quickArrow} size={16} /></Link>
            <Link to="/mi-cuenta/credito"><CreditCard size={19} /><span>Ver todos mis créditos</span><ArrowRight className={styles.quickArrow} size={16} /></Link>
            <Link to="/catalogo"><ShoppingBag size={19} /><span>Continuar comprando</span></Link>
          </div>
        </section>
      </div>
    </>
  );
}
