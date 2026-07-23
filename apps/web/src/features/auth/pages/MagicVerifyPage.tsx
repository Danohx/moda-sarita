import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "@shared/api/auth.api";
import { toApiError } from "@shared/api/errors";
import { useAuth } from "@shared/context/AuthContext";
import { AuthShell } from "@web/features/auth/components/AuthShell";
import styles from "./AuthPage.module.css";

export function MagicVerifyPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { restoreSession, setUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authApi.verifyMagicLink({ token })
      .then(async (response) => {
        if (!active) return;
        const email = response.user?.correo || "";
        setUser({ correo: email, email, rol: "CLIENTE_WEB" });
        await restoreSession();
        navigate("/mi-cuenta", { replace: true });
      })
      .catch((cause) => { if (active) setError(toApiError(cause, "El enlace ya no es válido.").message); });
    return () => { active = false; };
  }, [navigate, restoreSession, setUser, token]);

  return (
    <AuthShell eyebrow="Acceso seguro" title="Validando tu enlace" description="Este proceso puede tomar unos segundos.">
      {error ? <><div className={`${styles.feedback} ${styles.error}`}>{error}</div><p className={styles.footerLink}><Link to="/login">Solicitar otro enlace</Link></p></> : <div className={styles.submit}><LoaderCircle size={20} className="spin" />Verificando acceso...</div>}
    </AuthShell>
  );
}
