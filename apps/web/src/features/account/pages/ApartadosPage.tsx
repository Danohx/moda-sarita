import { useEffect, useState } from "react";
import { CalendarClock, PackageCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { cuentaApi, type CuentaPedidoResumen } from "@shared/api/cuenta.api";
import { toApiError } from "@shared/api/errors";
import { formatMoney } from "@web/lib/formatters";
import styles from "./AccountPages.module.css";

const PAGE_SIZE = 12;

function date(value?: string | null) {
  if (!value) return "Sin fecha límite";
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "medium" });
}

export function ApartadosPage() {
  const [items, setItems] = useState<CuentaPedidoResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    cuentaApi.getApartados({ limit: PAGE_SIZE, offset: 0 })
      .then((response) => {
        if (!active) return;
        setItems(response.data ?? []);
        setTotal(response.pagination?.total ?? response.data?.length ?? 0);
        setHasMore(Boolean(response.pagination?.hasMore));
      })
      .catch((cause) => { if (active) setError(toApiError(cause, "No se pudieron cargar tus apartados.").message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await cuentaApi.getApartados({ limit: PAGE_SIZE, offset: items.length });
      setItems((current) => [...current, ...(response.data ?? [])]);
      setTotal(response.pagination?.total ?? total);
      setHasMore(Boolean(response.pagination?.hasMore));
    } catch (cause) {
      setError(toApiError(cause, "No se pudieron cargar más apartados.").message);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando apartados...</p></div>;

  return <>
    <header className={styles.header}><div><p>Mi cuenta</p><h1>Mis apartados</h1></div><span>{total} {total === 1 ? "apartado" : "apartados"}</span></header>
    {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}
    {items.length === 0 ? <section className={`${styles.card} ${styles.empty}`}><PackageCheck size={36} /><h2>No tienes apartados registrados</h2><p>Los apartados creados en la boutique aparecerán aquí.</p></section> : <>
      <div className={styles.apartadoGrid}>{items.map((item) => <Link className={styles.apartadoCard} key={item.id} to={`/mi-cuenta/pedidos/${item.id}`}>
        <div className={styles.apartadoTop}><div><small>Apartado</small><strong>#{item.folio}</strong></div><span className={styles.badge}>{item.estado}</span></div>
        <div className={styles.apartadoAmounts}><div><small>Total</small><strong>{formatMoney(Number(item.total || 0))}</strong></div><div><small>Abonado</small><strong>{formatMoney(Number(item.total_pagado || 0))}</strong></div><div><small>Pendiente</small><strong>{formatMoney(Number(item.saldo_pendiente || 0))}</strong></div></div>
        <div className={styles.apartadoDeadline}><CalendarClock size={17} /><span>Fecha límite: <strong>{date(item.fecha_limite_apartado)}</strong></span></div>
        <span className={styles.detailLink}>Ver productos y pagos</span>
      </Link>)}</div>
      {hasMore && <button className={styles.loadMoreButton} type="button" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore && <RefreshCw size={16} className={styles.spin} />}{loadingMore ? "Cargando..." : "Ver más apartados"}</button>}
    </>}
    <section className={`${styles.card} ${styles.readOnlyNotice}`}><PackageCheck size={20} /><div><strong>Consulta en línea</strong><p>Los abonos y liquidaciones de apartados continúan realizándose en la boutique mientras no se habilite una pasarela de pago web.</p></div></section>
  </>;
}
