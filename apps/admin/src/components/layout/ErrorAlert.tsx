import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "../../../styles/ErrorAlert.module.css";

export type ErrorSeverity = "error" | "warning" | "info" | "success";

export interface ErrorAlertProps {
  open: boolean;
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  onClose: () => void;
  autoCloseDuration?: number;
}

const ICONS: Record<ErrorSeverity, React.ReactNode> = {
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="0.9" fill="currentColor" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M9.134 3.5a1 1 0 0 1 1.732 0l7.198 12.5A1 1 0 0 1 17.198 17.5H2.802a1 1 0 0 1-.866-1.5L9.134 3.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8.5v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.9" fill="currentColor" />
    </svg>
  ),
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const DEFAULT_TITLES: Record<ErrorSeverity, string> = {
  error: "Ocurrió un error",
  warning: "Advertencia",
  info: "Información",
  success: "Operación exitosa",
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  open,
  title,
  message,
  severity = "error",
  onClose,
  autoCloseDuration = 0,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !autoCloseDuration) return;

    if (progressRef.current) {
      progressRef.current.style.transition = "none";
      progressRef.current.style.width = "100%";
      // forzar reflow
      void progressRef.current.offsetWidth;
      progressRef.current.style.transition = `width ${autoCloseDuration}ms linear`;
      progressRef.current.style.width = "0%";
    }

    timerRef.current = setTimeout(onClose, autoCloseDuration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, autoCloseDuration, onClose]);

  if (!open) return null;

  const resolvedTitle = title ?? DEFAULT_TITLES[severity];

  return ReactDOM.createPortal(
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={resolvedTitle}>
      <div className={`${styles.card} ${styles[`card_${severity}`]}`}>
        {/* Barra de progreso (solo si auto-cierra) */}
        {autoCloseDuration > 0 && (
          <div className={`${styles.progressTrack} ${styles[`progressTrack_${severity}`]}`}>
            <div ref={progressRef} className={`${styles.progressBar} ${styles[`progressBar_${severity}`]}`} />
          </div>
        )}

        <div className={styles.inner}>
          {/* Icono */}
          <div className={`${styles.iconWrap} ${styles[`iconWrap_${severity}`]}`}>
            {ICONS[severity]}
          </div>

          {/* Contenido */}
          <div className={styles.content}>
            <p className={styles.title}>{resolvedTitle}</p>
            <p className={styles.message}>{message}</p>
          </div>

          {/* Cerrar */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ErrorAlert;