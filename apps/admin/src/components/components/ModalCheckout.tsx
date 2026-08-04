import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag,
  ChevronRight,
  User,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import styles from "../../../styles/ModalCheckout.module.css";
import { type MetodoPagoConfig } from "@shared/api/configuracion.api";
import { creditoService } from "@admin/services/credito.service";
import type {
  FrecuenciaPagoCredito,
  SimulacionCredito,
} from "@admin/types/credito.types";
import type { ClientePOS } from "./ModalClientes";

interface ResumenItem {
  nombre: string;
  variante?: string;
  cantidad: number;
  precio: number;
}

export type CreditCheckoutConfig = {
  enganche: number;
  metodo_enganche: string | null;
  referencia_enganche: string | null;
  plazo_meses: number;
  frecuencia_pago: FrecuenciaPagoCredito;
  fecha_primer_vencimiento: string;
  simulacion: SimulacionCredito;
};

interface ModalCheckoutProps {
  isOpen: boolean;
  items: ResumenItem[];
  subtotal: number;
  iva: number;
  total: number;
  cliente?: ClientePOS | null;
  procesando?: boolean;
  onPagar: (credito?: CreditCheckoutConfig) => void;
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
  canAuthorizeCredit: boolean;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});
const fmt = (v: number) => CURRENCY_FORMATTER.format(Number(v || 0));

function tomorrowPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getMetodoIcon(codigo: string) {
  const normalized = codigo.toUpperCase();
  if (normalized.includes("EFECTIVO")) return <Banknote size={20} />;
  if (normalized.includes("TARJETA") || normalized.includes("CREDITO") || normalized.includes("DEBITO")) return <CreditCard size={20} />;
  if (normalized.includes("TRANSFERENCIA") || normalized.includes("PAYPAL") || normalized.includes("MERCADO")) return <Smartphone size={20} />;
  return <CreditCard size={20} />;
}


export const ModalCheckout: React.FC<ModalCheckoutProps> = ({
  isOpen,
  items,
  subtotal,
  iva,
  total,
  cliente,
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
  canAuthorizeCredit,
}) => {
  const [enganche, setEnganche] = useState("");
  const [metodoEnganche, setMetodoEnganche] = useState("EFECTIVO");
  const [referenciaEnganche, setReferenciaEnganche] = useState("");
  const [plazo, setPlazo] = useState(1);
  const [frecuencia, setFrecuencia] = useState<FrecuenciaPagoCredito>("MENSUAL");
  const [primerVencimiento, setPrimerVencimiento] = useState(tomorrowPlus(15));
  const [simulacion, setSimulacion] = useState<SimulacionCredito | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [errorCredito, setErrorCredito] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEnganche("");
    setMetodoEnganche("EFECTIVO");
    setReferenciaEnganche("");
    setPlazo(1);
    setFrecuencia("MENSUAL");
    setPrimerVencimiento(tomorrowPlus(15));
    setSimulacion(null);
    setErrorCredito(null);
  }, [isOpen, cliente?.id, total]);

  useEffect(() => {
    setSimulacion(null);
    setErrorCredito(null);
  }, [enganche, frecuencia, plazo, primerVencimiento, metodoPago]);

  useEffect(() => {
    if (metodosPago.some((item) => item.codigo === metodoEnganche && item.es_credito !== true)) {
      return;
    }
    const firstMoneyMethod = metodosPago.find((item) => item.es_credito !== true);
    setMetodoEnganche(firstMoneyMethod?.codigo ?? "EFECTIVO");
  }, [metodoEnganche, metodosPago]);

  const clienteNombre = cliente
    ? `${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno || ""}`.trim()
    : undefined;

  const metodosEnganche = useMemo(
    () => metodosPago.filter((item) => item.es_credito !== true),
    [metodosPago],
  );

  const metodoEngancheConfig = useMemo(
    () =>
      metodosEnganche.find((item) => item.codigo === metodoEnganche) ??
      metodosEnganche[0] ??
      null,
    [metodoEnganche, metodosEnganche],
  );

  const engancheNumero = Number(enganche || 0);
  const necesitaMetodoEnganche = engancheNumero > 0;
  const referenciaEngancheValida =
    !necesitaMetodoEnganche ||
    !metodoEngancheConfig?.requiere_referencia ||
    referenciaEnganche.trim().length > 0;

  const montosSugeridos = [
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 50) * 50 + 50,
    Math.ceil(total / 200) * 200,
  ].filter((v, i, arr) => v >= total && arr.indexOf(v) === i);

  async function simularCredito() {
    if (!cliente?.id) {
      setErrorCredito("Selecciona un cliente para simular el crédito.");
      return;
    }
    if (!canAuthorizeCredit) {
      setErrorCredito("Tu usuario no tiene permiso para autorizar créditos.");
      return;
    }
    try {
      setSimulando(true);
      setErrorCredito(null);
      const result = await creditoService.simular({
        cliente_id: String(cliente.id),
        total_compra: total,
        enganche: engancheNumero,
        plazo_meses: plazo,
        frecuencia_pago: frecuencia,
        fecha_primer_vencimiento: primerVencimiento,
      });
      setSimulacion(result);
      if (!result.elegibilidad.apto) {
        setErrorCredito(
          `Cliente no elegible: ${result.validaciones_incumplidas.join(", ")}`,
        );
      }
    } catch (error) {
      setSimulacion(null);
      setErrorCredito(error instanceof Error ? error.message : "No se pudo simular el crédito.");
    } finally {
      setSimulando(false);
    }
  }

  if (!isOpen) return null;

  const creditReady =
    !esMetodoCredito ||
    Boolean(
      canAuthorizeCredit &&
        cliente?.id &&
        simulacion?.elegibilidad.apto &&
        (!necesitaMetodoEnganche || metodoEngancheConfig) &&
        referenciaEngancheValida,
    );

  const puedePagar =
    !procesando &&
    Boolean(metodoPago) &&
    metodosPago.length > 0 &&
    (!requiereReferencia || esMetodoCredito || referenciaExterna.trim().length > 0) &&
    !pagoEfectivoInsuficiente &&
    creditReady;

  function confirmar() {
    if (esMetodoCredito) {
      if (!simulacion || !simulacion.elegibilidad.apto) return;
      onPagar({
        enganche: engancheNumero,
        metodo_enganche: necesitaMetodoEnganche ? metodoEnganche : null,
        referencia_enganche:
          necesitaMetodoEnganche && referenciaEnganche.trim()
            ? referenciaEnganche.trim()
            : null,
        plazo_meses: plazo,
        frecuencia_pago: frecuencia,
        fecha_primer_vencimiento: primerVencimiento,
        simulacion,
      });
      return;
    }
    onPagar();
  }

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}><ShoppingBag size={20} /></div>
          <div><h2 className={styles.titulo}>Cobro</h2>{clienteNombre && <p className={styles.subtitulo}><User size={11} /> {clienteNombre}</p>}</div>
          <button className={styles.cerrarBtn} onClick={onCerrar} type="button"><X size={20} /></button>
        </div>

        <div className={styles.body}>
          <div className={styles.resumenItems}>
            {items.map((item, i) => <div key={`${item.nombre}-${i}`} className={styles.resumenRow}><span className={styles.resumenNombre}>{item.nombre}{item.variante && <span className={styles.resumenVariante}> · {item.variante}</span>}<span className={styles.resumenCantidad}> ×{item.cantidad}</span></span><span className={styles.resumenPrecio}>{fmt(item.precio * item.cantidad)}</span></div>)}
          </div>

          <div className={styles.totalesCard}>
            <div className={styles.totalRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className={styles.totalRow}><span>IVA incluido</span><span>{fmt(iva)}</span></div>
            <div className={styles.totalRowFinal}><span>Total</span><span>{fmt(total)}</span></div>
          </div>

          <div className={styles.metodos}>
            {metodosPago.length === 0 ? <p className={styles.errorText}>No hay métodos de pago activos para punto de venta.</p> : metodosPago.map((metodo) => <button key={metodo.codigo} type="button" className={`${styles.metodoBtn} ${metodoPago === metodo.codigo ? styles.metodoActivo : ""}`} onClick={() => { onMetodoPagoChange(metodo.codigo); onReferenciaExternaChange(""); onMontoRecibidoChange(total); }}><span className={styles.metodoIcono}>{getMetodoIcon(metodo.codigo)}</span><span className={styles.metodoLabel}>{metodo.nombre}</span></button>)}
          </div>

          {requiereReferencia && !esMetodoCredito ? <div className={styles.efectivoSection}><label className={styles.fieldLabel}>Referencia</label><div className={styles.inputWrap}><input type="text" className={styles.montoInput} placeholder="Folio, autorización o referencia" value={referenciaExterna} onChange={(e) => onReferenciaExternaChange(e.target.value)} /></div>{!referenciaExterna.trim() && <p className={styles.errorText}>Este método requiere referencia.</p>}</div> : null}

          {permiteCambio && !esMetodoCredito ? <div className={styles.efectivoSection}><label className={styles.fieldLabel}>Monto recibido</label><div className={styles.inputWrap}><span className={styles.inputPrefix}>$</span><input type="number" className={styles.montoInput} value={montoRecibido || ""} onChange={(e) => onMontoRecibidoChange(Number(e.target.value || 0))} min={0} step="0.01" /></div><div className={styles.sugeridos}>{montosSugeridos.map((monto) => <button key={monto} type="button" className={styles.sugeridoBtn} onClick={() => onMontoRecibidoChange(monto)}>{fmt(monto)}</button>)}</div>{pagoEfectivoInsuficiente ? <p className={styles.errorText}>El monto recibido no puede ser menor al total.</p> : montoRecibido > 0 ? <div className={styles.cambioRow}><span>Cambio</span><span className={styles.cambioValor}>{fmt(cambio)}</span></div> : null}</div> : null}

          {esMetodoCredito ? (
            <section className={styles.creditPlanSection}>
              <div className={styles.creditPlanHeader}><div><h3>Plan de crédito</h3><p>La API validará límite, mora y reglas configuradas.</p></div><CalendarDays size={22} /></div>
              {!cliente ? <p className={styles.errorText}>Selecciona un cliente para usar crédito de tienda.</p> : !canAuthorizeCredit ? <p className={styles.errorText}>No tienes permiso credito.create para autorizar esta venta.</p> : (
                <>
                  <div className={styles.creditFieldsGrid}>
                    <label><span>Enganche</span><input type="number" value={enganche} onChange={(e) => setEnganche(e.target.value)} min={0} max={total - 0.01} step="0.01" /></label>
                    <label><span>Plazo</span><select value={plazo} onChange={(e) => setPlazo(Number(e.target.value))}><option value={1}>1 mes</option><option value={2}>2 meses</option><option value={3}>3 meses</option></select></label>
                    <label><span>Frecuencia</span><select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value as FrecuenciaPagoCredito)}><option value="SEMANAL">Semanal</option><option value="QUINCENAL">Quincenal</option><option value="MENSUAL">Mensual</option></select></label>
                    <label><span>Primer vencimiento</span><input type="date" value={primerVencimiento} onChange={(e) => setPrimerVencimiento(e.target.value)} /></label>
                  </div>
                  {necesitaMetodoEnganche ? <div className={styles.creditFieldsGrid}><label><span>Método del enganche</span><select value={metodoEnganche} onChange={(e) => { setMetodoEnganche(e.target.value); setReferenciaEnganche(""); }}>{metodosEnganche.map((item) => <option key={item.codigo} value={item.codigo}>{item.nombre}</option>)}</select></label>{metodoEngancheConfig?.requiere_referencia ? <label><span>Referencia del enganche</span><input value={referenciaEnganche} onChange={(e) => setReferenciaEnganche(e.target.value)} /></label> : null}</div> : null}
                  {necesitaMetodoEnganche && !metodoEngancheConfig ? (
                    <div className={styles.creditError}>
                      <AlertTriangle size={16} />
                      <span>No existe un método de pago real activo para registrar el enganche.</span>
                    </div>
                  ) : null}
                  <button type="button" className={styles.simulateButton} onClick={() => void simularCredito()} disabled={
                        simulando ||
                        !referenciaEngancheValida ||
                        (necesitaMetodoEnganche && !metodoEngancheConfig)
                      }>{simulando ? "Simulando..." : "Simular calendario"}</button>
                  {errorCredito ? <div className={styles.creditError}><AlertTriangle size={16} /><span>{errorCredito}</span></div> : null}
                  {simulacion ? <div className={styles.creditSimulation}><div className={styles.creditSimulationSummary}><span>Financiado <strong>{fmt(simulacion.monto_financiado)}</strong></span><span>Cuotas <strong>{simulacion.numero_cuotas}</strong></span><span>Último vencimiento <strong>{simulacion.fecha_vencimiento_final}</strong></span></div>{simulacion.elegibilidad.apto ? <div className={styles.creditEligible}><CheckCircle2 size={16} /> Cliente elegible</div> : null}<div className={styles.creditSchedule}><table><thead><tr><th>#</th><th>Fecha</th><th>Monto</th></tr></thead><tbody>{simulacion.calendario.map((cuota) => <tr key={cuota.numero_cuota}><td>{cuota.numero_cuota}</td><td>{cuota.fecha_vencimiento}</td><td>{fmt(cuota.monto_programado)}</td></tr>)}</tbody></table></div></div> : null}
                </>
              )}
            </section>
          ) : null}
        </div>

        <div className={styles.footer}>
          <button className={styles.pagarBtn} onClick={confirmar} disabled={!puedePagar || creditoSinCliente} type="button">
            {procesando ? "Procesando..." : esMetodoCredito ? `Crear venta a crédito · ${fmt(total)}` : `Confirmar pago · ${fmt(total)}`}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCheckout;
