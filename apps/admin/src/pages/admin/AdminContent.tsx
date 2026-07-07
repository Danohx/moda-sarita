import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/AdminContent.module.css";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";

import {
  cambiarEstadoFaq,
  cambiarEstadoPolitica,
  cambiarPublicacionFaq,
  cambiarPublicacionPolitica,
  crearFaq,
  getFaqsAdmin,
  getPoliticaPrivacidadAdmin,
  getVersionesPolitica,
  guardarFaq,
  guardarPoliticaPrivacidad,
  reordenarFaqs,
  restaurarVersionPolitica,
  type ContenidoFaq,
  type ContenidoPagina,
  type ContenidoPaginaVersion,
} from "@admin/services/contenido.service";

import { sanitizeHtml } from "@shared/utils/sanitizeHtml";

type TabKey = "politicas" | "faq";

type AlertState = {
  type: "success" | "error" | "info";
  message: string;
} | null;

type ContentTabConfig = {
  key: TabKey;
  label: string;
  canView: boolean;
};

const CONTENT_PERMISSIONS = {
  pagesView: "contenido.paginas.view",
  pagesManage: "contenido.paginas.manage",
  pagesPublish: "contenido.paginas.publish",
  faqView: "contenido.faq.view",
  faqManage: "contenido.faq.manage",
} as const;

const emptyFaq = {
  pregunta: "",
  respuesta_html: "",
  respuesta_texto: "",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function plainTextToHtml(value: string) {
  return value
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => {
      const html = escapeHtml(paragraph.trim()).replaceAll("\n", "<br />");
      return `<p>${html}</p>`;
    })
    .join("");
}

