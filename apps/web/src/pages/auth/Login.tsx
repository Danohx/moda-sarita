import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from '@shared/styles/AuthStyles.module.css'
import { useAuth } from '@shared/context/AuthContext'
import { ApiError } from '@shared/api/client'
import { authApi } from '@shared/api/auth.api'

type LoginMode =
  | 'password'
  | 'magiclink'
  | 'magiclink-sent'
  | 'forgot-password'
  | 'forgot-password-sent'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [mode, setMode] = useState<LoginMode>('password')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({ correo: '', contrasena: '' })
  const [tempToken, setTempToken] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) return err.message
    if (err instanceof Error) return err.message
    return fallback
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await authApi.login({
        correo: formData.correo,
        contrasena: formData.contrasena,
      })

      if (response.requires2FA) {
        setRequires2FA(true)
        setTempToken(response.tempToken || '')
        return
      }

      if (!response.accessToken || !response.refreshToken) {
        throw new Error('La respuesta del servidor no incluyó los tokens de sesión.')
      }

      login(
        response.accessToken,
        response.refreshToken,
        response.user ?? {
          nombre: 'Usuario',
          correo: formData.correo,
          id: 0,
        }
      )

      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Error al iniciar sesión.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await authApi.magicLink({ correo: formData.correo })
      setMode('magiclink-sent')
    } catch (err) {
      setError(getErrorMessage(err, 'Error al enviar el enlace.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FASubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await authApi.verify2FA({
        tempToken,
        otpCode,
      })

      if (!response.accessToken || !response.refreshToken) {
        throw new Error('La respuesta del servidor no incluyó los tokens de sesión.')
      }

      login(
        response.accessToken,
        response.refreshToken,
        response.user ?? {
          nombre: 'Usuario',
          correo: formData.correo,
          id: 0,
        }
      )

      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Código inválido.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await authApi.forgotPassword({ correo: formData.correo })
      setMode('forgot-password-sent')
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('Has superado el límite de intentos. Espera unos minutos.')
      } else {
        setError(getErrorMessage(err, 'Error al solicitar recuperación.'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div style={{ marginBottom: '1rem' }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 48, color: '#ec1380' }}
          >
            checkroom
          </span>
        </div>

        {requires2FA ? (
          <>
            <h1 className={styles.title}>Verificación 2FA</h1>
            <p className={styles.subtitle}>Ingresa el código de tu app</p>
            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handle2FASubmit}>
              <div className={styles.inputGroup}>
                <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                  key
                </span>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Código 6 dígitos"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Verificar'}
              </button>
            </form>
          </>
        ) : mode === 'magiclink-sent' ? (
          <>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 60, color: '#2e7d32' }}
            >
              mark_email_read
            </span>
            <h1 className={styles.title}>Revisa tu correo</h1>
            <p className={styles.subtitle}>
              Enlace enviado a <strong>{formData.correo}</strong>
            </p>
            <button
              onClick={() => setMode('password')}
              className={styles.secondaryButton}
            >
              Volver
            </button>
          </>
        ) : mode === 'forgot-password-sent' ? (
          <>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 60, color: '#ec1380' }}
            >
              lock_reset
            </span>
            <h1 className={styles.title}>Solicitud enviada</h1>
            <p className={styles.subtitle}>
              Instrucciones enviadas a <strong>{formData.correo}</strong>
            </p>

            <button
              onClick={() => {
                setFormData({ ...formData, correo: '' })
                setMode('forgot-password')
              }}
              className={styles.primaryButton}
            >
              Probar otro correo
            </button>

            <button
              onClick={() => setMode('password')}
              className={styles.secondaryButton}
            >
              Volver al login
            </button>
          </>
        ) : mode === 'forgot-password' ? (
          <>
            <h1 className={styles.title}>Recuperar</h1>
            <p className={styles.subtitle}>Te enviaremos un enlace seguro</p>
            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleForgotPasswordSubmit}>
              <div className={styles.inputGroup}>
                <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                  mail
                </span>
                <input
                  className={styles.input}
                  type="email"
                  name="correo"
                  placeholder="Correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>

            <button
              onClick={() => setMode('password')}
              className={styles.secondaryButton}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.title}>Bienvenida</h1>
            <p className={styles.subtitle}>
              {mode === 'password' ? 'Ingresa tus datos' : 'Acceso sin contraseña'}
            </p>

            {error && <div className={styles.errorMsg}>{error}</div>}

            {mode === 'password' ? (
              <form onSubmit={handlePasswordSubmit}>
                <div className={styles.inputGroup}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                    mail
                  </span>
                  <input
                    className={styles.input}
                    type="email"
                    name="correo"
                    placeholder="Correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                    lock
                  </span>
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
                      position: 'absolute',
                      right: 15,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ec1380',
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagicLinkSubmit}>
                <div className={styles.inputGroup}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                    mail
                  </span>
                  <input
                    className={styles.input}
                    type="email"
                    name="correo"
                    placeholder="Correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Enlace Mágico'}
                </button>
              </form>
            )}

            <hr className={styles.divider} />

            <button
              onClick={() =>
                setMode(mode === 'password' ? 'magiclink' : 'password')
              }
              className={styles.secondaryButton}
            >
              {mode === 'password' ? 'Usar Enlace Mágico' : 'Usar Contraseña'}
            </button>

            <span className={styles.linkText}>
              ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default Login