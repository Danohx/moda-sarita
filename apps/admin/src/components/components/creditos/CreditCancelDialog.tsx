import { useEffect, useState } from "react";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import type { CreditoResumen } from "@admin/types/credito.types";
import styles from "../../../../styles/CreditDialogs.module.css";

type Props = {
  open: boolean;
  credito: CreditoResumen | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (motivo: string) => Promise<void>;
};

export default function CreditCancelDialog({
  open,
  credito,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (open) setMotivo("");
  }, [open, credito?.credito_id]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancelar crédito</DialogTitle>
      <DialogContent className={styles.content}>
        <Alert severity="warning">
          Solo se puede cancelar un crédito sin abonos confirmados. La operación queda auditada.
        </Alert>
        <TextField
          label="Motivo de cancelación"
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
          multiline
          minRows={3}
          fullWidth
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <button className={styles.secondaryButton} onClick={onClose} disabled={loading}>
          Volver
        </button>
        <button
          className={styles.dangerButton}
          onClick={() => void onSubmit(motivo.trim())}
          disabled={motivo.trim().length < 5 || loading}
        >
          {loading ? "Cancelando..." : "Confirmar cancelación"}
        </button>
      </DialogActions>
    </Dialog>
  );
}
