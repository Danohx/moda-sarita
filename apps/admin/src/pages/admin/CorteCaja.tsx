import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  ReceiptText,
  HandCoins,
} from "lucide-react";
import styles from "../../../styles/CorteCaja.module.css";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";
import { ventasService } from "@admin/services/ventas.service";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";
import type {
  CorteCaja as CorteData,
  CorteConceptoDesgloseApi,
  CorteMetodoDesgloseApi,
} from "@shared/api/ventas.api";

const fmt = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));

const toNumber = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

type EstadoCorte = "sin_corte" | "abierto" | "cerrado";
type Tone = "pending" | "success" | "danger" | "warning";

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

  if (code.includes("EFECTIVO")) {
    return <Banknote size={14} />;
  }

  if (code.includes("TARJETA") || code.includes("CARD")) {
    return <CreditCard size={14} />;
  }

  if (code.includes("TRANSFERENCIA") || code.includes("BANCO")) {
    return <Landmark size={14} />;
  }

  return <CircleDollarSign size={14} />;
}

function ConceptCard({ concepto }: { concepto: CorteConceptoDesgloseApi }) {
  return (
    <article className={styles.detailCard}>
      <span className={styles.detailLabel}>{concepto.nombre}</span>
      <strong className={styles.detailValue}>{fmt(toNumber(concepto.total))}</strong>
      <small className={styles.detailHelper}>
        {toNumber(concepto.operaciones)} operacion(es)
      </small>
    </article>
  );
}

