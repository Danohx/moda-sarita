import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { toApiError } from "@shared/api/errors";
import { tiendaApi, type TiendaDireccion, type TiendaDireccionPayload } from "@shared/api/tienda.api";
import styles from "./AccountPages.module.css";

const EMPTY: TiendaDireccionPayload = { calle: "", numero_exterior: "", numero_interior: "", colonia: "", ciudad: "Huejutla de Reyes", estado: "Hidalgo", codigo_postal: "43000", referencias: "", es_principal: false };

export function AddressesPage() {
  const [addresses, setAddresses] = useState<TiendaDireccion[]>([]);
  const [form, setForm] = useState<TiendaDireccionPayload>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const response = await tiendaApi.getDirecciones();
    setAddresses(response.data);
  }

  useEffect(() => { load().catch((cause) => setError(toApiError(cause).message)).finally(() => setLoading(false)); }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    try { await tiendaApi.createDireccion(form); await load(); setForm(EMPTY); setShowForm(false); }
    catch (cause) { setError(toApiError(cause, "No se pudo guardar la dirección.").message); }
    finally { setSaving(false); }
  }

  async function setPrincipal(id: string) {
    try { await tiendaApi.setDireccionPrincipal(id); await load(); }
    catch (cause) { setError(toApiError(cause).message); }
  }

  async function remove(id: string) {
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    try { await tiendaApi.deleteDireccion(id); await load(); }
    catch (cause) { setError(toApiError(cause).message); }
  }

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando direcciones...</p></div>;

  return (
    <>
      <header className={styles.header}><div><p>Entrega</p><h1>Mis direcciones</h1></div><button className={styles.primary} type="button" onClick={() => setShowForm((current) => !current)}><Plus size={18} />Nueva dirección</button></header>
      {error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}
      {showForm && <form className={`${styles.card} ${styles.form}`} onSubmit={handleSubmit} style={{ marginBottom: "1.2rem" }}>
        <h2>Agregar dirección</h2>
        <div className={styles.formGrid}>
          {([['calle','Calle'],['numero_exterior','Número exterior'],['numero_interior','Número interior'],['colonia','Colonia'],['ciudad','Ciudad'],['estado','Estado'],['codigo_postal','Código postal']] as const).map(([key,label]) => <div className={styles.field} key={key}><label htmlFor={`account-address-${key}`}>{label}</label><input id={`account-address-${key}`} value={String(form[key] || "")} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} required={!['numero_interior','colonia'].includes(key)} /></div>)}
          <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="account-address-references">Referencias</label><textarea id="account-address-references" value={form.referencias || ""} onChange={(event) => setForm((current) => ({ ...current, referencias: event.target.value }))} /></div>
        </div>
        <label><input type="checkbox" checked={Boolean(form.es_principal)} onChange={(event) => setForm((current) => ({ ...current, es_principal: event.target.checked }))} /> Usar como dirección principal</label>
        <div className={styles.actions}><button className={styles.secondary} type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className={styles.primary} type="submit" disabled={saving}>{saving && <LoaderCircle size={18} className="spin" />}Guardar dirección</button></div>
      </form>}
      <div className={styles.addressGrid}>
        {addresses.map((address) => <article className={`${styles.card} ${styles.address}`} key={address.id}>
          <div className={styles.addressTop}><strong><MapPin size={17} /> {address.es_principal ? "Dirección principal" : "Dirección guardada"}</strong>{address.es_principal && <CheckCircle2 size={19} color="#188452" />}</div>
          <p>{address.calle} {address.numero_exterior}{address.numero_interior ? `, Int. ${address.numero_interior}` : ""}</p><p>{address.colonia ? `${address.colonia}, ` : ""}{address.ciudad}, {address.estado}, C.P. {address.codigo_postal}</p>{address.referencias && <p><strong>Referencias:</strong> {address.referencias}</p>}
          <div className={styles.addressActions}>{!address.es_principal && <button className={styles.secondary} type="button" onClick={() => setPrincipal(address.id)}><Star size={16} />Hacer principal</button>}<button className={styles.danger} type="button" onClick={() => remove(address.id)}><Trash2 size={16} />Eliminar</button></div>
        </article>)}
      </div>
      {addresses.length === 0 && !showForm && <div className={`${styles.card} ${styles.empty}`}><MapPin size={35} /><h2>No tienes direcciones guardadas</h2><p>Agrega una para utilizar la entrega a domicilio.</p></div>}
    </>
  );
}
