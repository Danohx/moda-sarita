import { useState } from 'react';
import '../../styles/ComingSoon.css';

interface MensajeEstado {
  tipo: 'exito' | 'error';
  texto: string;
}

const ComingSoon = () => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<MensajeEstado | null>(null);
  const URL_API = `${import.meta.env.VITE_URL_API}/api/suscripcion`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      const response = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje({ tipo: 'exito', texto: '¡Listo! Revisa tu correo (mira en spam por si acaso).' });
        setEmail('');
      } else {
        setMensaje({ tipo: 'error', texto: data.msg || 'Algo salió mal.' });
      }

    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión. Intenta más tarde.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="coming-soon-container">
      <div className="glass-card">
        <span className="material-symbols-outlined main-icon" aria-hidden="true">rocket_launch</span>
        
        <h1 className="headline">¡Moda Sarita llega a Internet!</h1>
        <p className="subtext">
          Estamos construyendo nuestra <strong>primera tienda virtual</strong>.
          <br />
          Muy pronto podrás ver todo nuestro catálogo y estrenar tus favoritos 
          sin salir de casa.
        </p>

        {/* FORMULARIO */}
        <form 
          onSubmit={handleSubmit} 
          style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}
          aria-label="Formulario de suscripción"
        >
          <input 
            type="email" 
            id="email-input"
            name="email"
            aria-label="Dirección de correo electrónico para notificaciones"
            placeholder="Escribe tu correo aquí..." 
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            style={{
              padding: '14px 20px',
              borderRadius: '30px',
              border: '2px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              width: '85%',
              fontSize: '16px',
              outline: 'none',
              textAlign: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ec1380'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />

          <button 
            className="notify-btn" 
            type="submit" 
            disabled={loading}
            aria-busy={loading}
            style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {loading ? 'hourglass_top' : 'notifications_active'}
            </span>
            {loading ? 'Enviando...' : 'Avísame del lanzamiento'}
          </button>
        </form>

        {/* MENSAJE DE FEEDBACK */}
        {mensaje && (
          <div role="alert" aria-live="polite">
            <p style={{ 
              marginTop: '15px', 
              fontSize: '14px', 
              color: mensaje.tipo === 'exito' ? 'green' : '#d32f2f',
              fontWeight: 'bold' 
            }}>
              {mensaje.texto}
            </p>
          </div>
        )}
        
        <footer style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '14px', opacity: 0.8 }}>
              Mientras tanto, síguenos en Facebook:
            </p>
            
            <a 
              href="https://web.facebook.com/profile.php?id=100064330681893" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Visitar página de Facebook de Moda Sarita"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: '#ec1380',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <span className="material-symbols-outlined" aria-hidden="true">thumb_up</span>
              Moda Sarita
            </a>
        </footer>
      </div>
    </main>
  );
};

export default ComingSoon;