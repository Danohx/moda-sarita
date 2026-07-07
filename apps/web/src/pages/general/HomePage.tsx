import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "@shared/styles/HomePage.module.css";
import ProductCard from "@shared/components/common/ProductCard";
import { productosApi, type Producto } from "@shared/api/productos.api";

type HomeProduct = {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

const FALLBACK_FEATURED: HomeProduct[] = [
  { id: "1", title: "Blusa Seda", description: "Elegancia pura.", price: 450 },
  { id: "2", title: "Vestido Floral", description: "Verano 2026.", price: 600 },
  { id: "3", title: "Jeans Skinny", description: "Ajuste perfecto.", price: 550 },
  { id: "4", title: "Chaqueta Piel", description: "Estilo rebelde.", price: 800 },
];

function mapProductoToHome(producto: Producto): HomeProduct {
  return {
    id: producto.id,
    title: producto.nombre,
    description: producto.descripcion ?? "Producto disponible en Moda Sarita.",
    price: Number(
      producto.precio_desde ??
        producto.precio_venta ??
        producto.precio_hasta ??
        0,
    ),
    imageUrl: producto.imagen_principal ?? undefined,
  };
}

const HomePage = () => {
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featuredProducts = useMemo(() => {
    return products.length > 0 ? products : FALLBACK_FEATURED;
  }, [products]);

  useEffect(() => {
    let mounted = true;

    async function loadHomeProducts() {
      try {
        setLoading(true);
        setError(null);

        const response = await productosApi.getAllPublic({
          destacado: true,
        });

        if (!mounted) return;

        const data = Array.isArray(response.data) ? response.data : [];

        setProducts(data.slice(0, 4).map(mapProductoToHome));
      } catch (err) {
        console.error("Error cargando productos del home:", err);

        if (mounted) {
          setProducts([]);
          setError("No se pudieron cargar los productos. Mostrando datos de ejemplo.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadHomeProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.subtitle}>NUEVA COLECCIÓN 2026</span>

          <h1 className={styles.title}>
            Redefine Tu <span className={styles.highlight}>Estilo</span>
          </h1>

          <p className={styles.description}>
            Moda que sientes, estilo que expresas. Piezas únicas diseñadas para ti.
          </p>

          <Link to="/catalogo" className={styles.ctaButton}>
            Explorar Catálogo
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featured}>
        <h2 className={styles.sectionTitle}>Tendencias de Temporada</h2>

        {loading && (
          <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            Cargando productos...
          </p>
        )}

        {!loading && error && (
          <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {error}
          </p>
        )}

        <div className={styles.grid}>
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;