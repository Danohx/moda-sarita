// src/pages/ComingSoon.jsx
import '../styles/ComingSoon.css';

const ComingSoon = () => {
  return (
    <div className="coming-soon-container">
      <div className="glass-card">
        {/* Icono de lanzamiento */}
        <span className="material-symbols-outlined main-icon">rocket_launch</span>
        
        <h1 className="headline">¡Moda Sarita llega a Internet!</h1>
        <p className="subtext">
          Estamos construyendo nuestra <strong>primera tienda virtual</strong>.
          <br />
          Muy pronto podrás ver todo nuestro catálogo y estrenar tus favoritos 
          sin salir de casa.
        </p>

        <button className="notify-btn" onClick={() => alert("¡Gracias! Te avisaremos del lanzamiento.")}>
          <span className="material-symbols-outlined">notifications_active</span>
          Avísame del lanzamiento
        </button>
        
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '14px', opacity: 0.8 }}>
              Mientras tanto, síguenos en Facebook:
            </p>
            
            {/* ENLACE A FACEBOOK */}
            <a 
              href="https://web.facebook.com/profile.php?id=100064330681893" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'var(--color-primary-vibrant)',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <span className="material-symbols-outlined">thumb_up</span>
              Moda Sarita
            </a>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;