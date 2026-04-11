import React, { useState } from "react";
import { X, Receipt, Calendar, DollarSign, AlertCircle, ChevronRight } from "lucide-react";
import styles from "../../../styles/ModalApartado.module.css";

interface ResumenItem {
  nombre: string;
  variante?: string;
  cantidad: number;
  precio: number;
}

interface ModalApartadoProps {
  items: ResumenItem[];
  total: number;
  clienteNombre?: string;
  onApartar: (anticipo: number, diasVigencia: number, notas: string) => void;
  onCerrar: () => void;
}

const DIAS_OPCIONES = [3, 7, 14, 30];
const PORCENTAJES_ANTICIPO = [10, 20, 30, 50];

export const ModalApartado: React.FC<ModalApartadoProps> = ({
  items,
  total,
  clienteNombre,
  onApartar,
  onCerrar,
}) => {
  const [diasVigencia, setDiasVigencia] = useState(7);
  const [porcentaje, setPorcentaje] = useState(20);
  const [anticipoPersonalizado, setAnticipoPersonalizado] = useState("");
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [notas, setNotas] = useState("");

  const formatMoneda = (v: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);

  const anticipo = modoPersonalizado
    ? parseFloat(anticipoPersonalizado) || 0
    : total * (porcentaje / 100);

  const restante = Math.max(0, total - anticipo);

  const fechaVencimiento = new Date();
  fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVigencia);
  const fechaStr = fechaVencimiento.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const puedeApartar = anticipo > 0 && anticipo <= total;

  const handleApartar = () => {
    if (!puedeApartar) return;
    onApartar(anticipo, diasVigencia, notas);
    onCerrar();
  };

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Receipt size={20} />
          </div>
          <div>
            <h2 className={styles.titulo}>Crear apartado</h2>
            <p className={styles.subtitulo}>
              {clienteNombre ?? "Venta general"} · {items.length} producto{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button className={styles.cerrarBtn} onClick={onCerrar} type="button">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Total */}
          <div className={styles.totalBanner}>
            <span className={styles.totalLabel}>Total del apartado</span>
            <span className={styles.totalValor}>{formatMoneda(total)}</span>
          </div>

          {/* Anticipo */}
          <div className={styles.seccion}>
            <span className={styles.seccionLabel}>Anticipo</span>
            <div className={styles.porcentajesGrid}>
              {PORCENTAJES_ANTICIPO.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.porcentajeBtn} ${
                    !modoPersonalizado && porcentaje === p ? styles.porcentajeActivo : ""
                  }`}
                  onClick={() => {
                    setPorcentaje(p);
                    setModoPersonalizado(false);
                  }}
                >
                  <span className={styles.porcentajeNum}>{p}%</span>
                  <span className={styles.porcentajeMonto}>{formatMoneda(total * p / 100)}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`${styles.personalBtn} ${modoPersonalizado ? styles.personalActivo : ""}`}
              onClick={() => setModoPersonalizado(true)}
            >
              <DollarSign size={14} />
              Monto personalizado
            </button>

            {modoPersonalizado && (
              <div className={styles.inputWrap}>
                <span className={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  className={styles.montoInput}
                  placeholder="0.00"
                  value={anticipoPersonalizado}
                  onChange={(e) => setAnticipoPersonalizado(e.target.value)}
                  autoFocus
                  min={1}
                  max={total}
                  step="0.01"
                />
              </div>
            )}
          </div>

          {/* Resumen anticipo + restante */}
          <div className={styles.resumenPago}>
            <div className={styles.resumenPagoRow}>
              <span>Paga hoy</span>
              <span className={styles.resumenPagoValor}>{formatMoneda(anticipo)}</span>
            </div>
            <div className={styles.resumenPagoRow}>
              <span>Resta al recoger</span>
              <span>{formatMoneda(restante)}</span>
            </div>
          </div>

          {/* Vigencia */}
          <div className={styles.seccion}>
            <span className={styles.seccionLabel}>Vigencia</span>
            <div className={styles.diasGrid}>
              {DIAS_OPCIONES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`${styles.diaBtn} ${diasVigencia === d ? styles.diaActivo : ""}`}
                  onClick={() => setDiasVigencia(d)}
                >
                  {d} días
                </button>
              ))}
            </div>
            <div className={styles.fechaInfo}>
              <Calendar size={13} />
              <span>Vence el {fechaStr}</span>
            </div>
          </div>

          {/* Notas */}
          <div className={styles.seccion}>
            <span className={styles.seccionLabel}>Notas (opcional)</span>
            <textarea
              className={styles.notasInput}
              placeholder="Ej: Cliente pagará viernes, separar en bodega..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
            />
          </div>

          {/* Warning si anticipo inválido */}
          {modoPersonalizado && anticipoPersonalizado && !puedeApartar && (
            <div className={styles.warningBanner}>
              <AlertCircle size={15} />
              El anticipo no puede superar el total
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.apartarBtn}
            onClick={handleApartar}
            disabled={!puedeApartar}
            type="button"
          >
            Confirmar apartado · {formatMoneda(anticipo)}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalApartado;