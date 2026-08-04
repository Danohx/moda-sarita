import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { ArrowBack, Download, Payment, Cancel } from "@mui/icons-material";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";
import { creditoService } from "@admin/services/credito.service";
import type { CreditoDetalle } from "@admin/types/credito.types";
import CreditStatusChip from "@admin/components/components/creditos/CreditStatusChip";
import CreditPaymentDialog from "@admin/components/components/creditos/CreditPaymentDialog";
import CreditCancelDialog from "@admin/components/components/creditos/CreditCancelDialog";
import styles from "../../../styles/CreditDetail.module.css";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const date = (value?: string | null) => value ? new Date(value).toLocaleDateString("es-MX") : "—";

export default function CreditDetail() {
  const { creditoId = "" } = useParams();
  const { user } = useAuth();
  const canPay = canAccess(user, { permissions: "credito.payments.create" });
  const canCancel = canAccess(user, { permissions: "credito.cancel" });

  const [data, setData] = useState<CreditoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await creditoService.obtener(creditoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el crédito.");
    } finally {
      setLoading(false);
    }
  }, [creditoId]);

  useEffect(() => { void load(); }, [load]);

  const credito = data?.credito ?? null;
  const canCancelSafely = Boolean(
    credito &&
      canCancel &&
      credito.origen !== "MIGRACION_LEGACY" &&
      Number(credito.enganche || 0) === 0 &&
      Number(credito.saldo_pendiente || 0) ===
        Number(credito.monto_financiado || 0),
  );
  const progress = useMemo(() => {
    if (!credito || Number(credito.monto_financiado) <= 0) return 0;
    return Math.min(100, ((Number(credito.monto_financiado) - Number(credito.saldo_pendiente)) / Number(credito.monto_financiado)) * 100);
  }, [credito]);

  async function submitPayment(payload: { monto: number; metodo_pago: string; referencia_externa: string | null; observaciones: string | null }) {
    if (!credito) return;
    try {
      setBusy(true);
      const result = await creditoService.abonar(credito.credito_id, payload);
      setPaymentOpen(false);
      setSuccess("Abono registrado correctamente.");
      await load();
      await creditoService.descargarComprobante(credito.credito_id, result.pago.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el abono.");
    } finally { setBusy(false); }
  }

  async function submitCancel(motivo: string) {
    if (!credito) return;
    try {
      setBusy(true);
      await creditoService.cancelar(credito.credito_id, motivo);
      setCancelOpen(false);
      setSuccess("Crédito cancelado correctamente.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar el crédito.");
    } finally { setBusy(false); }
  }

  if (loading) return <div className={styles.loading}><CircularProgress /><span>Cargando crédito...</span></div>;
  if (!credito || !data) return <Alert severity="error">{error ?? "Crédito no encontrado."}</Alert>;

  return (
    <Box className={styles.page}>
      <header className={styles.header}>
        <div><Link to="/credits" className={styles.back}><ArrowBack fontSize="small" /> Volver</Link><Typography variant="h4">Crédito {credito.pedido_folio ? `#${credito.pedido_folio}` : "histórico"}</Typography><p>{credito.cliente_nombre}</p></div>
        <div className={styles.actions}>{canPay && ["ACTIVO", "EN_MORA", "INCUMPLIDO"].includes(credito.estado) ? <Button variant="contained" startIcon={<Payment />} onClick={() => setPaymentOpen(true)}>Registrar abono</Button> : null}{canCancelSafely && ["ACTIVO", "EN_MORA", "INCUMPLIDO"].includes(credito.estado) ? <Button color="error" startIcon={<Cancel />} onClick={() => setCancelOpen(true)}>Cancelar venta</Button> : null}</div>
      </header>

      {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
      {success ? <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert> : null}
      {!credito.datos_calendario_completos ? <Alert severity="warning">Crédito histórico sin calendario completo. No es posible determinar puntualidad ni vencimientos.</Alert> : null}

      <section className={styles.summaryGrid}>
        <article><span>Estado</span><CreditStatusChip estado={credito.estado} /></article>
        <article><span>Monto financiado</span><strong>{money.format(Number(credito.monto_financiado))}</strong></article>
        <article><span>Saldo pendiente</span><strong>{money.format(Number(credito.saldo_pendiente))}</strong></article>
        <article><span>Total vencido</span><strong className={Number(credito.total_vencido) > 0 ? styles.danger : ""}>{money.format(Number(credito.total_vencido || 0))}</strong></article>
        <article><span>Otorgamiento</span><strong>{date(credito.fecha_otorgamiento)}</strong></article>
        <article><span>Próximo vencimiento</span><strong>{date(credito.proximo_vencimiento)}</strong></article>
      </section>

      <section className={styles.progressCard}><div><span>Avance pagado</span><strong>{progress.toFixed(1)}%</strong></div><div className={styles.progressTrack}><div style={{ width: `${progress}%` }} /></div></section>

      {credito.datos_calendario_completos ? <section className={styles.card}><h2>Calendario de cuotas</h2><div className={styles.tableWrap}><table><thead><tr><th>#</th><th>Vencimiento</th><th>Programado</th><th>Pagado</th><th>Saldo</th><th>Estado</th></tr></thead><tbody>{data.cuotas.map((cuota) => <tr key={cuota.id}><td>{cuota.numero_cuota}</td><td>{date(cuota.fecha_vencimiento)}</td><td>{money.format(Number(cuota.monto_programado))}</td><td>{money.format(Number(cuota.monto_pagado))}</td><td>{money.format(Number(cuota.saldo_pendiente))}</td><td><span className={`${styles.installmentStatus} ${styles[`installment_${cuota.estado}`]}`}>{cuota.estado}</span></td></tr>)}</tbody></table></div></section> : null}

      <section className={styles.card}><h2>Pagos</h2>{data.pagos.length === 0 ? <p className={styles.empty}>Sin pagos registrados.</p> : <div className={styles.tableWrap}><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Método</th><th>Monto</th><th>Aplicaciones</th><th>Comprobante</th></tr></thead><tbody>{data.pagos.map((pago) => <tr key={pago.id}><td>{date(pago.fecha_pago)}</td><td>{pago.concepto}</td><td>{pago.metodo}</td><td>{money.format(Number(pago.monto))}</td><td>{pago.aplicaciones?.length ?? 0}</td><td>{["ABONO_CREDITO", "LIQUIDACION_CREDITO"].includes(pago.concepto) ? <button className={styles.downloadButton} onClick={() => void creditoService.descargarComprobante(credito.credito_id, pago.id)}><Download fontSize="small" /> PDF</button> : <span>Ticket de venta</span>}</td></tr>)}</tbody></table></div>}</section>

      <section className={styles.card}><h2>Movimientos</h2>{data.movimientos.length === 0 ? <p className={styles.empty}>Sin movimientos.</p> : <div className={styles.timeline}>{data.movimientos.map((mov) => <article key={mov.id}><div><strong>{mov.descripcion}</strong><span>{new Date(mov.fecha).toLocaleString("es-MX")}</span></div><div><strong className={Number(mov.monto) < 0 ? styles.positive : styles.danger}>{money.format(Math.abs(Number(mov.monto)))}</strong><span>Saldo: {money.format(Number(mov.saldo_resultante))}</span></div></article>)}</div>}</section>

      <CreditPaymentDialog open={paymentOpen} credito={credito} loading={busy} onClose={() => setPaymentOpen(false)} onSubmit={submitPayment} />
      <CreditCancelDialog open={cancelOpen} credito={credito} loading={busy} onClose={() => setCancelOpen(false)} onSubmit={submitCancel} />
    </Box>
  );
}
