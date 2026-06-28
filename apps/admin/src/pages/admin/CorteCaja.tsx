import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  User,
  Printer,
  Lock,
  CircleDollarSign,
  History,
  CreditCard,
  Landmark,
  Banknote,
} from "lucide-react";
import styles from "../../../styles/CorteCaja.module.css";
import { ventasService } from "@admin/services/ventas.service";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(v || 0));

const toNumber = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

type EstadoCorte = "sin_corte" | "abierto" | "cerrado";

interface CorteMetodoDesglose {
  codigo: string;
  nombre: string;
  total: number | string;
  operaciones?: number | string;
  afecta_caja: boolean;
  permite_cambio?: boolean;
  es_credito?: boolean;
  activo_pos?: boolean;
}

interface CorteTotalesMetodos {
  total_caja?: number | string;
  total_pagos?: number | string;
  efectivo_esperado?: number | string;
}

interface CorteResumen {
  fondo_inicial?: number | string;
  total_efectivo?: number | string;
  total_tarjeta?: number | string;
  total_transferencia?: number | string;
  total_pagos?: number | string;
  efectivo_esperado?: number | string;
}

interface CorteData {
  id: string | number;
  usuario_id: string | number;
  usuario_nombre?: string;
  inicio_turno: string;
  fin_turno: string | null;
  fondo_inicial?: number | string;
  total_sistema: number | string;
  total_real: number | string | null;
  observaciones: string | null;
  resumen?: CorteResumen;
  desglose_metodos?: CorteMetodoDesglose[];
  totales_metodos?: CorteTotalesMetodos;
}

interface ApiError {
  response?: {
    data?: {
      msg?: string;
      detail?: string;
    };
  };
  message?: string;
}

function getMetodoIcon(codigo: string) {
  const code = String(codigo || "").toUpperCase();

  if (code === "EFECTIVO" || code.includes("EFECTIVO")) {
    return <Banknote size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />;
  }

  if (code.includes("TARJETA") || code.includes("CARD")) {
    return <CreditCard size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />;
  }

  if (code.includes("TRANSFERENCIA") || code.includes("BANCO")) {
    return <Landmark size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />;
  }

  return <CircleDollarSign size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />;
}

