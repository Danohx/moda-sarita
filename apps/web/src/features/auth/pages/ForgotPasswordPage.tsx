import { useState, type FormEvent } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "@shared/api/auth.api";
import { toApiError } from "@shared/api/errors";
import { AuthShell } from "@web/features/auth/components/AuthShell";
import styles from "./AuthPage.module.css";

export function ForgotPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await authApi.forgotPassword({ correo });
      setMessage(response.mensaje || "Revisa tu correo para restablecer la contraseña.");
    } catch (cause) {
      setError(toApiError(cause, "No se pudo procesar la solicitud.").message);
    } finally { setLoading(false); }
  }

  return (
    <AuthShell eyebrow="Recuperación" title="Recupera tu contraseña" description="Te enviaremos un enlace temporal al correo registrado.">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}><label htmlFor="forgot-email">Correo electrónico</label><div className={styles.inputWrap}><Mail size={18} /><input id="forgot-email" type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} required /></div></div>
        {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}
        {message && <div className={`${styles.feedback} ${styles.success}`}>{message}</div>}
        <button className={styles.submit} type="submit" disabled={loading}>{loading && <LoaderCircle size={18} className="spin" />}Enviar enlace</button>
      </form>
      <p className={styles.footerLink}><Link to="/login">Volver al inicio de sesión</Link></p>
    </AuthShell>
  );
}
