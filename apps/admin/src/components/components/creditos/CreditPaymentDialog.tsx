import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Alert,
} from "@mui/material";
import type { CreditoResumen } from "@admin/types/credito.types";
import styles from "../../../../styles/CreditDialogs.module.css";

const METODOS = [
  { value: "EFECTIVO", label: "Efectivo", requiereReferencia: false },
  { value: "TARJETA_DEBITO", label: "Tarjeta de débito", requiereReferencia: true },
  { value: "TARJETA_CREDITO", label: "Tarjeta de crédito", requiereReferencia: true },
  { value: "TRANSFERENCIA", label: "Transferencia", requiereReferencia: true },
];

type Props = {
  open: boolean;
  credito: CreditoResumen | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    monto: number;
    metodo_pago: string;
    referencia_externa: string | null;
    observaciones: string | null;
  }) => Promise<void>;
};

export default function CreditPaymentDialog({
  open,
  credito,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("EFECTIVO");
  const [referencia, setReferencia] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMonto("");
    setMetodo("EFECTIVO");
    setReferencia("");
    setObservaciones("");
    setError(null);
  }, [open, credito?.credito_id]);

  const metodoConfig = useMemo(
    () => METODOS.find((item) => item.value === metodo) ?? METODOS[0],
    [metodo],
  );

  const saldo = Number(credito?.saldo_pendiente ?? 0);
  const montoNumber = Number(monto || 0);
  const valido =
    montoNumber > 0 &&
    montoNumber <= saldo &&
    (!metodoConfig.requiereReferencia || referencia.trim().length > 0);

  async function handleSubmit() {
    if (!credito) return;
    if (montoNumber <= 0) {
      setError("El monto debe ser mayor a cero.");
      return;
    }
    if (montoNumber > saldo) {
      setError("El abono no puede exceder el saldo pendiente.");
      return;
    }
    if (metodoConfig.requiereReferencia && !referencia.trim()) {
      setError("El método seleccionado requiere referencia.");
      return;
    }

    setError(null);
    await onSubmit({
      monto: montoNumber,
      metodo_pago: metodo,
      referencia_externa: referencia.trim() || null,
      observaciones: observaciones.trim() || null,
    });
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar abono</DialogTitle>
      <DialogContent className={styles.content}>
        {credito ? (
          <div className={styles.summary}>
            <span>{credito.cliente_nombre}</span>
            <strong>Saldo: ${saldo.toFixed(2)}</strong>
          </div>
        ) : null}

        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="Monto"
          type="number"
          value={monto}
          onChange={(event) => setMonto(event.target.value)}
          inputProps={{ min: 0.01, max: saldo, step: 0.01 }}
          fullWidth
          disabled={loading}
        />

        <FormControl fullWidth disabled={loading}>
          <InputLabel>Método de pago</InputLabel>
          <Select
            label="Método de pago"
            value={metodo}
            onChange={(event) => {
              setMetodo(String(event.target.value));
              setReferencia("");
            }}
          >
            {METODOS.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {metodoConfig.requiereReferencia ? (
          <TextField
            label="Referencia"
            value={referencia}
            onChange={(event) => setReferencia(event.target.value)}
            fullWidth
            disabled={loading}
          />
        ) : null}

        <TextField
          label="Observaciones"
          value={observaciones}
          onChange={(event) => setObservaciones(event.target.value)}
          multiline
          minRows={2}
          fullWidth
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <button className={styles.secondaryButton} onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          className={styles.primaryButton}
          onClick={() => void handleSubmit()}
          disabled={!valido || loading}
        >
          {loading ? "Registrando..." : "Registrar abono"}
        </button>
      </DialogActions>
    </Dialog>
  );
}
