import { useSearchParams, Link } from 'react-router-dom';
import styles from '../../styles/CatalogPage.module.css';
import ProductCard from '../../components/common/ProductCard';

// Mock Data para que funcione sin backend
const PRODUCTS_DB = Array(12).fill(null).map((_, i) => ({
  id: (i + 1).toString(),
  title: `Prenda Estilo ${i + 1}`,
  description: 'Diseño exclusivo de temporada.',
  price: 300 + (i * 50),
  isOffer: i % 3 === 0, // Algunos en oferta
  category: i % 2 === 0 ? 'vestidos' : 'blusas'
}));

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. LEER URL (Cumple Punto 4)
  const busqueda = searchParams.get('q') || '';
  const filtroOferta = searchParams.get('filtro') === 'ofertas';

  // 2. FILTRAR DATOS
  const products = PRODUCTS_DB.filter(p => {
    const matchText = p.title.toLowerCase().includes(busqueda.toLowerCase());
    const matchOffer = filtroOferta ? p.isOffer : true;
    return matchText && matchOffer;
  });

  // Helper para cambiar filtros
  const toggleOferta = () => {
    const newParams = new URLSearchParams(searchParams);
    if (filtroOferta) newParams.delete('filtro');
    else newParams.set('filtro', 'ofertas');
    setSearchParams(newParams);
  };

  return (
    <div className={styles.container}>
      
      {/* Header con Breadcrumbs (Cumple Punto 5) */}
      <div className={styles.header}>
         <h1 className={styles.pageTitle}>Catálogo</h1>
         
         <div className={styles.breadcrumbs}>
            <Link to="/" className={styles.crumbLink}>Inicio</Link> 
            <span className={styles.separator}>/</span>
            <span className={styles.current}>Catálogo</span>
            
            {busqueda && (
                <>
                    <span className={styles.separator}>/</span>
                    <span className={styles.filterTag}>"{busqueda}"</span>
                </>
            )}
            {filtroOferta && (
                <>
                    <span className={styles.separator}>/</span>
                    <span className={styles.filterTag}>Ofertas</span>
                </>
            )}
         </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar de Filtros */}
        <aside className={styles.sidebar}>
           <h3 className={styles.sidebarTitle}>Filtros</h3>
           
           <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={filtroOferta}
                    onChange={toggleOferta}
                  />
                  <span className={styles.checkmark}></span>
                  Solo Ofertas 🔥
              </label>
           </div>

           <button 
             onClick={() => setSearchParams({})}
             className={styles.resetButton}
           >
             Limpiar Filtros
           </button>
        </aside>

        {/* Grid de Resultados */}
        <main className={styles.mainContent}>
           <div className={styles.resultsInfo}>
              <strong>{products.length}</strong> productos encontrados
           </div>

           <div className={styles.grid}>
             {products.length > 0 ? (
                products.map(p => <ProductCard key={p.id} {...p} />)
             ) : (
                <div className={styles.noResults}>
                    <span className="material-symbols-outlined">search_off</span>
                    <p>No encontramos lo que buscas.</p>
                </div>
             )}
           </div>
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;