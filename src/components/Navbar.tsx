// src/components/Navbar.jsx
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* LOGO */}
        <a href="/" className={styles.logo}>
          <span className={`material-symbols-outlined ${styles.logoIcon}`}>diamond</span>
          Moda Sarita
        </a>

        {/* MENÚ (Solo visual) */}
        <ul className={styles.navMenu}>
          <li><a href="#" className={styles.navLink}>Inicio</a></li>
          <li><a href="#" className={styles.navLink}>Catálogo</a></li>
          <li><a href="#" className={styles.navLink}>Ofertas</a></li>
          <li><a href="#" className={styles.navLink}>Contacto</a></li>
        </ul>

        {/* ICONOS */}
        <div className={styles.navActions}>
          <button className={styles.iconButton}>
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className={styles.iconButton}>
            <span className="material-symbols-outlined">shopping_bag</span>
          </button>
          <button className={styles.iconButton}>
             <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;