export default function AdminContent() {
  const { user } = useAuth();

  const canViewPages = canAccess(user, {
    permissions: CONTENT_PERMISSIONS.pagesView,
  });

  const canManagePages = canAccess(user, {
    permissions: CONTENT_PERMISSIONS.pagesManage,
  });

  const canPublishPages = canAccess(user, {
    permissions: CONTENT_PERMISSIONS.pagesPublish,
  });

  const canViewFaqs = canAccess(user, {
    permissions: CONTENT_PERMISSIONS.faqView,
  });

  const canManageFaqs = canAccess(user, {
    permissions: CONTENT_PERMISSIONS.faqManage,
  });

  const [activeTab, setActiveTab] = useState<TabKey>("politicas");

  const [politica, setPolitica] = useState<ContenidoPagina | null>(null);
  const [politicaForm, setPoliticaForm] = useState({
    titulo: "",
    resumen: "",
    contenido_html: "",
    contenido_texto: "",
  });

  const [versiones, setVersiones] = useState<ContenidoPaginaVersion[]>([]);
  const [faqs, setFaqs] = useState<ContenidoFaq[]>([]);
  const [faqForm, setFaqForm] = useState(emptyFaq);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingPolitica, setSavingPolitica] = useState(false);
  const [savingFaq, setSavingFaq] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const editingFaq = useMemo(
    () => faqs.find((faq) => faq.id === editingFaqId) || null,
    [faqs, editingFaqId],
  );

  const tabs = useMemo<ContentTabConfig[]>(
    () => [
      {
        key: "politicas",
        label: "Políticas de privacidad",
        canView: canViewPages,
      },
      {
        key: "faq",
        label: "Preguntas frecuentes",
        canView: canViewFaqs,
      },
    ],
    [canViewFaqs, canViewPages],
  );

  const visibleTabs = useMemo(
    () => tabs.filter((item) => item.canView),
    [tabs],
  );

  const activeTabToRender = useMemo<TabKey | null>(() => {
    if (visibleTabs.length === 0) return null;

    return visibleTabs.some((item) => item.key === activeTab)
      ? activeTab
      : visibleTabs[0].key;
  }, [activeTab, visibleTabs]);

  async function loadAll() {
    setLoading(true);
    setAlert(null);

    try {
      const [politicaData, faqsData] = await Promise.all([
        canViewPages ? getPoliticaPrivacidadAdmin() : Promise.resolve(null),
        canViewFaqs ? getFaqsAdmin() : Promise.resolve([]),
      ]);

      if (politicaData) {
        setPolitica(politicaData);
        setPoliticaForm({
          titulo: politicaData.titulo || "",
          resumen: politicaData.resumen || "",
          contenido_html: politicaData.contenido_html || "",
          contenido_texto:
            politicaData.contenido_texto ||
            politicaData.contenido_html?.replace(/<[^>]+>/g, "") ||
            "",
        });

        const versionesData = await getVersionesPolitica(politicaData.id);
        setVersiones(versionesData);
      } else {
        setPolitica(null);
        setVersiones([]);
      }

      setFaqs(faqsData);
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: "No se pudo cargar el contenido administrable.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewPages, canViewFaqs]);

  function showSuccess(message: string) {
    setAlert({ type: "success", message });
  }

  function showError(message: string) {
    setAlert({ type: "error", message });
  }

  async function handleSavePolitica() {
    if (!politica) return;

    if (!canManagePages) {
      showError("No tienes permiso para modificar páginas de contenido.");
      return;
    }

    if (politicaForm.titulo.trim().length < 3) {
      showError("El título debe tener al menos 3 caracteres.");
      return;
    }

    if (
      politicaForm.contenido_html.trim().length < 2 &&
      politicaForm.contenido_texto.trim().length < 2
    ) {
      showError("La política debe tener contenido antes de guardarse.");
      return;
    }

    setSavingPolitica(true);

    try {
      const htmlFinal = plainTextToHtml(politicaForm.contenido_texto);

      const updated = await guardarPoliticaPrivacidad(politica.id, {
        titulo: politicaForm.titulo,
        resumen: politicaForm.resumen || null,
        contenido_html: htmlFinal,
        contenido_texto: politicaForm.contenido_texto || null,
      });

      setPolitica(updated);
      showSuccess("Política guardada correctamente.");
    } catch (error) {
      console.error(error);
      showError("No se pudo guardar la política.");
    } finally {
      setSavingPolitica(false);
    }
  }

  async function handleTogglePoliticaActivo() {
    if (!politica) return;

    if (!canManagePages) {
      showError(
        "No tienes permiso para activar o desactivar páginas de contenido.",
      );
      return;
    }

    try {
      const updated = await cambiarEstadoPolitica(
        politica.id,
        !politica.activo,
      );
      setPolitica(updated);
      showSuccess(
        updated.activo
          ? "Política activada correctamente."
          : "Política desactivada correctamente.",
      );
    } catch (error) {
      console.error(error);
      showError("No se pudo cambiar el estado de la política.");
    }
  }

  async function handleTogglePoliticaPublicacion() {
    if (!politica) return;

    if (!canPublishPages) {
      showError("No tienes permiso para publicar páginas de contenido.");
      return;
    }

    try {
      const updated = await cambiarPublicacionPolitica(
        politica.id,
        !politica.publicado,
      );

      setPolitica(updated);

      const versionesData = await getVersionesPolitica(updated.id);
      setVersiones(versionesData);

      showSuccess(
        updated.publicado
          ? "Política publicada correctamente."
          : "Política despublicada correctamente.",
      );
    } catch (error) {
      console.error(error);
      showError(
        "No se pudo cambiar la publicación. Verifica que esté activa y tenga contenido.",
      );
    }
  }

  async function handleRestoreVersion(versionId: string) {
    if (!politica) return;

    if (!canManagePages) {
      showError("No tienes permiso para restaurar versiones de contenido.");
      return;
    }

    const confirmar = window.confirm(
      "¿Restaurar esta versión como borrador? Después deberás publicarla manualmente.",
    );

    if (!confirmar) return;

    try {
      const restored = await restaurarVersionPolitica(politica.id, versionId);

      setPolitica(restored);
      setPoliticaForm({
        titulo: restored.titulo || "",
        resumen: restored.resumen || "",
        contenido_html: restored.contenido_html || "",
        contenido_texto: restored.contenido_texto || "",
      });

      const versionesData = await getVersionesPolitica(restored.id);
      setVersiones(versionesData);

      showSuccess("Versión restaurada como borrador.");
    } catch (error) {
      console.error(error);
      showError("No se pudo restaurar la versión.");
    }
  }

  function startCreateFaq() {
    if (!canManageFaqs) {
      showError("No tienes permiso para crear preguntas frecuentes.");
      return;
    }

    setEditingFaqId(null);
    setFaqForm(emptyFaq);
  }

  function startEditFaq(faq: ContenidoFaq) {
    if (!canManageFaqs) {
      showError("No tienes permiso para editar preguntas frecuentes.");
      return;
    }

    setEditingFaqId(faq.id);

    const texto =
      faq.respuesta_texto || faq.respuesta_html?.replace(/<[^>]+>/g, "") || "";

    setFaqForm({
      pregunta: faq.pregunta,
      respuesta_texto: texto,
      respuesta_html: plainTextToHtml(texto),
    });
  }

  async function handleSaveFaq() {
    if (!canManageFaqs) {
      showError("No tienes permiso para guardar preguntas frecuentes.");
      return;
    }

    const respuestaTexto = faqForm.respuesta_texto.trim();
    const respuestaHtml = plainTextToHtml(respuestaTexto);

    if (faqForm.pregunta.trim().length < 5) {
      showError("La pregunta debe tener al menos 5 caracteres.");
      return;
    }

    if (respuestaTexto.length < 2) {
      showError("La respuesta es requerida.");
      return;
    }

    setSavingFaq(true);

    try {
      if (editingFaqId) {
        await guardarFaq(editingFaqId, {
          pregunta: faqForm.pregunta,
          respuesta_texto: respuestaTexto,
          respuesta_html: respuestaHtml,
        });

        showSuccess("Pregunta actualizada correctamente.");
      } else {
        await crearFaq({
          pregunta: faqForm.pregunta,
          respuesta_texto: respuestaTexto,
          respuesta_html: respuestaHtml,
        });

        showSuccess("Pregunta creada correctamente.");
      }

      setFaqForm(emptyFaq);
      setEditingFaqId(null);

      const data = await getFaqsAdmin();
      setFaqs(data);
    } catch (error) {
      console.error(error);
      showError("No se pudo guardar la pregunta.");
    } finally {
      setSavingFaq(false);
    }
  }

  async function handleToggleFaqActivo(faq: ContenidoFaq) {
    if (!canManageFaqs) {
      showError(
        "No tienes permiso para activar o desactivar preguntas frecuentes.",
      );
      return;
    }

    try {
      await cambiarEstadoFaq(faq.id, !faq.activo);
      const data = await getFaqsAdmin();
      setFaqs(data);

      showSuccess(
        faq.activo
          ? "Pregunta desactivada correctamente."
          : "Pregunta activada correctamente.",
      );
    } catch (error) {
      console.error(error);
      showError("No se pudo cambiar el estado de la pregunta.");
    }
  }

  async function handleToggleFaqPublicacion(faq: ContenidoFaq) {
    if (!canManageFaqs) {
      showError("No tienes permiso para publicar preguntas frecuentes.");
      return;
    }

    try {
      await cambiarPublicacionFaq(faq.id, !faq.publicado);
      const data = await getFaqsAdmin();
      setFaqs(data);

      showSuccess(
        faq.publicado
          ? "Pregunta despublicada correctamente."
          : "Pregunta publicada correctamente.",
      );
    } catch (error) {
      console.error(error);
      showError(
        "No se pudo publicar la pregunta. Verifica que esté activa y tenga respuesta.",
      );
    }
  }

  async function moveFaq(faq: ContenidoFaq, direction: "up" | "down") {
    if (!canManageFaqs) {
      showError("No tienes permiso para reordenar preguntas frecuentes.");
      return;
    }

    const currentIndex = faqs.findIndex((item) => item.id === faq.id);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const payload = {
      items: reordered.map((item, index) => ({
        id: item.id,
        orden: index,
      })),
    };

    try {
      const data = await reordenarFaqs(payload);
      setFaqs(data);
      showSuccess("Orden actualizado correctamente.");
    } catch (error) {
      console.error(error);
      showError("No se pudo actualizar el orden.");
    }
  }

  if (visibleTabs.length === 0 || !activeTabToRender) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Panel administrativo</p>
            <h1>Contenido público</h1>
            <p>No tienes permisos para consultar el contenido administrable.</p>
          </div>
        </header>

        <div className={`${styles.alert} ${styles.error}`}>
          No tienes permiso para ver este módulo.
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingCard}>Cargando contenido...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Panel administrativo</p>
          <h1>Contenido público</h1>
          <p>
            Administra la política de privacidad y las preguntas frecuentes
            visibles en la tienda.
          </p>
        </div>
      </header>

      {alert && (
        <div className={`${styles.alert} ${styles[alert.type]}`}>
          {alert.message}
        </div>
      )}

      <section className={styles.tabs}>
        {visibleTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeTabToRender === item.key ? styles.activeTab : ""}
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </section>

      {activeTabToRender === "politicas" && politica && (
        <section className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Política de privacidad</h2>
                <p>
                  Estado:{" "}
                  <strong>
                    {politica.activo ? "Activa" : "Inactiva"} /{" "}
                    {politica.publicado ? "Publicada" : "Borrador"}
                  </strong>
                </p>
              </div>

              <div className={styles.actions}>
                {canManagePages && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleTogglePoliticaActivo}
                  >
                    {politica.activo ? "Desactivar" : "Activar"}
                  </button>
                )}

                {canPublishPages && (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleTogglePoliticaPublicacion}
                  >
                    {politica.publicado ? "Despublicar" : "Publicar"}
                  </button>
                )}
              </div>
            </div>

            <label className={styles.field}>
              <span>Título</span>
              <input
                value={politicaForm.titulo}
                disabled={!canManagePages}
                onChange={(event) =>
                  setPoliticaForm((prev) => ({
                    ...prev,
                    titulo: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Resumen</span>
              <textarea
                rows={2}
                value={politicaForm.resumen}
                disabled={!canManagePages}
                onChange={(event) =>
                  setPoliticaForm((prev) => ({
                    ...prev,
                    resumen: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Contenido de la política</span>
              <textarea
                rows={12}
                value={politicaForm.contenido_texto}
                disabled={!canManagePages}
                onChange={(event) => {
                  const texto = event.target.value;

                  setPoliticaForm((prev) => ({
                    ...prev,
                    contenido_texto: texto,
                    contenido_html: plainTextToHtml(texto),
                  }));
                }}
                placeholder="Escribe aquí la política de privacidad. Separa los párrafos con una línea en blanco."
              />
            </label>

            {canManagePages && (
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSavePolitica}
                  disabled={savingPolitica}
                >
                  {savingPolitica ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}
          </article>

          <aside className={styles.card}>
            <h2>Vista previa</h2>

            <div className={styles.previewBox}>
              <h1>{politicaForm.titulo}</h1>

              {politicaForm.resumen && <p>{politicaForm.resumen}</p>}

              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(politicaForm.contenido_html),
                }}
              />
            </div>

            <h3>Historial de versiones</h3>

            <div className={styles.versionList}>
              {versiones.length === 0 && (
                <p className={styles.muted}>Aún no hay versiones publicadas.</p>
              )}

              {versiones.map((version) => (
                <div key={version.id} className={styles.versionItem}>
                  <div>
                    <strong>Versión {version.numero_version}</strong>
                    <span>{version.accion}</span>
                    <small>
                      {new Date(version.created_at).toLocaleString("es-MX")}
                    </small>
                  </div>

                  {canManagePages && (
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => handleRestoreVersion(version.id)}
                    >
                      Restaurar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {activeTabToRender === "faq" && (
        <section className={styles.grid}>
          <article className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>{editingFaq ? "Editar pregunta" : "Nueva pregunta"}</h2>
                <p>
                  Crea y organiza las preguntas visibles en la página pública de
                  FAQ.
                </p>
              </div>

              {canManageFaqs && editingFaq && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={startCreateFaq}
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <label className={styles.field}>
              <span>Pregunta</span>
              <input
                value={faqForm.pregunta}
                disabled={!canManageFaqs}
                onChange={(event) =>
                  setFaqForm((prev) => ({
                    ...prev,
                    pregunta: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Respuesta</span>
              <textarea
                rows={7}
                value={faqForm.respuesta_texto}
                disabled={!canManageFaqs}
                onChange={(event) => {
                  const texto = event.target.value;

                  setFaqForm((prev) => ({
                    ...prev,
                    respuesta_texto: texto,
                    respuesta_html: plainTextToHtml(texto),
                  }));
                }}
                placeholder="Escribe la respuesta de forma clara para el cliente."
              />
            </label>

            {canManageFaqs && (
              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSaveFaq}
                  disabled={savingFaq}
                >
                  {savingFaq
                    ? "Guardando..."
                    : editingFaq
                      ? "Guardar pregunta"
                      : "Crear pregunta"}
                </button>
              </div>
            )}
          </article>

          <article className={styles.card}>
            <h2>Preguntas registradas</h2>

            <div className={styles.faqList}>
              {faqs.length === 0 && (
                <p className={styles.muted}>Aún no hay preguntas frecuentes.</p>
              )}

              {faqs.map((faq, index) => (
                <div key={faq.id} className={styles.faqItem}>
                  <div className={styles.faqContent}>
                    <div className={styles.faqTitleRow}>
                      <strong>{faq.pregunta}</strong>
                      <span
                        className={`${styles.badge} ${
                          faq.publicado ? styles.badgeOk : styles.badgeMuted
                        }`}
                      >
                        {faq.publicado ? "Publicada" : "Borrador"}
                      </span>
                      <span
                        className={`${styles.badge} ${
                          faq.activo ? styles.badgeOk : styles.badgeDanger
                        }`}
                      >
                        {faq.activo ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    <div
                      className={styles.faqAnswer}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(faq.respuesta_html),
                      }}
                    />
                  </div>

                  {canManageFaqs && (
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        disabled={index === 0}
                        onClick={() => moveFaq(faq, "up")}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className={styles.iconButton}
                        disabled={index === faqs.length - 1}
                        onClick={() => moveFaq(faq, "down")}
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => startEditFaq(faq)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => handleToggleFaqActivo(faq)}
                      >
                        {faq.activo ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => handleToggleFaqPublicacion(faq)}
                      >
                        {faq.publicado ? "Despublicar" : "Publicar"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}