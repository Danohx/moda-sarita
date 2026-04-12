import React, { useState } from "react";
import {
  X, CreditCard, Banknote, Smartphone, ShoppingBag, ChevronRight, User,
} from "lucide-react";
import styles from "../../../styles/ModalCheckout.module.css";

type MetodoPago = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "PAYPAL" | "MERCADO_PAGO" | "CREDITO_TIENDA";

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
  onPagar: (metodo: MetodoPago, montoPagado?: number) => void;
  onCerrar: () => void;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const fmt = (v: number) => CURRENCY_FORMATTER.format(v);

export const ModalCheckout: React.FC<ModalCheckoutProps> = ({
  isOpen,
  items,
  subtotal,
  iva,
  total,
  clienteNombre,
  onPagar,
  onCerrar,
}) => {
  const [metodo, setMetodo] = useState<MetodoPago>("EFECTIVO");
  const [montoEfectivo, setMontoEfectivo] = useState("");

  // Resetear estado interno cuando se cierra
  React.useEffect(() => {
    if (!isOpen) {
      setMetodo("EFECTIVO");
      setMontoEfectivo("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cambio =
    metodo === "EFECTIVO" && montoEfectivo
      ? Math.max(0, parseFloat(montoEfectivo) - total)
      : 0;

  const puedePagar =
    metodo !== "EFECTIVO" ||
    (montoEfectivo !== "" && parseFloat(montoEfectivo) >= total);

  const metodos: { id: MetodoPago; label: string; icon: React.ReactNode }[] = [
    { id: "EFECTIVO",      label: "Efectivo",     icon: <Banknote size={20} /> },
    { id: "TARJETA",       label: "Tarjeta",       icon: <CreditCard size={20} /> },
    { id: "TRANSFERENCIA", label: "Transferencia", icon: <Smartphone size={20} /> },
  ];

  const montosSugeridos = [
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 50) * 50 + 50,
    Math.ceil(total / 200) * 200,
  ].filter((v, i, arr) => v >= total && arr.indexOf(v) === i);

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}><ShoppingBag size={20} /></div>
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
              <div key={i} className={styles.resumenRow}>
                <span className={styles.resumenNombre}>
                  {item.nombre}
                  {item.variante && <span className={styles.resumenVariante}> · {item.variante}</span>}
                  <span className={styles.resumenCantidad}> ×{item.cantidad}</span>
                </span>
                <span className={styles.resumenPrecio}>{fmt(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className={styles.totalesCard}>
            <div className={styles.totalRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className={styles.totalRow}><span>IVA (16%)</span><span>{fmt(iva)}</span></div>
            <div className={styles.totalRowFinal}><span>Total</span><span>{fmt(total)}</span></div>
          </div>

          <div className={styles.metodos}>
            {metodos.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`${styles.metodoBtn} ${metodo === m.id ? styles.metodoActivo : ""}`}
                onClick={() => setMetodo(m.id)}
              >
                <span className={styles.metodoIcono}>{m.icon}</span>
                <span className={styles.metodoLabel}>{m.label}</span>
              </button>
            ))}
          </div>

          {metodo === "EFECTIVO" && (
            <div className={styles.efectivoSection}>
              <label className={styles.fieldLabel}>Monto recibido</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  className={styles.montoInput}
                  placeholder="0.00"
                  value={montoEfectivo}
                  onChange={(e) => setMontoEfectivo(e.target.value)}
                  autoFocus
                  min={total}
                  step="0.01"
                />
              </div>

              {montosSugeridos.length > 0 && (
                <div className={styles.sugeridos}>
                  {montosSugeridos.map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      className={styles.sugeridoBtn}
                      onClick={() => setMontoEfectivo(String(monto))}
                    >
                      {fmt(monto)}
                    </button>
                  ))}
                </div>
              )}

              {montoEfectivo && parseFloat(montoEfectivo) >= total && (
                <div className={styles.cambioRow}>
                  <span>Cambio</span>
                  <span className={styles.cambioValor}>{fmt(cambio)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.pagarBtn}
            onClick={() => onPagar(metodo, montoEfectivo ? parseFloat(montoEfectivo) : undefined)}
            disabled={!puedePagar}
            type="button"
          >
            Confirmar pago · {fmt(total)}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCheckout;