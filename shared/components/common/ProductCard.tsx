import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/ProductCard.module.css';

interface ProductCardProps {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, description, price, imageUrl }) => {
  const imageSrc = imageUrl || `https://loremflickr.com/400/600/woman,fashion,?random=${id}`;

  return (
    <div className={styles.card}>
      
      <Link to={`/catalogo/${id}`} className={styles.imageLink}>
        <div className={styles.imageContainer}>
            <img src={imageSrc} alt={title} />
            <span className={styles.badge}>NUEVO</span>
        </div>
      </Link>

      <div className={styles.content}>
        <Link to={`/catalogo/${id}`} className={styles.titleLink}>
            <h3 className={styles.title}>{title}</h3>
        </Link>

        {description && <p className={styles.description}>{description}</p>}
        
        <div className={styles.footer}>
          <span className={styles.price}>${Number(price).toFixed(2)}</span>
          <button className={styles.cartButton} title="Agregar al carrito">
            <span className="material-symbols-outlined">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;