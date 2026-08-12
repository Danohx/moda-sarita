import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/Marketing.module.css";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";
import {
  cambiarEstadoCuponMarketing,
  cambiarEstadoSuscripcionMarketing,
  editarCuponMarketing,
  editarPlantillaMarketing,
  editarSegmentoMarketing,
  editarSuscripcionMarketing,
  enviarPruebaPlantillaMarketing,
  getCuponesMarketing,
  getPlantillasMarketing,
  getSegmentosMarketing,
  getSuscripcionesMarketing,
  guardarCuponMarketing,
  guardarPlantillaMarketing,
  guardarSegmentoMarketing,
  guardarSuscripcionMarketing,
  type AplicaCupon,
  type CanalCupon,
  type CuponMarketing,
  type PlantillaEmailMarketing,
  type SegmentoMarketing,
  type SuscripcionMarketing,
  type TipoPlantilla,
} from "../../services/marketing.service";

type Tab = "suscriptores" | "cupones" | "segmentos" | "plantillas";
type AlertState = { type: "success" | "error"; message: string } | null;

type MarketingTabConfig = {
  key: Tab;
  label: string;
  description: string;
  canView: boolean;
};

const PERMS = {
  suscripcionesView: "marketing.suscripciones.view",
  suscripcionesManage: "marketing.suscripciones.manage",
  cuponesView: "marketing.cupones.view",
  cuponesManage: "marketing.cupones.manage",
  segmentosView: "marketing.segmentos.view",
  segmentosManage: "marketing.segmentos.manage",
  plantillasView: "marketing.plantillas.view",
  plantillasManage: "marketing.plantillas.manage",
  plantillasTestSend: "marketing.plantillas.test_send",
} as const;

const today = new Date().toISOString().slice(0, 10);
const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

const emptySuscriptor = {
  email: "",
  nombre: "",
  telefono: "",
  acepta_marketing: true,
  notas_admin: "",
};

const emptyCupon = {
  codigo: "",
  nombre: "",
  descripcion: "",
  tipo_descuento: "PORCENTAJE",
  valor: 10,
  monto_minimo_compra: 0,
  fecha_inicio: today,
  fecha_fin: nextMonth,
  activo: true,
  canal: "AMBOS" as CanalCupon,
  aplica_a: "PEDIDO" as AplicaCupon,
  uso_maximo: "",
  uso_maximo_por_cliente: "",
  acumulable: false,
  solo_clientes_registrados: false,
};

const emptySegmento = {
  nombre: "",
  descripcion: "",
  activo: true,
};

const emptyPlantilla = {
  clave: "",
  nombre: "",
  descripcion: "",
  tipo: "MARKETING" as TipoPlantilla,
  asunto: "",
  preheader: "",
  cuerpo_texto: "",
  activo: true,
};

