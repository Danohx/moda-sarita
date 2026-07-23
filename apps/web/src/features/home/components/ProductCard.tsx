import { ArrowUpRight, PackageX } from "lucide-react";
import { Link } from "react-router-dom";
import type { Producto } from "@shared/api/productos.api";
import { formatMoney } from "@web/lib/formatters";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Producto;
};

function getPriceLabel(product: Producto) {
  const from = Number(product.precio_desde ?? product.precio_venta ?? 0);
  const to = Number(product.precio_hasta ?? from);

  return from !== to
    ? `${formatMoney(from)} – ${formatMoney(to)}`
    : formatMoney(from);
}

function getAvailableStock(product: Producto) {
  if (product.stock_disponible_total !== undefined) {
    return Number(product.stock_disponible_total ?? 0);
  }

  return Number(product.stock_total ?? product.stock_fisico_total ?? 0);
}

export function ProductCard({ product }: ProductCardProps) {
  const stock = getAvailableStock(product);
  const soldOut = stock <= 0;
  const image = product.imagen_principal || "/images/product-placeholder.svg";

  return (
    <article className={styles.card}>
      <Link className={styles.imageLink} to={`/producto/${product.id}`}>
        <img
          src={image}
          alt={product.nombre}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/product-placeholder.svg";
          }}
        />
        {product.destacado && <span className={styles.featured}>Destacado</span>}
        {soldOut && (
          <span className={styles.soldOut}>
            <PackageX size={15} />
            Agotado
          </span>
        )}
      </Link>

      <div className={styles.body}>
        <div>
          <p className={styles.category}>{product.categoria_nombre || "Moda Sarita"}</p>
          <h3>
            <Link to={`/producto/${product.id}`}>{product.nombre}</Link>
          </h3>
        </div>
        <div className={styles.footer}>
          <strong>{getPriceLabel(product)}</strong>
          <Link
            className={styles.detailLink}
            to={`/producto/${product.id}`}
            aria-label={`Ver ${product.nombre}`}
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
