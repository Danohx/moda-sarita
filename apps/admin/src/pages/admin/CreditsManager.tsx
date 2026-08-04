import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Refresh, Schedule } from "@mui/icons-material";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";
import { creditoService } from "@admin/services/credito.service";
import type {
  CreditoFilters,
  CreditoResumen,
  EstadoCredito,
  UltimaEjecucionVencimientos,
} from "@admin/types/credito.types";
import CreditStatusChip from "@admin/components/components/creditos/CreditStatusChip";
import CreditPaymentDialog from "@admin/components/components/creditos/CreditPaymentDialog";
import styles from "../../../styles/CreditsManager.module.css";

const ESTADOS: Array<{ value: EstadoCredito | ""; label: string }> = [
  { value: "", label: "Todos" },
  { value: "ACTIVO", label: "Activo" },
  { value: "EN_MORA", label: "En mora" },
  { value: "INCUMPLIDO", label: "Incumplido" },
  { value: "LIQUIDADO", label: "Liquidado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function dateLabel(value?: string | null) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("es-MX");
}

export default function CreditsManager() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const canView = canAccess(user, { permissions: "credito.view" });
  const canPay = canAccess(user, { permissions: "credito.payments.create" });
  const canRunOverdue = canAccess(user, { permissions: "credito.overdue.run" });

  const [items, setItems] = useState<CreditoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentCredit, setPaymentCredit] = useState<CreditoResumen | null>(null);
  const [paying, setPaying] = useState(false);
  const [ultimaEjecucion, setUltimaEjecucion] =
    useState<UltimaEjecucionVencimientos | null>(null);

  const [estado, setEstado] = useState<EstadoCredito | "">(
    (searchParams.get("estado") as EstadoCredito | null) ?? "",
  );
  const [clienteId, setClienteId] = useState(searchParams.get("cliente_id") ?? "");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [soloVencidos, setSoloVencidos] = useState(false);
  const [incluirLegacy, setIncluirLegacy] = useState(true);

  const filters = useMemo<CreditoFilters>(
    () => ({
      estado: estado || undefined,
      cliente_id: clienteId.trim() || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      con_cuotas_vencidas: soloVencidos ? true : undefined,
      datos_calendario_completos: incluirLegacy ? undefined : true,
      limit: 200,
      offset: 0,
    }),
    [clienteId, estado, fechaDesde, fechaHasta, incluirLegacy, soloVencidos],
  );

  const load = useCallback(async () => {
    if (!canView) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await creditoService.listar(filters);
      setItems(result.data);
      try {
        setUltimaEjecucion(
          await creditoService.getUltimaEjecucionVencimientos(),
        );
      } catch {
        setUltimaEjecucion(null);
      }
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los créditos.");
    } finally {
      setLoading(false);
    }
  }, [canView, filters]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (estado) next.set("estado", estado);
    if (clienteId.trim()) next.set("cliente_id", clienteId.trim());
    setSearchParams(next, { replace: true });
  }, [clienteId, estado, setSearchParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.saldo += Number(item.saldo_pendiente || 0);
        acc.vencido += Number(item.total_vencido || 0);
        if (["ACTIVO", "EN_MORA", "INCUMPLIDO"].includes(item.estado)) acc.activos += 1;
        if (item.estado === "EN_MORA") acc.mora += 1;
        return acc;
      },
      { saldo: 0, vencido: 0, activos: 0, mora: 0 },
    );
  }, [items]);

  async function handleProcessOverdue() {
    try {
      setProcessing(true);
      setError(null);
      const result = await creditoService.procesarVencimientos();
      setSuccess(
        `Vencimientos procesados: ${Number(
          result.cuotas_marcadas_vencidas || result.cuotas_vencidas || 0,
        )} cuota(s), ${Number(
          result.creditos_marcados_en_mora || result.creditos_en_mora || 0,
        )} crédito(s) en mora.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron procesar vencimientos.");
    } finally {
      setProcessing(false);
    }
  }

  async function handlePayment(payload: {
    monto: number;
    metodo_pago: string;
    referencia_externa: string | null;
    observaciones: string | null;
  }) {
    if (!paymentCredit) return;
    try {
      setPaying(true);
      const result = await creditoService.abonar(paymentCredit.credito_id, payload);
      setPaymentCredit(null);
      setSuccess(`Abono registrado. Saldo restante: ${money.format(Number(result.credito.saldo_pendiente || 0))}`);
      await load();
      await creditoService.descargarComprobante(
        paymentCredit.credito_id,
        result.pago.id,
        `abono-${paymentCredit.pedido_folio ?? paymentCredit.credito_id}.pdf`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el abono.");
    } finally {
      setPaying(false);
    }
  }

  if (!canView) {
    return <Alert severity="warning">No tienes permiso para consultar créditos.</Alert>;
  }

  return (
    <Box className={styles.page}>
      <header className={styles.header}>
        <div>
          <Typography variant="h4" className={styles.title}>Créditos</Typography>
          <Typography className={styles.subtitle}>
            Créditos individuales, cuotas, vencimientos y cobranza.
          </Typography>
        </div>
        <div className={styles.actions}>
          <Button startIcon={<Refresh />} onClick={() => void load()} disabled={loading}>
            Actualizar
          </Button>
          {canRunOverdue ? (
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={() => void handleProcessOverdue()}
              disabled={processing}
              className={styles.primaryButton}
            >
              {processing ? "Procesando..." : "Procesar vencimientos"}
            </Button>
          ) : null}
        </div>
      </header>

      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert> : null}

      {ultimaEjecucion ? (
        <div className={styles.lastRun}>
          <span>Último proceso de vencimientos</span>
          <strong>
            {new Date(ultimaEjecucion.iniciado_at).toLocaleString("es-MX")} · {ultimaEjecucion.origen}
          </strong>
          <em>{ultimaEjecucion.exitoso ? "Exitoso" : "Con error"}</em>
        </div>
      ) : null}

      <section className={styles.metrics}>
        <article><span>Créditos visibles</span><strong>{items.length}</strong></article>
        <article><span>Activos</span><strong>{totals.activos}</strong></article>
        <article><span>En mora</span><strong>{totals.mora}</strong></article>
        <article><span>Saldo pendiente</span><strong>{money.format(totals.saldo)}</strong></article>
        <article><span>Saldo vencido</span><strong>{money.format(totals.vencido)}</strong></article>
      </section>

      <section className={styles.filters}>
        <FormControl size="small" className={styles.filterControl}>
          <InputLabel>Estado</InputLabel>
          <Select value={estado} label="Estado" onChange={(event) => setEstado(event.target.value as EstadoCredito | "")}>
            {ESTADOS.map((item) => <MenuItem key={item.value || "all"} value={item.value}>{item.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="Cliente ID" value={clienteId} onChange={(event) => setClienteId(event.target.value)} />
        <TextField size="small" label="Desde" type="date" value={fechaDesde} onChange={(event) => setFechaDesde(event.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="Hasta" type="date" value={fechaHasta} onChange={(event) => setFechaHasta(event.target.value)} InputLabelProps={{ shrink: true }} />
        <label className={styles.checkbox}><input type="checkbox" checked={soloVencidos} onChange={(event) => setSoloVencidos(event.target.checked)} /> Solo con cuotas vencidas</label>
        <label className={styles.checkbox}><input type="checkbox" checked={incluirLegacy} onChange={(event) => setIncluirLegacy(event.target.checked)} /> Incluir históricos</label>
      </section>

      <section className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}><CircularProgress /><span>Cargando créditos...</span></div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>No hay créditos con los filtros seleccionados.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th><th>Pedido</th><th>Financiado</th><th>Saldo</th><th>Próximo pago</th><th>Vencido</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((credito) => (
                  <tr key={credito.credito_id}>
                    <td><strong>{credito.cliente_nombre}</strong><small>{credito.telefono ?? "Sin teléfono"}</small></td>
                    <td>{credito.pedido_folio ? `#${credito.pedido_folio}` : "Legacy"}</td>
                    <td>{money.format(Number(credito.monto_financiado))}</td>
                    <td>{money.format(Number(credito.saldo_pendiente))}</td>
                    <td>{credito.datos_calendario_completos ? <><span>{dateLabel(credito.proximo_vencimiento)}</span><small>{money.format(Number(credito.monto_proxima_cuota ?? 0))}</small></> : <span className={styles.legacy}>Sin calendario</span>}</td>
                    <td className={Number(credito.total_vencido) > 0 ? styles.dangerText : ""}>{money.format(Number(credito.total_vencido || 0))}</td>
                    <td><CreditStatusChip estado={credito.estado} /></td>
                    <td><div className={styles.rowActions}><Link to={`/credits/${credito.credito_id}`}>Ver detalle</Link>{canPay && ["ACTIVO", "EN_MORA", "INCUMPLIDO"].includes(credito.estado) ? <button onClick={() => setPaymentCredit(credito)}>Abonar</button> : null}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CreditPaymentDialog open={Boolean(paymentCredit)} credito={paymentCredit} loading={paying} onClose={() => setPaymentCredit(null)} onSubmit={handlePayment} />
    </Box>
  );
}
