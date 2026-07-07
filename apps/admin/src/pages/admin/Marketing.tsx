import React, { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/Marketing.module.css";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";
import {
  cambiarEstadoCuponMarketing,
  // cambiarEstadoSuscripcionMarketing,
  editarCuponMarketing,
  editarPlantillaMarketing,
  // editarSegmentoMarketing,
  // editarSuscripcionMarketing,
  enviarPruebaPlantillaMarketing,
  getCuponesMarketing,
  getPlantillasMarketing,
  // getSegmentosMarketing,
  // getSuscripcionesMarketing,
  guardarCuponMarketing,
  guardarPlantillaMarketing,
  // guardarSegmentoMarketing,
  // guardarSuscripcionMarketing,
  type AplicaCupon,
  type CanalCupon,
  type CuponMarketing,
  // type EstadoSuscripcion,
  type PlantillaEmailMarketing,
  // type SegmentoMarketing,
  // type SuscripcionMarketing,
  type TipoPlantilla,
} from "../../services/marketing.service";

type Tab = "cupones" | "plantillas";

type AlertState = {
  type: "success" | "error";
  message: string;
} | null;

type MarketingTabConfig = {
  key: Tab;
  label: string;
  canView: boolean;
};

const MARKETING_PERMISSIONS = {
  cuponesView: "marketing.cupones.view",
  cuponesManage: "marketing.cupones.manage",
  plantillasView: "marketing.plantillas.view",
  plantillasManage: "marketing.plantillas.manage",
  plantillasTestSend: "marketing.plantillas.test_send",
} as const;

const today = new Date().toISOString().slice(0, 10);
const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

// const emptySuscriptor = {
//   email: "",
//   nombre: "",
//   telefono: "",
//   acepta_marketing: true,
//   notas_admin: "",
// };

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

// const emptySegmento = {
//   nombre: "",
//   descripcion: "",
//   activo: true,
// };

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

export default function Marketing() {
  const { user } = useAuth();

  const canViewCupones = canAccess(user, {
    permissions: MARKETING_PERMISSIONS.cuponesView,
  });

  const canManageCupones = canAccess(user, {
    permissions: MARKETING_PERMISSIONS.cuponesManage,
  });

  const canViewPlantillas = canAccess(user, {
    permissions: MARKETING_PERMISSIONS.plantillasView,
  });

  const canManagePlantillas = canAccess(user, {
    permissions: MARKETING_PERMISSIONS.plantillasManage,
  });

  const canSendPlantillaTest = canAccess(user, {
    permissions: MARKETING_PERMISSIONS.plantillasTestSend,
  });

  const [tab, setTab] = useState<Tab>("cupones");
  const [alert, setAlert] = useState<AlertState>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // const [suscriptores, setSuscriptores] = useState<SuscripcionMarketing[]>([]);
  const [cupones, setCupones] = useState<CuponMarketing[]>([]);
  // const [segmentos, setSegmentos] = useState<SegmentoMarketing[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaEmailMarketing[]>([]);

  // const [suscriptorForm, setSuscriptorForm] = useState(emptySuscriptor);
  const [cuponForm, setCuponForm] = useState(emptyCupon);
  // const [segmentoForm, setSegmentoForm] = useState(emptySegmento);
  const [plantillaForm, setPlantillaForm] = useState(emptyPlantilla);

  // const [editingSuscriptorId, setEditingSuscriptorId] = useState<string | null>(null);
  const [editingCuponId, setEditingCuponId] = useState<string | null>(null);
  // const [editingSegmentoId, setEditingSegmentoId] = useState<string | null>(null);
  const [editingPlantillaId, setEditingPlantillaId] = useState<string | null>(
    null,
  );

  const [testEmail, setTestEmail] = useState("");

  const tabs = useMemo<MarketingTabConfig[]>(
    () => [
      {
        key: "cupones",
        label: "Cupones",
        canView: canViewCupones,
      },
      {
        key: "plantillas",
        label: "Plantillas",
        canView: canViewPlantillas,
      },
    ],
    [canViewCupones, canViewPlantillas],
  );

  const visibleTabs = useMemo(
    () => tabs.filter((item) => item.canView),
    [tabs],
  );

  const currentTab = useMemo<Tab | null>(() => {
    if (visibleTabs.length === 0) return null;

    return visibleTabs.some((item) => item.key === tab)
      ? tab
      : visibleTabs[0].key;
  }, [tab, visibleTabs]);

  const title = useMemo(() => {
    const map: Record<Tab, string> = {
      // suscriptores: "Suscriptores",
      cupones: "Cupones y promociones",
      // segmentos: "Segmentos",
      plantillas: "Plantillas de correo",
    };

    return currentTab ? map[currentTab] : "Marketing";
  }, [currentTab]);

  function showSuccess(message: string) {
    setAlert({ type: "success", message });
  }

  function showError(message: string) {
    setAlert({ type: "error", message });
  }

  // async function loadSuscriptores() {
  //   const data = await getSuscripcionesMarketing();
  //   setSuscriptores(data);
  // }

  async function loadCupones() {
    if (!canViewCupones) return;

    const data = await getCuponesMarketing();
    setCupones(data);
  }

  // async function loadSegmentos() {
  //   const data = await getSegmentosMarketing();
  //   setSegmentos(data);
  // }

  async function loadPlantillas() {
    if (!canViewPlantillas) return;

    const data = await getPlantillasMarketing();
    setPlantillas(data);
  }

  async function loadCurrentTab() {
    setLoading(true);
    setAlert(null);

    try {
      if (!currentTab) return;

      // if (currentTab === "suscriptores") await loadSuscriptores();
      if (currentTab === "cupones") await loadCupones();
      // if (currentTab === "segmentos") await loadSegmentos();
      if (currentTab === "plantillas") await loadPlantillas();
    } catch (error) {
      console.error(error);
      showError("No se pudo cargar la información de marketing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  // async function handleSaveSuscriptor(event: React.FormEvent) {
  //   event.preventDefault();

  //   if (!suscriptorForm.email.trim()) {
  //     showError("El correo es requerido.");
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     if (editingSuscriptorId) {
  //       const updated = await editarSuscripcionMarketing(editingSuscriptorId, {
  //         nombre: suscriptorForm.nombre || null,
  //         telefono: suscriptorForm.telefono || null,
  //         acepta_marketing: suscriptorForm.acepta_marketing,
  //         notas_admin: suscriptorForm.notas_admin || null,
  //       });

  //       setSuscriptores((prev) =>
  //         prev.map((item) => (item.id === updated.id ? updated : item)),
  //       );
  //       showSuccess("Suscriptor actualizado correctamente.");
  //     } else {
  //       const created = await guardarSuscripcionMarketing({
  //         email: suscriptorForm.email,
  //         nombre: suscriptorForm.nombre || null,
  //         telefono: suscriptorForm.telefono || null,
  //         origen: "ADMIN",
  //         estado: "ACTIVO",
  //         acepta_marketing: suscriptorForm.acepta_marketing,
  //         notas_admin: suscriptorForm.notas_admin || null,
  //       });

  //       setSuscriptores((prev) => [created, ...prev]);
  //       showSuccess("Suscriptor creado correctamente.");
  //     }

  //     setSuscriptorForm(emptySuscriptor);
  //     setEditingSuscriptorId(null);
  //   } catch (error) {
  //     console.error(error);
  //     showError("No se pudo guardar el suscriptor.");
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  // function startEditSuscriptor(item: SuscripcionMarketing) {
  //   setEditingSuscriptorId(item.id);
  //   setSuscriptorForm({
  //     email: item.email,
  //     nombre: item.nombre || "",
  //     telefono: item.telefono || "",
  //     acepta_marketing: item.acepta_marketing,
  //     notas_admin: item.notas_admin || "",
  //   });
  // }

  // async function handleStatusSuscriptor(
  //   item: SuscripcionMarketing,
  //   estado: EstadoSuscripcion,
  // ) {
  //   setSaving(true);

  //   try {
  //     const updated = await cambiarEstadoSuscripcionMarketing(
  //       item.id,
  //       estado,
  //       estado === "BAJA" ? "Cambio desde panel administrativo" : null,
  //     );

  //     setSuscriptores((prev) =>
  //       prev.map((row) => (row.id === updated.id ? updated : row)),
  //     );

  //     showSuccess("Estado del suscriptor actualizado.");
  //   } catch (error) {
  //     console.error(error);
  //     showError("No se pudo actualizar el estado del suscriptor.");
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  async function handleSaveCupon(event: React.FormEvent) {
    event.preventDefault();

    if (!canManageCupones) {
      showError("No tienes permiso para administrar cupones.");
      return;
    }

    if (!cuponForm.codigo.trim() && !editingCuponId) {
      showError("El código del cupón es requerido.");
      return;
    }

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
        uso_maximo:
          cuponForm.uso_maximo === "" ? null : Number(cuponForm.uso_maximo),
        uso_maximo_por_cliente:
          cuponForm.uso_maximo_por_cliente === ""
            ? null
            : Number(cuponForm.uso_maximo_por_cliente),
        acumulable: cuponForm.acumulable,
        solo_clientes_registrados: cuponForm.solo_clientes_registrados,
      };

      if (editingCuponId) {
        const updated = await editarCuponMarketing(editingCuponId, payload);

        setCupones((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );

        showSuccess("Cupón actualizado correctamente.");
      } else {
        const created = await guardarCuponMarketing({
          codigo: cuponForm.codigo,
          activo: cuponForm.activo,
          ...payload,
        });

        setCupones((prev) => [created, ...prev]);
        showSuccess("Cupón creado correctamente.");
      }

      setCuponForm(emptyCupon);
      setEditingCuponId(null);
    } catch (error) {
      console.error(error);
      showError("No se pudo guardar el cupón.");
    } finally {
      setSaving(false);
    }
  }

  function startEditCupon(item: CuponMarketing) {
    if (!canManageCupones) {
      showError("No tienes permiso para editar cupones.");
      return;
    }

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
        item.uso_maximo_por_cliente == null
          ? ""
          : String(item.uso_maximo_por_cliente),
      acumulable: item.acumulable,
      solo_clientes_registrados: item.solo_clientes_registrados,
    });
  }

  async function handleToggleCupon(item: CuponMarketing) {
    if (!canManageCupones) {
      showError("No tienes permiso para activar o desactivar cupones.");
      return;
    }

    setSaving(true);

    try {
      const updated = await cambiarEstadoCuponMarketing(item.id, !item.activo);

      setCupones((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );

      showSuccess("Estado del cupón actualizado.");
    } catch (error) {
      console.error(error);
      showError("No se pudo actualizar el cupón.");
    } finally {
      setSaving(false);
    }
  }

  // async function handleSaveSegmento(event: React.FormEvent) {
  //   event.preventDefault();

  //   if (segmentoForm.nombre.trim().length < 3) {
  //     showError("El segmento debe tener al menos 3 caracteres.");
  //     return;
  //   }

  //   setSaving(true);

  //   try {
  //     const payload = {
  //       nombre: segmentoForm.nombre,
  //       descripcion: segmentoForm.descripcion || null,
  //       activo: segmentoForm.activo,
  //       criterios: {
  //         tipo: "manual",
  //         descripcion: segmentoForm.descripcion || "",
  //       },
  //     };

  //     if (editingSegmentoId) {
  //       const updated = await editarSegmentoMarketing(editingSegmentoId, payload);

  //       setSegmentos((prev) =>
  //         prev.map((item) => (item.id === updated.id ? updated : item)),
  //       );

  //       showSuccess("Segmento actualizado correctamente.");
  //     } else {
  //       const created = await guardarSegmentoMarketing(payload);

  //       setSegmentos((prev) => [created, ...prev]);
  //       showSuccess("Segmento creado correctamente.");
  //     }

  //     setSegmentoForm(emptySegmento);
  //     setEditingSegmentoId(null);
  //   } catch (error) {
  //     console.error(error);
  //     showError("No se pudo guardar el segmento.");
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  // function startEditSegmento(item: SegmentoMarketing) {
  //   setEditingSegmentoId(item.id);
  //   setSegmentoForm({
  //     nombre: item.nombre,
  //     descripcion: item.descripcion || "",
  //     activo: item.activo,
  //   });
  // }

  // async function handleToggleSegmento(item: SegmentoMarketing) {
  //   setSaving(true);

  //   try {
  //     const updated = await editarSegmentoMarketing(item.id, {
  //       activo: !item.activo,
  //     });

  //     setSegmentos((prev) =>
  //       prev.map((row) => (row.id === updated.id ? updated : row)),
  //     );

  //     showSuccess("Estado del segmento actualizado.");
  //   } catch (error) {
  //     console.error(error);
  //     showError("No se pudo actualizar el segmento.");
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  async function handleSavePlantilla(event: React.FormEvent) {
    event.preventDefault();

    if (!canManagePlantillas) {
      showError("No tienes permiso para administrar plantillas.");
      return;
    }

    if (!plantillaForm.nombre.trim() || !plantillaForm.asunto.trim()) {
      showError("Nombre y asunto son requeridos.");
      return;
    }

    setSaving(true);

    try {
      const cuerpoHtml = textToHtml(plantillaForm.cuerpo_texto);

      const payload = {
        nombre: plantillaForm.nombre,
        descripcion: plantillaForm.descripcion || null,
        tipo: plantillaForm.tipo,
        asunto: plantillaForm.asunto,
        preheader: plantillaForm.preheader || null,
        cuerpo_html: cuerpoHtml,
        cuerpo_texto: plantillaForm.cuerpo_texto || null,
        activo: plantillaForm.activo,
      };

      if (editingPlantillaId) {
        const updated = await editarPlantillaMarketing(
          editingPlantillaId,
          payload,
        );

        setPlantillas((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );

        showSuccess("Plantilla actualizada correctamente.");
      } else {
        if (!plantillaForm.clave.trim()) {
          showError("La clave es requerida para crear una plantilla.");
          setSaving(false);
          return;
        }

        const created = await guardarPlantillaMarketing({
          clave: plantillaForm.clave,
          ...payload,
        });

        setPlantillas((prev) => [created, ...prev]);
        showSuccess("Plantilla creada correctamente.");
      }

      setPlantillaForm(emptyPlantilla);
      setEditingPlantillaId(null);
    } catch (error) {
      console.error(error);
      showError("No se pudo guardar la plantilla.");
    } finally {
      setSaving(false);
    }
  }

  function startEditPlantilla(item: PlantillaEmailMarketing) {
    if (!canManagePlantillas) {
      showError("No tienes permiso para editar plantillas.");
      return;
    }

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

  async function handleTogglePlantilla(item: PlantillaEmailMarketing) {
    if (!canManagePlantillas) {
      showError("No tienes permiso para activar o desactivar plantillas.");
      return;
    }

    setSaving(true);

    try {
      const updated = await editarPlantillaMarketing(item.id, {
        activo: !item.activo,
      });

      setPlantillas((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );

      showSuccess("Estado de plantilla actualizado.");
    } catch (error) {
      console.error(error);
      showError("No se pudo actualizar la plantilla.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest(plantilla: PlantillaEmailMarketing) {
    if (!canSendPlantillaTest) {
      showError("No tienes permiso para enviar pruebas de plantillas.");
      return;
    }

    if (!testEmail.trim()) {
      showError("Coloca un correo destino para la prueba.");
      return;
    }

    setSaving(true);

    try {
      await enviarPruebaPlantillaMarketing(plantilla.id, testEmail);
      showSuccess("Correo de prueba enviado correctamente.");
    } catch (error) {
      console.error(error);
      showError("No se pudo enviar el correo de prueba.");
    } finally {
      setSaving(false);
    }
  }

  if (visibleTabs.length === 0 || !currentTab) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Panel administrativo</p>
            <h1>Marketing</h1>
            <p>No tienes permisos para consultar este módulo.</p>
          </div>
        </header>

        <div className={`${styles.alert} ${styles.error}`}>
          No tienes permiso para ver marketing.
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Panel administrativo</p>
          <h1>Marketing base</h1>
          <p>
            Administra suscriptores, cupones, segmentos y plantillas de correo.
          </p>
        </div>

        <button type="button" onClick={loadCurrentTab} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      {alert && (
        <div className={`${styles.alert} ${styles[alert.type]}`}>
          {alert.message}
        </div>
      )}

      <nav className={styles.tabs}>
        {visibleTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={currentTab === item.key ? styles.activeTab : ""}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className={styles.sectionHeader}>
        <h2>{title}</h2>
      </section>

      {/* {tab === "suscriptores" && (
        <section className={styles.grid}>
          <form className={styles.card} onSubmit={handleSaveSuscriptor}>
            <h3>{editingSuscriptorId ? "Editar suscriptor" : "Nuevo suscriptor"}</h3>

            <label className={styles.field}>
              <span>Correo</span>
              <input
                value={suscriptorForm.email}
                disabled={Boolean(editingSuscriptorId)}
                onChange={(event) =>
                  setSuscriptorForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Nombre</span>
              <input
                value={suscriptorForm.nombre}
                onChange={(event) =>
                  setSuscriptorForm((prev) => ({
                    ...prev,
                    nombre: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Teléfono</span>
              <input
                value={suscriptorForm.telefono}
                onChange={(event) =>
                  setSuscriptorForm((prev) => ({
                    ...prev,
                    telefono: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.check}>
              <input
                type="checkbox"
                checked={suscriptorForm.acepta_marketing}
                onChange={(event) =>
                  setSuscriptorForm((prev) => ({
                    ...prev,
                    acepta_marketing: event.target.checked,
                  }))
                }
              />
              Acepta marketing
            </label>

            <label className={styles.field}>
              <span>Notas internas</span>
              <textarea
                rows={4}
                value={suscriptorForm.notas_admin}
                onChange={(event) =>
                  setSuscriptorForm((prev) => ({
                    ...prev,
                    notas_admin: event.target.value,
                  }))
                }
              />
            </label>

            <div className={styles.actions}>
              <button type="submit" disabled={saving}>
                {editingSuscriptorId ? "Guardar cambios" : "Crear suscriptor"}
              </button>

              {editingSuscriptorId && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setEditingSuscriptorId(null);
                    setSuscriptorForm(emptySuscriptor);
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className={styles.card}>
            <h3>Lista de suscriptores</h3>

            <div className={styles.list}>
              {suscriptores.map((item) => (
                <article key={item.id} className={styles.item}>
                  <div>
                    <strong>{item.email}</strong>
                    <p>{item.nombre || "Sin nombre"} · {item.telefono || "Sin teléfono"}</p>
                  </div>

                  <span className={`${styles.badge} ${styles[item.estado]}`}>
                    {item.estado}
                  </span>

                  <div className={styles.rowActions}>
                    <button type="button" onClick={() => startEditSuscriptor(item)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusSuscriptor(item, "ACTIVO")}
                    >
                      Activar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusSuscriptor(item, "BAJA")}
                    >
                      Baja
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusSuscriptor(item, "BLOQUEADO")}
                    >
                      Bloquear
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )} */}

      {currentTab === "cupones" && (
        <section className={styles.grid}>
          {canManageCupones && (
            <form className={styles.card} onSubmit={handleSaveCupon}>
              <h3>{editingCuponId ? "Editar cupón" : "Nuevo cupón"}</h3>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  <span>Código</span>
                  <input
                    value={cuponForm.codigo}
                    disabled={Boolean(editingCuponId)}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        codigo: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Nombre</span>
                  <input
                    value={cuponForm.nombre}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        nombre: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>Descripción</span>
                <textarea
                  rows={3}
                  value={cuponForm.descripcion}
                  onChange={(event) =>
                    setCuponForm((prev) => ({
                      ...prev,
                      descripcion: event.target.value,
                    }))
                  }
                />
              </label>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  <span>Tipo descuento</span>
                  <select
                    value={cuponForm.tipo_descuento}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        tipo_descuento: event.target.value,
                      }))
                    }
                  >
                    <option value="PORCENTAJE">Porcentaje</option>
                    <option value="MONTO">Monto fijo</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Valor</span>
                  <input
                    type="number"
                    value={cuponForm.valor}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        valor: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  <span>Compra mínima</span>
                  <input
                    type="number"
                    value={cuponForm.monto_minimo_compra}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        monto_minimo_compra: Number(event.target.value),
                      }))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Uso máximo</span>
                  <input
                    type="number"
                    value={cuponForm.uso_maximo}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        uso_maximo: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  <span>Fecha inicio</span>
                  <input
                    type="date"
                    value={cuponForm.fecha_inicio}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        fecha_inicio: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Fecha fin</span>
                  <input
                    type="date"
                    value={cuponForm.fecha_fin}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        fecha_fin: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  <span>Canal</span>
                  <select
                    value={cuponForm.canal}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        canal: event.target.value as CanalCupon,
                      }))
                    }
                  >
                    <option value="AMBOS">Ambos</option>
                    <option value="POS">POS</option>
                    <option value="WEB">Web</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Aplica a</span>
                  <select
                    value={cuponForm.aplica_a}
                    onChange={(event) =>
                      setCuponForm((prev) => ({
                        ...prev,
                        aplica_a: event.target.value as AplicaCupon,
                      }))
                    }
                  >
                    <option value="PEDIDO">Pedido</option>
                    <option value="PRODUCTO">Producto</option>
                    <option value="CATEGORIA">Categoría</option>
                  </select>
                </label>
              </div>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={cuponForm.acumulable}
                  onChange={(event) =>
                    setCuponForm((prev) => ({
                      ...prev,
                      acumulable: event.target.checked,
                    }))
                  }
                />
                Acumulable
              </label>

              <div className={styles.actions}>
                <button type="submit" disabled={saving}>
                  {editingCuponId ? "Guardar cambios" : "Crear cupón"}
                </button>

                {editingCuponId && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setEditingCuponId(null);
                      setCuponForm(emptyCupon);
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}

          <div className={styles.card}>
            <h3>Lista de cupones</h3>

            <div className={styles.list}>
              {cupones.map((item) => (
                <article key={item.id} className={styles.item}>
                  <div>
                    <strong>{item.codigo}</strong>
                    <p>
                      {item.nombre || "Sin nombre"} · {item.valor}
                      {item.tipo_descuento === "PORCENTAJE" ? "%" : " MXN"}
                    </p>
                    <small>{item.estado_calculado}</small>
                  </div>

                  <span
                    className={`${styles.badge} ${item.activo ? styles.ACTIVO : styles.INACTIVO}`}
                  >
                    {item.activo ? "ACTIVO" : "INACTIVO"}
                  </span>

                  {canManageCupones && (
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        onClick={() => startEditCupon(item)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleCupon(item)}
                      >
                        {item.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* {tab === "segmentos" && (
        <section className={styles.grid}>
          <form className={styles.card} onSubmit={handleSaveSegmento}>
            <h3>{editingSegmentoId ? "Editar segmento" : "Nuevo segmento"}</h3>

            <label className={styles.field}>
              <span>Nombre</span>
              <input
                value={segmentoForm.nombre}
                onChange={(event) =>
                  setSegmentoForm((prev) => ({
                    ...prev,
                    nombre: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Descripción</span>
              <textarea
                rows={4}
                value={segmentoForm.descripcion}
                onChange={(event) =>
                  setSegmentoForm((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
              />
            </label>

            <label className={styles.check}>
              <input
                type="checkbox"
                checked={segmentoForm.activo}
                onChange={(event) =>
                  setSegmentoForm((prev) => ({
                    ...prev,
                    activo: event.target.checked,
                  }))
                }
              />
              Activo
            </label>

            <div className={styles.actions}>
              <button type="submit" disabled={saving}>
                {editingSegmentoId ? "Guardar cambios" : "Crear segmento"}
              </button>
            </div>
          </form>

          <div className={styles.card}>
            <h3>Lista de segmentos</h3>

            <div className={styles.list}>
              {segmentos.map((item) => (
                <article key={item.id} className={styles.item}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <p>{item.descripcion || "Sin descripción"}</p>
                  </div>

                  <span className={`${styles.badge} ${item.activo ? styles.ACTIVO : styles.INACTIVO}`}>
                    {item.activo ? "ACTIVO" : "INACTIVO"}
                  </span>

                  <div className={styles.rowActions}>
                    <button type="button" onClick={() => startEditSegmento(item)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => handleToggleSegmento(item)}>
                      {item.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )} */}

      {currentTab === "plantillas" && (
        <section className={styles.grid}>
          {canManagePlantillas && (
            <form className={styles.card} onSubmit={handleSavePlantilla}>
              <h3>
                {editingPlantillaId ? "Editar plantilla" : "Nueva plantilla"}
              </h3>

              <div className={styles.twoCols}>
                <label className={styles.field}>
                  <span>Clave</span>
                  <input
                    value={plantillaForm.clave}
                    disabled={Boolean(editingPlantillaId)}
                    onChange={(event) =>
                      setPlantillaForm((prev) => ({
                        ...prev,
                        clave: event.target.value.toUpperCase(),
                      }))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Tipo</span>
                  <select
                    value={plantillaForm.tipo}
                    onChange={(event) =>
                      setPlantillaForm((prev) => ({
                        ...prev,
                        tipo: event.target.value as TipoPlantilla,
                      }))
                    }
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="TRANSACCIONAL">Transaccional</option>
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span>Nombre</span>
                <input
                  value={plantillaForm.nombre}
                  onChange={(event) =>
                    setPlantillaForm((prev) => ({
                      ...prev,
                      nombre: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Asunto</span>
                <input
                  value={plantillaForm.asunto}
                  onChange={(event) =>
                    setPlantillaForm((prev) => ({
                      ...prev,
                      asunto: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Preheader</span>
                <input
                  value={plantillaForm.preheader}
                  onChange={(event) =>
                    setPlantillaForm((prev) => ({
                      ...prev,
                      preheader: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Contenido del correo</span>
                <textarea
                  rows={8}
                  value={plantillaForm.cuerpo_texto}
                  onChange={(event) =>
                    setPlantillaForm((prev) => ({
                      ...prev,
                      cuerpo_texto: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={plantillaForm.activo}
                  onChange={(event) =>
                    setPlantillaForm((prev) => ({
                      ...prev,
                      activo: event.target.checked,
                    }))
                  }
                />
                Activa
              </label>

              <div className={styles.actions}>
                <button type="submit" disabled={saving}>
                  {editingPlantillaId ? "Guardar cambios" : "Crear plantilla"}
                </button>
              </div>
            </form>
          )}

          <div className={styles.card}>
            <h3>Lista de plantillas</h3>

            {canSendPlantillaTest && (
              <label className={styles.field}>
                <span>Correo para prueba</span>
                <input
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </label>
            )}

            <div className={styles.list}>
              {plantillas.map((item) => (
                <article key={item.id} className={styles.item}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <p>{item.asunto}</p>
                    <small>
                      {item.clave} · {item.tipo}
                    </small>
                  </div>

                  <span
                    className={`${styles.badge} ${item.activo ? styles.ACTIVO : styles.INACTIVO}`}
                  >
                    {item.activo ? "ACTIVA" : "INACTIVA"}
                  </span>

                  {(canManagePlantillas || canSendPlantillaTest) && (
                    <div className={styles.rowActions}>
                      {canManagePlantillas && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditPlantilla(item)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePlantilla(item)}
                          >
                            {item.activo ? "Desactivar" : "Activar"}
                          </button>
                        </>
                      )}

                      {canSendPlantillaTest && (
                        <button
                          type="button"
                          onClick={() => handleSendTest(item)}
                        >
                          Enviar prueba
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}