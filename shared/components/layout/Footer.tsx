import { Link } from 'react-router-dom';
import styles from '../../styles/Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Sección Superior: Marca y Redes */}
      <div className={styles.footerTop}>
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>diamond</span>
            <div className={styles.logoText}>
              <span>MODA</span>
              <span className={styles.logoAccent}>SARITA</span>
            </div>
          </div>
          <p className={styles.tagline}>
            Donde cada prenda cuenta una historia y cada estilo tiene voz propia.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Instagram"><span className="material-symbols-outlined">photo_camera</span></a>
            <a href="#" aria-label="Facebook"><span className="material-symbols-outlined">facebook</span></a>
            <a href="#" aria-label="TikTok"><span className="material-symbols-outlined">video_library</span></a>
            <a href="#" aria-label="WhatsApp"><span className="material-symbols-outlined">chat</span></a>
          </div>
        </div>

        {/* Grid de Enlaces */}
        <div className={styles.linksGrid}>
          <div className={styles.linksSection}>
            <h3>Tienda</h3>
            <ul>
              <li><Link to="/catalogo">Nuevos Ingresos</Link></li>
              <li><Link to="/catalogo?q=blusas">Blusas</Link></li>
              <li><Link to="/catalogo?q=vestidos">Vestidos</Link></li>
              <li><Link to="/catalogo?q=pantalones">Pantalones</Link></li>
              <li><Link to="/catalogo?filtro=ofertas">Ofertas</Link></li>
            </ul>
          </div>

          <div className={styles.linksSection}>
            <h3>Servicios</h3>
            <ul>
              <li><Link to="#">Sistema de Apartados</Link></li>
              <li><Link to="#">Crédito de Moda</Link></li>
              <li><Link to="#">Personal Shopper</Link></li>
              <li><Link to="#">Tarjetas de Regalo</Link></li>
            </ul>
          </div>

          <div className={styles.linksSection}>
            <h3>Ayuda</h3>
            <ul>
              <li><Link to="#">Preguntas Frecuentes</Link></li>
              <li><Link to="#">Envíos y Entregas</Link></li>
              <li><Link to="#">Devoluciones</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          <div className={styles.linksSection}>
            <h3>Legal</h3>
            <ul>
              <li><Link to="#">Privacidad</Link></li>
              <li><Link to="#">Términos y Condiciones</Link></li>
              <li><Link to="#">Política de Cookies</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sección de Contacto Rápido */}
      <div className={styles.contactBar}>
        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>location_on</span>
          <div>
            <h4>Visítanos</h4>
            <p>Av. Revolución 123, Centro, Huejutla, Hgo.</p>
          </div>
        </div>
        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>call</span>
          <div>
            <h4>Llámanos</h4>
            <p>+52 771 123 4567</p>
          </div>
        </div>
        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>mail</span>
          <div>
            <h4>Escríbenos</h4>
            <p>hola@modasarita.com</p>
          </div>
        </div>
        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>schedule</span>
          <div>
            <h4>Horario</h4>
            <p>Lun-Sáb: 10:00 - 20:00</p>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Copyright y Pagos */}
      <div className={styles.footerBottom}>
        <div className={styles.paymentMethods}>
          <span>Aceptamos:</span>
          <div className={styles.paymentIcons}>
            <span className="material-symbols-outlined">credit_card</span>
            <span className="material-symbols-outlined">payments</span>
            <span className="material-symbols-outlined">qr_code</span>
            <span className="material-symbols-outlined">receipt</span>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>© {currentYear} Moda Sarita Boutique. Todos los derechos reservados.</p>
          <p className={styles.madeWith}>
            Diseñado con <span className="material-symbols-outlined" style={{fontSize: '14px', color: '#ec1380'}}>favorite</span> en Huejutla.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;