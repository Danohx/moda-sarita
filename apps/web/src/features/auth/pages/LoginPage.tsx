import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, Lock, Mail } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@shared/api/auth.api";
import { toApiError } from "@shared/api/errors";
import { useAuth } from "@shared/context/AuthContext";
import { AuthShell } from "@web/features/auth/components/AuthShell";
import styles from "./AuthPage.module.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, restoreSession, setUser } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [message, setMessage] = useState("");

  const returnTo = params.get("returnTo") || "/mi-cuenta";

  if (isAuthenticated) {
    return <Navigate replace to={returnTo} />;
  }

  async function finishLogin(email: string) {
    setUser({ correo: email, email, rol: "CLIENTE_WEB" });
    await restoreSession();
    navigate(returnTo, { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (tempToken) {
        const response = await authApi.verify2FA({ tempToken, otpCode });
        await finishLogin(response.user?.correo || correo);
        return;
      }

      const response = await authApi.login({ correo, contrasena });
      if (response.requires2FA && response.tempToken) {
        setTempToken(response.tempToken);
        setMessage("Ingresa el código de tu aplicación de autenticación.");
        return;
      }

      await finishLogin(response.user?.correo || correo);
    } catch (cause) {
      setError(toApiError(cause, "No se pudo iniciar sesión.").message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!correo.trim()) {
      setError("Escribe tu correo para enviarte el enlace de acceso.");
      return;
    }

    setError("");
    setMessage("");
    setMagicLoading(true);
    try {
      const response = await authApi.magicLink({ correo });
      setMessage(response.mensaje || "Revisa tu correo para continuar.");
    } catch (cause) {
      setError(toApiError(cause, "No se pudo enviar el enlace.").message);
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Bienvenida de nuevo"
      title={tempToken ? "Verificación en dos pasos" : "Inicia sesión"}
      description={tempToken ? "Protegemos tu cuenta con un código temporal." : "Accede para finalizar compras y consultar tus pedidos."}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {!tempToken ? (
          <>
            <div className={styles.field}>
              <label htmlFor="login-email">Correo electrónico</label>
              <div className={styles.inputWrap}>
                <Mail size={18} />
                <input
                  id="login-email"
                  autoComplete="email"
                  type="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="login-password">Contraseña</label>
              <div className={styles.inputWrap}>
                <Lock size={18} />
                <input
                  id="login-password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  required
                />
                <button
                  className={styles.togglePassword}
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className={styles.actionsRow}>
              <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
              <button className={styles.linkButton} type="button" onClick={handleMagicLink} disabled={magicLoading}>
                {magicLoading ? "Enviando..." : "Entrar con enlace mágico"}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.field}>
            <label htmlFor="otp-code">Código de 6 dígitos</label>
            <div className={styles.inputWrap}>
              <KeyRound size={18} />
              <input
                id="otp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>
          </div>
        )}

        {error && <div className={`${styles.feedback} ${styles.error}`} role="alert">{error}</div>}
        {message && <div className={`${styles.feedback} ${styles.success}`}>{message}</div>}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading && <LoaderCircle size={18} className="spin" />}
          {tempToken ? "Verificar código" : "Iniciar sesión"}
        </button>
        {tempToken && (
          <button className={styles.secondary} type="button" onClick={() => { setTempToken(null); setOtpCode(""); }}>
            Volver al inicio de sesión
          </button>
        )}
      </form>
      <p className={styles.footerLink}>¿Aún no tienes cuenta? <Link to={`/registro?returnTo=${encodeURIComponent(returnTo)}`}>Regístrate</Link></p>
    </AuthShell>
  );
}
