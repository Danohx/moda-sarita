import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart2,
  ImageOff,
  Tags,
  X,
} from "lucide-react";
import styles from "../../../styles/InventoryAlertsModal.module.css";

export type InventoryAlertType =
  | "bajo_stock"
  | "sin_imagen"
  | "sin_categoria";

export interface BaseAlertItem {
  id: string;
  type: InventoryAlertType;
  title: string;
  message: string;
  href?: string;
}

export interface StockAlertItem extends BaseAlertItem {
  type: "bajo_stock";
  varianteId: string;
  nombre: string;
  stockDisponible: number;
  stockMinimo: number;
  estado: "bajo" | "agotado";
}

export interface GenericInventoryAlertItem extends BaseAlertItem {
  type: "sin_imagen" | "sin_categoria";
  productoId: string;
}

export type AlertItem = StockAlertItem | GenericInventoryAlertItem;

interface InventoryAlertsModalProps {
  alerts: AlertItem[];
  open: boolean;
  onClose: () => void;
  onRegisterMovement?: (alertItem: StockAlertItem) => void;
}

function isStockAlert(item: AlertItem): item is StockAlertItem {
  return item.type === "bajo_stock";
}

function getAlertIcon(type: InventoryAlertType) {
  if (type === "sin_imagen") return <ImageOff size={16} />;
  if (type === "sin_categoria") return <Tags size={16} />;
  return <AlertTriangle size={16} />;
}

function getAlertLabel(item: AlertItem) {
  if (item.type === "sin_imagen") return "Sin imagen";
  if (item.type === "sin_categoria") return "Sin categoría";

  return item.message === "agotado" ? "Agotado" : "Stock bajo";
}

function getAlertItemClass(item: AlertItem) {
  if (isStockAlert(item) && item.estado === "agotado") {
    return `${styles.alertItem} ${styles.alertItemOut}`;
  }

  if (isStockAlert(item)) {
    return `${styles.alertItem} ${styles.alertItemLow}`;
  }

  return `${styles.alertItem} ${styles.alertItemInfo}`;
}

function getStatusBarClass(item: AlertItem) {
  if (isStockAlert(item) && item.estado === "agotado") {
    return `${styles.statusBar} ${styles.statusBarOut}`;
  }

  if (isStockAlert(item)) {
    return `${styles.statusBar} ${styles.statusBarLow}`;
  }

  return `${styles.statusBar} ${styles.statusBarInfo}`;
}

function getBadgeClass(item: AlertItem) {
  if (isStockAlert(item) && item.estado === "agotado") {
    return styles.badgeOut;
  }

  if (isStockAlert(item)) {
    return styles.badgeLow;
  }

  return styles.badgeInfo;
}

const InventoryAlertsModal: React.FC<InventoryAlertsModalProps> = ({
  alerts,
  open,
  onClose,
  onRegisterMovement,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onCloseRef.current();
    },
    [],
  );

  const counts = useMemo(() => {
    const agotadas = alerts.filter(
      (a) => isStockAlert(a) && a.estado === "agotado",
    ).length;

    const bajoStock = alerts.filter(
      (a) => isStockAlert(a) && a.estado === "bajo",
    ).length;

    const sinImagen = alerts.filter((a) => a.type === "sin_imagen").length;

    const sinCategoria = alerts.filter(
      (a) => a.type === "sin_categoria",
    ).length;

    return {
      agotadas,
      bajoStock,
      sinImagen,
      sinCategoria,
    };
  }, [alerts]);

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
                {alerts.length === 1 ? " alerta activa" : " alertas activas"}

                {counts.agotadas > 0 && (
                  <span className={styles.subtitleBadgeOut}>
                    {counts.agotadas} agotada
                    {counts.agotadas > 1 ? "s" : ""}
                  </span>
                )}

                {counts.bajoStock > 0 && (
                  <span className={styles.subtitleBadgeLow}>
                    {counts.bajoStock} bajo stock
                  </span>
                )}

                {counts.sinImagen > 0 && (
                  <span className={styles.subtitleBadgeInfo}>
                    {counts.sinImagen} sin imagen
                  </span>
                )}

                {counts.sinCategoria > 0 && (
                  <span className={styles.subtitleBadgeInfo}>
                    {counts.sinCategoria} sin categoría
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
              <p>No hay alertas de inventario.</p>
            </div>
          ) : (
            <ul className={styles.list} role="list">
              {alerts.map((item) => (
                <li key={item.id} className={getAlertItemClass(item)}>
                  <div className={getStatusBarClass(item)} aria-hidden="true" />

                  <div className={styles.itemContent}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemNombre}>
                        <span className={styles.itemIcon}>
                          {getAlertIcon(item.type)}
                        </span>
                        {item.title}
                      </span>

                      <span className={getBadgeClass(item)}>
                        {getAlertLabel(item)}
                      </span>
                    </div>

                    <p className={styles.itemMessage}>{item.message}</p>

                    {isStockAlert(item) && (
                      <div className={styles.stockMeta}>
                        <span className={styles.stockItem}>
                          <span className={styles.stockLabel}>
                            Disponible
                          </span>
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
                    )}

                    <div className={styles.itemActions}>
                      {isStockAlert(item) && onRegisterMovement && (
                        <button
                          type="button"
                          className={styles.actionPrimary}
                          onClick={() => onRegisterMovement(item)}
                        >
                          <ArrowRightLeft size={14} />
                          Registrar movimiento
                        </button>
                      )}

                      {isStockAlert(item) ? (
                        <Link
                          to={`/inventory/variants/${item.varianteId}/movements`}
                          className={styles.actionSecondary}
                          onClick={onClose}
                        >
                          <BarChart2 size={14} />
                          Ver movimientos
                        </Link>
                      ) : item.href ? (
                        <Link
                          to={item.href}
                          className={styles.actionSecondary}
                          onClick={onClose}
                        >
                          <BarChart2 size={14} />
                          Revisar producto
                        </Link>
                      ) : null}
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