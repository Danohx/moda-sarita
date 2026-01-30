import { useState, type FormEvent } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../../styles/Navbar.module.css';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/?q=${busqueda}`);
      setIsOpen(false);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        
        {/* LOGO */}
        <NavLink to="/" className={styles.logo}>
           <span className="material-symbols-outlined" style={{color: '#ec1380'}}>checkroom</span>
           <span className={styles.brandName}>Moda Sarita</span>
        </NavLink>

        {/* HAMBURGUESA (Móvil) */}
        <button className={styles.hamburger} onClick={toggleMenu}>
          <span className="material-symbols-outlined">
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* MENÚ */}
        <ul className={`${styles.navMenu} ${isOpen ? styles.active : ''}`}>
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink} 
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/catalogo" 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
              onClick={() => setIsOpen(false)}
            >
              Catálogo
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/catalogo?filtro=ofertas" 
              className={styles.navLink}
              onClick={() => setIsOpen(false)}
            >
              Ofertas
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contacto" 
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </NavLink>
          </li>
        </ul>
        
        {/* ACCIONES */}
        <div className={styles.navActions}>
           
           {/* BÚSQUEDA */}
           <form onSubmit={handleSearch} className={styles.searchForm}>
             <input 
                type="text" 
                placeholder="Buscar..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.searchInput}
             />
             <button type="submit" className={styles.searchButton}>
               <span className="material-symbols-outlined">search</span>
             </button>
           </form>

           {/* CARRITO */}
           <button className={styles.iconButton} title="Carrito">
             <span className="material-symbols-outlined">shopping_bag</span>
           </button>
           
           {/* PERFIL / LOGIN */}
           {isAuthenticated ? (
              <NavLink 
                to="/configuracion" 
                className={styles.iconButton}
                title={`Hola, ${user?.nombre || 'Usuario'}`}
              >
                 <span className="material-symbols-outlined" style={{ color: '#ec1380', fontWeight: 'bold' }}>person</span>
              </NavLink>
           ) : (
              <NavLink to="/login" className={styles.iconButton} title="Iniciar Sesión">
                 <span className="material-symbols-outlined">person</span>
              </NavLink>
           )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;