export default function CorteCaja() {
  const { id: corteIdParam } = useParams();
  const { user } = useAuth();

  const canReadCorte = canAccess(user, {
    permissions: "ventas.corte_caja.read",
  });
  const canCreateCorte = canAccess(user, {
    permissions: "ventas.corte_caja.create",
  });
  const canCloseCorte = canAccess(user, {
    permissions: "ventas.corte_caja.close",
  });

  const [estado, setEstado] = useState<EstadoCorte>("sin_corte");
  const [corteActual, setCorteActual] = useState<CorteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fondoInicial, setFondoInicial] = useState("");
  const [montoContado, setMontoContado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const loadCorte = async () => {
    if (!canReadCorte) {
      setLoading(false);
      setError("No tienes permiso para consultar corte de caja.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = corteIdParam
        ? await ventasService.getCorteById(corteIdParam)
        : await ventasService.getCorteActual();

      if (response && typeof response === "object" && "id" in response) {
        const corte = response as CorteData;
        setCorteActual(corte);
        setEstado(corte.fin_turno ? "cerrado" : "abierto");

        if (corte.fin_turno) {
          setMontoContado(String(corte.total_real ?? ""));
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
    } catch (unknownError) {
      console.error("Error cargando el corte:", unknownError);
      setError("No se pudo cargar la informacion del turno.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCorte();
  }, [corteIdParam, canReadCorte]);

  const isOpen = estado === "abierto";
  const isClosed = estado === "cerrado";
  const hasNoShift = estado === "sin_corte";

  const metodosCorte = useMemo<CorteMetodoDesgloseApi[]>(() => {
    return (corteActual?.desglose_metodos ?? []).filter((metodo) => {
      const codigo = String(metodo.codigo || "").toUpperCase();
      return metodo.es_credito !== true && codigo !== "CREDITO_TIENDA";
    });
  }, [corteActual?.desglose_metodos]);

  const conceptosCorte = corteActual?.desglose_conceptos ?? [];
  const cobranza = corteActual?.cobranza_creditos;
  const financiamiento = corteActual?.financiamiento_creditos;

  const fondoInicialActual = toNumber(
    corteActual?.resumen?.fondo_inicial ?? corteActual?.fondo_inicial,
  );

  const totalEfectivo = toNumber(
    corteActual?.totales_metodos?.total_caja ??
      corteActual?.resumen?.total_efectivo ??
      metodosCorte
        .filter((metodo) => metodo.afecta_caja)
        .reduce((sum, metodo) => sum + toNumber(metodo.total), 0),
  );

  const totalEsperadoVista = toNumber(
    corteActual?.totales_metodos?.efectivo_esperado ??
      corteActual?.resumen?.efectivo_esperado ??
      fondoInicialActual + totalEfectivo,
  );

  const totalPagos = toNumber(
    corteActual?.totales_metodos?.total_pagos ??
      corteActual?.resumen?.total_pagos ??
      metodosCorte.reduce((sum, metodo) => sum + toNumber(metodo.total), 0),
  );

  const conteoCapturado = isClosed || montoContado.trim() !== "";
  const totalRealNumber = conteoCapturado
    ? toNumber(isClosed ? corteActual?.total_real : montoContado)
    : null;
  const diferencia =
    totalRealNumber === null ? null : totalRealNumber - totalEsperadoVista;

  const tone: Tone =
    diferencia === null
      ? "pending"
      : diferencia === 0
        ? "success"
        : diferencia < 0
          ? "danger"
          : "warning";

  const toneLabel =
    tone === "pending"
      ? "Pendiente de conteo"
      : tone === "success"
        ? "Corte exacto"
        : tone === "danger"
          ? "Faltante"
          : "Sobrante";

  const requiereJustificacion = diferencia !== null && diferencia !== 0;

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

  const handleAbrirCorte = async () => {
    if (!canCreateCorte) {
      setError("No tienes permiso para abrir cortes de caja.");
      return;
    }

    const fondo = Number(fondoInicial || 0);
    if (!Number.isFinite(fondo) || fondo < 0) {
      setError("El fondo inicial debe ser un numero mayor o igual a cero.");
      return;
    }

    try {
      setProcesando(true);
      setError(null);
      await ventasService.abrirCorte({ fondo_inicial: fondo });
      setFondoInicial("");
      await loadCorte();
    } catch (unknownError) {
      const apiError = unknownError as ApiError;
      setError(
        apiError.response?.data?.msg ||
          apiError.message ||
          "Ocurrio un error al abrir el turno.",
      );
    } finally {
      setProcesando(false);
    }
  };

  const handleCerrarCorte = async () => {
    if (!canCloseCorte) {
      setError("No tienes permiso para cerrar cortes de caja.");
      return;
    }

    if (!corteActual || !conteoCapturado || totalRealNumber === null) {
      setError("Captura el total contado antes de cerrar el corte.");
      return;
    }

    if (totalRealNumber < 0) {
      setError("El total contado no puede ser negativo.");
      return;
    }

    if (requiereJustificacion && observaciones.trim() === "") {
      const palabra = diferencia! < 0 ? "faltante" : "sobrante";
      setError(
        `Existe un ${palabra} de ${fmt(Math.abs(diferencia!))}. Es obligatorio escribir una justificacion.`,
      );
      return;
    }

    try {
      setProcesando(true);
      setError(null);

      const response = await ventasService.cerrarCorte(corteActual.id, {
        usuario_id: corteActual.usuario_id,
        total_real: totalRealNumber,
        observaciones: observaciones || undefined,
      });

      setCorteActual(response as CorteData);
      setEstado("cerrado");
    } catch (unknownError) {
      const apiError = unknownError as ApiError;
      setError(
        apiError.response?.data?.msg ||
          apiError.message ||
          "Ocurrio un error al cerrar el turno.",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (!canReadCorte) {
    return (
      <div className={styles.page}>
        <AdminBreadcrumbs items={[{ label: "Corte de Caja" }]} />
        <div className={styles.emptyState}>
          <div className={styles.emptyStateTop}>
            <Lock size={28} />
            <div>
              <strong>Acceso restringido</strong>
              <p>No tienes permiso para consultar el corte de caja.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loadingText}>Cargando informacion del turno...</p>
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
          <Link to="/corte/history" className={styles.historialBtn}>
            <History size={14} /> Historial
          </Link>
          <span
            className={`${styles.status} ${
              hasNoShift
                ? styles.statusIdle
                : isOpen
                  ? styles.statusOpen
                  : styles.statusClosed
            }`}
          >
            {hasNoShift ? "Sin corte" : isOpen ? "Abierto" : "Cerrado"}
          </span>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {hasNoShift && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateTop}>
            <Lock size={28} />
            <div>
              <strong>No hay turno activo</strong>
              <p>Abre un corte para comenzar a registrar operaciones del dia.</p>
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
                  onChange={(event) => setFondoInicial(event.target.value)}
                  disabled={procesando || !canCreateCorte}
                />
              </div>
            </label>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleAbrirCorte}
              disabled={procesando || !canCreateCorte}
            >
              {procesando ? "Abriendo..." : "Abrir corte"}
            </button>
          </div>
        </div>
      )}

      {!hasNoShift && (
        <div className={styles.grid}>
          <div className={styles.col}>
            <section className={styles.panel}>
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
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Sistema</p>
                  <h2 className={styles.panelTitle}>Efectivo esperado en caja</h2>
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
                  <span>Entradas en efectivo</span>
                  <strong>{fmt(totalEfectivo)}</strong>
                </div>
              </div>

              <div className={styles.methodGrid}>
                {metodosCorte.map((metodo) => (
                  <article key={metodo.codigo} className={styles.methodCard}>
                    <span className={styles.methodTitle}>
                      {getMetodoIcon(metodo.codigo)} {metodo.nombre}
                    </span>
                    <strong>{fmt(toNumber(metodo.total))}</strong>
                    <small>
                      {metodo.afecta_caja
                        ? "Afecta caja fisica"
                        : "Cobro de referencia"}
                    </small>
                  </article>
                ))}

                <article className={styles.methodCard}>
                  <span className={styles.methodTitle}>
                    <ReceiptText size={14} /> Total cobrado
                  </span>
                  <strong>{fmt(totalPagos)}</strong>
                  <small>Todos los metodos reales</small>
                </article>
              </div>

              <div className={styles.infoNote}>
                Credito de tienda no aparece como metodo cobrado porque representa
                financiamiento, no dinero recibido.
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Origen del cobro</p>
                  <h2 className={styles.panelTitle}>Desglose por concepto</h2>
                </div>
                <div className={styles.iconBox}>
                  <ReceiptText size={16} />
                </div>
              </div>

              {conceptosCorte.length > 0 ? (
                <div className={styles.detailGrid}>
                  {conceptosCorte.map((concepto) => (
                    <ConceptCard key={concepto.codigo} concepto={concepto} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyInline}>Sin cobros en este turno.</div>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Cobranza</p>
                  <h2 className={styles.panelTitle}>Cobrado de creditos</h2>
                </div>
                <div className={styles.iconBox}>
                  <HandCoins size={16} />
                </div>
              </div>

              <div className={styles.rows}>
                <div className={styles.row}>
                  <span>Enganches recibidos</span>
                  <strong>{fmt(toNumber(cobranza?.enganches))}</strong>
                </div>
                <div className={styles.row}>
                  <span>Abonos recibidos</span>
                  <strong>{fmt(toNumber(cobranza?.abonos))}</strong>
                </div>
                <div className={styles.row}>
                  <span>Liquidaciones recibidas</span>
                  <strong>{fmt(toNumber(cobranza?.liquidaciones))}</strong>
                </div>
                <div className={`${styles.row} ${styles.totalRow}`}>
                  <span>Total cobrado de creditos</span>
                  <strong>{fmt(toNumber(cobranza?.total))}</strong>
                </div>
              </div>

              <div className={styles.infoNote}>
                Este importe ya esta incluido en los metodos de cobro. No se suma dos
                veces al efectivo esperado.
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Financiamiento</p>
                  <h2 className={styles.panelTitle}>Credito otorgado en el turno</h2>
                </div>
                <div className={styles.iconBox}>
                  <CreditCard size={16} />
                </div>
              </div>

              <div className={styles.financeGrid}>
                <article className={styles.financeCard}>
                  <span>Ventas a credito</span>
                  <strong>{toNumber(financiamiento?.ventas_credito)}</strong>
                </article>
                <article className={styles.financeCard}>
                  <span>Total de esas ventas</span>
                  <strong>{fmt(toNumber(financiamiento?.monto_ventas_credito))}</strong>
                </article>
                <article className={styles.financeCard}>
                  <span>Enganches pactados</span>
                  <strong>{fmt(toNumber(financiamiento?.enganches_pactados))}</strong>
                </article>
                <article className={`${styles.financeCard} ${styles.financeHighlight}`}>
                  <span>Monto financiado</span>
                  <strong>{fmt(toNumber(financiamiento?.monto_financiado))}</strong>
                </article>
              </div>

              <div className={styles.infoNote}>
                El monto financiado es una cuenta por cobrar y no afecta el efectivo
                fisico ni el total cobrado del corte.
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Conteo fisico</p>
                  <h2 className={styles.panelTitle}>Lo que hay en caja</h2>
                </div>
                <div className={styles.iconBox}>
                  <Calculator size={16} />
                </div>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Total contado</span>
                  <div className={styles.inputShell}>
                    <span>$</span>
                    <input
                      type="number"
                      value={montoContado}
                      onChange={(event) => setMontoContado(event.target.value)}
                      readOnly={isClosed || !canCloseCorte}
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
                    onChange={(event) => setObservaciones(event.target.value)}
                    readOnly={isClosed || !canCloseCorte}
                    rows={3}
                    placeholder="Ingresa cualquier nota o justificacion..."
                  />
                </label>
              </div>
            </section>
          </div>

          <div className={styles.col}>
            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Resultado</p>
                  <h2 className={styles.panelTitle}>Diferencia del corte</h2>
                </div>
                <div className={`${styles.resultIcon} ${styles[`tone_${tone}`]}`}>
                  {tone === "success" ? (
                    <CheckCircle2 size={16} />
                  ) : tone === "pending" ? (
                    <Calculator size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
              </div>

              <div className={`${styles.diffCard} ${styles[`diff_${tone}`]}`}>
                <span>{toneLabel}</span>
                <strong>{diferencia === null ? "—" : fmt(diferencia)}</strong>
              </div>

              <div className={styles.rows}>
                <div className={styles.row}>
                  <span>Esperado en efectivo</span>
                  <strong>{fmt(totalEsperadoVista)}</strong>
                </div>
                <div className={styles.row}>
                  <span>Real contado</span>
                  <strong>{totalRealNumber === null ? "—" : fmt(totalRealNumber)}</strong>
                </div>
                <div className={styles.row}>
                  <span>Diferencia</span>
                  <strong>{diferencia === null ? "—" : fmt(diferencia)}</strong>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>Accion final</p>
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
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => window.print()}
                  >
                    <Printer size={15} /> Imprimir corte
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.infoNote}>
                    El cierre compara solamente el efectivo esperado contra el
                    efectivo contado. Captura el conteo para calcular la diferencia.
                  </div>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={procesando || !conteoCapturado || !canCloseCorte}
                    onClick={handleCerrarCorte}
                  >
                    {procesando ? "Cerrando..." : "Cerrar corte"}
                  </button>
                </>
              )}
            </section>
          </div>
        </div>
      )}

      <div className={styles.printSheet}>
        <div className={styles.printHeader}>
          <h1>Moda Sarita</h1>
          <p>Corte de caja</p>
        </div>

        <div className={styles.printSection}>
          <div className={styles.printRow}>
            <span>Cajero</span>
            <strong>{corteActual?.usuario_nombre ?? "Cajero"}</strong>
          </div>
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
            <span>Entradas en efectivo</span>
            <strong>{fmt(totalEfectivo)}</strong>
          </div>
          {metodosCorte.map((metodo) => (
            <div key={metodo.codigo} className={styles.printRow}>
              <span>{metodo.nombre}</span>
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
            <span>Enganches de credito</span>
            <strong>{fmt(toNumber(cobranza?.enganches))}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Abonos de credito</span>
            <strong>{fmt(toNumber(cobranza?.abonos))}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Liquidaciones de credito</span>
            <strong>{fmt(toNumber(cobranza?.liquidaciones))}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Monto financiado</span>
            <strong>{fmt(toNumber(financiamiento?.monto_financiado))}</strong>
          </div>
        </div>

        <div className={styles.printSection}>
          <div className={styles.printRow}>
            <span>Efectivo esperado</span>
            <strong>{fmt(totalEsperadoVista)}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Total contado</span>
            <strong>{totalRealNumber === null ? "—" : fmt(totalRealNumber)}</strong>
          </div>
          <div className={styles.printRow}>
            <span>Diferencia</span>
            <strong>{diferencia === null ? "—" : fmt(diferencia)}</strong>
          </div>
        </div>

        <div className={styles.printSection}>
          <span className={styles.printObservacionesLabel}>Observaciones</span>
          <p className={styles.printObservacionesText}>
            {observaciones.trim() || "Sin observaciones"}
          </p>
        </div>
      </div>
    </div>
  );
}
