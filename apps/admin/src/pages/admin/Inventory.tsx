import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Boxes,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../../../styles/Inventory.module.css";
import { inventarioService } from "@admin/services/inventario.service";
import InventoryMovementModal from "@admin/components/components/InventoryMovementsModal";
import InventoryAlertsModal, {
  type AlertItem,
} from "@admin/components/components/InventoryAlertsModal";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";

interface InventoryRow {
  id: string;
  producto: string;
  variante: string;
  sku: string;
  categoria: string;
  stockFisico: number;
  stockApartado: number;
  stockDisponible: number;
  stockMinimo: number;
  estado: "ok" | "bajo" | "agotado";
}

interface VariantOption {
  id: string;
  producto: string;
  variante: string;
  sku: string;
  stockFisico: number;
  stockApartado: number;
  stockDisponible: number;
  stockMinimo: number;
}

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ok" | "bajo" | "agotado"
  >("all");
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedMovementRow, setSelectedMovementRow] =
    useState<InventoryRow | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const loadInventory = useCallback(async (isRefresh = false) => {
    try {
      setError(null);

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const rows = await inventarioService.getExistencias();

      const mapped = (rows ?? []).map((item) => {
        const stockFisico = Number(item.stock_fisico ?? 0);
        const stockApartado = Number(item.stock_apartado ?? 0);
        const stockDisponible = Number(item.stock_disponible ?? 0);
        const stockMinimo = Number(item.stock_minimo ?? 0);
        const bajoStock = Boolean(item.bajo_stock);

        const varianteParts = [
          item.talla_nombre ?? null,
          item.color_nombre ?? null,
        ].filter(Boolean);

        let estado: "ok" | "bajo" | "agotado" = "ok";

        if (stockDisponible <= 0) estado = "agotado";
        else if (bajoStock || stockDisponible <= stockMinimo) estado = "bajo";

        return {
          id: String(item.variante_id),
          producto: item.producto_nombre ?? "",
          variante:
            varianteParts.length > 0
              ? varianteParts.join(" / ")
              : "Variante base",
          sku: item.sku ?? "",
          categoria: item.categoria_nombre ?? "Sin categoría",
          stockFisico,
          stockApartado,
          stockDisponible,
          stockMinimo,
          estado,
        };
      });

      setItems(mapped);
    } catch (err) {
      console.error(err);
      setItems([]);
      setError("No se pudieron cargar las existencias.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    void loadInventory(true);
  };

  const handleOpenMovementModal = (row?: InventoryRow | null) => {
    setSelectedMovementRow(row ?? null);
    setIsMovementModalOpen(true);
  };

  const handleCloseMovementModal = () => {
    setIsMovementModalOpen(false);
    setSelectedMovementRow(null);
    handleRefresh();
  };

  const handleRegisterFromAlert = (alertItem: AlertItem) => {
    const row = items.find((i) => i.id === alertItem.id) ?? null;
    setIsAlertsModalOpen(false);
    handleOpenMovementModal(row);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        item.producto.toLowerCase().includes(term) ||
        item.variante.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.categoria.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || item.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const alertItems = useMemo(
    () =>
      items
        .filter((i) => i.estado === "bajo" || i.estado === "agotado")
        .map((i) => ({
          id: i.id,
          nombre: `${i.producto} / ${i.variante}`,
          stockDisponible: i.stockDisponible,
          stockMinimo: i.stockMinimo,
          estado: i.estado as "bajo" | "agotado",
        })),
    [items],
  );

  const variantOptions = useMemo<VariantOption[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        producto: item.producto,
        variante: item.variante,
        sku: item.sku,
        stockFisico: item.stockFisico,
        stockApartado: item.stockApartado,
        stockDisponible: item.stockDisponible,
        stockMinimo: item.stockMinimo,
      })),
    [items],
  );

  const stats = useMemo(() => {
    const stockFisico = items.reduce((acc, item) => acc + item.stockFisico, 0);
    const stockDisponible = items.reduce(
      (acc, item) => acc + item.stockDisponible,
      0,
    );
    const lowStock = items.filter((item) => item.estado === "bajo").length;
    const agotados = items.filter((item) => item.estado === "agotado").length;

    return {
      totalVariantes: items.length,
      stockFisico,
      stockDisponible,
      lowStock,
      agotados,
    };
  }, [items]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  return (
    <section className={styles.inventory}>
      <header className={styles.header}>
        <div>
          <AdminBreadcrumbs items={[{ label: "Inventario" }]} />
          <h1 className={styles.title}>Inventario</h1>
          <p className={styles.subtitle}>
            Consulta el inventario por variante, disponible, apartado y estado
            actual.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.alertsBtn}
            onClick={() => setIsAlertsModalOpen(true)}
            disabled={alertItems.length === 0}
          >
            <AlertTriangle size={18} />
            Alertas
            {alertItems.length > 0 && (
              <span className={styles.alertsBadge}>{alertItems.length}</span>
            )}
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => handleOpenMovementModal(null)}
          >
            <ArrowRightLeft size={18} />
            Registrar movimiento
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void handleRefresh()}
          >
            <RefreshCw
              size={18}
              className={refreshing ? styles.spinning : ""}
            />
            Actualizar
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <article className={`${styles.statCard} ${styles.primaryCard}`}>
          <Boxes size={28} />
          <div>
            <span>Total variantes</span>
            <strong>{stats.totalVariantes}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.infoCard}`}>
          <Package size={28} />
          <div>
            <span>Stock físico</span>
            <strong>{stats.stockFisico}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.warningCard}`}>
          <AlertTriangle size={28} />
          <div>
            <span>Stock disponible</span>
            <strong>{stats.stockDisponible}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.dangerCard}`}>
          <ArrowRightLeft size={28} />
          <div>
            <span>En alerta</span>
            <strong>{stats.lowStock + stats.agotados}</strong>
          </div>
        </article>
      </div>

      <section className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por producto, variante, SKU o categoría"
          />
        </div>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as "all" | "ok" | "bajo" | "agotado",
            )
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
          <div className={styles.centerState}>Cargando existencias...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.centerState}>
            No hay existencias para mostrar.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Variante</th>
                  <th>Categoría</th>
                  <th>SKU</th>
                  <th>Físico</th>
                  <th>Apartado</th>
                  <th>Disponible</th>
                  <th>Mínimo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.producto}</td>
                    <td>{item.variante}</td>
                    <td>{item.categoria}</td>
                    <td>{item.sku}</td>
                    <td>{item.stockFisico}</td>
                    <td>{item.stockApartado}</td>
                    <td>{item.stockDisponible}</td>
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
                        <Link
                          to={`/inventory/variants/${item.id}/movements`}
                          className={styles.actionBtn}
                        >
                          Movimientos
                        </Link>
                        <button
                          type="button"
                          className={styles.actionBtnSecondary}
                          onClick={() => handleOpenMovementModal(item)}
                        >
                          Ajustar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <InventoryAlertsModal
        open={isAlertsModalOpen}
        alerts={alertItems}
        onClose={() => setIsAlertsModalOpen(false)}
        onRegisterMovement={handleRegisterFromAlert}
      />

      <InventoryMovementModal
        isOpen={isMovementModalOpen}
        onClose={handleCloseMovementModal}
        title={
          selectedMovementRow
            ? "Registrar movimiento"
            : "Registrar movimiento global"
        }
        subtitle={
          selectedMovementRow
            ? "Realiza un movimiento rápido sobre la variante seleccionada."
            : "Selecciona una variante y registra un movimiento de inventario."
        }
        producto={selectedMovementRow?.producto ?? ""}
        variante={selectedMovementRow?.variante ?? ""}
        sku={selectedMovementRow?.sku ?? ""}
        variante_id={selectedMovementRow?.id ?? ""}
        stockFisico={selectedMovementRow?.stockFisico ?? 0}
        stockApartado={selectedMovementRow?.stockApartado ?? 0}
        stockDisponible={selectedMovementRow?.stockDisponible ?? 0}
        stockMinimo={selectedMovementRow?.stockMinimo ?? 0}
        variantOptions={variantOptions}
      />
    </section>
  );
};

export default Inventory;
