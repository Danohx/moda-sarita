import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
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
  type StockAlertItem,
} from "@admin/components/components/InventoryAlertsModal";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";
import { useSearchParams } from "react-router-dom";

// Interfaces sin cambios
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

const PAGE_SIZE = 50;

function buildAlertItems(
    data: Awaited<ReturnType<typeof inventarioService.getAlertas>>,
  ): AlertItem[] {
    const bajoStock: AlertItem[] = data.bajo_stock.map((item) => {
      const stockDisponible = Number(item.stock_disponible ?? 0);
      const stockMinimo = Number(item.stock_minimo ?? 0);

      return {
        id: `bajo-stock-${item.variante_id}`,
        type: "bajo_stock",
        varianteId: String(item.variante_id),
        productoId: String(item.producto_id),
        title: [
          item.producto_nombre,
          item.talla_nombre ? `Talla ${item.talla_nombre}` : null,
          item.color_nombre ? `Color ${item.color_nombre}` : null,
        ]
          .filter(Boolean)
          .join(" • "),
        nombre: item.producto_nombre,
        message: `${item.producto_nombre} tiene ${stockDisponible} disponibles. Mínimo configurado: ${stockMinimo}.`,
        stockDisponible,
        stockMinimo,
        estado: stockDisponible <= 0 ? "agotado" : "bajo",
        href: `/inventory/variants/${item.variante_id}/movements`,
      };
    });

    const sinImagen: AlertItem[] = data.productos_sin_imagen.map((item) => ({
      id: `sin-imagen-${item.producto_id}`,
      type: "sin_imagen",
      productoId: String(item.producto_id),
      title: item.nombre,
      message: "Este producto no tiene imagen principal asignada.",
      href: `/products/${item.producto_id}/images`,
    }));

    const sinCategoria: AlertItem[] = data.productos_sin_categoria.map(
      (item) => ({
        id: `sin-categoria-${item.producto_id}`,
        type: "sin_categoria",
        productoId: String(item.producto_id),
        title: item.nombre,
        message: "Este producto no tiene categoría asignada.",
        href: `/products/${item.producto_id}/edit`,
      }),
    );

    return [...bajoStock, ...sinImagen, ...sinCategoria];
  }

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsCount, setAlertsCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState<
    "all" | "ok" | "bajo" | "agotado"
  >("all");
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedMovementRow, setSelectedMovementRow] =
    useState<InventoryRow | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchParams] = useSearchParams();

  const varianteIdFromUrl = searchParams.get("varianteId") ?? undefined;
  const productoIdFromUrl = searchParams.get("productoId") ?? undefined;

  // ── Carga principal ───────────────────────────────────────────────────────

  const loadAlerts = useCallback(async () => {
    try {
      const data = await inventarioService.getAlertas(20);
      const items = buildAlertItems(data);

      setAlerts(items);
      setAlertsCount(data.resumen.total);
    } catch (err) {
      console.error("Error cargando alertas de inventario:", err);
      setAlerts([]);
      setAlertsCount(0);
    }
  }, []);

  const loadInventory = useCallback(
    async (
      opts: {
        q?: string;
        p?: number;
        isRefresh?: boolean;
        varianteId?: string;
        productoId?: string;
      } = {},
    ) => {
      const {
        q = searchQuery,
        p = page,
        isRefresh = false,
        varianteId,
        productoId,
      } = opts;

      try {
        setError(null);
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result = await inventarioService.getExistencias({
          q: q.trim() || undefined,
          limit: PAGE_SIZE,
          offset: p * PAGE_SIZE,
          varianteId,
          productoId,
        });

        const mapped = (result.items ?? []).map((item) => {
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
        setTotal(result.pagination.total);
      } catch (err) {
        console.error(err);
        setItems([]);
        setError("No se pudieron cargar las existencias.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, page],
  );

  // Carga inicial
  useEffect(() => {
    void loadInventory({
      varianteId: varianteIdFromUrl,
      productoId: productoIdFromUrl,
      p: 0,
    });
    void loadAlerts();
  }, [loadInventory, productoIdFromUrl, varianteIdFromUrl, loadAlerts]);

  // ── Búsqueda con debounce ─────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value); // actualiza el input visualmente de inmediato

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setSearchQuery(value);
        setPage(0);
        void loadInventory({ q: value, p: 0 }); // consulta al servidor con el nuevo término
      }, 350);
    },
    [loadInventory],
  );

  // ── Paginación ────────────────────────────────────────────────────────────

  const goToPage = useCallback(
    (p: number) => {
      setPage(p);
      void loadInventory({ p });
    },
    [loadInventory],
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const start = Math.max(0, page - 2);
    const end = Math.min(totalPages, page + 3);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [page, totalPages]);

  // ── Refresh ───────────────────────────────────────────────────────────────

  const loadInventoryRef = useRef(loadInventory);
  useEffect(() => {
    loadInventoryRef.current = loadInventory;
  }, [loadInventory]);

  const handleRefresh = useCallback(() => {
    void loadInventoryRef.current({ isRefresh: true });
    void loadAlerts()
  }, [loadAlerts]);

  // ── Modales ───────────────────────────────────────────────────────────────

  const handleOpenMovementModal = useCallback((row?: InventoryRow | null) => {
    setSelectedMovementRow(row ?? null);
    setIsMovementModalOpen(true);
  }, []);

  const handleCloseMovementModal = useCallback(() => {
    setIsMovementModalOpen(false);
    setSelectedMovementRow(null);
    handleRefresh();
  }, [handleRefresh]);

  const handleRegisterFromAlert = useCallback(
    (alertItem: StockAlertItem) => {
      const row = items.find((i) => i.id === alertItem.id) ?? null;
      setIsAlertsModalOpen(false);
      handleOpenMovementModal(row);
    },
    [items, handleOpenMovementModal],
  );

  const handleCloseAlertsModal = useCallback(
    () => setIsAlertsModalOpen(false),
    [],
  );

  // ── Datos derivados ───────────────────────────────────────────────────────

  // El filtro de estado se aplica solo sobre la página actual (es local)
  // La búsqueda por texto va siempre al servidor
  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((item) => item.estado === statusFilter);
  }, [items, statusFilter]);

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

  // Stats sobre TODOS los registros del servidor (total), no solo la página
  const stats = useMemo(() => {
    const stockFisico = items.reduce((acc, i) => acc + i.stockFisico, 0);
    const stockDisponible = items.reduce(
      (acc, i) => acc + i.stockDisponible,
      0,
    );
    const lowStock = items.filter((i) => i.estado === "bajo").length;
    const agotados = items.filter((i) => i.estado === "agotado").length;
    return {
      totalVariantes: total,
      stockFisico,
      stockDisponible,
      lowStock,
      agotados,
    };
  }, [items, total]);

  // ── Render ────────────────────────────────────────────────────────────────

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
          >
            <AlertTriangle size={18} />
            Alertas
            {alertsCount > 0 ? (
              <span className={styles.alertBadge}>{alertsCount}</span>
            ) : null}
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
            onClick={handleRefresh}
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
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por producto, variante, SKU o categoría"
          />
          {/* Indicador de búsqueda activa */}
          {loading && searchInput && (
            <RefreshCw size={15} className={styles.spinning} />
          )}
        </div>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
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
            {searchInput
              ? `Sin resultados para "${searchInput}"`
              : "No hay existencias para mostrar."}
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

        {/* ── Paginación ── */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)}{" "}
              de {total} variantes
            </span>

            <div className={styles.paginationButtons}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => goToPage(page - 1)}
              >
                ← Anterior
              </button>

              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ""}`}
                  onClick={() => goToPage(n)}
                >
                  {n + 1}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageBtn}
                disabled={page >= totalPages - 1}
                onClick={() => goToPage(page + 1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </section>

      <InventoryAlertsModal
        open={isAlertsModalOpen}
        alerts={alerts}
        onClose={handleCloseAlertsModal}
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