function textToHtml(value: string) {
  const safe = value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  return safe
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replaceAll("\n", "<br />")}</p>`)
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

export default function Marketing() {
  const { user } = useAuth();

  const canViewSuscripciones = canAccess(user, { permissions: PERMS.suscripcionesView });
  const canManageSuscripciones = canAccess(user, { permissions: PERMS.suscripcionesManage });
  const canViewCupones = canAccess(user, { permissions: PERMS.cuponesView });
  const canManageCupones = canAccess(user, { permissions: PERMS.cuponesManage });
  const canViewSegmentos = canAccess(user, { permissions: PERMS.segmentosView });
  const canManageSegmentos = canAccess(user, { permissions: PERMS.segmentosManage });
  const canViewPlantillas = canAccess(user, { permissions: PERMS.plantillasView });
  const canManagePlantillas = canAccess(user, { permissions: PERMS.plantillasManage });
  const canSendTest = canAccess(user, { permissions: PERMS.plantillasTestSend });

  const tabs = useMemo<MarketingTabConfig[]>(
    () => [
      {
        key: "suscriptores",
        label: "Suscriptores",
        description: "Consentimiento y lista de contactos de marketing.",
        canView: canViewSuscripciones,
      },
      {
        key: "cupones",
        label: "Cupones",
        description: "Promociones, vigencias y límites de uso.",
        canView: canViewCupones,
      },
      {
        key: "segmentos",
        label: "Segmentos",
        description: "Agrupaciones para futuras campañas y avisos.",
        canView: canViewSegmentos,
      },
      {
        key: "plantillas",
        label: "Plantillas",
        description: "Contenido de correo y envíos de prueba.",
        canView: canViewPlantillas,
      },
    ],
    [canViewCupones, canViewPlantillas, canViewSegmentos, canViewSuscripciones],
  );

  const visibleTabs = useMemo(() => tabs.filter((item) => item.canView), [tabs]);
  const [tab, setTab] = useState<Tab>("suscriptores");
  const currentTab = visibleTabs.some((item) => item.key === tab)
    ? tab
    : visibleTabs[0]?.key ?? null;

  const [alert, setAlert] = useState<AlertState>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [suscriptores, setSuscriptores] = useState<SuscripcionMarketing[]>([]);
  const [cupones, setCupones] = useState<CuponMarketing[]>([]);
  const [segmentos, setSegmentos] = useState<SegmentoMarketing[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaEmailMarketing[]>([]);

  const [suscriptorForm, setSuscriptorForm] = useState(emptySuscriptor);
  const [cuponForm, setCuponForm] = useState(emptyCupon);
  const [segmentoForm, setSegmentoForm] = useState(emptySegmento);
  const [plantillaForm, setPlantillaForm] = useState(emptyPlantilla);

  const [editingSuscriptorId, setEditingSuscriptorId] = useState<string | null>(null);
  const [editingCuponId, setEditingCuponId] = useState<string | null>(null);
  const [editingSegmentoId, setEditingSegmentoId] = useState<string | null>(null);
  const [editingPlantillaId, setEditingPlantillaId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const currentTabInfo = visibleTabs.find((item) => item.key === currentTab);

  const stats = useMemo(
    () => ({
      suscriptoresActivos: suscriptores.filter(
        (item) => item.estado === "ACTIVO" && item.acepta_marketing,
      ).length,
      cuponesActivos: cupones.filter((item) => item.activo).length,
      segmentosActivos: segmentos.filter((item) => item.activo).length,
      plantillasActivas: plantillas.filter((item) => item.activo).length,
    }),
    [cupones, plantillas, segmentos, suscriptores],
  );

  function success(message: string) {
    setAlert({ type: "success", message });
  }

  function fail(message: string) {
    setAlert({ type: "error", message });
  }

  async function loadAll() {
    setLoading(true);
    setAlert(null);

    try {
      const [suscripcionesResult, cuponesResult, segmentosResult, plantillasResult] =
        await Promise.all([
          canViewSuscripciones ? getSuscripcionesMarketing() : Promise.resolve([]),
          canViewCupones ? getCuponesMarketing() : Promise.resolve([]),
          canViewSegmentos ? getSegmentosMarketing() : Promise.resolve([]),
          canViewPlantillas ? getPlantillasMarketing() : Promise.resolve([]),
        ]);

      setSuscriptores(suscripcionesResult);
      setCupones(cuponesResult);
      setSegmentos(segmentosResult);
      setPlantillas(plantillasResult);
    } catch (error) {
      console.error(error);
      fail("No se pudo cargar la información de marketing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canViewCupones,
    canViewPlantillas,
    canViewSegmentos,
    canViewSuscripciones,
  ]);

  async function handleSaveSuscriptor(event: React.FormEvent) {
    event.preventDefault();
    if (!canManageSuscripciones) return fail("No tienes permiso para administrar suscriptores.");
    if (!suscriptorForm.email.trim()) return fail("El correo es requerido.");

    setSaving(true);
    try {
      if (editingSuscriptorId) {
        const updated = await editarSuscripcionMarketing(editingSuscriptorId, {
          nombre: suscriptorForm.nombre || null,
          telefono: suscriptorForm.telefono || null,
          acepta_marketing: suscriptorForm.acepta_marketing,
          notas_admin: suscriptorForm.notas_admin || null,
        });
        setSuscriptores((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        success("Suscriptor actualizado correctamente.");
      } else {
        const created = await guardarSuscripcionMarketing({
          email: suscriptorForm.email.trim(),
          nombre: suscriptorForm.nombre || null,
          telefono: suscriptorForm.telefono || null,
          origen: "ADMIN",
          estado: "ACTIVO",
          acepta_marketing: suscriptorForm.acepta_marketing,
          notas_admin: suscriptorForm.notas_admin || null,
        });
        setSuscriptores((prev) => [created, ...prev]);
        success("Suscriptor registrado correctamente.");
      }
      setSuscriptorForm(emptySuscriptor);
      setEditingSuscriptorId(null);
    } catch (error) {
      console.error(error);
      fail("No se pudo guardar el suscriptor. Verifica que el correo no esté duplicado.");
    } finally {
      setSaving(false);
    }
  }

  function editSuscriptor(item: SuscripcionMarketing) {
    setEditingSuscriptorId(item.id);
    setSuscriptorForm({
      email: item.email,
      nombre: item.nombre || "",
      telefono: item.telefono || "",
      acepta_marketing: item.acepta_marketing,
      notas_admin: item.notas_admin || "",
    });
  }

  async function toggleSuscriptor(item: SuscripcionMarketing) {
    if (!canManageSuscripciones) return fail("No tienes permiso para cambiar suscripciones.");
    setSaving(true);
    try {
      const next = item.estado === "ACTIVO" ? "BAJA" : "ACTIVO";
      const updated = await cambiarEstadoSuscripcionMarketing(
        item.id,
        next,
        next === "BAJA" ? "Cambio realizado desde panel administrativo" : null,
      );
      setSuscriptores((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      success(next === "ACTIVO" ? "Suscripción reactivada." : "Suscripción dada de baja.");
    } catch (error) {
      console.error(error);
      fail("No se pudo cambiar el estado del suscriptor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCupon(event: React.FormEvent) {
    event.preventDefault();
    if (!canManageCupones) return fail("No tienes permiso para administrar cupones.");
    if (!editingCuponId && !cuponForm.codigo.trim()) return fail("El código del cupón es requerido.");
    if (Number(cuponForm.valor) <= 0) return fail("El valor del descuento debe ser mayor a cero.");
    if (cuponForm.tipo_descuento === "PORCENTAJE" && Number(cuponForm.valor) > 100) {
      return fail("El porcentaje no puede ser mayor a 100%.");
    }
    if (cuponForm.fecha_fin < cuponForm.fecha_inicio) return fail("La fecha final no puede ser anterior a la inicial.");

    setSaving(true);
    try {
      const payload = {
        nombre: cuponForm.nombre || null,
        descripcion: cuponForm.descripcion || null,
        tipo_descuento: cuponForm.tipo_descuento,
        valor: Number(cuponForm.valor),
        monto_minimo_compra: Number(cuponForm.monto_minimo_compra || 0),
        fecha_inicio: cuponForm.fecha_inicio,
        fecha_fin: cuponForm.fecha_fin,
        canal: cuponForm.canal,
        aplica_a: cuponForm.aplica_a,
        uso_maximo: cuponForm.uso_maximo === "" ? null : Number(cuponForm.uso_maximo),
        uso_maximo_por_cliente:
          cuponForm.uso_maximo_por_cliente === ""
            ? null
            : Number(cuponForm.uso_maximo_por_cliente),
        acumulable: cuponForm.acumulable,
        solo_clientes_registrados: cuponForm.solo_clientes_registrados,
      };

      if (editingCuponId) {
        const updated = await editarCuponMarketing(editingCuponId, payload);
        setCupones((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        success("Cupón actualizado correctamente.");
      } else {
        const created = await guardarCuponMarketing({
          codigo: cuponForm.codigo.trim().toUpperCase(),
          activo: cuponForm.activo,
          ...payload,
        });
        setCupones((prev) => [created, ...prev]);
        success("Cupón creado correctamente.");
      }
      setCuponForm(emptyCupon);
      setEditingCuponId(null);
    } catch (error) {
      console.error(error);
      fail("No se pudo guardar el cupón.");
    } finally {
      setSaving(false);
    }
  }

  function editCupon(item: CuponMarketing) {
    setEditingCuponId(item.id);
    setCuponForm({
      codigo: item.codigo,
      nombre: item.nombre || "",
      descripcion: item.descripcion || "",
      tipo_descuento: item.tipo_descuento,
      valor: Number(item.valor),
      monto_minimo_compra: Number(item.monto_minimo_compra),
      fecha_inicio: String(item.fecha_inicio).slice(0, 10),
      fecha_fin: String(item.fecha_fin).slice(0, 10),
      activo: item.activo,
      canal: item.canal,
      aplica_a: item.aplica_a,
      uso_maximo: item.uso_maximo == null ? "" : String(item.uso_maximo),
      uso_maximo_por_cliente:
        item.uso_maximo_por_cliente == null ? "" : String(item.uso_maximo_por_cliente),
      acumulable: item.acumulable,
      solo_clientes_registrados: item.solo_clientes_registrados,
    });
  }

  async function toggleCupon(item: CuponMarketing) {
    if (!canManageCupones) return fail("No tienes permiso para cambiar cupones.");
    setSaving(true);
    try {
      const updated = await cambiarEstadoCuponMarketing(item.id, !item.activo);
      setCupones((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      success("Estado del cupón actualizado.");
    } catch (error) {
      console.error(error);
      fail("No se pudo actualizar el cupón.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSegmento(event: React.FormEvent) {
    event.preventDefault();
    if (!canManageSegmentos) return fail("No tienes permiso para administrar segmentos.");
    if (segmentoForm.nombre.trim().length < 3) return fail("El segmento debe tener al menos 3 caracteres.");

    setSaving(true);
    try {
      const payload = {
        nombre: segmentoForm.nombre.trim(),
        descripcion: segmentoForm.descripcion || null,
        activo: segmentoForm.activo,
        criterios: {
          tipo: "manual",
          descripcion: segmentoForm.descripcion || "",
        },
      };

      if (editingSegmentoId) {
        const updated = await editarSegmentoMarketing(editingSegmentoId, payload);
        setSegmentos((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        success("Segmento actualizado correctamente.");
      } else {
        const created = await guardarSegmentoMarketing(payload);
        setSegmentos((prev) => [created, ...prev]);
        success("Segmento creado correctamente.");
      }
      setSegmentoForm(emptySegmento);
      setEditingSegmentoId(null);
    } catch (error) {
      console.error(error);
      fail("No se pudo guardar el segmento.");
    } finally {
      setSaving(false);
    }
  }

  function editSegmento(item: SegmentoMarketing) {
    setEditingSegmentoId(item.id);
    setSegmentoForm({
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      activo: item.activo,
    });
  }

  async function toggleSegmento(item: SegmentoMarketing) {
    if (!canManageSegmentos) return fail("No tienes permiso para cambiar segmentos.");
    setSaving(true);
    try {
      const updated = await editarSegmentoMarketing(item.id, { activo: !item.activo });
      setSegmentos((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      success("Estado del segmento actualizado.");
    } catch (error) {
      console.error(error);
      fail("No se pudo actualizar el segmento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePlantilla(event: React.FormEvent) {
    event.preventDefault();
    if (!canManagePlantillas) return fail("No tienes permiso para administrar plantillas.");
    if (!plantillaForm.nombre.trim() || !plantillaForm.asunto.trim()) return fail("Nombre y asunto son requeridos.");
    if (!editingPlantillaId && !plantillaForm.clave.trim()) return fail("La clave es requerida.");

    setSaving(true);
    try {
      const payload = {
        nombre: plantillaForm.nombre.trim(),
        descripcion: plantillaForm.descripcion || null,
        tipo: plantillaForm.tipo,
        asunto: plantillaForm.asunto.trim(),
        preheader: plantillaForm.preheader || null,
        cuerpo_html: textToHtml(plantillaForm.cuerpo_texto),
        cuerpo_texto: plantillaForm.cuerpo_texto || null,
        activo: plantillaForm.activo,
      };

      if (editingPlantillaId) {
        const updated = await editarPlantillaMarketing(editingPlantillaId, payload);
        setPlantillas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        success("Plantilla actualizada correctamente.");
      } else {
        const created = await guardarPlantillaMarketing({
          clave: plantillaForm.clave.trim().toUpperCase(),
          ...payload,
        });
        setPlantillas((prev) => [created, ...prev]);
        success("Plantilla creada correctamente.");
      }
      setPlantillaForm(emptyPlantilla);
      setEditingPlantillaId(null);
    } catch (error) {
      console.error(error);
      fail("No se pudo guardar la plantilla.");
    } finally {
      setSaving(false);
    }
  }

  function editPlantilla(item: PlantillaEmailMarketing) {
    setEditingPlantillaId(item.id);
    setPlantillaForm({
      clave: item.clave,
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      tipo: item.tipo,
      asunto: item.asunto,
      preheader: item.preheader || "",
      cuerpo_texto: item.cuerpo_texto || "",
      activo: item.activo,
    });
  }

  async function togglePlantilla(item: PlantillaEmailMarketing) {
    if (!canManagePlantillas) return fail("No tienes permiso para cambiar plantillas.");
    setSaving(true);
    try {
      const updated = await editarPlantillaMarketing(item.id, { activo: !item.activo });
      setPlantillas((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      success("Estado de la plantilla actualizado.");
    } catch (error) {
      console.error(error);
      fail("No se pudo actualizar la plantilla.");
    } finally {
      setSaving(false);
    }
  }

  async function sendTest(item: PlantillaEmailMarketing) {
    if (!canSendTest) return fail("No tienes permiso para enviar correos de prueba.");
    if (!testEmail.trim()) return fail("Escribe el correo destino para la prueba.");
    setSaving(true);
    try {
      await enviarPruebaPlantillaMarketing(item.id, testEmail.trim());
      success(`Correo de prueba enviado a ${testEmail.trim()}.`);
    } catch (error) {
      console.error(error);
      fail("No se pudo enviar el correo de prueba. Revisa la configuración de Resend.");
    } finally {
      setSaving(false);
    }
  }

  if (visibleTabs.length === 0) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Comunicación</span>
            <h1>Marketing</h1>
            <p>No tienes permisos para consultar este módulo.</p>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Comunicación y promociones</span>
          <h1>Marketing</h1>
          <p>
            Administra consentimiento, promociones y contenido de correo desde una sola vista.
          </p>
        </div>
        <button className={styles.refreshButton} type="button" onClick={() => void loadAll()} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      <section className={styles.statsGrid} aria-label="Resumen de marketing">
        <article className={styles.statCard}>
          <span>Suscriptores activos</span>
          <strong>{stats.suscriptoresActivos}</strong>
          <small>Con consentimiento vigente</small>
        </article>
        <article className={styles.statCard}>
          <span>Cupones activos</span>
          <strong>{stats.cuponesActivos}</strong>
          <small>Promociones disponibles</small>
        </article>
        <article className={styles.statCard}>
          <span>Segmentos activos</span>
          <strong>{stats.segmentosActivos}</strong>
          <small>Audiencias organizadas</small>
        </article>
        <article className={styles.statCard}>
          <span>Plantillas activas</span>
          <strong>{stats.plantillasActivas}</strong>
          <small>Listas para comunicación</small>
        </article>
      </section>

      {alert && (
        <div className={`${styles.alert} ${alert.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          {alert.message}
          <button type="button" onClick={() => setAlert(null)} aria-label="Cerrar aviso">×</button>
        </div>
      )}

      <nav className={styles.tabs} aria-label="Secciones de marketing">
        {visibleTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={currentTab === item.key ? styles.tabActive : ""}
            onClick={() => setTab(item.key)}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </nav>

      {currentTab === "suscriptores" && (
        <section className={styles.workspace}>
          {canManageSuscripciones && (
            <form className={styles.panel} onSubmit={handleSaveSuscriptor}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelEyebrow}>Consentimiento</span>
                  <h2>{editingSuscriptorId ? "Editar suscriptor" : "Nuevo suscriptor"}</h2>
                </div>
              </div>
              <label className={styles.field}>
                <span>Correo electrónico</span>
                <input
                  type="email"
                  value={suscriptorForm.email}
                  disabled={Boolean(editingSuscriptorId)}
                  onChange={(event) => setSuscriptorForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>
              <div className={styles.twoCols}>
                <label className={styles.field}>
                  <span>Nombre</span>
                  <input value={suscriptorForm.nombre} onChange={(event) => setSuscriptorForm((prev) => ({ ...prev, nombre: event.target.value }))} />
                </label>
                <label className={styles.field}>
                  <span>Teléfono</span>
                  <input value={suscriptorForm.telefono} onChange={(event) => setSuscriptorForm((prev) => ({ ...prev, telefono: event.target.value }))} />
                </label>
              </div>
              <label className={styles.field}>
                <span>Notas internas</span>
                <textarea rows={3} value={suscriptorForm.notas_admin} onChange={(event) => setSuscriptorForm((prev) => ({ ...prev, notas_admin: event.target.value }))} />
              </label>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={suscriptorForm.acepta_marketing} onChange={(event) => setSuscriptorForm((prev) => ({ ...prev, acepta_marketing: event.target.checked }))} />
                <span><strong>Acepta comunicaciones de marketing</strong><small>Debe reflejar el consentimiento del titular.</small></span>
              </label>
              <div className={styles.formActions}>
                {editingSuscriptorId && <button type="button" className={styles.secondaryButton} onClick={() => { setEditingSuscriptorId(null); setSuscriptorForm(emptySuscriptor); }}>Cancelar</button>}
                <button type="submit" disabled={saving}>{saving ? "Guardando..." : editingSuscriptorId ? "Guardar cambios" : "Registrar"}</button>
              </div>
            </form>
          )}

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.panelEyebrow}>Audiencia</span><h2>Suscriptores</h2></div>
              <span className={styles.counter}>{suscriptores.length}</span>
            </div>
            <div className={styles.list}>
              {!loading && suscriptores.length === 0 && <div className={styles.emptyState}><strong>Sin suscriptores</strong><p>La lista aparecerá aquí cuando existan registros.</p></div>}
              {suscriptores.map((item) => (
                <article className={styles.listItem} key={item.id}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemTitleRow}><strong>{item.nombre || item.email}</strong><span className={`${styles.badge} ${item.estado === "ACTIVO" ? styles.badgeActive : styles.badgeInactive}`}>{item.estado}</span></div>
                    <p>{item.email}{item.telefono ? ` · ${item.telefono}` : ""}</p>
                    <small>Origen: {item.origen} · Alta: {formatDate(item.fecha_registro || item.created_at)}</small>
                  </div>
                  {canManageSuscripciones && <div className={styles.rowActions}><button type="button" onClick={() => editSuscriptor(item)}>Editar</button><button type="button" onClick={() => void toggleSuscriptor(item)}>{item.estado === "ACTIVO" ? "Dar de baja" : "Reactivar"}</button></div>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {currentTab === "cupones" && (
        <section className={styles.workspace}>
          {canManageCupones && (
            <form className={styles.panel} onSubmit={handleSaveCupon}>
              <div className={styles.panelHeader}><div><span className={styles.panelEyebrow}>Promoción</span><h2>{editingCuponId ? "Editar cupón" : "Nuevo cupón"}</h2></div></div>
              <div className={styles.twoCols}>
                <label className={styles.field}><span>Código</span><input disabled={Boolean(editingCuponId)} value={cuponForm.codigo} onChange={(e) => setCuponForm((p) => ({ ...p, codigo: e.target.value.toUpperCase() }))} /></label>
                <label className={styles.field}><span>Nombre</span><input value={cuponForm.nombre} onChange={(e) => setCuponForm((p) => ({ ...p, nombre: e.target.value }))} /></label>
              </div>
              <label className={styles.field}><span>Descripción</span><textarea rows={3} value={cuponForm.descripcion} onChange={(e) => setCuponForm((p) => ({ ...p, descripcion: e.target.value }))} /></label>
              <div className={styles.threeCols}>
                <label className={styles.field}><span>Tipo</span><select value={cuponForm.tipo_descuento} onChange={(e) => setCuponForm((p) => ({ ...p, tipo_descuento: e.target.value }))}><option value="PORCENTAJE">Porcentaje</option><option value="MONTO_FIJO">Monto fijo</option></select></label>
                <label className={styles.field}><span>Valor</span><input type="number" min="0.01" step="0.01" value={cuponForm.valor} onChange={(e) => setCuponForm((p) => ({ ...p, valor: Number(e.target.value) }))} /></label>
                <label className={styles.field}><span>Compra mínima</span><input type="number" min="0" step="0.01" value={cuponForm.monto_minimo_compra} onChange={(e) => setCuponForm((p) => ({ ...p, monto_minimo_compra: Number(e.target.value) }))} /></label>
              </div>
              <div className={styles.twoCols}>
                <label className={styles.field}><span>Inicio</span><input type="date" value={cuponForm.fecha_inicio} onChange={(e) => setCuponForm((p) => ({ ...p, fecha_inicio: e.target.value }))} /></label>
                <label className={styles.field}><span>Fin</span><input type="date" value={cuponForm.fecha_fin} onChange={(e) => setCuponForm((p) => ({ ...p, fecha_fin: e.target.value }))} /></label>
              </div>
              <div className={styles.threeCols}>
                <label className={styles.field}><span>Canal</span><select value={cuponForm.canal} onChange={(e) => setCuponForm((p) => ({ ...p, canal: e.target.value as CanalCupon }))}><option value="AMBOS">POS + Web</option><option value="POS">POS</option><option value="WEB">Web</option></select></label>
                <label className={styles.field}><span>Usos globales</span><input type="number" min="1" value={cuponForm.uso_maximo} placeholder="Ilimitado" onChange={(e) => setCuponForm((p) => ({ ...p, uso_maximo: e.target.value }))} /></label>
                <label className={styles.field}><span>Usos por cliente</span><input type="number" min="1" value={cuponForm.uso_maximo_por_cliente} placeholder="Ilimitado" onChange={(e) => setCuponForm((p) => ({ ...p, uso_maximo_por_cliente: e.target.value }))} /></label>
              </div>
              <div className={styles.checkGrid}>
                <label className={styles.checkRow}><input type="checkbox" checked={cuponForm.acumulable} onChange={(e) => setCuponForm((p) => ({ ...p, acumulable: e.target.checked }))} /><span><strong>Acumulable</strong><small>Puede combinarse con otras promociones.</small></span></label>
                <label className={styles.checkRow}><input type="checkbox" checked={cuponForm.solo_clientes_registrados} onChange={(e) => setCuponForm((p) => ({ ...p, solo_clientes_registrados: e.target.checked }))} /><span><strong>Solo clientes registrados</strong><small>Requiere cliente asociado.</small></span></label>
              </div>
              <div className={styles.formActions}>{editingCuponId && <button type="button" className={styles.secondaryButton} onClick={() => { setEditingCuponId(null); setCuponForm(emptyCupon); }}>Cancelar</button>}<button type="submit" disabled={saving}>{saving ? "Guardando..." : editingCuponId ? "Guardar cambios" : "Crear cupón"}</button></div>
            </form>
          )}

          <div className={styles.panel}>
            <div className={styles.panelHeader}><div><span className={styles.panelEyebrow}>Promociones</span><h2>Cupones registrados</h2></div><span className={styles.counter}>{cupones.length}</span></div>
            <div className={styles.list}>
              {!loading && cupones.length === 0 && <div className={styles.emptyState}><strong>Sin cupones</strong><p>Crea la primera promoción para comenzar.</p></div>}
              {cupones.map((item) => (
                <article className={styles.listItem} key={item.id}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemTitleRow}><strong className={styles.code}>{item.codigo}</strong><span className={`${styles.badge} ${item.activo ? styles.badgeActive : styles.badgeInactive}`}>{item.estado_calculado}</span></div>
                    <p>{item.nombre || "Sin nombre"} · {item.tipo_descuento === "PORCENTAJE" ? `${Number(item.valor)}%` : `$${Number(item.valor).toFixed(2)}`}</p>
                    <small>{formatDate(item.fecha_inicio)} → {formatDate(item.fecha_fin)} · Canal {item.canal} · Usos {item.usos_actuales}{item.uso_maximo == null ? "" : `/${item.uso_maximo}`}</small>
                  </div>
                  {canManageCupones && <div className={styles.rowActions}><button type="button" onClick={() => editCupon(item)}>Editar</button><button type="button" onClick={() => void toggleCupon(item)}>{item.activo ? "Desactivar" : "Activar"}</button></div>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {currentTab === "segmentos" && (
        <section className={styles.workspace}>
          {canManageSegmentos && (
            <form className={styles.panel} onSubmit={handleSaveSegmento}>
              <div className={styles.panelHeader}><div><span className={styles.panelEyebrow}>Audiencia</span><h2>{editingSegmentoId ? "Editar segmento" : "Nuevo segmento"}</h2></div></div>
              <label className={styles.field}><span>Nombre</span><input value={segmentoForm.nombre} onChange={(e) => setSegmentoForm((p) => ({ ...p, nombre: e.target.value }))} /></label>
              <label className={styles.field}><span>Descripción</span><textarea rows={5} value={segmentoForm.descripcion} onChange={(e) => setSegmentoForm((p) => ({ ...p, descripcion: e.target.value }))} /></label>
              <label className={styles.checkRow}><input type="checkbox" checked={segmentoForm.activo} onChange={(e) => setSegmentoForm((p) => ({ ...p, activo: e.target.checked }))} /><span><strong>Segmento activo</strong><small>Disponible para organización y futuras campañas.</small></span></label>
              <div className={styles.formActions}>{editingSegmentoId && <button type="button" className={styles.secondaryButton} onClick={() => { setEditingSegmentoId(null); setSegmentoForm(emptySegmento); }}>Cancelar</button>}<button type="submit" disabled={saving}>{saving ? "Guardando..." : editingSegmentoId ? "Guardar cambios" : "Crear segmento"}</button></div>
            </form>
          )}

          <div className={styles.panel}>
            <div className={styles.panelHeader}><div><span className={styles.panelEyebrow}>Organización</span><h2>Segmentos</h2></div><span className={styles.counter}>{segmentos.length}</span></div>
            <div className={styles.list}>
              {!loading && segmentos.length === 0 && <div className={styles.emptyState}><strong>Sin segmentos</strong><p>Crea agrupaciones para organizar las audiencias.</p></div>}
              {segmentos.map((item) => (
                <article className={styles.listItem} key={item.id}>
                  <div className={styles.itemMain}><div className={styles.itemTitleRow}><strong>{item.nombre}</strong><span className={`${styles.badge} ${item.activo ? styles.badgeActive : styles.badgeInactive}`}>{item.activo ? "ACTIVO" : "INACTIVO"}</span></div><p>{item.descripcion || "Sin descripción"}</p><small>Actualizado {formatDate(item.updated_at)}</small></div>
                  {canManageSegmentos && <div className={styles.rowActions}><button type="button" onClick={() => editSegmento(item)}>Editar</button><button type="button" onClick={() => void toggleSegmento(item)}>{item.activo ? "Desactivar" : "Activar"}</button></div>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {currentTab === "plantillas" && (
        <section className={styles.workspace}>
          {canManagePlantillas && (
            <form className={styles.panel} onSubmit={handleSavePlantilla}>
              <div className={styles.panelHeader}><div><span className={styles.panelEyebrow}>Correo</span><h2>{editingPlantillaId ? "Editar plantilla" : "Nueva plantilla"}</h2></div></div>
              <div className={styles.twoCols}>
                <label className={styles.field}><span>Clave</span><input disabled={Boolean(editingPlantillaId)} value={plantillaForm.clave} onChange={(e) => setPlantillaForm((p) => ({ ...p, clave: e.target.value.toUpperCase() }))} /></label>
                <label className={styles.field}><span>Tipo</span><select value={plantillaForm.tipo} onChange={(e) => setPlantillaForm((p) => ({ ...p, tipo: e.target.value as TipoPlantilla }))}><option value="MARKETING">Marketing</option><option value="TRANSACCIONAL">Transaccional</option></select></label>
              </div>
              <label className={styles.field}><span>Nombre</span><input value={plantillaForm.nombre} onChange={(e) => setPlantillaForm((p) => ({ ...p, nombre: e.target.value }))} /></label>
              <label className={styles.field}><span>Asunto</span><input value={plantillaForm.asunto} onChange={(e) => setPlantillaForm((p) => ({ ...p, asunto: e.target.value }))} /></label>
              <label className={styles.field}><span>Preheader</span><input value={plantillaForm.preheader} onChange={(e) => setPlantillaForm((p) => ({ ...p, preheader: e.target.value }))} /></label>
              <label className={styles.field}><span>Cuerpo del correo</span><textarea rows={9} value={plantillaForm.cuerpo_texto} onChange={(e) => setPlantillaForm((p) => ({ ...p, cuerpo_texto: e.target.value }))} /></label>
              <label className={styles.checkRow}><input type="checkbox" checked={plantillaForm.activo} onChange={(e) => setPlantillaForm((p) => ({ ...p, activo: e.target.checked }))} /><span><strong>Plantilla activa</strong><small>Disponible para envíos permitidos.</small></span></label>
              <div className={styles.formActions}>{editingPlantillaId && <button type="button" className={styles.secondaryButton} onClick={() => { setEditingPlantillaId(null); setPlantillaForm(emptyPlantilla); }}>Cancelar</button>}<button type="submit" disabled={saving}>{saving ? "Guardando..." : editingPlantillaId ? "Guardar cambios" : "Crear plantilla"}</button></div>
            </form>
          )}

          <div className={styles.panel}>
            <div className={styles.panelHeader}><div><span className={styles.panelEyebrow}>Comunicación</span><h2>Plantillas</h2></div><span className={styles.counter}>{plantillas.length}</span></div>
            {canSendTest && <div className={styles.testBar}><label className={styles.field}><span>Correo para prueba</span><input type="email" placeholder="correo@ejemplo.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} /></label><small>El envío de prueba usa la configuración actual de Resend.</small></div>}
            <div className={styles.list}>
              {!loading && plantillas.length === 0 && <div className={styles.emptyState}><strong>Sin plantillas</strong><p>Crea contenido reutilizable para comunicaciones.</p></div>}
              {plantillas.map((item) => (
                <article className={styles.listItem} key={item.id}>
                  <div className={styles.itemMain}><div className={styles.itemTitleRow}><strong>{item.nombre}</strong><span className={`${styles.badge} ${item.activo ? styles.badgeActive : styles.badgeInactive}`}>{item.activo ? "ACTIVA" : "INACTIVA"}</span></div><p>{item.asunto}</p><small>{item.clave} · {item.tipo}</small></div>
                  <div className={styles.rowActions}>{canManagePlantillas && <><button type="button" onClick={() => editPlantilla(item)}>Editar</button><button type="button" onClick={() => void togglePlantilla(item)}>{item.activo ? "Desactivar" : "Activar"}</button></>}{canSendTest && <button type="button" className={styles.primaryMini} onClick={() => void sendTest(item)}>Enviar prueba</button>}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {loading && <div className={styles.loadingBar}>Actualizando información...</div>}
      {currentTabInfo && <footer className={styles.moduleFooter}><strong>{currentTabInfo.label}</strong><span>{currentTabInfo.description}</span></footer>}
    </main>
  );
}
