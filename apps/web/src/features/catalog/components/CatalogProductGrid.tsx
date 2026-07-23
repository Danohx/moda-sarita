import type { Producto } from "@shared/api/productos.api";
import { ProductCard } from "@web/features/home/components/ProductCard";
import styles from "./CatalogProductGrid.module.css";

type CatalogProductGridProps = {
  products: Producto[];
};

export function CatalogProductGrid({ products }: CatalogProductGridProps) {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
