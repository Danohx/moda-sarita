import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import styles from '../../styles/AuthStyles.module.css'

const Register = () => {
  const navigate = useNavigate()
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    edad: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
  })
  
  const [error, setError] = useState<string | null>(null) 
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsLoading(true)

    try {
      const { confirmarContrasena, ...dataToSubmit } = formData;
      
      // Usamos 'api' en lugar de 'axios' directo para usar la BaseURL correcta
      await api.post('/auth/register', dataToSubmit)

      setSuccess('Usuario registrado exitosamente. Redirigiendo al login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          // Mapeamos los errores de express-validator
          setError(err.response.data.errors.map((e: any) => e.msg).join(' | '));
      } else {
          setError(err.response?.data?.mensaje || 'Error al registrar la cuenta.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card} style={{maxWidth: '500px'}}> {/* Un poco más ancho para las columnas */}
        <h1 className={styles.title}>Crear una cuenta</h1>
        <p className={styles.subtitle}>Tu nueva boutique de confianza te espera</p>
        
        <form onSubmit={handleSubmit}>
          
          {/* Fila 1: Nombre y Apellido Paterno */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>person</span>
              <input className={styles.input} type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>badge</span>
              <input className={styles.input} type="text" name="apellidoPaterno" placeholder="Apellido P." onChange={handleChange} required />
            </div>
          </div>

          {/* Fila 2: Apellido Materno y Teléfono */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
             <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>badge</span>
              <input className={styles.input} type="text" name="apellidoMaterno" placeholder="Apellido M." onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>phone</span>
              <input className={styles.input} type="tel" name="telefono" placeholder="Teléfono" onChange={handleChange} />
            </div>
          </div>

          {/* Edad (Opcional, fila completa o ajustar según diseño) */}
          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>cake</span>
            <input className={styles.input} type="number" name="edad" placeholder="Edad" onChange={handleChange} />
          </div>

          <hr className={styles.divider} />

          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
            <input className={styles.input} type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} required />
          </div>
          
          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
            <input 
                className={styles.input}
                type={showPassword ? "text" : "password"} 
                name="contrasena" 
                placeholder="Contraseña" 
                onChange={handleChange} 
                required 
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
                    color: '#ec1380'
                }}
            >
                <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                </span>
            </button>
          </div>

          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock_reset</span>
            <input 
                className={styles.input}
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmarContrasena" 
                placeholder="Confirmar contraseña" 
                onChange={handleChange} 
                required 
            />
             <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
                    color: '#ec1380'
                }}
            >
                <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
            </button>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          <button type="submit" className={styles.primaryButton} disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <span className={styles.linkText}>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </span>
      </div>
    </div>
  )
}

export default Register