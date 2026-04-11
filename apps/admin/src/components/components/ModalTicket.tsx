import React from "react";
import { CheckCircle, Printer, RefreshCw, X } from "lucide-react";
import styles from "../../../styles/ModalTicket.module.css";

interface TicketItem {
  nombre: string;
  variante?: string;
  cantidad: number;
  precio: number;
}

type TipoVenta = "venta" | "apartado";

interface ModalTicketProps {
  tipo: TipoVenta;
  folio: string;
  items: TicketItem[];
  subtotal: number;
  iva: number;
  total: number;
  anticipo?: number;
  metodoPago?: string;
  clienteNombre?: string;
  onNuevaVenta: () => void;
  onImprimir?: () => void;
  onCerrar: () => void;
}

export const ModalTicket: React.FC<ModalTicketProps> = ({
  tipo,
  folio,
  items,
  subtotal,
  iva,
  total,
  anticipo,
  metodoPago,
  clienteNombre,
  onNuevaVenta,
  onImprimir,
  onCerrar,
}) => {
  const formatMoneda = (v: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);

  const hora = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fecha = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const esApartado = tipo === "apartado";

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Éxito */}
        <div className={styles.exito}>
          <div className={styles.exitoIcono}>
            <CheckCircle size={36} />
          </div>
          <h2 className={styles.exitoTitulo}>
            {esApartado ? "Apartado creado" : "¡Venta completada!"}
          </h2>
          <p className={styles.exitoSub}>
            {esApartado
              ? "El apartado fue registrado exitosamente"
              : "El pago fue procesado correctamente"}
          </p>
        </div>

        {/* Ticket */}
        <div className={styles.ticket}>
          {/* Header ticket */}
          <div className={styles.ticketHeader}>
            <div className={styles.ticketFolio}>
              <span className={styles.folioLabel}>Folio</span>
              <span className={styles.folioNum}># {folio}</span>
            </div>
            <div className={styles.ticketFecha}>
              <span>{fecha}</span>
              <span className={styles.ticketHora}>{hora}</span>
            </div>
          </div>

          {clienteNombre && (
            <div className={styles.ticketCliente}>
              Cliente: <strong>{clienteNombre}</strong>
            </div>
          )}

          {/* Divisor punteado */}
          <div className={styles.divPunteado} />

          {/* Items */}
          <div className={styles.ticketItems}>
            {items.map((item, i) => (
              <div key={i} className={styles.ticketItem}>
                <div className={styles.ticketItemNombre}>
                  <span>{item.nombre}</span>
                  {item.variante && (
                    <span className={styles.ticketVariante}>{item.variante}</span>
                  )}
                </div>
                <div className={styles.ticketItemRight}>
                  <span className={styles.ticketQty}>×{item.cantidad}</span>
                  <span className={styles.ticketPrecio}>
                    {formatMoneda(item.precio * item.cantidad)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.divPunteado} />

          {/* Totales */}
          <div className={styles.ticketTotales}>
            <div className={styles.ticketTotalRow}>
              <span>Subtotal</span>
              <span>{formatMoneda(subtotal)}</span>
            </div>
            <div className={styles.ticketTotalRow}>
              <span>IVA (16%)</span>
              <span>{formatMoneda(iva)}</span>
            </div>
            <div className={styles.ticketTotalFinal}>
              <span>Total</span>
              <span>{formatMoneda(total)}</span>
            </div>

            {esApartado && anticipo !== undefined && (
              <>
                <div className={`${styles.ticketTotalRow} ${styles.anticipoRow}`}>
                  <span>Anticipo recibido</span>
                  <span className={styles.anticipoValor}>{formatMoneda(anticipo)}</span>
                </div>
                <div className={styles.ticketTotalRow}>
                  <span>Resta al recoger</span>
                  <span>{formatMoneda(total - anticipo)}</span>
                </div>
              </>
            )}

            {!esApartado && metodoPago && (
              <div className={styles.metodoBadge}>
                Pago con {metodoPago}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.acciones}>
          {onImprimir && (
            <button className={styles.imprimirBtn} onClick={onImprimir} type="button">
              <Printer size={17} />
              Imprimir ticket
            </button>
          )}
          <button className={styles.nuevaVentaBtn} onClick={onNuevaVenta} type="button">
            <RefreshCw size={17} />
            Nueva venta
          </button>
        </div>

        <button className={styles.cerrarBtn} onClick={onCerrar} type="button">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ModalTicket;