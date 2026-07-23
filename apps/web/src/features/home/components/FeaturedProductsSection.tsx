import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Producto } from "@shared/api/productos.api";
import { LoadingCards } from "@web/components/ui/LoadingCards";
import { SectionHeading } from "@web/components/ui/SectionHeading";
import { ProductCard } from "./ProductCard";
import styles from "./FeaturedProductsSection.module.css";

type FeaturedProductsSectionProps = {
  products: Producto[];
  loading: boolean;
};

export function FeaturedProductsSection({
  products,
  loading,
}: FeaturedProductsSectionProps) {
  return (
    <section className={`section ${styles.section}`} id="destacados" aria-labelledby="featured-title">
      <div className="container">
        <SectionHeading
          eyebrow="Selección especial"
          title="Productos destacados"
          description="Una muestra de las piezas disponibles en boutique y en nuestra tienda en línea."
          action={
            <Link className="text-link" to="/catalogo">
              Ver todo
              <ArrowRight size={18} />
            </Link>
          }
        />

        {loading ? (
          <LoadingCards count={4} />
        ) : products.length > 0 ? (
          <div className={styles.grid}>
            {products.slice(0, 8).map((product) => (
              <ProductCard key={String(product.id)} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <strong>Pronto encontrarás productos aquí.</strong>
            <p>
              Activa productos como destacados y agrega su imagen principal desde el panel administrativo.
            </p>
            <Link className="button button-primary" to="/catalogo">
              Ir al catálogo
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
