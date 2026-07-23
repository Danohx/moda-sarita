import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { fetchFaqsPublicas, type ContenidoFaqPublica } from "@shared/api/contenido.api";
import styles from "./ContentPages.module.css";

export function FAQPage() {
  const [faqs, setFaqs] = useState<ContenidoFaqPublica[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchFaqsPublicas().then((response) => setFaqs(response.data)).catch(() => setFaqs([])).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando preguntas...</p></div>;
  return <main className={`${styles.page} container`}><header className={styles.hero}><p>Centro de ayuda</p><h1>Preguntas frecuentes</h1><span>Resolvemos las dudas más comunes sobre compras, pagos, entregas y tu cuenta.</span></header>{faqs.length > 0 ? <section className={styles.faqList}>{faqs.map((faq) => <details className={styles.faq} key={faq.id}><summary>{faq.pregunta}</summary><div className={styles.answer} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.respuesta_html || faq.respuesta_texto || "") }} /></details>)}</section> : <section className={styles.empty}><h2>Contenido en preparación</h2><p>Las preguntas frecuentes se publicarán desde el panel administrativo.</p></section>}</main>;
}
