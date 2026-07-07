import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/AdminContactMessages.module.css";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";

import {
  cambiarEstadoMensajeContacto,
  enviarRespuestaMensajeContacto,
  getMensajeContacto,
  getMensajesContacto,
  guardarNotasMensajeContacto,
  type ContactoEstado,
  type ContactoMensaje,
} from "../../services/contacto.service";

type AlertState = {
  type: "success" | "error";
  message: string;
} | null;

const ESTADOS: Array<{ label: string; value: ContactoEstado | "" }> = [
  { label: "Todos", value: "" },
  { label: "Nuevo", value: "NUEVO" },
  { label: "Leído", value: "LEIDO" },
  { label: "Respondido", value: "RESPONDIDO" },
  { label: "Archivado", value: "ARCHIVADO" },
];

function estadoLabel(estado: ContactoEstado) {
  const map: Record<ContactoEstado, string> = {
    NUEVO: "Nuevo",
    LEIDO: "Leído",
    RESPONDIDO: "Respondido",
    ARCHIVADO: "Archivado",
  };

  return map[estado];
}

const AUTO_REFRESH_MS = 60_000;

const CONTACT_PERMISSIONS = {
  view: "contenido.contacto.view",
  manage: "contenido.contacto.manage",
} as const;

export default function AdminContactMessages() {
  const { user } = useAuth();

  const canViewContact = canAccess(user, {
    permissions: CONTACT_PERMISSIONS.view,
  });

  const canManageContact = canAccess(user, {
    permissions: CONTACT_PERMISSIONS.manage,
  });

  const [mensajes, setMensajes] = useState<ContactoMensaje[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactoMensaje | null>(null);

  const [estado, setEstado] = useState<ContactoEstado | "">("");
  const [q, setQ] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  const [notas, setNotas] = useState("");
  const [respuesta, setRespuesta] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  function mensajeDebeMostrarse(mensaje: ContactoMensaje) {
    if (!includeArchived && mensaje.estado === "ARCHIVADO") return false;

    if (estado && mensaje.estado !== estado) return false;

    const search = q.trim().toLowerCase();

    if (!search) return true;

    return [mensaje.nombre, mensaje.email, mensaje.asunto, mensaje.mensaje]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  }

  function applyMensajeActualizado(updated: ContactoMensaje) {
    const updatedId = String(updated.id);

    setSelected(updated);
    setSelectedId(updatedId);
    setNotas(updated.notas_admin || "");
    setRespuesta(updated.respuesta_admin || "");

    setMensajes((prev) => {
      const debeMostrarse = mensajeDebeMostrarse(updated);

      if (!debeMostrarse) {
        return prev.filter((item) => String(item.id) !== updatedId);
      }

      const exists = prev.some((item) => String(item.id) === updatedId);

      if (!exists) {
        return [updated, ...prev];
      }

      return prev.map((item) =>
        String(item.id) === updatedId
          ? {
              ...item,
              ...updated,
            }
          : item,
      );
    });

    window.dispatchEvent(new Event("contacto:resumen-updated"));
  }

  const filteredTitle = useMemo(() => {
    if (estado) return `Mensajes: ${estadoLabel(estado)}`;
    return "Mensajes recibidos";
  }, [estado]);

  function clearSelectedMessage() {
    setSelectedId(null);
    setSelected(null);
    setNotas("");
    setRespuesta("");
  }

  async function loadMensajes(silent = false) {
    if (!canViewContact) {
      setMensajes([]);
      setSelected(null);
      setSelectedId(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    if (!silent) {
      setAlert(null);
    }

    try {
      const result = await getMensajesContacto({
        estado,
        q,
        includeArchived,
        limit: 50,
        offset: 0,
      });

      setMensajes(result.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);

      if (!silent) {
        setAlert({
          type: "error",
          message: "No se pudieron cargar los mensajes de contacto.",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadDetail(id: string) {
    setLoadingDetail(true);

    try {
      const data = await getMensajeContacto(id);

      if (data.estado === "NUEVO" && canManageContact) {
        try {
          const updated = await cambiarEstadoMensajeContacto(data.id, "LEIDO");

          applyMensajeActualizado(updated);
          return;
        } catch (statusError) {
          console.error(
            "No se pudo marcar como leído automáticamente:",
            statusError,
          );

          setAlert({
            type: "error",
            message:
              "El mensaje se cargó, pero no se pudo marcar como leído automáticamente.",
          });
        }
      }

      applyMensajeActualizado(data);
    } catch (error) {
      console.error(error);

      setAlert({
        type: "error",
        message: "No se pudo cargar el detalle del mensaje.",
      });
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadMensajes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, includeArchived]);

  async function handleSearch(event: React.FormEvent) {
    if (!canViewContact) {
      setAlert({
        type: "error",
        message: "No tienes permiso para consultar mensajes de contacto.",
      });
      return;
    }

    event.preventDefault();
    clearSelectedMessage();
    await loadMensajes();
  }

  async function handleSelectMensaje(mensaje: ContactoMensaje) {
    if (!canViewContact) {
      setAlert({
        type: "error",
        message: "No tienes permiso para consultar mensajes de contacto.",
      });
      return;
    }

    setSelectedId(mensaje.id);

    // Pintamos algo inmediato para que no se sienta vacío.
    setSelected(mensaje);
    setNotas(mensaje.notas_admin || "");
    setRespuesta(mensaje.respuesta_admin || "");

    await loadDetail(mensaje.id);
  }

  async function handleChangeStatus(nextEstado: ContactoEstado) {
    if (!selected) return;

    if (!canManageContact) {
      setAlert({
        type: "error",
        message: "No tienes permiso para administrar mensajes de contacto.",
      });
      return;
    }

    setSaving(true);

    try {
      const updated = await cambiarEstadoMensajeContacto(
        selected.id,
        nextEstado,
      );

      applyMensajeActualizado(updated);

      setAlert({
        type: "success",
        message: "Estado actualizado correctamente.",
      });
    } catch (error) {
      console.error(error);

      setAlert({
        type: "error",
        message: "No se pudo actualizar el estado.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotas() {
    if (!selected) return;

    if (!canManageContact) {
      setAlert({
        type: "error",
        message: "No tienes permiso para guardar notas internas.",
      });
      return;
    }

    setSaving(true);

    try {
      const updated = await guardarNotasMensajeContacto(
        selected.id,
        notas.trim() || null,
      );

      applyMensajeActualizado(updated);

      setAlert({
        type: "success",
        message: "Notas guardadas correctamente.",
      });
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: "No se pudieron guardar las notas.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleResponder() {
    if (!selected) return;

    if (!canManageContact) {
      setAlert({
        type: "error",
        message: "No tienes permiso para responder mensajes de contacto.",
      });
      return;
    }

    if (respuesta.trim().length < 5) {
      setAlert({
        type: "error",
        message: "La respuesta debe tener al menos 5 caracteres.",
      });
      return;
    }

    setSaving(true);

    try {
      const updated = await enviarRespuestaMensajeContacto(
        selected.id,
        respuesta.trim(),
      );

      applyMensajeActualizado(updated);

      setAlert({
        type: "success",
        message: "Respuesta registrada correctamente.",
      });
    } catch (error) {
      console.error(error);
      setAlert({
        type: "error",
        message: "No se pudo registrar la respuesta.",
      });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!canViewContact) return undefined;

    const intervalId = window.setInterval(() => {
      loadMensajes(true);
    }, AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewContact, estado, q, includeArchived, selectedId]);

  if (!canViewContact) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Panel administrativo</p>
            <h1>Mensajes de contacto</h1>
            <p>No tienes permisos para consultar mensajes de contacto.</p>
          </div>
        </header>

        <div className={`${styles.alert} ${styles.error}`}>
          No tienes permiso para ver este módulo.
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Panel administrativo</p>
          <h1>Mensajes de contacto</h1>
          <p>
            Consulta, responde y organiza los mensajes enviados por clientes
            desde el formulario de contacto.
          </p>
        </div>
      </header>

      {alert && (
        <div className={`${styles.alert} ${styles[alert.type]}`}>
          {alert.message}
        </div>
      )}

      {lastUpdated && (
        <small className={styles.muted}>
          Última actualización: {lastUpdated.toLocaleTimeString("es-MX")}
        </small>
      )}
      <section className={styles.toolbar}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Buscar por nombre, correo, asunto o mensaje..."
          />

          <button type="submit">Buscar</button>
          <button
            type="button"
            onClick={() => loadMensajes(true)}
            disabled={refreshing}
          >
            {refreshing ? "Actualizando..." : "Actualizar"}
          </button>
        </form>

        <div className={styles.filters}>
          <select
            value={estado}
            onChange={(event) => {
              clearSelectedMessage();
              setEstado(event.target.value as ContactoEstado | "");
            }}
          >
            {ESTADOS.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(event) => {
                clearSelectedMessage();
                setIncludeArchived(event.target.checked);
              }}
            />
            Incluir archivados
          </label>
        </div>
      </section>

      <section className={styles.layout}>
        <aside className={styles.listCard}>
          <h2>{filteredTitle}</h2>

          {loading && <p className={styles.muted}>Cargando mensajes...</p>}

          {!loading && mensajes.length === 0 && (
            <p className={styles.muted}>No hay mensajes para mostrar.</p>
          )}

          <div className={styles.messageList}>
            {mensajes.map((mensaje) => (
              <button
                key={mensaje.id}
                type="button"
                className={`${styles.messageItem} ${
                  selectedId === mensaje.id ? styles.selected : ""
                }`}
                onClick={() => handleSelectMensaje(mensaje)}
              >
                <div className={styles.messageTop}>
                  <strong>{mensaje.asunto}</strong>
                  <span
                    className={`${styles.badge} ${
                      styles[`estado${mensaje.estado}`]
                    }`}
                  >
                    {estadoLabel(mensaje.estado)}
                  </span>
                </div>

                <p>{mensaje.nombre}</p>
                <small>{mensaje.email}</small>

                <span className={styles.date}>
                  {new Date(mensaje.created_at).toLocaleString("es-MX")}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <article className={styles.detailCard}>
          {!selected && (
            <div className={styles.emptyDetail}>
              <h2>Selecciona un mensaje</h2>
              <p>El detalle del mensaje aparecerá aquí.</p>
            </div>
          )}

          {selected && (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <h2>{selected.asunto}</h2>
                  <p>
                    De <strong>{selected.nombre}</strong> · {selected.email}
                  </p>
                  {selected.telefono && <p>Teléfono: {selected.telefono}</p>}
                </div>

                <span
                  className={`${styles.badge} ${
                    styles[`estado${selected.estado}`]
                  }`}
                >
                  {estadoLabel(selected.estado)}
                </span>
              </div>

              {loadingDetail && (
                <p className={styles.muted}>Actualizando detalle...</p>
              )}

              <div className={styles.messageBox}>
                <p>{selected.mensaje}</p>
              </div>

              <div className={styles.metaGrid}>
                <div>
                  <span>Recibido</span>
                  <strong>
                    {new Date(selected.created_at).toLocaleString("es-MX")}
                  </strong>
                </div>

                <div>
                  <span>Notificación admin</span>
                  <strong>
                    {selected.notificado_admin ? "Enviada" : "No enviada"}
                  </strong>
                </div>

                <div>
                  <span>CAPTCHA</span>
                  <strong>
                    {selected.captcha_ok ? "Validado" : "No validado"}
                  </strong>
                </div>

                <div>
                  <span>Honeypot</span>
                  <strong>
                    {selected.honeypot_detected ? "Detectado" : "Limpio"}
                  </strong>
                </div>
              </div>

              {canManageContact && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleChangeStatus("NUEVO")}
                  >
                    Marcar nuevo
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleChangeStatus("LEIDO")}
                  >
                    Marcar leído
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleChangeStatus("ARCHIVADO")}
                  >
                    Archivar
                  </button>
                </div>
              )}

              <section className={styles.formSection}>
                <label className={styles.field}>
                  <span>Notas internas</span>
                  <textarea
                    rows={4}
                    value={notas}
                    onChange={(event) => setNotas(event.target.value)}
                    placeholder="Notas visibles solo para administración."
                    disabled={!canManageContact || saving}
                  />
                </label>

                {canManageContact && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={saving}
                    onClick={handleSaveNotas}
                  >
                    Guardar notas
                  </button>
                )}
              </section>

              <section className={styles.formSection}>
                <label className={styles.field}>
                  <span>Respuesta al cliente</span>
                  <textarea
                    rows={6}
                    value={respuesta}
                    onChange={(event) => setRespuesta(event.target.value)}
                    placeholder="Escribe la respuesta que se registrará para el cliente."
                    disabled={!canManageContact || saving}
                  />
                </label>

                {canManageContact && (
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={saving}
                    onClick={handleResponder}
                  >
                    Registrar respuesta
                  </button>
                )}
              </section>
            </>
          )}
        </article>
      </section>
    </main>
  );
}