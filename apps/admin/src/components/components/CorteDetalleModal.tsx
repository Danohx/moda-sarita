import { useEffect } from "react";
import {
  X,
  Wallet,
  Clock3,
  Printer,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "../../../styles/CorteDetalleModal.module.css";

export interface CorteDetalle {
  id: string | number;
  usuario_id: string | number;
  usuario_nombre: string;
  inicio_turno: string;
  fin_turno: string | null;
  total_sistema: number;
  total_real: number | null;
  observaciones: string | null;
}

interface Props {
  corte: CorteDetalle | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    v,
  );

const fmtFechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const fmtHora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function CorteDetalleModal({
  corte,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: Props) {
  useEffect(() => {
    if (!corte) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (e.key === "ArrowRight" && hasNext) onNext?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [corte, onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    if (corte) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [corte]);

  if (!corte) return null;

  const isClosed = !!corte.fin_turno;
  const totalSistema = corte.total_sistema;
  const totalReal = corte.total_real ?? 0;
  const diferencia = isClosed ? totalReal - totalSistema : 0;

  const tone = !isClosed
    ? "pending"
    : diferencia === 0
      ? "success"
      : diferencia < 0
        ? "danger"
        : "warning";

  const toneLabel =
    tone === "pending"
      ? "Turno abierto"
      : tone === "success"
        ? "Corte exacto"
        : tone === "danger"
          ? "Faltante"
          : "Sobrante";

  const horaApertura = fmtHora(corte.inicio_turno);
  const horaCierre = corte.fin_turno ? fmtHora(corte.fin_turno) : null;
  const fechaLabel = fmtFechaLarga(corte.inicio_turno);

  return (
    <>
      <div
        className={`${styles.overlay} ${corte ? styles.overlayVisible : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.panel} ${corte ? styles.panelVisible : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle del corte #${corte.id}`}
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalMeta}>
            <span className={styles.modalBadge}>
              <Wallet size={13} /> Corte #{corte.id}
            </span>
            <span className={styles.modalFecha}>{fechaLabel}</span>
          </div>

          <div className={styles.modalActions}>
            {/* Navegación prev / next */}
            <div className={styles.navGroup}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={onPrev}
                disabled={!hasPrev}
                title="Corte anterior (←)"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={onNext}
                disabled={!hasNext}
                title="Corte siguiente (→)"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <button
              type="button"
              className={styles.printBtn}
              title="Imprimir corte"
              onClick={() => window.print()}
            >
              <Printer size={14} />
              Imprimir
            </button>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              title="Cerrar (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={`${styles.resultBanner} ${styles[`banner_${tone}`]}`}>
            <div className={styles.bannerLeft}>
              <div className={`${styles.bannerIcon} ${styles[`icon_${tone}`]}`}>
                {tone === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
              </div>
              <div>
                <span className={styles.bannerLabel}>{toneLabel}</span>
                <strong className={styles.bannerAmount}>
                  {isClosed ? fmt(diferencia) : "Turno en curso"}
                </strong>
              </div>
            </div>
            <span
              className={`${styles.estadoChip} ${isClosed ? styles.chipClosed : styles.chipOpen}`}
            >
              {isClosed ? "Cerrado" : "Abierto"}
            </span>
          </div>

          <div className={styles.grid}>
            <div className={styles.col}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <p className={styles.eyebrow}>Turno</p>
                  <h3 className={styles.cardTitle}>Horario</h3>
                </div>
                <div className={styles.times}>
                  <div className={styles.timeBlock}>
                    <div className={styles.timeIconWrap}>
                      <Clock3 size={13} />
                    </div>
                    <div>
                      <span>Apertura</span>
                      <strong>{horaApertura}</strong>
                    </div>
                  </div>
                  <div className={styles.timeLine} />
                  <div className={styles.timeBlock}>
                    <div
                      className={`${styles.timeIconWrap} ${isClosed ? styles.timeIconClosed : styles.timeIconPending}`}
                    >
                      <Clock3 size={13} />
                    </div>
                    <div>
                      <span>{isClosed ? "Cierre" : "En curso"}</span>
                      <strong>{horaCierre ?? "---"}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <p className={styles.eyebrow}>Responsable</p>
                  <h3 className={styles.cardTitle}>Cajero en turno</h3>
                </div>
                <div className={styles.cajeroRow}>
                  <div className={styles.avatarLg}>
                    {corte.usuario_nombre
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <strong className={styles.cajeroName}>
                      {corte.usuario_nombre}
                    </strong>
                    <span className={styles.cajeroId}>
                      ID #{corte.usuario_id}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <p className={styles.eyebrow}>Sistema</p>
                  <h3 className={styles.cardTitle}>Esperado en caja</h3>
                </div>
                <div className={styles.bigNumber}>
                  <span>Total esperado</span>
                  <strong>
                    {isClosed ? fmt(totalSistema) : "Calculando al cerrar..."}
                  </strong>
                </div>
                <div className={styles.rows}>
                  <div className={styles.row}>
                    <span>Ventas del turno</span>
                    <strong>{isClosed ? fmt(totalSistema) : "---"}</strong>
                  </div>
                  <div className={styles.row}>
                    <span>Fondo de caja inicial</span>
                    <strong>{fmt(0)}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <p className={styles.eyebrow}>Conteo físico</p>
                  <h3 className={styles.cardTitle}>Lo que había en caja</h3>
                  <div className={styles.cardIcon}>
                    <Calculator size={14} />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Total contado</span>
                    <div className={styles.inputShell}>
                      <span>$</span>
                      <input
                        type="number"
                        value={isClosed ? totalReal : ""}
                        readOnly
                        placeholder={isClosed ? "" : "---"}
                      />
                    </div>
                  </label>

                  <label className={`${styles.field} ${styles.fieldFull}`}>
                    <span>Observaciones</span>
                    <textarea
                      value={corte.observaciones ?? ""}
                      readOnly
                      rows={3}
                      placeholder={
                        corte.observaciones
                          ? ""
                          : "Sin observaciones registradas."
                      }
                    />
                  </label>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <p className={styles.eyebrow}>Resultado</p>
                  <h3 className={styles.cardTitle}>Diferencia del corte</h3>
                  <div
                    className={`${styles.cardIcon} ${styles[`cardIcon_${tone}`]}`}
                  >
                    {tone === "success" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertTriangle size={14} />
                    )}
                  </div>
                </div>

                <div className={`${styles.diffCard} ${styles[`diff_${tone}`]}`}>
                  <span>{toneLabel}</span>
                  <strong>{isClosed ? fmt(diferencia) : "---"}</strong>
                </div>

                <div className={styles.rows}>
                  <div className={styles.row}>
                    <span>Esperado</span>
                    <strong>{isClosed ? fmt(totalSistema) : "---"}</strong>
                  </div>
                  <div className={styles.row}>
                    <span>Real contado</span>
                    <strong>{isClosed ? fmt(totalReal) : "---"}</strong>
                  </div>
                  <div className={`${styles.row} ${styles.rowHighlight}`}>
                    <span>Diferencia</span>
                    <strong className={styles[`diffText_${tone}`]}>
                      {isClosed ? fmt(diferencia) : "---"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <p className={styles.eyebrow}>Acción</p>
                  <h3 className={styles.cardTitle}>
                    {isClosed ? "Turno cerrado" : "Turno activo"}
                  </h3>
                  <div className={styles.cardIcon}>
                    <CircleDollarSign size={14} />
                  </div>
                </div>

                {isClosed ? (
                  <div className={`${styles.diffCard} ${styles.diff_success}`}>
                    <span>Cierre completado</span>
                    <strong>Guardado correctamente</strong>
                  </div>
                ) : (
                  <div className={`${styles.diffCard} ${styles.diff_pending}`}>
                    <span>En progreso</span>
                    <strong>Turno aún no cerrado</strong>
                  </div>
                )}

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.printBtnFull}
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Imprimir corte
                  </button>
                  <button
                    type="button"
                    className={styles.closeModalBtn}
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}