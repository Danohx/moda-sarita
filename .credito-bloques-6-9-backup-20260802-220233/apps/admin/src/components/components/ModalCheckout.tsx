import React from "react";
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag,
  ChevronRight,
  User,
} from "lucide-react";
import styles from "../../../styles/ModalCheckout.module.css";
import { type MetodoPagoConfig } from "@shared/api/configuracion.api";

interface ResumenItem {
  nombre: string;
  variante?: string;
  cantidad: number;
  precio: number;
}

interface ModalCheckoutProps {
  isOpen: boolean;
  items: ResumenItem[];
  subtotal: number;
  iva: number;
  total: number;
  clienteNombre?: string;
  procesando?: boolean;
  onPagar: () => void;
  onCerrar: () => void;
  metodosPago: MetodoPagoConfig[];
  metodoPago: string;
  onMetodoPagoChange: (codigo: string) => void;
  referenciaExterna: string;
  onReferenciaExternaChange: (value: string) => void;
  montoRecibido: number;
  onMontoRecibidoChange: (value: number) => void;
  cambio: number;
  requiereReferencia: boolean;
  permiteCambio: boolean;
  pagoEfectivoInsuficiente: boolean;
  esMetodoCredito: boolean;
  creditoSinCliente: boolean;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const fmt = (v: number) => CURRENCY_FORMATTER.format(Number(v || 0));

function getMetodoIcon(codigo: string) {
  const normalized = codigo.toUpperCase();

  if (normalized.includes("EFECTIVO")) {
    return <Banknote size={20} />;
  }

  if (
    normalized.includes("TARJETA") ||
    normalized.includes("CREDITO") ||
    normalized.includes("DEBITO")
  ) {
    return <CreditCard size={20} />;
  }

  if (
    normalized.includes("TRANSFERENCIA") ||
    normalized.includes("PAYPAL") ||
    normalized.includes("MERCADO")
  ) {
    return <Smartphone size={20} />;
  }

  return <CreditCard size={20} />;
}

export const ModalCheckout: React.FC<ModalCheckoutProps> = ({
  isOpen,
  items,
  subtotal,
  iva,
  total,
  clienteNombre,
  procesando = false,
  onPagar,
  onCerrar,
  metodosPago,
  metodoPago,
  onMetodoPagoChange,
  referenciaExterna,
  onReferenciaExternaChange,
  montoRecibido,
  onMontoRecibidoChange,
  cambio,
  requiereReferencia,
  permiteCambio,
  pagoEfectivoInsuficiente,
  esMetodoCredito,
  creditoSinCliente,
}) => {
  if (!isOpen) return null;

  const montosSugeridos = [
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 50) * 50 + 50,
    Math.ceil(total / 200) * 200,
  ].filter((v, i, arr) => v >= total && arr.indexOf(v) === i);

  const puedePagar =
    !procesando &&
    Boolean(metodoPago) &&
    metodosPago.length > 0 &&
    (!requiereReferencia || referenciaExterna.trim().length > 0) &&
    !pagoEfectivoInsuficiente;

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <ShoppingBag size={20} />
          </div>

          <div>
            <h2 className={styles.titulo}>Cobro</h2>

            {clienteNombre && (
              <p className={styles.subtitulo}>
                <User size={11} /> {clienteNombre}
              </p>
            )}
          </div>

          <button className={styles.cerrarBtn} onClick={onCerrar} type="button">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.resumenItems}>
            {items.map((item, i) => (
              <div key={`${item.nombre}-${i}`} className={styles.resumenRow}>
                <span className={styles.resumenNombre}>
                  {item.nombre}

                  {item.variante && (
                    <span className={styles.resumenVariante}>
                      {" "}
                      · {item.variante}
                    </span>
                  )}

                  <span className={styles.resumenCantidad}>
                    {" "}
                    ×{item.cantidad}
                  </span>
                </span>

                <span className={styles.resumenPrecio}>
                  {fmt(item.precio * item.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.totalesCard}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>IVA (16%)</span>
              <span>{fmt(iva)}</span>
            </div>

            <div className={styles.totalRowFinal}>
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          <div className={styles.metodos}>
            {metodosPago.length === 0 ? (
              <p className={styles.errorText}>
                No hay métodos de pago activos para punto de venta.
              </p>
            ) : (
              metodosPago.map((metodo) => (
                <button
                  key={metodo.codigo}
                  type="button"
                  className={`${styles.metodoBtn} ${
                    metodoPago === metodo.codigo ? styles.metodoActivo : ""
                  }`}
                  onClick={() => {
                    onMetodoPagoChange(metodo.codigo);
                    onReferenciaExternaChange("");
                    onMontoRecibidoChange(total);
                  }}
                >
                  <span className={styles.metodoIcono}>
                    {getMetodoIcon(metodo.codigo)}
                  </span>

                  <span className={styles.metodoLabel}>{metodo.nombre}</span>
                </button>
              ))
            )}
          </div>

          {requiereReferencia && (
            <div className={styles.efectivoSection}>
              <label className={styles.fieldLabel}>Referencia</label>

              <div className={styles.inputWrap}>
                <input
                  type="text"
                  className={styles.montoInput}
                  placeholder="Folio, autorización o referencia"
                  value={referenciaExterna}
                  onChange={(e) => onReferenciaExternaChange(e.target.value)}
                  autoFocus
                />
              </div>

              {!referenciaExterna.trim() && (
                <p className={styles.errorText}>
                  Este método de pago requiere referencia.
                </p>
              )}
            </div>
          )}

          {permiteCambio && (
            <div className={styles.efectivoSection}>
              <label className={styles.fieldLabel}>Monto recibido</label>

              <div className={styles.inputWrap}>
                <span className={styles.inputPrefix}>$</span>

                <input
                  type="number"
                  className={styles.montoInput}
                  placeholder="0.00"
                  value={montoRecibido || ""}
                  onChange={(e) =>
                    onMontoRecibidoChange(Number(e.target.value || 0))
                  }
                  min={0}
                  step="0.01"
                  autoFocus={!requiereReferencia}
                />
              </div>

              {montosSugeridos.length > 0 && (
                <div className={styles.sugeridos}>
                  {montosSugeridos.map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      className={styles.sugeridoBtn}
                      onClick={() => onMontoRecibidoChange(monto)}
                    >
                      {fmt(monto)}
                    </button>
                  ))}
                </div>
              )}

              {pagoEfectivoInsuficiente && (
                <p className={styles.errorText}>
                  El monto recibido no puede ser menor al total.
                </p>
              )}

              {!pagoEfectivoInsuficiente && montoRecibido > 0 && (
                <div className={styles.cambioRow}>
                  <span>Cambio</span>
                  <span className={styles.cambioValor}>{fmt(cambio)}</span>
                </div>
              )}
            </div>
          )}
          {esMetodoCredito && (
            <div className={styles.efectivoSection}>
              <label className={styles.fieldLabel}>Crédito de tienda</label>

              {clienteNombre ? (
                <p className={styles.creditInfo}>
                  Se cargará al crédito de: <strong>{clienteNombre}</strong>
                </p>
              ) : (
                <p className={styles.errorText}>
                  Selecciona un cliente para usar crédito de tienda.
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.pagarBtn}
            onClick={onPagar}
            disabled={!puedePagar || creditoSinCliente}
            type="button"
          >
            {procesando ? "Procesando..." : `Confirmar pago · ${fmt(total)}`}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCheckout;
