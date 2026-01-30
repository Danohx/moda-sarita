import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../styles/ProductDetail.module.css';
import { PRODUCTS } from '../../data/Products'; // O pega el array aquí si no creaste el archivo

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const found = PRODUCTS.find(p => p.id === Number(id));
    if (found) {
      setProduct(found);
    } else {
      navigate('/catalogo');
    }
  }, [id, navigate]);

  if (!product) return <div style={{padding: '4rem', textAlign: 'center'}}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <button onClick={() => navigate('/catalogo')} className={styles.backButton}>
        <span className="material-symbols-outlined">arrow_back</span>
        Volver al catálogo
      </button>

      <div className={styles.content}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img src={product.image} alt={product.title} />
          </div>
        </div>

        <div className={styles.info}>
          <span className={styles.badge}>NUEVO</span>
          <h1 className={styles.title}>{product.title}</h1>
          
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[1,2,3,4,5].map(s => (
                  <span key={s} className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              ))}
            </div>
            <span className={styles.ratingCount}>(12 reseñas)</span>
          </div>

          <p className={styles.price}>${product.price.toFixed(2)}</p>
          
          <p className={styles.description}>
            {product.description}
          </p>

          <div className={styles.options}>
            <h3 className={styles.optionTitle}>Talla</h3>
            <div className={styles.sizes}>
              {['CH', 'M', 'G'].map(size => (
                <button key={size} className={styles.sizeButton}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <div className={styles.quantitySelector}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={styles.qtyBtn}>
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className={styles.qtyBtn}>
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            
            <button className={styles.addToCartBtn}>
              <span className="material-symbols-outlined">shopping_cart</span>
              Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;