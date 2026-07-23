import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@shared/api/auth.api";
import { toApiError } from "@shared/api/errors";
import { useAuth } from "@shared/context/AuthContext";
import { AuthShell } from "@web/features/auth/components/AuthShell";
import styles from "./AuthPage.module.css";

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, restoreSession, setUser } = useAuth();
  const [form, setForm] = useState({ nombre: "", apellidoPaterno: "", apellidoMaterno: "", correo: "", contrasena: "", confirmar: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = params.get("returnTo") || "/mi-cuenta";

  if (isAuthenticated) return <Navigate replace to={returnTo} />;

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!PASSWORD_RE.test(form.contrasena)) {
      setError("La contraseña debe incluir mayúscula, minúscula, número y carácter especial.");
      return;
    }
    if (form.contrasena !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        nombre: form.nombre.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim() || undefined,
        correo: form.correo.trim(),
        contrasena: form.contrasena,
      });
      const login = await authApi.login({ correo: form.correo, contrasena: form.contrasena });
      if (login.requires2FA) {
        navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
        return;
      }
      const email = login.user?.correo || form.correo;
      setUser({ correo: email, email, rol: "CLIENTE_WEB" });
      await restoreSession();
      navigate(returnTo, { replace: true });
    } catch (cause) {
      setError(toApiError(cause, "No se pudo crear la cuenta.").message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="Nueva clienta" title="Crea tu cuenta" description="Registra tus datos para comprar y dar seguimiento a tus pedidos.">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <label htmlFor="register-name">Nombre</label>
            <div className={styles.inputWrap}><UserRound size={18} /><input id="register-name" value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} required /></div>
          </div>
          <div className={styles.field}>
            <label htmlFor="register-lastname">Apellido paterno</label>
            <div className={styles.inputWrap}><UserRound size={18} /><input id="register-lastname" value={form.apellidoPaterno} onChange={(event) => updateField("apellidoPaterno", event.target.value)} required /></div>
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="register-second-lastname">Apellido materno</label>
          <div className={styles.inputWrap}><UserRound size={18} /><input id="register-second-lastname" value={form.apellidoMaterno} onChange={(event) => updateField("apellidoMaterno", event.target.value)} /></div>
        </div>
        <div className={styles.field}>
          <label htmlFor="register-email">Correo electrónico</label>
          <div className={styles.inputWrap}><Mail size={18} /><input id="register-email" type="email" autoComplete="email" value={form.correo} onChange={(event) => updateField("correo", event.target.value)} required /></div>
        </div>
        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <label htmlFor="register-password">Contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={18} />
              <input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.contrasena} onChange={(event) => updateField("contrasena", event.target.value)} required />
              <button className={styles.togglePassword} type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Mostrar u ocultar contraseña">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="register-confirm">Confirmar</label>
            <div className={styles.inputWrap}><Lock size={18} /><input id="register-confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmar} onChange={(event) => updateField("confirmar", event.target.value)} required /></div>
          </div>
        </div>
        <p className={styles.passwordHelp}>Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo.</p>
        {error && <div className={`${styles.feedback} ${styles.error}`} role="alert">{error}</div>}
        <button className={styles.submit} type="submit" disabled={loading}>{loading && <LoaderCircle size={18} className="spin" />}Crear cuenta</button>
      </form>
      <p className={styles.footerLink}>¿Ya tienes cuenta? <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Inicia sesión</Link></p>
    </AuthShell>
  );
}
