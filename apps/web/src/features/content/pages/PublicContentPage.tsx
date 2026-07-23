import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { fetchPaginaPublica, type ContenidoPaginaPublica } from "@shared/api/contenido.api";
import styles from "./ContentPages.module.css";

type PublicContentPageProps = {
  contentKey: string;
  eyebrow: string;
  fallbackTitle: string;
  fallbackText: string;
};

export function PublicContentPage({ contentKey, eyebrow, fallbackTitle, fallbackText }: PublicContentPageProps) {
  const [page, setPage] = useState<ContenidoPaginaPublica | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaginaPublica(contentKey).then((response) => setPage(response.data)).catch(() => setPage(null)).finally(() => setLoading(false));
  }, [contentKey]);

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Cargando contenido...</p></div>;

  const title = page?.titulo || fallbackTitle;
  const summary = page?.resumen || fallbackText;
  const html = page?.contenido_html ? DOMPurify.sanitize(page.contenido_html) : "";

  return <main className={`${styles.page} container`}><header className={styles.hero}><p>{eyebrow}</p><h1>{title}</h1><span>{summary}</span></header><article className={styles.content}>{html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <div className={styles.notice}>{fallbackText}</div>}</article></main>;
}
