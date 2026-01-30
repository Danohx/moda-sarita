import { Link } from 'react-router-dom';
import styles from '../../styles/HomePage.module.css';
import ProductCard from '../../components/common/ProductCard';

// Datos de ejemplo para la portada
const FEATURED = [
  { id: '1', title: 'Blusa Seda', description: 'Elegancia pura.', price: 450 },
  { id: '2', title: 'Vestido Floral', description: 'Verano 2026.', price: 600 },
  { id: '3', title: 'Jeans Skinny', description: 'Ajuste perfecto.', price: 550 },
  { id: '4', title: 'Chaqueta Piel', description: 'Estilo rebelde.', price: 800 },
];

const HomePage = () => {
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
        <div className={styles.grid}>
          {FEATURED.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;