import { Link } from 'react-router-dom';
import styles from '../../styles/Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "2rem" }}
            >
              diamond
            </span>

            <div className={styles.logoText}>
              <span>MODA</span>
              <span className={styles.logoAccent}>SARITA</span>
            </div>
          </div>

          <p className={styles.tagline}>
            Donde cada prenda cuenta una historia y cada estilo tiene voz propia.
          </p>

          <div className={styles.socialLinks}>
            <a href="#" aria-label="Instagram">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href="#" aria-label="Facebook">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a href="#" aria-label="TikTok">
              <span className="material-symbols-outlined">smart_display</span>
            </a>
            <a href="#" aria-label="WhatsApp">
              <span className="material-symbols-outlined">chat</span>
            </a>
          </div>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.linksSection}>
            <h3>Tienda</h3>
            <ul>
              <li>
                <Link to="/catalogo">Catálogo</Link>
              </li>
              <li>
                <Link to="/catalogo?q=blusas">Blusas</Link>
              </li>
              <li>
                <Link to="/catalogo?q=vestidos">Vestidos</Link>
              </li>
              <li>
                <Link to="/catalogo?q=pantalones">Pantalones</Link>
              </li>
              <li>
                <Link to="/catalogo?filtro=ofertas">Ofertas</Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksSection}>
            <h3>Servicios</h3>
            <ul>
              <li>
                <Link to="/faq">Sistema de apartados</Link>
              </li>
              <li>
                <Link to="/faq">Crédito de Moda</Link>
              </li>
              <li>
                <Link to="/contacto">Atención personalizada</Link>
              </li>
              <li>
                <Link to="/contacto">Solicitar información</Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksSection}>
            <h3>Ayuda</h3>
            <ul>
              <li>
                <Link to="/faq">Preguntas frecuentes</Link>
              </li>
              <li>
                <Link to="/faq">Envíos y entregas</Link>
              </li>
              <li>
                <Link to="/faq">Cambios y devoluciones</Link>
              </li>
              <li>
                <Link to="/contacto">Contacto</Link>
              </li>
            </ul>
          </div>

          <div className={styles.linksSection}>
            <h3>Legal</h3>
            <ul>
              <li>
                <Link to="/aviso-de-privacidad">Aviso de privacidad</Link>
              </li>
              <li>
                <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
              </li>
              <li>
                <Link to="/aviso-de-privacidad">Protección de datos</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.contactBar}>
        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>
            location_on
          </span>
          <div>
            <h4>Visítanos</h4>
            <p>Huejutla de Reyes, Hidalgo</p>
          </div>
        </div>

        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>
            call
          </span>
          <div>
            <h4>Llámanos</h4>
            <p>Disponible próximamente</p>
          </div>
        </div>

        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>
            mail
          </span>
          <div>
            <h4>Escríbenos</h4>
            <p>contacto@modasarita.com</p>
          </div>
        </div>

        <div className={styles.contactItem}>
          <span className={`material-symbols-outlined ${styles.contactIcon}`}>
            schedule
          </span>
          <div>
            <h4>Horario</h4>
            <p>Lun-Sáb: 10:00 - 20:00</p>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.paymentMethods}>
          <span>Aceptamos:</span>
          <div className={styles.paymentIcons}>
            <span className="material-symbols-outlined">payments</span>
            <span className="material-symbols-outlined">credit_card</span>
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="material-symbols-outlined">qr_code</span>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>© {currentYear} Moda Sarita Boutique. Todos los derechos reservados.</p>
          <p className={styles.madeWith}>
            Diseñado con{" "}
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px", color: "#ec1380" }}
            >
              favorite
            </span>{" "}
            en Huejutla.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;