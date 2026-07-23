import { useState, type FormEvent } from "react";
import { LoaderCircle, Lock } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { authApi } from "@shared/api/auth.api";
import { toApiError } from "@shared/api/errors";
import { AuthShell } from "@web/features/auth/components/AuthShell";
import styles from "./AuthPage.module.css";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const route = useParams();
  const [search] = useSearchParams();
  const token = route.token || search.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!token) { setError("El enlace de recuperación no es válido."); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      const response = await authApi.resetPassword({ token, nuevaContrasena: password });
      setMessage(response.mensaje || "Contraseña actualizada.");
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (cause) { setError(toApiError(cause, "No se pudo actualizar la contraseña.").message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell eyebrow="Seguridad" title="Define una nueva contraseña" description="Usa una contraseña diferente a las anteriores.">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}><label htmlFor="reset-password">Nueva contraseña</label><div className={styles.inputWrap}><Lock size={18} /><input id="reset-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></div></div>
        <div className={styles.field}><label htmlFor="reset-confirm">Confirmar contraseña</label><div className={styles.inputWrap}><Lock size={18} /><input id="reset-confirm" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={8} required /></div></div>
        {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}
        {message && <div className={`${styles.feedback} ${styles.success}`}>{message}</div>}
        <button className={styles.submit} type="submit" disabled={loading}>{loading && <LoaderCircle size={18} className="spin" />}Guardar contraseña</button>
      </form>
      <p className={styles.footerLink}><Link to="/login">Volver al inicio de sesión</Link></p>
    </AuthShell>
  );
}
