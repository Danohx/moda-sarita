import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardEdit, RefreshCw, Save } from "lucide-react";
import styles from "../../../styles/InventoryAdjustments.module.css";

const InventoryAdjustments: React.FC = () => {
  const [refreshing] = useState(false);
  const [saving] = useState(false);

  const [form, setForm] = useState({
    producto: "",
    variante: "",
    tipo: "ajuste",
    cantidad: 0,
    motivo: "",
    referencia: "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Ajuste Manual de Inventario</h1>
          <p className={styles.subtitle}>
            Registra ajustes de stock manuales para productos o variantes.
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
        <Link to="/inventory/adjustments" className={styles.quickNavActive}>Ajustes</Link>
        <Link to="/inventory/alerts" className={styles.quickNavItem}>Alertas</Link>
      </nav>

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>
            <ClipboardEdit size={20} />
            Nuevo ajuste
          </h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="producto">Producto</label>
            <input
              id="producto"
              value={form.producto}
              onChange={(e) => setForm((prev) => ({ ...prev, producto: e.target.value }))}
              placeholder="Nombre o SKU del producto"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="variante">Variante</label>
            <input
              id="variante"
              value={form.variante}
              onChange={(e) => setForm((prev) => ({ ...prev, variante: e.target.value }))}
              placeholder="Color / talla"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="ajuste">Ajuste</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="cantidad">Cantidad</label>
            <input
              id="cantidad"
              type="number"
              min="0"
              value={form.cantidad}
              onChange={(e) => setForm((prev) => ({ ...prev, cantidad: Number(e.target.value) }))}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="motivo">Motivo</label>
            <textarea
              id="motivo"
              rows={4}
              value={form.motivo}
              onChange={(e) => setForm((prev) => ({ ...prev, motivo: e.target.value }))}
              placeholder="Describe la razón del ajuste"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="referencia">Referencia</label>
            <input
              id="referencia"
              value={form.referencia}
              onChange={(e) => setForm((prev) => ({ ...prev, referencia: e.target.value }))}
              placeholder="Folio, nota o referencia interna"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <Link to="/inventory" className={styles.cancelBtn}>
            Cancelar
          </Link>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            <Save size={18} />
            Guardar ajuste
          </button>
        </div>
      </form>
    </section>
  );
};

export default InventoryAdjustments;