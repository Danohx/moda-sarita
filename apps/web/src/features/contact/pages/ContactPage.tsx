import { useState, type FormEvent } from "react";
import { Facebook, LoaderCircle, Mail, MapPin, Phone } from "lucide-react";
import { crearMensajeContactoPublico } from "@shared/api/contacto.api";
import { toApiError } from "@shared/api/errors";
import { STORE_CONFIG } from "@web/config/store.config";
import styles from "./ContactPage.module.css";

export function ContactPage() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await crearMensajeContactoPublico({ ...form, telefono: form.telefono || null, captchaToken: null });
      setMessage(response.msg || "Recibimos tu mensaje. Te responderemos a la brevedad.");
      setForm({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "", website: "" });
    } catch (cause) { setError(toApiError(cause, "No se pudo enviar el mensaje.").message); }
    finally { setLoading(false); }
  }

  return <main className={`${styles.page} container`}><header className={styles.header}><p>Contacto</p><h1>Estamos para ayudarte</h1><span>Escríbenos sobre productos, pedidos, pagos o entregas. También puedes visitarnos directamente en Huejutla.</span></header><div className={styles.layout}><aside className={styles.info}><div className={styles.infoItem}><span><MapPin size={20} /></span><div><strong>Visítanos</strong><p>{STORE_CONFIG.address}</p></div></div><div className={styles.infoItem}><span><Phone size={20} /></span><div><strong>Teléfono</strong><a href={`tel:${STORE_CONFIG.phoneHref}`}>{STORE_CONFIG.phoneDisplay}</a></div></div><div className={styles.infoItem}><span><Facebook size={20} /></span><div><strong>Facebook</strong><a href={STORE_CONFIG.facebookUrl} target="_blank" rel="noreferrer">Moda Sarita Boutique</a></div></div><div className={styles.infoItem}><span><Mail size={20} /></span><div><strong>Horario de respuesta</strong><p>Te responderemos dentro del horario de atención de la boutique.</p></div></div></aside><form className={styles.form} onSubmit={handleSubmit}><div className={styles.grid}><div className={styles.field}><label htmlFor="contact-name">Nombre</label><input id="contact-name" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} minLength={2} required /></div><div className={styles.field}><label htmlFor="contact-email">Correo</label><input id="contact-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div><div className={styles.field}><label htmlFor="contact-phone">Teléfono</label><input id="contact-phone" value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} /></div><div className={styles.field}><label htmlFor="contact-subject">Asunto</label><input id="contact-subject" value={form.asunto} onChange={(event) => setForm({ ...form, asunto: event.target.value })} minLength={3} required /></div><div className={`${styles.field} ${styles.full}`}><label htmlFor="contact-message">Mensaje</label><textarea id="contact-message" value={form.mensaje} onChange={(event) => setForm({ ...form, mensaje: event.target.value })} minLength={10} required /></div><div className={styles.honeypot}><label htmlFor="contact-website">Sitio web</label><input id="contact-website" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} tabIndex={-1} autoComplete="off" /></div></div>{error && <div className={`${styles.feedback} ${styles.error}`}>{error}</div>}{message && <div className={`${styles.feedback} ${styles.success}`}>{message}</div>}<button className={styles.submit} type="submit" disabled={loading}>{loading && <LoaderCircle size={18} className="spin" />}{loading ? "Enviando..." : "Enviar mensaje"}</button></form></div></main>;
}
