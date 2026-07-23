import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { toApiError } from "@shared/api/errors";
import { tiendaApi, type TiendaPerfil } from "@shared/api/tienda.api";
import styles from "./AccountPages.module.css";

export function ProfilePage() {
  const [perfil, setPerfil] = useState<TiendaPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    tiendaApi.getPerfil().then((response) => setPerfil(response.data)).catch((cause) => setError(toApiError(cause).message)).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!perfil) return;
    setSaving(true); setError(""); setMessage("");
    try {
      const response = await tiendaApi.updatePerfil({ nombres: perfil.nombres, apellido_paterno: perfil.apellido_paterno, apellido_materno: perfil.apellido_materno, telefono: perfil.telefono });
      setPerfil(response.data);
      setMessage("Tus datos se actualizaron correctamente.");
    } catch (cause) { setError(toApiError(cause, "No se pudo actualizar el perfil.").message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando perfil...</p></div>;

  return (
    <>
      <header className={styles.header}><div><p>Datos personales</p><h1>Mi perfil</h1></div><span>El correo de acceso no se modifica desde esta pantalla.</span></header>
      {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}
      {message && <div className={`${styles.feedback} ${styles.success}`}>{message}</div>}
      {perfil && <form className={`${styles.card} ${styles.form}`} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.field}><label htmlFor="profile-name">Nombre</label><input id="profile-name" value={perfil.nombres} onChange={(event) => setPerfil({ ...perfil, nombres: event.target.value })} required /></div>
          <div className={styles.field}><label htmlFor="profile-lastname">Apellido paterno</label><input id="profile-lastname" value={perfil.apellido_paterno} onChange={(event) => setPerfil({ ...perfil, apellido_paterno: event.target.value })} required /></div>
          <div className={styles.field}><label htmlFor="profile-second-lastname">Apellido materno</label><input id="profile-second-lastname" value={perfil.apellido_materno || ""} onChange={(event) => setPerfil({ ...perfil, apellido_materno: event.target.value })} /></div>
          <div className={styles.field}><label htmlFor="profile-phone">Teléfono</label><input id="profile-phone" value={perfil.telefono || ""} onChange={(event) => setPerfil({ ...perfil, telefono: event.target.value })} /></div>
          <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="profile-email">Correo electrónico</label><input id="profile-email" value={perfil.email} disabled /></div>
        </div>
        <div className={styles.actions}><button className={styles.primary} type="submit" disabled={saving}>{saving ? <LoaderCircle size={18} className="spin" /> : <Save size={18} />}Guardar cambios</button></div>
      </form>}
    </>
  );
}
