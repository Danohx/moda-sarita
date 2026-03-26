import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@shared/api/auth.api'
import { ApiError } from '@shared/api/client'
import styles from '@shared/styles/AuthStyles.module.css'

const Register = () => {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      await authApi.register({
        nombre: formData.nombre.trim(),
        apellidoPaterno: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim() || undefined,
        correo: formData.correo.trim(),
        contrasena: formData.contrasena,
      })

      setSuccess('Usuario registrado exitosamente. Redirigiendo al login...')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as
          | {
              errores?: Array<{ msg?: string }>
              errors?: Array<{ msg?: string }>
              mensaje?: string
              msg?: string
            }
          | undefined

        if (data?.errores && Array.isArray(data.errores)) {
          setError(
            data.errores
              .map((e) => e.msg)
              .filter(Boolean)
              .join(' | ')
          )
        } else if (data?.errors && Array.isArray(data.errors)) {
          setError(
            data.errors
              .map((e) => e.msg)
              .filter(Boolean)
              .join(' | ')
          )
        } else {
          setError(data?.mensaje || data?.msg || err.message || 'Error al registrar la cuenta.')
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al registrar la cuenta.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card} style={{ maxWidth: '500px' }}>
        <h1 className={styles.title}>Crear una cuenta</h1>
        <p className={styles.subtitle}>Tu nueva boutique de confianza te espera</p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>person</span>
              <input
                className={styles.input}
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>badge</span>
              <input
                className={styles.input}
                type="text"
                name="apellidoPaterno"
                placeholder="Apellido P."
                value={formData.apellidoPaterno}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>badge</span>
              <input
                className={styles.input}
                type="text"
                name="apellidoMaterno"
                placeholder="Apellido M."
                value={formData.apellidoMaterno}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>phone</span>
              <input
                className={styles.input}
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>cake</span>
            <input
              className={styles.input}
              type="number"
              name="edad"
              placeholder="Edad"
              value={formData.edad}
              onChange={handleChange}
            />
          </div>

          <hr className={styles.divider} />

          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
            <input
              className={styles.input}
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              name="contrasena"
              placeholder="Contraseña"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#ec1380',
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
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmarContrasena"
              placeholder="Confirmar contraseña"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#ec1380',
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