import { useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import styles from '../../styles/AuthStyles.module.css'

const ConfigurationPage = () => {
  const { isAuthenticated, logout, logoutAllDevices, user } = useAuth()

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const is2FAEnabled = user?.tfaEnabled;

  const handleSetup2FA = async () => {
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      const response = await api.post('/security/2fa/setup')
      setQrCodeUrl(response.data.otpauth_url)
      setIsLoading(false)
    } catch (err: any) {
      setIsLoading(false)
      setError(err.response?.data?.mensaje || 'Error al iniciar la configuración 2FA.')
    }
  }

  const handleEnable2FA = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError(null)
    
    try {
      await api.post('/security/2fa/enable', { token: otpCode })
      setSuccess("¡2FA Activado correctamente!")
      setQrCodeUrl(null)
      setOtpCode('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código OTP inválido.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <h1 className={styles.title}>Cargando...</h1>
            </div>
        </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.subtitle}>Administra la seguridad de tu cuenta</p>

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <h3 style={{ color: '#5c4b57', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Sesión</h3>
            
            <button onClick={logout} className={styles.secondaryButton}>
                Cerrar sesión actual
            </button>
            
            <button 
                onClick={logoutAllDevices} 
                className={styles.primaryButton}
                style={{ backgroundColor: '#ffebee', color: '#d32f2f', marginTop: '10px' }}
            >
                ⚠️ Cerrar sesión en TODOS los dispositivos
            </button>
            <p className={styles.smallText}>Úsalo si crees que te han hackeado.</p>
        </div>

        <div style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#5c4b57', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Doble Factor (2FA)</h3>

            {is2FAEnabled && !success && (
               <div className={styles.successMsg} style={{textAlign: 'center', marginTop: '1rem'}}>
                  <span className="material-symbols-outlined" style={{fontSize: '48px', display: 'block', margin: '0 auto'}}>lock</span>
                  <p style={{fontWeight: 'bold', margin: '10px 0'}}>Tu seguridad 2FA está activa.</p>
                  <p className={styles.smallText}>Tu cuenta está blindada contra accesos no autorizados.</p>
               </div>
            )}
            {!is2FAEnabled && !qrCodeUrl && !success && (
                <>
                    <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem', marginTop: '1rem' }}>
                        Protege tu cuenta pidiendo un código extra al entrar.
                    </p>
                    <button onClick={handleSetup2FA} className={styles.primaryButton} disabled={isLoading}>
                        {isLoading ? 'Cargando...' : 'Activar 2FA'}
                    </button>
                </>
            )}

            {qrCodeUrl && (
                <div style={{ textAlign: 'center', background: '#f9f9f9', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                    <p style={{marginBottom: '1rem', color: '#333'}}>1. Escanea esto con Google Authenticator:</p>
                    <div style={{ background: 'white', padding: '10px', display: 'inline-block', borderRadius: '8px' }}>
                        <QRCodeSVG value={qrCodeUrl} size={200} />
                    </div>

                    <form onSubmit={handleEnable2FA} style={{ marginTop: '1.5rem' }}>
                        <p style={{marginBottom: '0.5rem', color: '#333'}}>2. Ingresa el código que te da la app:</p>
                        <div className={styles.inputGroup}>
                             <span className={`material-symbols-outlined ${styles.inputIcon}`}>key</span>
                             <input 
                                className={styles.input}
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="000 000"
                                maxLength={6}
                                style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
                             />
                        </div>
                        <button type="submit" className={styles.primaryButton} disabled={isLoading}>
                            {isLoading ? 'Verificando...' : 'Confirmar y Activar'}
                        </button>
                    </form>
                </div>
            )}
            {success && (
                <div className={styles.successMsg} style={{ marginTop: '1rem' }}>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '5px' }}>check_circle</span>
                    {success}
                </div>
            )}
            {error && <div className={styles.errorMsg} style={{ marginTop: '1rem' }}>{error}</div>}
        </div>

      </div>
    </div>
  )
}

export default ConfigurationPage