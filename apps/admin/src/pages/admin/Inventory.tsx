import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRightLeft,
  Boxes,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import styles from "../../../styles/Inventory.module.css";

interface InventoryItem {
  id: string | number;
  producto: string;
  sku: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  estado: "ok" | "bajo" | "agotado";
}

const Inventory: React.FC = () => {
  const [items] = useState<InventoryItem[]>([]);
  const [loading] = useState(false);
  const [refreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "bajo" | "agotado">("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.producto.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.categoria.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const stats = useMemo(() => {
    const stockTotal = items.reduce((acc, item) => acc + item.stockActual, 0);
    const lowStock = items.filter((item) => item.estado === "bajo").length;
    const agotados = items.filter((item) => item.estado === "agotado").length;

    return {
      totalItems: items.length,
      stockTotal,
      lowStock,
      agotados,
    };
  }, [items]);

  return (
    <section className={styles.inventory}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Inventario</h1>
          <p className={styles.subtitle}>
            Visualiza existencias, alertas y accesos a movimientos y ajustes.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.secondaryBtn} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
            Actualizar
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <article className={`${styles.statCard} ${styles.primaryCard}`}>
          <Boxes size={28} />
          <div>
            <span>Total productos</span>
            <strong>{stats.totalItems}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.infoCard}`}>
          <Package size={28} />
          <div>
            <span>Stock total</span>
            <strong>{stats.stockTotal}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.warningCard}`}>
          <AlertTriangle size={28} />
          <div>
            <span>Stock bajo</span>
            <strong>{stats.lowStock}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.dangerCard}`}>
          <ArrowRightLeft size={28} />
          <div>
            <span>Agotados</span>
            <strong>{stats.agotados}</strong>
          </div>
        </article>
      </div>

      <nav className={styles.quickNav}>
        <Link to="/inventory" className={styles.quickNavActive}>
          Existencias
        </Link>
        <Link to="/inventory/movements" className={styles.quickNavItem}>
          Movimientos
        </Link>
        <Link to="/inventory/adjustments" className={styles.quickNavItem}>
          Ajustes
        </Link>
        <Link to="/inventory/alerts" className={styles.quickNavItem}>
          Alertas
        </Link>
      </nav>

      <section className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por producto, SKU o categoría"
          />
        </div>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | "ok" | "bajo" | "agotado")
          }
        >
          <option value="all">Todos los estados</option>
          <option value="ok">En rango</option>
          <option value="bajo">Stock bajo</option>
          <option value="agotado">Agotado</option>
        </select>
      </section>

      <section className={styles.tableCard}>
        {loading ? (
          <div className={styles.centerState}>Cargando inventario...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.centerState}>
            No hay existencias cargadas todavía.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>SKU</th>
                  <th>Stock actual</th>
                  <th>Stock mínimo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.producto}</td>
                    <td>{item.categoria}</td>
                    <td>{item.sku}</td>
                    <td>{item.stockActual}</td>
                    <td>{item.stockMinimo}</td>
                    <td>
                      <span
                        className={
                          item.estado === "ok"
                            ? styles.badgeOk
                            : item.estado === "bajo"
                            ? styles.badgeLow
                            : styles.badgeOut
                        }
                      >
                        {item.estado === "ok"
                          ? "En rango"
                          : item.estado === "bajo"
                          ? "Stock bajo"
                          : "Agotado"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/inventory/products/${item.id}/movements`} className={styles.actionBtn}>
                          Movimientos
                        </Link>
                        <Link to="/inventory/adjustments" className={styles.actionBtnSecondary}>
                          Ajustar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default Inventory;