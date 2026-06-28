import type {
  ProductosTabData,
  ReporteProducto,
  ReporteProductoSinVenta,
  ReporteValor,
} from "@admin/types/reportes.types";
import { formatMoney, formatNumber } from "@admin/utils/reportesFormat";
import styles from "../../../../styles/components/reportes/ProductosTab.module.css";
import { useState } from "react";

type ProductosTabProps = {
  data: ProductosTabData | null;
  loading: boolean;
};

const PAGE_SIZE = 10;

function Pagination({
  total,
  page,
  pageSize,
  onPage,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.pageBtn}
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
      >
        ‹ Anterior
      </button>

      <span className={styles.pageInfo}>
        {page + 1} / {totalPages}
      </span>

      <button
        type="button"
        className={styles.pageBtn}
        disabled={page >= totalPages - 1}
        onClick={() => onPage(page + 1)}
      >
        Siguiente ›
      </button>
    </div>
  );
}

function toNumber(value: ReporteValor | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "P";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function ProductImage({
  src,
  alt,
  size = "large",
}: {
  src?: string | null;
  alt: string;
  size?: "small" | "large";
}) {
  const placeholderClass =
    size === "small" ? styles.tablePlaceholder : styles.productPlaceholder;

  const imageClass = size === "small" ? styles.tableThumb : styles.productImage;

  if (!src) {
    return <div className={placeholderClass}>{getInitials(alt)}</div>;
  }

  return <img className={imageClass} src={src} alt={alt} loading="lazy" />;
}

function ProductRankingList({
  title,
  subtitle,
  products,
  emptyText,
}: {
  title: string;
  subtitle: string;
  products: ReporteProducto[];
  emptyText: string;
}) {
  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardSubtitle}>{subtitle}</p>
      </header>

      <div className={styles.cardBody}>
        {products.length === 0 ? (
          <div className={styles.emptyState}>{emptyText}</div>
        ) : (
          <div className={styles.productList}>
            {products.slice(0, 6).map((product) => (
              <article key={product.producto_id} className={styles.productItem}>
                <ProductImage
                  src={product.imagen_principal}
                  alt={product.producto}
                />

                <div className={styles.productInfo}>
                  <p className={styles.productName}>{product.producto}</p>
                  <span className={styles.productSku}>
                    SKU: {product.sku ?? "Sin SKU"}
                  </span>
                </div>

                <div className={styles.productStats}>
                  <strong className={styles.productMoney}>
                    {formatMoney(product.ingresos)}
                  </strong>
                  <span className={styles.productUnits}>
                    {formatNumber(product.unidades_vendidas)} unidades
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ProductosSinVentasTable({
  products,
}: {
  products: ReporteProductoSinVenta[];
}) {
  const [page, setPage] = useState(0);
  const slice = products.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay productos sin ventas en este periodo.
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Stock disponible</th>
              <th>Precio venta</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((product) => (
              <tr key={product.producto_id}>
                <td>
                  <div className={styles.tableProduct}>
                    <ProductImage
                      src={product.imagen_principal}
                      alt={product.producto}
                      size="small"
                    />
                    <div>
                      <span className={styles.tableProductName}>
                        {product.producto}
                      </span>
                      <span className={styles.tableSku}>
                        {product.sku ?? "Sin SKU"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.badge}>
                    {product.sku ?? "Sin SKU"}
                  </span>
                </td>
                <td className={styles.tableStrong}>
                  {formatNumber(product.stock_disponible)}
                </td>
                <td>{formatMoney(product.precio_venta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        total={products.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
      />
    </>
  );
}

function ProductosVendidosTable({ products }: { products: ReporteProducto[] }) {
  const [page, setPage] = useState(0);
  const slice = products.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        No hay productos vendidos en este periodo.
      </div>
    );
  }

  const totalIngresos = products.reduce(
    (sum, p) => sum + toNumber(p.ingresos),
    0,
  );
  const totalUnidades = products.reduce(
    (sum, p) => sum + toNumber(p.unidades_vendidas),
    0,
  );

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades</th>
              <th>Ingresos</th>
              <th>Participación</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((product) => {
              const ingresos = toNumber(product.ingresos);
              const participacion =
                totalIngresos > 0 ? (ingresos / totalIngresos) * 100 : 0;

              return (
                <tr key={product.producto_id}>
                  <td>
                    <div className={styles.tableProduct}>
                      <ProductImage
                        src={product.imagen_principal}
                        alt={product.producto}
                        size="small"
                      />
                      <div>
                        <span className={styles.tableProductName}>
                          {product.producto}
                        </span>
                        <span className={styles.tableSku}>
                          {product.sku ?? "Sin SKU"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{formatNumber(product.unidades_vendidas)}</td>
                  <td className={styles.tableStrong}>
                    {formatMoney(product.ingresos)}
                  </td>
                  <td>{participacion.toFixed(1)}%</td>
                </tr>
              );
            })}

            {/* Fila de totales solo en última página */}
            {page === Math.ceil(products.length / PAGE_SIZE) - 1 && (
              <tr>
                <td className={styles.tableStrong}>Total</td>
                <td className={styles.tableStrong}>
                  {formatNumber(totalUnidades)}
                </td>
                <td className={styles.tableStrong}>
                  {formatMoney(totalIngresos)}
                </td>
                <td className={styles.tableStrong}>100%</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        total={products.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPage={setPage}
      />
    </>
  );
}

export default function ProductosTab({ data, loading }: ProductosTabProps) {
  if (loading) {
    return <div className={styles.loadingState}>Cargando productos...</div>;
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        No se pudo cargar la información de productos.
      </div>
    );
  }

  return (
    <section className={styles.productosTab}>
      <div className={styles.gridTop}>
        <ProductRankingList
          title="Productos más vendidos"
          subtitle="Artículos con mayor movimiento en el periodo."
          products={data.masVendidos}
          emptyText="No hay productos vendidos en este periodo."
        />

        <ProductRankingList
          title="Productos menos vendidos"
          subtitle="Artículos con baja rotación durante el periodo."
          products={data.menosVendidos}
          emptyText="No hay información suficiente para este reporte."
        />
      </div>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Detalle de productos vendidos</h3>
          <p className={styles.cardSubtitle}>
            Ingresos, unidades vendidas y participación por producto.
          </p>
        </header>

        <div className={styles.cardBody}>
          <ProductosVendidosTable products={data.masVendidos} />
        </div>
      </article>

      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Productos sin ventas</h3>
          <p className={styles.cardSubtitle}>
            Productos activos que no tuvieron ventas en el periodo seleccionado.
          </p>
        </header>

        <div className={styles.cardBody}>
          <ProductosSinVentasTable products={data.sinVentas} />
        </div>
      </article>
    </section>
  );
}