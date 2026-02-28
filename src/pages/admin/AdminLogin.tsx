export const AdminLogin = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Acceso Administrativo</h1>
        <p className="auth-subtitle">Ingresa tus credenciales de sistema</p>

        <form className="input-container">
          <div className="input-container">
            <label className="input-label">ID de Empleado / Email</label>
            <input type="text" className="input-field" placeholder="Ej. EMP-001" />
          </div>

          <div className="input-container">
            <label className="input-label">Contraseña</label>
            <input type="password" className="input-field" placeholder="••••••••" />
          </div>

          <button className="button button-primary button-full-width" style={{ marginTop: '1rem' }}>
            Ingresar al Panel
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-gray)' }}>
          ¿Olvidaste tu acceso? Contacta al Administrador General.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;