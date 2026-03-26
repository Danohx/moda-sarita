import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import styles from "../../../styles/InventoryAlerts.module.css";

interface AlertItem {
  id: string | number;
  producto: string;
  sku: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  estado: "bajo" | "agotado";
}

const InventoryAlerts: React.FC = () => {
  const [alerts] = useState<AlertItem[]>([]);
  const [loading] = useState(false);
  const [refreshing] = useState(false);
  const [search, setSearch] = useState("");

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      return (
        !search ||
        item.producto.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.categoria.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [alerts, search]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Alertas de Inventario</h1>
          <p className={styles.subtitle}>
            Revisa productos con stock bajo o agotado para tomar acción.
          </p>
        </div>

        <button type="button" className={styles.refreshBtn} disabled={refreshing}>
          <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          Actualizar
        </button>
      </header>

      <nav className={styles.quickNav}>
        <Link to="/inventory" className={styles.quickNavItem}>Existencias</Link>
        <Link to="/inventory/movements" className={styles.quickNavItem}>Movimientos</Link>
        <Link to="/inventory/adjustments" className={styles.quickNavItem}>Ajustes</Link>
        <Link to="/inventory/alerts" className={styles.quickNavActive}>Alertas</Link>
      </nav>

      <section className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar producto, SKU o categoría"
          />
        </div>
      </section>

      <section className={styles.alertCard}>
        <div className={styles.alertHeader}>
          <h2 className={styles.sectionTitle}>
            <AlertTriangle size={20} />
            Productos en alerta
          </h2>
        </div>

        {loading ? (
          <div className={styles.centerState}>Cargando alertas...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className={styles.centerState}>
            No hay alertas cargadas todavía.
          </div>
        ) : (
          <div className={styles.list}>
            {filteredAlerts.map((item) => (
              <article key={item.id} className={styles.alertItem}>
                <div className={styles.alertInfo}>
                  <strong>{item.producto}</strong>
                  <span>{item.categoria}</span>
                  <small>SKU: {item.sku}</small>
                </div>

                <div className={styles.alertMeta}>
                  <span>Actual: {item.stockActual}</span>
                  <span>Mínimo: {item.stockMinimo}</span>
                  <span className={item.estado === "agotado" ? styles.badgeOut : styles.badgeLow}>
                    {item.estado === "agotado" ? "Agotado" : "Stock bajo"}
                  </span>
                </div>

                <div className={styles.alertActions}>
                  <Link to="/inventory/adjustments" className={styles.actionBtn}>
                    Ajustar stock
                  </Link>
                  <Link to={`/inventory/products/${item.id}/movements`} className={styles.actionBtnSecondary}>
                    Ver movimientos
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default InventoryAlerts;