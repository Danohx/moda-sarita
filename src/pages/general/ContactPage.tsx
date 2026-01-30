import styles from '../../styles/AuthStyles.module.css';

const ContactPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        <h1 className={styles.title}>Contáctanos</h1>
        <p className={styles.subtitle}>Estamos aquí para ayudarte</p>
        
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <p><strong>📍 Dirección:</strong> Av. Principal #123, Centro.</p>
            <p><strong>📞 Teléfono:</strong> 555-0102</p>
            <p><strong>📧 Correo:</strong> contacto@modasarita.com</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert("Mensaje enviado (Simulado)"); }}>
            <div className={styles.inputGroup}>
                <input type="text" placeholder="Tu Nombre" className={styles.input} required />
            </div>
            <div className={styles.inputGroup}>
                <input type="email" placeholder="Tu Correo" className={styles.input} required />
            </div>
            <div className={styles.inputGroup}>
                <textarea 
                    placeholder="¿En qué podemos ayudarte?" 
                    className={styles.input} 
                    style={{ height: '100px', resize: 'none' }} 
                    required 
                />
            </div>
            <button type="submit" className={styles.primaryButton}>Enviar Mensaje</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;