import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRightLeft, BarChart2, X } from "lucide-react";
import styles from "../../../styles/InventoryAlertsModal.module.css";

export interface AlertItem {
  id: string;
  nombre: string;
  stockDisponible: number;
  stockMinimo: number;
  estado: "bajo" | "agotado";
}

interface InventoryAlertsModalProps {
  alerts: AlertItem[];
  open: boolean;
  onClose: () => void;
  onRegisterMovement: (alertItem: AlertItem) => void;
}

const InventoryAlertsModal: React.FC<InventoryAlertsModalProps> = ({
  alerts,
  open,
  onClose,
  onRegisterMovement
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const agotados = alerts.filter((a) => a.estado === "agotado").length;
  const bajos = alerts.filter((a) => a.estado === "bajo").length;

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 id="modal-title" className={styles.title}>
                Alertas de inventario
              </h2>
              <p className={styles.subtitle}>
                <span className={styles.countChip}>{alerts.length}</span>
                {alerts.length === 1
                  ? " variante en alerta"
                  : " variantes en alerta"}
                {agotados > 0 && (
                  <span className={styles.subtitleBadgeOut}>
                    {agotados} agotada{agotados > 1 ? "s" : ""}
                  </span>
                )}
                {bajos > 0 && (
                  <span className={styles.subtitleBadgeLow}>
                    {bajos} baja{bajos > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.body}>
          {alerts.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertTriangle size={32} />
              <p>No hay variantes en alerta.</p>
            </div>
          ) : (
            <ul className={styles.list} role="list">
              {alerts.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.alertItem} ${
                    item.estado === "agotado"
                      ? styles.alertItemOut
                      : styles.alertItemLow
                  }`}
                >
                  <div
                    className={`${styles.statusBar} ${
                      item.estado === "agotado"
                        ? styles.statusBarOut
                        : styles.statusBarLow
                    }`}
                    aria-hidden="true"
                  />

                  <div className={styles.itemContent}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemNombre}>{item.nombre}</span>
                      <span
                        className={
                          item.estado === "agotado"
                            ? styles.badgeOut
                            : styles.badgeLow
                        }
                      >
                        {item.estado === "agotado" ? "Agotado" : "Stock bajo"}
                      </span>
                    </div>

                    <div className={styles.stockMeta}>
                      <span className={styles.stockItem}>
                        <span className={styles.stockLabel}>Disponible</span>
                        <strong
                          className={`${styles.stockVal} ${
                            item.stockDisponible === 0
                              ? styles.stockValDanger
                              : styles.stockValWarn
                          }`}
                        >
                          {item.stockDisponible}
                        </strong>
                      </span>
                      <span
                        className={styles.stockDivider}
                        aria-hidden="true"
                      />
                      <span className={styles.stockItem}>
                        <span className={styles.stockLabel}>Mínimo</span>
                        <strong className={styles.stockVal}>
                          {item.stockMinimo}
                        </strong>
                      </span>
                    </div>

                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={styles.actionPrimary}
                        onClick={() => onRegisterMovement(item)}
                      >
                        <ArrowRightLeft size={14} />
                        Registrar movimiento
                      </button>
                      <Link
                        to={`/inventory/variants/${item.id}/movements`}
                        className={styles.actionSecondary}
                        onClick={onClose}
                      >
                        <BarChart2 size={14} />
                        Ver movimientos
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.footerCloseBtn}
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default InventoryAlertsModal;
