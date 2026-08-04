import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { clientesService } from "@admin/services/clientes.service";
import { creditoService } from "@admin/services/credito.service";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";
import type { CreditoResumen } from "@admin/types/credito.types";
import CreditStatusChip from "@admin/components/components/creditos/CreditStatusChip";
import styles from "../../../styles/CustomerCreditPanel.module.css";

type CustomerData = {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  telefono?: string | null;
  email?: string | null;
  activo: boolean;
  tiene_credito: boolean;
  limite_credito: number;
  saldo_deudor: number;
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function CustomerCreditPanel() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canView = canAccess(user, { permissions: "credito.view" });
  const canManage = canAccess(user, {
    permissions: "clientes.clientes.credito.manage",
  });

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [credits, setCredits] = useState<CreditoResumen[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canView) return;
    try {
      setLoading(true);
      setError(null);
      const [rawCustomer, creditResult] = await Promise.all([
        clientesService.getById(id),
        creditoService.listarPorCliente(id, { limit: 100, offset: 0 }),
      ]);
      const raw = rawCustomer as Record<string, unknown>;
      const normalized: CustomerData = {
        id: String(raw.id || id),
        nombres: String(raw.nombres || ""),
        apellido_paterno: String(raw.apellido_paterno || ""),
        apellido_materno: raw.apellido_materno
          ? String(raw.apellido_materno)
          : null,
        telefono: raw.telefono ? String(raw.telefono) : null,
        email: raw.email ? String(raw.email) : null,
        activo: raw.activo === true,
        tiene_credito: raw.tiene_credito === true,
        limite_credito: Number(raw.limite_credito || 0),
        saldo_deudor: Number(raw.saldo_deudor || 0),
      };
      setCustomer(normalized);
      setEnabled(normalized.tiene_credito);
      setLimit(String(normalized.limite_credito || ""));
      setCredits(creditResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el cliente.");
    } finally {
      setLoading(false);
    }
  }, [canView, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const available = useMemo(
    () => Math.max(Number(limit || 0) - Number(customer?.saldo_deudor || 0), 0),
    [customer?.saldo_deudor, limit],
  );

  async function save() {
    if (!canManage || !customer) return;
    const finalLimit = enabled ? Number(limit) : 0;
    if (enabled && (!Number.isFinite(finalLimit) || finalLimit <= 0)) {
      setError("El límite debe ser mayor a cero.");
      return;
    }
    if (!enabled && customer.saldo_deudor > 0) {
      setError("No se puede deshabilitar crédito mientras exista saldo pendiente.");
      return;
    }
    if (finalLimit < customer.saldo_deudor) {
      setError("El límite no puede ser menor que el saldo deudor actual.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await clientesService.updateCredito(customer.id, {
        tiene_credito: enabled,
        limite_credito: finalLimit,
      });
      setSuccess("Configuración de crédito actualizada.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  if (!canView) return <Alert severity="warning">No tienes permiso para consultar créditos.</Alert>;
  if (loading) return <div className={styles.loading}><CircularProgress /> Cargando...</div>;
  if (!customer) return <Alert severity="error">{error || "Cliente no encontrado."}</Alert>;

  const name = [customer.nombres, customer.apellido_paterno, customer.apellido_materno]
    .filter(Boolean)
    .join(" ");

  return (
    <Box className={styles.page}>
      <header className={styles.header}>
        <div>
          <button className={styles.back} onClick={() => navigate(-1)} type="button">
            <ArrowBack fontSize="small" /> Volver
          </button>
          <Typography variant="h4" className={styles.title}>Crédito de {name}</Typography>
          <p>{customer.telefono || customer.email || "Sin contacto"}</p>
        </div>
        <Link className={styles.allCredits} to={`/credits?cliente_id=${customer.id}`}>
          Ver créditos individuales
        </Link>
      </header>

      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert> : null}

      <section className={styles.metrics}>
        <article><span>Límite autorizado</span><strong>{money.format(customer.limite_credito)}</strong></article>
        <article><span>Saldo deudor</span><strong>{money.format(customer.saldo_deudor)}</strong></article>
        <article><span>Disponible</span><strong>{money.format(available)}</strong></article>
        <article><span>Créditos registrados</span><strong>{credits.length}</strong></article>
      </section>

      <section className={styles.configCard}>
        <div>
          <h2>Configuración del cliente</h2>
          <p>Esta configuración autoriza capacidad; cada compra crea un crédito independiente.</p>
        </div>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={(event) => setEnabled(event.target.checked)} disabled={!canManage || saving} />}
          label="Crédito habilitado"
        />
        <TextField
          label="Límite autorizado"
          type="number"
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
          disabled={!enabled || !canManage || saving}
          inputProps={{ min: customer.saldo_deudor, step: 0.01 }}
        />
        {canManage ? (
          <Button variant="contained" startIcon={<Save />} onClick={() => void save()} disabled={saving}>
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
        ) : (
          <Alert severity="info">Solo lectura: no tienes permiso para modificar el límite.</Alert>
        )}
      </section>

      <section className={styles.tableCard}>
        <h2>Créditos del cliente</h2>
        {credits.length === 0 ? <p>Sin créditos individuales.</p> : (
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>Pedido</th><th>Otorgamiento</th><th>Financiado</th><th>Saldo</th><th>Estado</th><th /></tr></thead>
              <tbody>{credits.map((credit) => (
                <tr key={credit.credito_id}>
                  <td>{credit.pedido_folio ? `#${credit.pedido_folio}` : "Legacy"}</td>
                  <td>{new Date(credit.fecha_otorgamiento).toLocaleDateString("es-MX")}</td>
                  <td>{money.format(Number(credit.monto_financiado))}</td>
                  <td>{money.format(Number(credit.saldo_pendiente))}</td>
                  <td><CreditStatusChip estado={credit.estado} /></td>
                  <td><Link to={`/credits/${credit.credito_id}`}>Detalle</Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </Box>
  );
}
