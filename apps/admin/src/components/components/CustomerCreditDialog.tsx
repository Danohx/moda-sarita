import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  X,
  CreditCard,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  ShieldOff,
  Zap,
} from "lucide-react";
import styles from "../../../styles/AdminCustomers.module.css";
import type { Cliente } from "@admin/pages/admin/AdminCustomers";
import { clientesService } from "@admin/services/clientes.service";

// ── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  customer: Cliente | null;
  formatMoneda: (valor: number) => string;
  onClose: () => void;
  onSuccess: () => void;
};

// Lo que espera nuestro componente visual
interface MovimientoCredito {
  id: string;
  fecha: string;
  tipo: "compra" | "abono" | "ajuste";
  descripcion: string;
  monto: number;
  saldoResultante: number;
}

// Lo que responde la base de datos (para no usar "any")
interface MovimientoCreditoBD {
  id: string | number;
  fecha: string;
  tipo: string;
  descripcion: string;
  monto: string | number;
  saldoResultante: string | number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCreditStatus(percent: number, tieneCredito: boolean) {
  if (!tieneCredito) return { label: "Sin crédito", color: "neutral" as const };
  if (percent >= 100) return { label: "Al límite", color: "danger" as const };
  if (percent >= 80) return { label: "Riesgo alto", color: "warning" as const };
  if (percent >= 50) return { label: "En uso", color: "info" as const };
  return { label: "Crédito activo", color: "success" as const };
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Componente principal ─────────────────────────────────────────────────────

const CustomerCreditDialog: React.FC<Props> = ({
  open,
  customer,
  formatMoneda,
  onClose,
  onSuccess,
}) => {
  // ── Configuración de crédito
  const [saving, setSaving] = useState(false);
  const [creditoHabilitado, setCreditoHabilitado] = useState(false);
  const [limiteCredito, setLimiteCredito] = useState("");

  // ── Abono
  const [abonoMonto, setAbonoMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [procesandoAbono, setProcesandoAbono] = useState(false);

  // ── Historial
  const [movimientos, setMovimientos] = useState<MovimientoCredito[]>([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<"resumen" | "historial">(
    "resumen",
  );

  // ── Derivados ────────────────────────────────────────────────────────────────

  const limite = customer?.creditLimit ?? 0;
  const deuda = customer?.currentBalance ?? 0;
  const disponible = Math.max(limite - deuda, 0);
  const creditPercent = limite > 0 ? Math.min((deuda / limite) * 100, 100) : 0;
  const status = getCreditStatus(creditPercent, creditoHabilitado);

  // ── Reset al abrir y Carga de Historial ──────────────────────────────────────

  useEffect(() => {
    if (!open || !customer) return;
    
    setCreditoHabilitado(customer.creditLimit > 0);
    setLimiteCredito(String(customer.creditLimit || ""));
    setAbonoMonto("");
    setMetodoPago("EFECTIVO");
    setVistaActiva("resumen");

    const fetchMovimientos = async () => {
      try {
        setLoadingMov(true);
        const dataBD = await clientesService.getMovimientosCredito(customer.id);
        
        // Mapeo seguro de los datos de la BD a la interfaz visual
        const mappedData: MovimientoCredito[] = dataBD.map((mov: MovimientoCreditoBD) => {
          const tipoLower = String(mov.tipo).toLowerCase();
          const tipoFinal = (tipoLower === "abono" || tipoLower === "compra" || tipoLower === "ajuste") 
            ? (tipoLower as "compra" | "abono" | "ajuste") 
            : "ajuste";

          return {
            id: String(mov.id),
            fecha: mov.fecha,
            tipo: tipoFinal,
            descripcion: mov.descripcion,
            monto: Number(mov.monto),
            saldoResultante: Number(mov.saldoResultante),
          };
        });

        setMovimientos(mappedData);
      } catch (error) {
        console.error("Error al cargar historial de crédito:", error);
        setMovimientos([]);
      } finally {
        setLoadingMov(false);
      }
    };

    void fetchMovimientos();
  }, [customer, open]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleGuardarCredito = useCallback(async () => {
    if (!customer) return;
    const limiteFinal = creditoHabilitado ? Number(limiteCredito) : 0;
    try {
      setSaving(true);
      await clientesService.updateCredito(customer.id, {
        tiene_credito: creditoHabilitado,
        limite_credito: limiteFinal,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la configuración de crédito.");
    } finally {
      setSaving(false);
    }
  }, [customer, creditoHabilitado, limiteCredito, onSuccess, onClose]);

  const handleRegistrarAbono = useCallback(async () => {
    if (!customer) return;
    const monto = Number(abonoMonto);
    if (monto <= 0) {
      alert("⚠️ Ingresa un monto mayor a 0.");
      return;
    }
    try {
      setProcesandoAbono(true);

      const payload: Parameters<typeof clientesService.abonarCredito>[1] = {
        monto: monto,
        metodo_pago: metodoPago,
      };

      await clientesService.abonarCredito(customer.id, payload);

      alert(
        `Abono de ${formatMoneda(monto)} vía ${metodoPago} registrado exitosamente.`,
      );
      setAbonoMonto("");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("No se pudo registrar el abono.");
    } finally {
      setProcesandoAbono(false);
    }
  }, [customer, abonoMonto, metodoPago, formatMoneda, onSuccess]);

  const ultimaActividad = useMemo(() => {
    if (!movimientos.length) return null;
    const ultimaCompra = movimientos.find((m) => m.tipo === "compra");
    const ultimoAbono = movimientos.find((m) => m.tipo === "abono");
    return { ultimaCompra, ultimoAbono };
  }, [movimientos]);

  const busy = saving || procesandoAbono;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={!busy ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: styles.creditDialogPaper }}
    >
      <DialogTitle className={styles.creditDialogTitle}>
        <div className={styles.creditDialogTitleInner}>
          <div className={styles.creditDialogTitleLeft}>
            <div className={styles.creditDialogTitleIcon}>
              <CreditCard size={18} />
            </div>
            <div>
              <span className={styles.creditDialogTitleText}>
                Crédito del cliente
              </span>
              <span className={styles.creditDialogTitleSub}>
                {customer?.name ?? "—"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.creditDialogCloseBtn}
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.creditDialogTabs}>
          <button
            type="button"
            className={`${styles.creditDialogTab} ${vistaActiva === "resumen" ? styles.creditDialogTabActive : ""}`}
            onClick={() => setVistaActiva("resumen")}
          >
            Resumen
          </button>
          <button
            type="button"
            className={`${styles.creditDialogTab} ${vistaActiva === "historial" ? styles.creditDialogTabActive : ""}`}
            onClick={() => setVistaActiva("historial")}
          >
            Historial
          </button>
        </div>
      </DialogTitle>

      <DialogContent className={styles.creditDialogContent}>
        {vistaActiva === "resumen" && (
          <>
            <div
              className={`${styles.creditStatusBanner} ${styles[`creditStatusBanner_${status.color}`]}`}
            >
              <div className={styles.creditStatusBannerLeft}>
                <div
                  className={`${styles.creditStatusIcon} ${styles[`creditStatusIcon_${status.color}`]}`}
                >
                  {status.color === "success" && <ShieldCheck size={18} />}
                  {status.color === "warning" && <AlertTriangle size={18} />}
                  {status.color === "danger" && <Zap size={18} />}
                  {status.color === "info" && <BarChart3 size={18} />}
                  {status.color === "neutral" && <ShieldOff size={18} />}
                </div>
                <span className={styles.creditStatusLabel}>{status.label}</span>
              </div>
              <span className={styles.creditStatusPercent}>
                {creditoHabilitado
                  ? `${creditPercent.toFixed(0)}% usado`
                  : "Deshabilitado"}
              </span>
            </div>

            <div className={styles.creditMetricsGrid}>
              <div className={styles.creditMetricCard}>
                <span className={styles.creditMetricLabel}>Límite</span>
                <strong className={styles.creditMetricValue}>
                  {formatMoneda(limite)}
                </strong>
              </div>
              <div
                className={`${styles.creditMetricCard} ${styles.creditMetricCardDebt}`}
              >
                <span className={styles.creditMetricLabel}>Saldo deudor</span>
                <strong
                  className={`${styles.creditMetricValue} ${deuda > 0 ? styles.creditMetricValueDanger : ""}`}
                >
                  {formatMoneda(deuda)}
                </strong>
              </div>
              <div
                className={`${styles.creditMetricCard} ${styles.creditMetricCardAvail}`}
              >
                <span className={styles.creditMetricLabel}>Disponible</span>
                <strong
                  className={`${styles.creditMetricValue} ${styles.creditMetricValueSuccess}`}
                >
                  {formatMoneda(disponible)}
                </strong>
              </div>
            </div>

            {creditoHabilitado && limite > 0 && (
              <div className={styles.creditBarWrap}>
                <div className={styles.creditBarTrack}>
                  <div
                    className={`${styles.creditBarFill} ${styles[`creditBarFill_${status.color}`]}`}
                    style={{ width: `${creditPercent}%` }}
                  />
                </div>
                <div className={styles.creditBarLabels}>
                  <span>{formatMoneda(deuda)} usado</span>
                  <span>{formatMoneda(disponible)} libre</span>
                </div>
              </div>
            )}

            {ultimaActividad && (
              <div className={styles.creditLastActivity}>
                <span className={styles.creditSectionLabel}>
                  Última actividad
                </span>
                <div className={styles.creditLastActivityGrid}>
                  {ultimaActividad.ultimaCompra && (
                    <div className={styles.creditActivityItem}>
                      <ArrowUpRight
                        size={13}
                        className={styles.creditActivityIconDanger}
                      />
                      <div>
                        <span className={styles.creditActivityType}>
                          Última compra
                        </span>
                        <span className={styles.creditActivityDate}>
                          {fmtFecha(ultimaActividad.ultimaCompra.fecha)}
                        </span>
                      </div>
                      <span className={styles.creditActivityAmountDanger}>
                        +{formatMoneda(ultimaActividad.ultimaCompra.monto)}
                      </span>
                    </div>
                  )}
                  {ultimaActividad.ultimoAbono && (
                    <div className={styles.creditActivityItem}>
                      <ArrowDownLeft
                        size={13}
                        className={styles.creditActivityIconSuccess}
                      />
                      <div>
                        <span className={styles.creditActivityType}>
                          Último abono
                        </span>
                        <span className={styles.creditActivityDate}>
                          {fmtFecha(ultimaActividad.ultimoAbono.fecha)}
                        </span>
                      </div>
                      <span className={styles.creditActivityAmountSuccess}>
                        {formatMoneda(
                          Math.abs(ultimaActividad.ultimoAbono.monto),
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.creditDivider}>
              <span>Configuración</span>
            </div>

            <div className={styles.creditConfigBlock}>
              <FormControlLabel
                className={styles.checkbox}
                control={
                  <Checkbox
                    checked={creditoHabilitado}
                    onChange={(e) => setCreditoHabilitado(e.target.checked)}
                    sx={{
                      color: "var(--color-primary)",
                      "&.Mui-checked": {
                        color: "var(--color-primary-vibrant)",
                      },
                    }}
                  />
                }
                label={
                  <span className={styles.creditCheckboxLabel}>
                    Habilitar crédito para este cliente
                  </span>
                }
              />
              <TextField
                label="Límite de crédito autorizado"
                type="number"
                value={limiteCredito}
                onChange={(e) => setLimiteCredito(e.target.value)}
                disabled={!creditoHabilitado}
                fullWidth
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "var(--border-radius-medium)",
                    fontFamily: "var(--font-primary)",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "var(--color-primary-vibrant)",
                  },
                }}
              />
            </div>

            <div className={styles.creditDivider}>
              <span>Operación</span>
            </div>

            <div className={styles.creditAbonoBlock}>
              <div className={styles.creditAbonoRow}>
                <TextField
                  label="Monto del abono"
                  type="number"
                  placeholder="0.00"
                  value={abonoMonto}
                  onChange={(e) => setAbonoMonto(e.target.value)}
                  disabled={procesandoAbono}
                  size="small"
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "var(--border-radius-medium)",
                      fontFamily: "var(--font-primary)",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                      borderColor: "var(--color-primary-vibrant)",
                    },
                  }}
                />
                <FormControl
                  size="small"
                  sx={{
                    minWidth: 140,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "var(--border-radius-medium)",
                      fontFamily: "var(--font-primary)",
                    },
                  }}
                >
                  <InputLabel>Método</InputLabel>
                  <Select
                    value={metodoPago}
                    label="Método"
                    onChange={(e) => setMetodoPago(e.target.value)}
                    disabled={procesandoAbono}
                  >
                    <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                    <MenuItem value="TARJETA_DEBITO">Débito</MenuItem>
                    <MenuItem value="TARJETA_CREDITO">Crédito</MenuItem>
                    <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <button
                type="button"
                className={styles.creditAbonoBtn}
                disabled={
                  !abonoMonto || Number(abonoMonto) <= 0 || procesandoAbono
                }
                onClick={handleRegistrarAbono}
              >
                <Wallet size={15} />
                {procesandoAbono ? "Registrando..." : "Registrar abono"}
                {!procesandoAbono && <ChevronRight size={15} />}
              </button>
            </div>

            <button
              type="button"
              className={styles.creditVerHistorialBtn}
              onClick={() => setVistaActiva("historial")}
            >
              <BarChart3 size={14} />
              Ver historial de movimientos
              <ChevronRight size={14} />
            </button>
          </>
        )}

        {vistaActiva === "historial" && (
          <div className={styles.creditHistorial}>
            <div className={styles.creditHistorialHeader}>
              <span className={styles.creditSectionLabel}>
                Movimientos recientes
              </span>
              <span className={styles.creditHistorialCount}>
                {movimientos.length} registros
              </span>
            </div>

            {loadingMov ? (
              <div className={styles.creditHistorialLoading}>
                <Clock size={20} />
                <span>Cargando movimientos...</span>
              </div>
            ) : movimientos.length === 0 ? (
              <div className={styles.creditHistorialEmpty}>
                <TrendingUp size={28} />
                <span>Sin movimientos registrados</span>
              </div>
            ) : (
              <div className={styles.creditMovList}>
                {movimientos.map((mov) => (
                  <div key={mov.id} className={styles.creditMovItem}>
                    <div
                      className={`${styles.creditMovIcon} ${
                        mov.tipo === "abono"
                          ? styles.creditMovIconAbono
                          : styles.creditMovIconCompra
                      }`}
                    >
                      {mov.tipo === "abono" ? (
                        <ArrowDownLeft size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                    </div>
                    <div className={styles.creditMovInfo}>
                      <span className={styles.creditMovDesc}>
                        {mov.descripcion}
                      </span>
                      <span className={styles.creditMovFecha}>
                        {fmtFecha(mov.fecha)}
                      </span>
                    </div>
                    <div className={styles.creditMovRight}>
                      <span
                        className={`${styles.creditMovMonto} ${
                          mov.monto < 0
                            ? styles.creditMovMontoAbono
                            : styles.creditMovMontoCompra
                        }`}
                      >
                        {mov.monto < 0 ? "−" : "+"}
                        {formatMoneda(Math.abs(mov.monto))}
                      </span>
                      <span className={styles.creditMovSaldo}>
                        Saldo: {formatMoneda(mov.saldoResultante)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.creditHistorialSummary}>
              <div className={styles.creditHistorialSummaryRow}>
                <span>Saldo deudor actual</span>
                <strong
                  className={deuda > 0 ? styles.creditMetricValueDanger : ""}
                >
                  {formatMoneda(deuda)}
                </strong>
              </div>
              <div className={styles.creditHistorialSummaryRow}>
                <span>Crédito disponible</span>
                <strong className={styles.creditMetricValueSuccess}>
                  {formatMoneda(disponible)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className={styles.creditDialogActions}>
        <button
          type="button"
          className={styles.creditDialogCancelBtn}
          onClick={onClose}
          disabled={busy}
        >
          Cerrar
        </button>
        <button
          type="button"
          className={styles.creditDialogSaveBtn}
          onClick={handleGuardarCredito}
          disabled={busy}
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerCreditDialog;