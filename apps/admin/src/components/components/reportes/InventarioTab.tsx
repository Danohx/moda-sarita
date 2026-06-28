import type {
  InventarioTabData,
  ReporteInventarioCritico,
  ReporteValor,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/InventarioTab.module.css";

type InventarioTabProps = {
  data: InventarioTabData | null;
  loading: boolean;
};

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatOptionalMoney(value: ReporteValor | undefined): string {
  if (value === undefined || value === null) {
    return "Sin permiso";
  }

  return formatMoney(value);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "P";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function getStockClass(stockDisponible: ReporteValor | undefined): string {
  const stock = toNumber(stockDisponible);

  if (stock <= 0) return styles.stockDanger;
  if (stock <= 3) return styles.stockWarning;

  return styles.stockOk;
}

function getEstadoInventario(item: ReporteInventarioCritico): {
  label: string;
  className: string;
} {
  const stockDisponible = toNumber(item.stock_disponible);

  if (stockDisponible <= 0) {
    return {
      label: "Sin stock",
      className: `${styles.badge} ${styles.badgeDanger}`,
    };
  }

  if (item.bajo_stock) {
    return {
      label: "Bajo stock",
      className: `${styles.badge} ${styles.badgeWarning}`,
    };
  }

  return {
    label: "Disponible",
    className: `${styles.badge} ${styles.badgeOk}`,
  };
}

function ProductImage({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  if (!src) {
    return <div className={styles.productPlaceholder}>{getInitials(alt)}</div>;
  }

  return <img className={styles.productImage} src={src} alt={alt} loading="lazy" />;
}

function InventarioMetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <strong className={styles.metricValue}>{value}</strong>
      <span className={styles.metricHelper}>{helper}</span>
    </article>
  );
}

function MovimientoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className={styles.movementCard}>
      <p className={styles.movementLabel}>{label}</p>
      <strong className={styles.movementValue}>{value}</strong>
    </article>
  );
}

function InventarioCriticoTable({
  products,
}: {
  products: ReporteInventarioCritico[];
}) {
  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay productos críticos en inventario.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>SKU</th>
            <th>Físico</th>
            <th>Apartado</th>
            <th>Disponible</th>
            <th>Mínimo</th>
            <th>Estado</th>
            <th>Precio venta</th>
            <th>Valor costo</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const estado = getEstadoInventario(product);

            return (
              <tr key={product.variante_id}>
                <td>
                  <div className={styles.productCell}>
                    <ProductImage
                      src={product.imagen_principal}
                      alt={product.producto}
                    />

                    <div>
                      <span className={styles.productName}>
                        {product.producto}
                      </span>
                      <span className={styles.productMeta}>
                        Variante: {product.variante_id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </td>

                <td>{product.categoria ?? "Sin categoría"}</td>

                <td>{product.sku ?? "Sin SKU"}</td>

                <td>{formatNumber(product.stock_fisico)}</td>

                <td>{formatNumber(product.stock_apartado)}</td>

                <td className={getStockClass(product.stock_disponible)}>
                  {formatNumber(product.stock_disponible)}
                </td>

                <td>{formatNumber(product.stock_minimo)}</td>

                <td>
                  <span className={estado.className}>{estado.label}</span>
                </td>

                <td>{formatOptionalMoney(product.precio_venta)}</td>

                <td className={styles.tableStrong}>
                  {formatOptionalMoney(product.valor_costo)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function InventarioTab({ data, loading }: InventarioTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando inventario...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información de inventario.
      </div>
    );
  }

  const resumen = data.resumen;
  const movimientos = data.movimientos;

  return (
    <section className={styles.inventarioTab}>
      <div className={styles.metricsGrid}>
        <InventarioMetricCard
          label="Productos activos"
          value={formatNumber(resumen.productos_activos)}
          helper="Productos disponibles en catálogo"
        />

        <InventarioMetricCard
          label="Variantes activas"
          value={formatNumber(resumen.variantes_activas)}
          helper="Combinaciones de talla/color"
        />

        <InventarioMetricCard
          label="Stock físico"
          value={formatNumber(resumen.stock_fisico_total)}
          helper="Unidades existentes"
        />

        <InventarioMetricCard
          label="Stock apartado"
          value={formatNumber(resumen.stock_apartado_total)}
          helper="Unidades reservadas"
        />

        <InventarioMetricCard
          label="Stock disponible"
          value={formatNumber(resumen.stock_disponible_total)}
          helper="Unidades listas para venta"
        />

        <InventarioMetricCard
          label="Valor inventario"
          value={formatOptionalMoney(resumen.valor_inventario)}
          helper="Calculado con costo actual"
        />

        <InventarioMetricCard
          label="Bajo stock"
          value={formatNumber(resumen.productos_bajo_stock)}
          helper="Variantes en nivel crítico"
        />

        <InventarioMetricCard
          label="Sin stock"
          value={formatNumber(resumen.productos_sin_stock)}
          helper="Variantes agotadas"
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Movimientos del periodo</h3>
          <p className={styles.cardSubtitle}>
            Entradas, salidas y ajustes registrados dentro del rango seleccionado.
          </p>
        </header>

        <div className={styles.cardBody}>
          <div className={styles.movementsGrid}>
            <MovimientoCard
              label="Movimientos"
              value={formatNumber(movimientos.movimientos)}
            />

            <MovimientoCard
              label="Entradas"
              value={formatNumber(movimientos.entradas_unidades)}
            />

            <MovimientoCard
              label="Salidas"
              value={formatNumber(movimientos.salidas_unidades)}
            />

            <MovimientoCard
              label="Ajustes"
              value={formatNumber(movimientos.ajustes)}
            />
          </div>
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Inventario crítico</h3>
          <p className={styles.cardSubtitle}>
            Productos bajo stock o sin disponibilidad para venta.
          </p>
        </header>

        <div className={styles.cardBody}>
          <InventarioCriticoTable products={data.critico} />
        </div>
      </article>
    </section>
  );
}