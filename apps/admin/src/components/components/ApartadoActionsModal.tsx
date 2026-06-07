import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  AttachMoney,
  Cancel,
  CheckCircle,
  Close,
  CreditCard,
  MoneyOff,
  Payments,
  Warning,
} from "@mui/icons-material";
import styles from "../../../styles/ApartadoActionModals.module.css";
import type { MetodoPago } from "../../../../../shared/api/pedidos.api";

// ─── shared method options ────────────────────────────────────────────────────

const METODOS_PAGO: { value: MetodoPago; label: string; icon: string }[] = [
  { value: "EFECTIVO",        label: "Efectivo",        icon: "💵" },
  { value: "TARJETA_CREDITO", label: "Tarjeta crédito", icon: "💳" },
  { value: "TARJETA_DEBITO",  label: "Tarjeta débito",  icon: "💳" },
  { value: "TRANSFERENCIA",   label: "Transferencia",   icon: "🏦" },
  { value: "MERCADO_PAGO",    label: "Mercado Pago",    icon: "🛒" },
  { value: "PAYPAL",          label: "PayPal",          icon: "🅿️" },
];

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(valor);
}

// ─── shared sub-components ────────────────────────────────────────────────────

function ModalHeader({
  icon,
  title,
  subtitle,
  variant,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  variant: "primary" | "success" | "danger";
  onClose: () => void;
}) {
  return (
    <DialogTitle className={styles.dialogTitle}>
      <Box className={styles.titleRow}>
        <Box className={`${styles.titleIcon} ${styles[`titleIcon_${variant}`]}`}>
          {icon}
        </Box>
        <Box className={styles.titleText}>
          <Typography className={styles.titleMain}>{title}</Typography>
          {subtitle && (
            <Typography className={styles.titleSub}>{subtitle}</Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" className={styles.closeBtn}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </DialogTitle>
  );
}

function MetodoPagoSelect({
  value,
  onChange,
}: {
  value: MetodoPago;
  onChange: (v: MetodoPago) => void;
}) {
  return (
    <FormControl fullWidth>
      <Typography className={styles.fieldLabel}>Método de pago</Typography>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as MetodoPago)}
        className={styles.select}
        startAdornment={
          <InputAdornment position="start">
            <CreditCard className={styles.selectIcon} />
          </InputAdornment>
        }
      >
        {METODOS_PAGO.map((m) => (
          <MenuItem key={m.value} value={m.value}>
            <Box className={styles.menuItem}>
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function ReferenciaField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Box>
      <Typography className={styles.fieldLabel}>
        Referencia externa{" "}
        <span className={styles.fieldOptional}>(opcional)</span>
      </Typography>
      <TextField
        fullWidth
        placeholder="Ej. folio de transferencia, número de operación…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.textField}
      />
    </Box>
  );
}

// ─── props ────────────────────────────────────────────────────────────────────

export type ApartadoActionModalsProps = {
  // Data
  apartadoFolio: number | null;
  apartadoRemaining: number;

  // Abono
  abonoOpen: boolean;
  abonoMonto: string;
  onAbonoMontoChange: (v: string) => void;

  // Liquidar
  liquidarOpen: boolean;

  // Cancelar
  cancelarOpen: boolean;
  motivoCancelacion: string;
  onMotivoCancelacionChange: (v: string) => void;

  // Shared
  metodoPago: MetodoPago;
  onMetodoPagoChange: (v: MetodoPago) => void;
  referenciaExterna: string;
  onReferenciaExternaChange: (v: string) => void;

  actionLoading: boolean;
  onClose: () => void;

  // Handlers
  onRegistrarAbono: () => void;
  onLiquidarApartado: () => void;
  onCancelarApartado: () => void;
};

// ─── main component ───────────────────────────────────────────────────────────

const ApartadoActionModals: React.FC<ApartadoActionModalsProps> = ({
  apartadoFolio,
  apartadoRemaining,
  abonoOpen,
  abonoMonto,
  onAbonoMontoChange,
  liquidarOpen,
  cancelarOpen,
  motivoCancelacion,
  onMotivoCancelacionChange,
  metodoPago,
  onMetodoPagoChange,
  referenciaExterna,
  onReferenciaExternaChange,
  actionLoading,
  onClose,
  onRegistrarAbono,
  onLiquidarApartado,
  onCancelarApartado,
}) => {
  const folioLabel = apartadoFolio ? `APT-${apartadoFolio}` : "—";
  const montoAbono = Number(abonoMonto) || 0;

  // ── Abono ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ═══ ABONO ═══════════════════════════════════════════════════════════ */}
      <Dialog
        open={abonoOpen}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: styles.paper }}
      >
        <ModalHeader
          icon={<AttachMoney />}
          title="Registrar abono"
          subtitle={folioLabel}
          variant="primary"
          onClose={onClose}
        />

        <DialogContent className={styles.content}>
          {/* Info del saldo */}
          <Box className={styles.infoBox}>
            <Box className={styles.infoRow}>
              <Typography className={styles.infoLabel}>
                Saldo pendiente
              </Typography>
              <Typography className={`${styles.infoValue} ${styles.infoValueRed}`}>
                {formatMoneda(apartadoRemaining)}
              </Typography>
            </Box>
            {montoAbono > 0 && (
              <Box className={styles.infoRow}>
                <Typography className={styles.infoLabel}>
                  Quedaría pendiente
                </Typography>
                <Typography
                  className={`${styles.infoValue} ${
                    apartadoRemaining - montoAbono <= 0
                      ? styles.infoValueGreen
                      : styles.infoValueOrange
                  }`}
                >
                  {formatMoneda(Math.max(0, apartadoRemaining - montoAbono))}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Monto */}
          <Box>
            <Typography className={styles.fieldLabel}>
              Monto del abono
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="0.00"
              value={abonoMonto}
              onChange={(e) => onAbonoMontoChange(e.target.value)}
              className={styles.textField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography className={styles.currencyPrefix}>$</Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Box>

          <MetodoPagoSelect value={metodoPago} onChange={onMetodoPagoChange} />
          <ReferenciaField
            value={referenciaExterna}
            onChange={onReferenciaExternaChange}
          />
        </DialogContent>

        <DialogActions className={styles.actions}>
          <Button
            onClick={onClose}
            disabled={actionLoading}
            className={styles.cancelBtn}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onRegistrarAbono}
            disabled={actionLoading || montoAbono <= 0}
            className={styles.primaryBtn}
            startIcon={
              actionLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Payments />
              )
            }
          >
            {actionLoading ? "Registrando…" : "Registrar abono"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ LIQUIDAR ════════════════════════════════════════════════════════ */}
      <Dialog
        open={liquidarOpen}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: styles.paper }}
      >
        <ModalHeader
          icon={<CheckCircle />}
          title="Liquidar apartado"
          subtitle={folioLabel}
          variant="success"
          onClose={onClose}
        />

        <DialogContent className={styles.content}>
          {/* Confirmación visual */}
          <Box className={`${styles.infoBox} ${styles.infoBoxSuccess}`}>
            <Box className={styles.liquidarHighlight}>
              <Typography className={styles.liquidarLabel}>
                Pago final a registrar
              </Typography>
              <Typography className={styles.liquidarMonto}>
                {formatMoneda(apartadoRemaining)}
              </Typography>
            </Box>
            <Typography className={styles.liquidarHint}>
              El apartado quedará marcado como{" "}
              <strong>LIQUIDADO</strong> automáticamente.
            </Typography>
          </Box>

          <MetodoPagoSelect value={metodoPago} onChange={onMetodoPagoChange} />
          <ReferenciaField
            value={referenciaExterna}
            onChange={onReferenciaExternaChange}
          />
        </DialogContent>

        <DialogActions className={styles.actions}>
          <Button
            onClick={onClose}
            disabled={actionLoading}
            className={styles.cancelBtn}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onLiquidarApartado}
            disabled={actionLoading}
            className={styles.successBtn}
            startIcon={
              actionLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CheckCircle />
              )
            }
          >
            {actionLoading ? "Liquidando…" : "Liquidar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ CANCELAR ════════════════════════════════════════════════════════ */}
      <Dialog
        open={cancelarOpen}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: styles.paper }}
      >
        <ModalHeader
          icon={<MoneyOff />}
          title="Cancelar apartado"
          subtitle={folioLabel}
          variant="danger"
          onClose={onClose}
        />

        <DialogContent className={styles.content}>
          {/* Advertencia */}
          <Box className={`${styles.infoBox} ${styles.infoBoxDanger}`}>
            <Box className={styles.warningRow}>
              <Warning className={styles.warningIcon} fontSize="small" />
              <Typography className={styles.warningText}>
                Esta acción liberará el stock reservado. Los pagos registrados
                no se eliminarán.
              </Typography>
            </Box>
          </Box>

          {/* Motivo */}
          <Box>
            <Typography className={styles.fieldLabel}>
              Motivo de cancelación
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Describe el motivo de la cancelación…"
              value={motivoCancelacion}
              onChange={(e) => onMotivoCancelacionChange(e.target.value)}
              className={`${styles.textField} ${styles.textFieldDanger}`}
            />
          </Box>
        </DialogContent>

        <DialogActions className={styles.actions}>
          <Button
            onClick={onClose}
            disabled={actionLoading}
            className={styles.cancelBtn}
          >
            Volver
          </Button>
          <Button
            variant="outlined"
            onClick={onCancelarApartado}
            disabled={actionLoading || !motivoCancelacion.trim()}
            className={styles.dangerBtn}
            startIcon={
              actionLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Cancel />
              )
            }
          >
            {actionLoading ? "Cancelando…" : "Cancelar apartado"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApartadoActionModals;