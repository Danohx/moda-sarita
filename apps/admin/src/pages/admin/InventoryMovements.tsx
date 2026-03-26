import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, RefreshCw, Search } from "lucide-react";
import styles from "../../../styles/InventoryMovements.module.css";

interface MovementItem {
  id: string | number;
  fecha: string;
  producto: string;
  sku: string;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  referencia: string;
}

const InventoryMovements: React.FC = () => {
  const [movements] = useState<MovementItem[]>([]);
  const [loading] = useState(false);
  const [refreshing] = useState(false);
  const [search, setSearch] = useState("");

  const filteredMovements = useMemo(() => {
    return movements.filter((item) => {
      return (
        !search ||
        item.producto.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.referencia.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [movements, search]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Movimientos de Inventario</h1>
          <p className={styles.subtitle}>
            Consulta entradas, salidas y ajustes registrados en inventario.
          </p>
        </div>

        <button type="button" className={styles.refreshBtn} disabled={refreshing}>
          <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          Actualizar
        </button>
      </header>

      <nav className={styles.quickNav}>
        <Link to="/inventory" className={styles.quickNavItem}>Existencias</Link>
        <Link to="/inventory/movements" className={styles.quickNavActive}>Movimientos</Link>
        <Link to="/inventory/adjustments" className={styles.quickNavItem}>Ajustes</Link>
        <Link to="/inventory/alerts" className={styles.quickNavItem}>Alertas</Link>
      </nav>

      <section className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por producto, SKU o referencia"
          />
        </div>
      </section>

      <section className={styles.tableCard}>
        {loading ? (
          <div className={styles.centerState}>Cargando movimientos...</div>
        ) : filteredMovements.length === 0 ? (
          <div className={styles.centerState}>
            No hay movimientos cargados todavía.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Referencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fecha}</td>
                    <td>{item.producto}</td>
                    <td>{item.sku}</td>
                    <td>
                      <span
                        className={
                          item.tipo === "entrada"
                            ? styles.badgeEntry
                            : item.tipo === "salida"
                            ? styles.badgeExit
                            : styles.badgeAdjust
                        }
                      >
                        {item.tipo}
                      </span>
                    </td>
                    <td>{item.cantidad}</td>
                    <td>{item.referencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.infoCard}>
        <div className={styles.infoIcon}>
          <ArrowLeftRight size={22} />
        </div>
        <div>
          <strong>Vista estructural</strong>
          <p>
            Aquí después podrás filtrar por fechas, tipo de movimiento, producto y variante.
          </p>
        </div>
      </section>
    </section>
  );
};

export default InventoryMovements;