export default function CorteCaja() {
  const [estado, setEstado] = useState<EstadoCorte>("sin_corte");
  const [corteActual, setCorteActual] = useState<CorteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fondoInicial, setFondoInicial] = useState("");
  const [montoContado, setMontoContado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const loadCorte = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ventasService.getCorteActual();

      console.log(res);
      if (res && typeof res === "object" && "id" in res) {
        const corte = res as CorteData;
        setCorteActual(corte);
        setEstado(corte.fin_turno ? "cerrado" : "abierto");

        if (corte.fin_turno) {
          setMontoContado(String(corte.total_real || ""));
          setObservaciones(corte.observaciones || "");
        } else {
          setMontoContado("");
          setObservaciones("");
        }
      } else {
        setEstado("sin_corte");
        setCorteActual(null);
        setMontoContado("");
        setObservaciones("");
      }
    } catch (error: unknown) {
      console.error("Error cargando el corte:", error);
      setError("No se pudo cargar la información del turno.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorte();
  }, []);

  const handlerPrintCorte = () => {
    window.print();
  };

  const handleAbrirCorte = async () => {
    const fondo = Number(fondoInicial) || 0;

    if (fondo < 0) {
      alert("⚠️ El fondo inicial no puede ser negativo.");
      return;
    }

    try {
      setProcesando(true);
      setError(null);
      await ventasService.abrirCorte({ fondo_inicial: fondo });
      setFondoInicial("");
      await loadCorte();
    } catch (error: unknown) {
      const err = error as ApiError;
      const msg = err.response?.data?.msg || err.message;
      setError(msg || "Ocurrió un error al abrir el turno.");
    } finally {
      setProcesando(false);
    }
  };

  const isOpen = estado === "abierto";
  const isClosed = estado === "cerrado";
  const hasNoShift = estado === "sin_corte";

  const fondoInicialActual = toNumber(
    corteActual?.resumen?.fondo_inicial ?? corteActual?.fondo_inicial ?? 0,
  );

  const hasDesgloseDinamico = Boolean(corteActual?.desglose_metodos?.length);

  const fallbackMetodos: CorteMetodoDesglose[] = [
    {
      codigo: "EFECTIVO",
      nombre: "Efectivo",
      total: corteActual?.resumen?.total_efectivo ?? 0,
      operaciones: 0,
      afecta_caja: true,
    },
    {
      codigo: "TARJETA",
      nombre: "Tarjeta",
      total: corteActual?.resumen?.total_tarjeta ?? 0,
      operaciones: 0,
      afecta_caja: false,
    },
    {
      codigo: "TRANSFERENCIA",
      nombre: "Transferencia",
      total: corteActual?.resumen?.total_transferencia ?? 0,
      operaciones: 0,
      afecta_caja: false,
    },
  ];

  const metodosCorte = hasDesgloseDinamico
    ? corteActual?.desglose_metodos ?? []
    : fallbackMetodos;

  const totalEfectivo = toNumber(
    corteActual?.totales_metodos?.total_caja ??
      corteActual?.resumen?.total_efectivo ??
      metodosCorte
        .filter((m) => m.afecta_caja)
        .reduce((acc, m) => acc + toNumber(m.total), 0),
  );

  const totalEsperadoVista = toNumber(
    corteActual?.totales_metodos?.efectivo_esperado ??
      corteActual?.resumen?.efectivo_esperado ??
      corteActual?.total_sistema ??
      fondoInicialActual + totalEfectivo,
  );

  const totalPagos = toNumber(
    corteActual?.totales_metodos?.total_pagos ??
      corteActual?.resumen?.total_pagos ??
      metodosCorte.reduce((acc, m) => acc + toNumber(m.total), 0),
  );

  const efectivoEsperado = totalEsperadoVista;
  const totalRealNumber = Number(
    isClosed ? corteActual?.total_real || 0 : montoContado || 0,
  );
  const diferencia = totalRealNumber - efectivoEsperado;

  const tone =
    diferencia === 0 ? "success" : diferencia < 0 ? "danger" : "warning";
  const toneLabel =
    diferencia === 0
      ? "Corte exacto"
      : diferencia < 0
        ? "Faltante"
        : "Sobrante";

  const fechaLabel = corteActual?.inicio_turno
    ? new Date(corteActual.inicio_turno).toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

  const horaApertura = corteActual?.inicio_turno
    ? new Date(corteActual.inicio_turno).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const horaCierre = corteActual?.fin_turno
    ? new Date(corteActual.fin_turno).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const requiereJustificacion = totalRealNumber !== totalEsperadoVista;

  const handleCerrarCorte = async () => {
    if (!corteActual) return;

    const real = Number(montoContado);
    if (Number.isNaN(real) || real < 0) {
      alert("⚠️ Ingresa un monto válido en el total contado.");
      return;
    }

    if (real !== totalEsperadoVista && observaciones.trim() === "") {
      const palabra = real < totalEsperadoVista ? "faltante" : "sobrante";
      alert(
        `⚠️ Tienes un ${palabra} de ${fmt(Math.abs(real - totalEsperadoVista))}.\n\nEs obligatorio escribir una justificación en las observaciones antes de poder cerrar el turno.`,
      );
      return;
    }

    try {
      setProcesando(true);
      setError(null);

      const payload: Parameters<typeof ventasService.cerrarCorte>[1] = {
        usuario_id: corteActual.usuario_id,
        total_real: real,
        observaciones: observaciones || undefined,
      };

      const res = await ventasService.cerrarCorte(corteActual.id, payload);
      console.log(res);
      setCorteActual(res as CorteData);
      setEstado("cerrado");
      alert("¡Turno cerrado con éxito!");
    } catch (error: unknown) {
      const err = error as ApiError;
      const msg = err.response?.data?.msg || err.message;
      setError(msg || "Ocurrió un error al cerrar el turno.");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p style={{ padding: "2rem" }}>Cargando información del turno...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminBreadcrumbs items={[{ label: "Corte de Caja" }]} />

      <header className={styles.bar}>
        <div className={styles.barLeft}>
          <span className={styles.badge}>
            <Wallet size={14} /> Corte de caja
          </span>
          <span className={styles.meta}>
            <Clock3 size={13} /> {fechaLabel}
          </span>
          <span className={styles.meta}>
            <User size={13} /> {corteActual?.usuario_nombre ?? "Cajero en turno"}
          </span>
        </div>

        <div className={styles.barRight}>
          <Link
            to="/corte/history"
            className={styles.historialBtn}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginRight: "16px",
            }}
          >
            <History size={14} /> Historial
          </Link>

          {hasNoShift && (
            <span className={`${styles.status} ${styles.statusIdle}`}>
              Sin corte
            </span>
          )}
          {isOpen && (
            <span className={`${styles.status} ${styles.statusOpen}`}>
              Abierto
            </span>
          )}
          {isClosed && (
            <span className={`${styles.status} ${styles.statusClosed}`}>
              Cerrado
            </span>
          )}
        </div>
      </header>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "10px 15px",
            borderRadius: "6px",
            margin: "0 20px 20px",
          }}
        >
          <AlertTriangle
            size={16}
            style={{
              display: "inline",
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          {error}
        </div>
      )}

      {hasNoShift && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateTop}>
            <Lock size={28} />
            <div>
              <strong>No hay turno activo</strong>
              <p>
                Abre un corte para comenzar a registrar operaciones del día.
              </p>
            </div>
          </div>

          <div className={styles.emptyStateBody}>
            <label className={styles.fondoField}>
              Fondo inicial
              <div className={styles.inputShell}>
                <span>$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={fondoInicial}
                  onChange={(e) => setFondoInicial(e.target.value)}
                  disabled={procesando}
                />
              </div>
            </label>

            <button
              type="button"
              className={styles.primaryBtn}
              style={{ flex: 1, maxWidth: 220 }}
              onClick={handleAbrirCorte}
              disabled={procesando}
            >
              {procesando ? "Abriendo..." : "Abrir corte"}
            </button>
          </div>
        </div>
      )}

      {!hasNoShift && (
        <div className={styles.grid}>
          <div className={styles.col}>
            <div className={styles.panel}>
              <div className={styles.times}>
                <div className={styles.timeBox}>
                  <span>Apertura</span>
                  <strong>{horaApertura}</strong>
                </div>
                <div className={styles.timeDash} />
                <div className={styles.timeBox}>
                  <span>{isClosed ? "Cierre" : "En curso"}</span>
                  <strong>{isClosed ? horaCierre : "---"}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                {isClosed ? (
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => {
                      setEstado("sin_corte");
                      setCorteActual(null);
                      setMontoContado("");
                      setObservaciones("");
                    }}
                  >
                    Nuevo corte
                  </button>
                ) : (
                  <button type="button" className={styles.secondaryBtn}>
                    Ver movimientos
                  </button>
                )}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Sistema</p>
                  <h2 className={styles.panelTitle}>
                    Efectivo esperado en caja
                  </h2>
                </div>
              </div>

              <div className={styles.bigNumber}>
                <span>Total esperado en efectivo</span>
                <strong>{fmt(totalEsperadoVista)}</strong>
              </div>

              <div className={styles.rows}>
                <div className={styles.row}>
                  <span>Fondo inicial</span>
                  <strong>{fmt(fondoInicialActual)}</strong>
                </div>
                <div className={styles.row}>
                  <span>Ventas en efectivo</span>
                  <strong>{fmt(totalEfectivo)}</strong>
                </div>
              </div>

              <div className={styles.methodGrid}>
                {metodosCorte.map((metodo) => (
                  <div key={metodo.codigo} className={styles.methodCard}>
                    <span>
                      {getMetodoIcon(metodo.codigo)}
                      {metodo.nombre}
                    </span>
                    <strong>{fmt(toNumber(metodo.total))}</strong>
                    <small
                      style={{
                        display: "block",
                        marginTop: 4,
                        opacity: 0.62,
                        fontSize: "0.72rem",
                      }}
                    >
                      {metodo.afecta_caja
                        ? "Afecta caja física"
                        : "Solo referencia"}
                    </small>
                  </div>
                ))}

                <div className={styles.methodCard}>
                  <span>Total cobrado</span>
                  <strong>{fmt(totalPagos)}</strong>
                  <small
                    style={{
                      display: "block",
                      marginTop: 4,
                      opacity: 0.62,
                      fontSize: "0.72rem",
                    }}
                  >
                    Todos los métodos
                  </small>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Conteo físico</p>
                  <h2 className={styles.panelTitle}>Lo que hay en caja</h2>
                </div>
                <div className={styles.iconBox}>
                  <Calculator size={16} />
                </div>
              </div>

              {!isClosed && fondoInicialActual > 0 && totalEfectivo === 0 && (
                <div
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #fdba74",
                    color: "#9a3412",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    marginBottom: "16px",
                    fontSize: "0.95rem",
                  }}
                >
                  No hubo ventas en efectivo en este turno. El esperado
                  corresponde solo al fondo inicial.
                </div>
              )}

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Total contado</span>
                  <div className={styles.inputShell}>
                    <span>$</span>
                    <input
                      type="number"
                      value={montoContado}
                      onChange={(e) => setMontoContado(e.target.value)}
                      readOnly={isClosed}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </label>

                <label className={`${styles.field} ${styles.fieldFull}`}>
                  <span>
                    Observaciones
                    {!isClosed && requiereJustificacion
                      ? " (obligatorias si hay diferencia)"
                      : ""}
                  </span>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    readOnly={isClosed}
                    rows={3}
                    placeholder={
                      !isClosed
                        ? "Ingresa cualquier nota o justificación..."
                        : ""
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <div className={styles.col}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Resultado</p>
                  <h2 className={styles.panelTitle}>Diferencia del corte</h2>
                </div>
                <div
                  className={`${styles.resultIcon} ${styles[`tone_${tone}`]}`}
                >
                  {tone === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
              </div>

              <div className={`${styles.diffCard} ${styles[`diff_${tone}`]}`}>
                <span>{toneLabel}</span>
                <strong>{fmt(diferencia)}</strong>
              </div>

              <div className={styles.rows}>
                <div className={styles.row}>
                  <span>Esperado en efectivo</span>
                  <strong>{fmt(totalEsperadoVista)}</strong>
                </div>
                <div className={styles.row}>
                  <span>Real contado</span>
                  <strong>{fmt(totalRealNumber)}</strong>
                </div>
                <div className={styles.row}>
                  <span>Diferencia</span>
                  <strong>{fmt(diferencia)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Acción final</p>
                  <h2 className={styles.panelTitle}>
                    {isClosed ? "Turno cerrado" : "Confirmar cierre"}
                  </h2>
                </div>
                <div className={styles.iconBox}>
                  <CircleDollarSign size={16} />
                </div>
              </div>

              {isClosed ? (
                <>
                  <div className={`${styles.diffCard} ${styles.diff_success}`}>
                    <span>Cierre completado</span>
                    <strong>Guardado correctamente</strong>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={handlerPrintCorte}
                    >
                      <Printer size={15} /> Imprimir corte
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "14px",
                      marginBottom: "16px",
                      color: "#334155",
                      fontSize: "0.95rem",
                    }}
                  >
                    El cierre compara únicamente el efectivo esperado contra el
                    efectivo contado. Los métodos marcados como referencia no forman
                    parte del dinero físico en caja.
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      disabled={procesando || montoContado === ""}
                      onClick={handleCerrarCorte}
                    >
                      {procesando ? "Cerrando..." : "Cerrar corte"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={styles.printSheet}>
        <div className={styles.printHeader}>
          <h1>Moda Sarita</h1>
          <p>Corte de caja</p>
        </div>

        <div className={styles.printRow}>
          <span>Cajero</span>
          <strong>{corteActual?.usuario_nombre ?? "Cajero"}</strong>
        </div>

        <div className={styles.printSection}>
          <div className={styles.printRow}>
            <span>Fecha</span>
            <strong>{fechaLabel}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Apertura</span>
            <strong>{horaApertura}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Cierre</span>
            <strong>{horaCierre}</strong>
          </div>
        </div>

        <div className={styles.printSection}>
          <div className={styles.printRow}>
            <span>Fondo inicial</span>
            <strong>{fmt(fondoInicialActual)}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Ventas que afectan caja</span>
            <strong>{fmt(totalEfectivo)}</strong>
          </div>
          {metodosCorte.map((metodo) => (
            <div key={metodo.codigo} className={styles.printRow}>
              <span>
                {metodo.nombre}
                {metodo.afecta_caja ? "" : " (referencia)"}
              </span>
              <strong>{fmt(toNumber(metodo.total))}</strong>
            </div>
          ))}
          <div className={styles.printRow}>
            <span>Total cobrado</span>
            <strong>{fmt(totalPagos)}</strong>
          </div>
        </div>

        <div className={styles.printSection}>
          <div className={styles.printRow}>
            <span>Efectivo esperado</span>
            <strong>{fmt(totalEsperadoVista)}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Total contado</span>
            <strong>{fmt(totalRealNumber)}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Diferencia</span>
            <strong>{fmt(diferencia)}</strong>
          </div>
        </div>

        <div className={styles.printSection}>
          <span className={styles.printObservacionesLabel}>Observaciones</span>
          <p className={styles.printObservacionesText}>
            {observaciones?.trim() ? observaciones : "Sin observaciones"}
          </p>
        </div>
      </div>
    </div>
  );
}