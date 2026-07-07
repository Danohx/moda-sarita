import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { RefreshCw, Search } from "lucide-react";
import styles from "../../../styles/InventoryMovements.module.css";
import { inventarioService } from "@admin/services/inventario.service";
import type {
  MovimientoInventario,
  TipoMovimiento,
} from "@shared/api/inventario.api";
import AdminBreadcrumbs from "../../components/layout/AdminBreadcrumbs";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";

interface VariantInfo {
  producto: string;
  variante: string;
  sku: string;
  stockFisico: number;
  apartado: number;
  disponible: number;
}

interface MovementItem {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  usuario: string;
}

const VARIANT: VariantInfo = {
  producto: "",
  variante: "",
  sku: "",
  stockFisico: 0,
  apartado: 0,
  disponible: 0,
};

const BADGE_CLASS: Record<MovementItem["tipo"], string> = {
  ENTRADA: styles.badgeEntry,
  SALIDA: styles.badgeExit,
  AJUSTE: styles.badgeAdjust,
  SET_STOCK: styles.badgeAdjust,
};

const InventoryVariantMovements: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  const canReadMovements = canAccess(user, {
    permissions: "inventario.movimientos.read",
  });

  const [variant, setVariant] = useState<VariantInfo>(VARIANT);
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!canReadMovements) {
        setVariant(VARIANT);
        setMovements([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (!id) {
        setError("No se recibió el identificador de la variante.");
        setVariant(VARIANT);
        setMovements([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        setError(null);

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [stockResponse, movementsResponse] = await Promise.all([
          inventarioService.getVariantStock(id),
          inventarioService.getVariantMovements(id),
        ]);

        const stock = stockResponse;
        const kardex: MovimientoInventario[] = movementsResponse ?? [];

        const talla = stock.talla_nombre;
        const color = stock.color_nombre;

        const variante =
          !talla && !color
            ? "Variante base"
            : [talla, color].filter(Boolean).join(" / ");

        setVariant({
          producto: stock.producto_nombre ?? "",
          variante,
          sku: stock.sku ?? "",
          stockFisico: Number(stock.stock_fisico ?? 0),
          apartado: Number(stock.stock_apartado ?? 0),
          disponible: Number(stock.stock_disponible ?? 0),
        });

        setMovements(
          kardex.map((item) => ({
            id: String(item.id),
            fecha: new Date(item.fecha).toLocaleString("es-MX", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
            tipo: item.tipo,
            cantidad: Number(item.cantidad ?? 0),
            motivo: item.motivo ?? "",
            usuario: item.usuario_email ?? "Sin usuario",
          })),
        );
      } catch (err) {
        console.error("Error cargando movimientos de inventario:", err);
        setVariant(VARIANT);
        setMovements([]);
        setError("No se pudieron cargar los movimientos de inventario.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canReadMovements, id],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return movements;
    return movements.filter(
      (m) =>
        m.motivo.toLowerCase().includes(term) ||
        m.usuario.toLowerCase().includes(term) ||
        m.tipo.toLowerCase().includes(term),
    );
  }, [movements, search]);

  if (!canReadMovements) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <div>
            <AdminBreadcrumbs
              items={[
                { label: "Inventario", to: "/inventory" },
                { label: "Movimientos" },
              ]}
            />
            <h1 className={styles.title}>Movimientos</h1>
            <p className={styles.subtitle}>
              No tienes permisos para consultar movimientos de inventario.
            </p>
          </div>
        </header>

        <div className={styles.centerState}>
          No tienes permiso para ver movimientos.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <AdminBreadcrumbs
            items={[
              { label: "Inventario", to: "/inventory" },
              { label: "Movimientos" },
            ]}
          />
          <h1 className={styles.title}>
            Movimientos —{" "}
            <span className={styles.titleVariant}>{variant.variante}</span>
          </h1>
          <p className={styles.subtitle}>
            Historial de entradas, salidas y ajustes de esta variante.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => void loadData(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={16}
              className={refreshing ? styles.spinning : undefined}
            />
            Actualizar
          </button>
        </div>
      </header>

      {error ? <div className={styles.centerState}>{error}</div> : null}

      <section className={styles.variantCard}>
        <div className={styles.variantTop}>
          <div className={styles.variantAvatar}>
            {variant.producto.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={styles.variantProductName}>{variant.producto}</p>
            <div className={styles.variantMeta}>
              <span>{variant.variante}</span>
              <code className={styles.skuTag}>{variant.sku}</code>
            </div>
          </div>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Stock físico</span>
            <span className={`${styles.metricVal} ${styles.metricOk}`}>
              {variant.stockFisico}
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Apartado</span>
            <span className={styles.metricVal}>{variant.apartado}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Disponible</span>
            <span className={`${styles.metricVal} ${styles.metricOk}`}>
              {variant.disponible}
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Movimientos</span>
            <span className={styles.metricVal}>{movements.length}</span>
          </div>
        </div>
      </section>

      <section className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tipo, motivo o usuario…"
          />
        </div>
      </section>

      <section className={styles.tableCard}>
        {loading ? (
          <div className={styles.centerState}>Cargando movimientos…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.centerState}>
            No hay movimientos para mostrar.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Motivo</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.tdMuted}>{item.fecha}</td>
                    <td>
                      <span className={BADGE_CLASS[item.tipo]}>
                        {item.tipo}
                      </span>
                    </td>
                    <td
                      className={`${styles.tdMono} ${item.cantidad < 0 ? styles.tdDanger : ""}`}
                    >
                      {item.cantidad > 0 ? `+${item.cantidad}` : item.cantidad}
                    </td>
                    <td>{item.motivo}</td>
                    <td className={styles.tdMuted}>{item.usuario}</td>
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

export default InventoryVariantMovements;