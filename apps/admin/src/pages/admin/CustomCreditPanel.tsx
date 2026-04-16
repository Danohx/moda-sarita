import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../../styles/CustomCreditPanel.module.css";
import type { Cliente } from "@admin/pages/admin/AdminCustomers";
import { clientesService } from "@admin/services/clientes.service";

type MovimientoCredito = {
  id: string;
  fecha: string;
  tipo: "compra" | "abono" | "ajuste";
  descripcion: string;
  monto: number;
  saldoResultante: number;
  metodo_pago?: string | null;
};

type MovimientoCreditoBD = {
  id: string | number;
  fecha: string;
  tipo: string;
  descripcion: string;
  monto: string | number;
  saldoResultante?: string | number;
  saldo_resultante?: string | number;
  metodo_pago?: string | null;
};

interface ClienteBackend {
  id?: string | number;
  nombres?: string;
  email?: string;
  telefono?: string;
  limite_credito?: string | number;
  saldo_actual?: string | number;
  saldo_deudor?: string | number;
  activo?: boolean;
  fecha_registro?: string;
}

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(valor);
}

function getCreditStatus(percent: number, tieneCredito: boolean) {
  if (!tieneCredito) return { label: "Sin crédito", type: "none" as const };
  if (percent >= 100) return { label: "Al límite", type: "danger" as const };
  if (percent >= 80) return { label: "Riesgo alto", type: "warning" as const };
  if (percent >= 50) return { label: "En uso", type: "info" as const };
  return { label: "Activo", type: "success" as const };
}

function fmtFechaHora(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeMovimientos(data: MovimientoCreditoBD[]): MovimientoCredito[] {
  return data.map((mov) => {
    const tipoLower = String(mov.tipo).toLowerCase();
    const tipoFinal: MovimientoCredito["tipo"] =
      tipoLower === "abono" || tipoLower === "compra" || tipoLower === "ajuste"
        ? tipoLower
        : "ajuste";
        
    return {
      id: String(mov.id),
      fecha: mov.fecha,
      tipo: tipoFinal,
      descripcion: String(mov.descripcion ?? ""),
      monto: Number(mov.monto),
      saldoResultante: Number(mov.saldoResultante ?? mov.saldo_resultante ?? 0),
      metodo_pago: mov.metodo_pago ?? null,
    };
  });
}

const CustomerCreditPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Cliente | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [creditoHabilitado, setCreditoHabilitado] = useState(false);
  const [limiteCredito, setLimiteCredito] = useState("");
  const [abonoMonto, setAbonoMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [procesandoAbono, setProcesandoAbono] = useState(false);
  const [movimientos, setMovimientos] = useState<MovimientoCredito[]>([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canEditCredit = true;

  const loadCustomer = useCallback(async () => {
    if (!id) {
      setPageError("No se proporcionó un ID de cliente válido.");
      setLoadingCustomer(false);
      return;
    }
    try {
      setLoadingCustomer(true);
      setPageError(null);
      const data = await clientesService.getById(id);

      if (!data) return;

      const c = data as ClienteBackend;
      
      const mappedCustomer: Cliente = {
        id: String(c.id || ""),
        name: String(c.nombres || "Sin nombre"),
        email: String(c.email || ""),
        phone: String(c.telefono || ""),
        creditLimit: Number(c.limite_credito ?? 0),
        currentBalance: Number(c.saldo_actual ?? c.saldo_deudor ?? 0),
        status: c.activo ? "active" : "inactive",
        joinDate: String(c.fecha_registro || "---"),
      };

      setCustomer(mappedCustomer);
    } catch (err) {
      setPageError(`No se pudo cargar la información del cliente. ${err}`);
    } finally {
      setLoadingCustomer(false);
    }
  }, [id]);

  const cargarMovimientos = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingMov(true);
      setError(null);
      const dataBD = (await clientesService.getMovimientosCredito(
        id,
      )) as MovimientoCreditoBD[];
      setMovimientos(normalizeMovimientos(dataBD));
    } catch {
      setMovimientos([]);
      setError("No se pudo cargar el historial.");
    } finally {
      setLoadingMov(false);
    }
  }, [id]);

  useEffect(() => {
    void loadCustomer();
    void cargarMovimientos();
  }, [loadCustomer, cargarMovimientos]);

  useEffect(() => {
    if (customer) {
      setCreditoHabilitado((customer.creditLimit ?? 0) > 0);
      setLimiteCredito(String(customer.creditLimit ?? ""));
    }
  }, [customer]);

  const handleGuardarCredito = useCallback(async () => {
    if (!id) return;
    const limiteFinal = creditoHabilitado ? Number(limiteCredito) : 0;
    if (
      creditoHabilitado &&
      (!Number.isFinite(limiteFinal) || limiteFinal < 0)
    ) {
      setError("El límite debe ser un número válido ≥ 0.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      await clientesService.updateCredito(id, {
        tiene_credito: creditoHabilitado,
        limite_credito: limiteFinal,
      });
      setSuccessMsg("Configuración guardada.");
      await loadCustomer();
    } catch {
      setError("No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }, [id, creditoHabilitado, limiteCredito, loadCustomer]);

  const handleRegistrarAbono = useCallback(async () => {
    if (!id || !customer) return;
    const monto = Number(abonoMonto);
    if (!creditoHabilitado) {
      setError("El cliente no tiene crédito habilitado.");
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    if (monto > customer.currentBalance) {
      setError("El abono no puede superar el saldo deudor.");
      return;
    }
    try {
      setProcesandoAbono(true);
      setError(null);
      setSuccessMsg(null);
      await clientesService.abonarCredito(id, {
        monto,
        metodo_pago: metodoPago,
      });
      setAbonoMonto("");
      setSuccessMsg(`Abono de ${formatMoneda(monto)} registrado.`);
      
      await loadCustomer();
      await cargarMovimientos();
    } catch {
      setError("No se pudo registrar el abono.");
    } finally {
      setProcesandoAbono(false);
    }
  }, [
    id,
    customer,
    abonoMonto,
    creditoHabilitado,
    metodoPago,
    loadCustomer,
    cargarMovimientos,
  ]);

  const resumen = useMemo(() => {
    const totalCompras = movimientos
      .filter((m) => m.tipo === "compra")
      .reduce((acc, mov) => acc + Math.abs(mov.monto), 0);
    const totalAbonos = movimientos
      .filter((m) => m.tipo === "abono")
      .reduce((acc, mov) => acc + Math.abs(mov.monto), 0);
    const totalAjustes = movimientos
      .filter((m) => m.tipo === "ajuste")
      .reduce((acc, mov) => acc + mov.monto, 0);
    return { totalCompras, totalAbonos, totalAjustes };
  }, [movimientos]);

  if (loadingCustomer) {
    return (
      <div className={styles.emptyPage}>
        <div
          className={styles.spinner}
          style={{
            width: 24,
            height: 24,
            borderTopColor: "var(--color-primary-vibrant)",
          }}
        />
        <p className={styles.emptyText}>Cargando información del cliente...</p>
      </div>
    );
  }

  if (pageError || !customer) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyIcon}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className={styles.emptyTitle}>Error al cargar</p>
        <p className={styles.emptyText}>
          {pageError || "El cliente no existe o fue eliminado."}
        </p>
        <button
          className={styles.btnOutline}
          onClick={() => navigate("/customers")}
          style={{ marginTop: 16 }}
        >
          Volver a clientes
        </button>
      </div>
    );
  }

  const limite = customer.creditLimit;
  const deuda = customer.currentBalance;
  const disponible = Math.max(limite - deuda, 0);
  const creditPercent = limite > 0 ? Math.min((deuda / limite) * 100, 100) : 0;
  const status = getCreditStatus(creditPercent, creditoHabilitado);
  const busy = saving || procesandoAbono;
  const initials = customer.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/customers")}
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Volver a clientes
        </button>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <h1 className={styles.heroName}>{customer.name}</h1>
            <p className={styles.heroMeta}>Estado de cuenta · Crédito</p>
          </div>
        </div>
        <div className={styles.heroRight}>
          <span
            className={`${styles.statusBadge} ${styles[`badge_${status.type}`]}`}
          >
            {status.label}
          </span>
          <p className={styles.heroBalance}>{formatMoneda(deuda)}</p>
          <p className={styles.heroBalanceLabel}>Saldo deudor actual</p>
        </div>
      </div>

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      {successMsg && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMsg}
        </div>
      )}

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} data-variant="neutral">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <p className={styles.metricLabel}>Límite autorizado</p>
          <p className={styles.metricValue}>{formatMoneda(limite)}</p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} data-variant="danger">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className={styles.metricLabel}>Saldo deudor</p>
          <p className={`${styles.metricValue} ${styles.metricDanger}`}>
            {formatMoneda(deuda)}
          </p>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} data-variant="success">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className={styles.metricLabel}>Crédito disponible</p>
          <p className={`${styles.metricValue} ${styles.metricSuccess}`}>
            {formatMoneda(disponible)}
          </p>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Crédito utilizado</span>
          <span className={styles.progressPercent}>
            {creditPercent.toFixed(0)}%
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressFill} ${
              creditPercent >= 100
                ? styles.progressDanger
                : creditPercent >= 80
                  ? styles.progressWarning
                  : styles.progressOk
            }`}
            style={{ width: `${creditPercent}%` }}
          />
        </div>
      </div>

      <div className={styles.cols}>
        <div className={styles.colLeft}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Configuración de crédito</h2>
            </div>
            <div className={styles.cardBody}>
              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={creditoHabilitado}
                  onChange={(e) => setCreditoHabilitado(e.target.checked)}
                  disabled={!canEditCredit || busy}
                />
                <span className={styles.toggleLabel}>Habilitar crédito</span>
              </label>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Límite autorizado (MXN)
                </label>
                <input
                  type="number"
                  className={styles.input}
                  value={limiteCredito}
                  onChange={(e) => setLimiteCredito(e.target.value)}
                  placeholder="0.00"
                  disabled={!creditoHabilitado || !canEditCredit || busy}
                />
              </div>

              <button
                className={styles.btnPrimary}
                onClick={handleGuardarCredito}
                disabled={busy || !canEditCredit}
                type="button"
              >
                {saving ? (
                  <span className={styles.spinner} />
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                )}
                {saving ? "Guardando…" : "Guardar configuración"}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Registrar abono</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Monto del abono</label>
                <input
                  type="number"
                  className={styles.input}
                  value={abonoMonto}
                  onChange={(e) => setAbonoMonto(e.target.value)}
                  placeholder="0.00"
                  disabled={procesandoAbono || !creditoHabilitado}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Método de pago</label>
                <select
                  className={styles.select}
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  disabled={procesandoAbono || !creditoHabilitado}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA_DEBITO">Débito</option>
                  <option value="TARJETA_CREDITO">Crédito</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>

              <button
                className={styles.btnOutline}
                onClick={handleRegistrarAbono}
                disabled={
                  !creditoHabilitado ||
                  !abonoMonto ||
                  Number(abonoMonto) <= 0 ||
                  procesandoAbono
                }
                type="button"
              >
                {procesandoAbono ? (
                  <span className={styles.spinner} />
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                )}
                {procesandoAbono ? "Registrando…" : "Registrar abono"}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Resumen del historial</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>
                    <span className={`${styles.dot} ${styles.dotWarning}`} />
                    Compras a crédito
                  </span>
                  <span className={styles.summaryRowValue}>
                    {formatMoneda(resumen.totalCompras)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>
                    <span className={`${styles.dot} ${styles.dotSuccess}`} />
                    Abonos registrados
                  </span>
                  <span
                    className={`${styles.summaryRowValue} ${styles.metricSuccess}`}
                  >
                    {formatMoneda(resumen.totalAbonos)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryRowLabel}>
                    <span className={`${styles.dot} ${styles.dotNeutral}`} />
                    Ajustes
                  </span>
                  <span className={styles.summaryRowValue}>
                    {formatMoneda(resumen.totalAjustes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.colRight}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Historial de movimientos</h2>
                <p className={styles.cardSubtitle}>
                  Estado de cuenta detallado
                </p>
              </div>
              <span className={styles.countBadge}>
                {movimientos.length} registros
              </span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th className={styles.right}>Monto</th>
                    <th className={styles.right}>Saldo</th>
                    <th>Método</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMov ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`sk-${i}`}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j}>
                            <div className={styles.skeletonCell} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : movimientos.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyTable}>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                          </svg>
                          <p>Sin movimientos registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    movimientos.map((mov) => {
                      const isAbono = mov.tipo === "abono";
                      const isCompra = mov.tipo === "compra";
                      return (
                        <tr key={mov.id} className={styles.tableRow}>
                          <td className={styles.tdMuted}>
                            {fmtFechaHora(mov.fecha)}
                          </td>
                          <td>
                            <span
                              className={`${styles.typeBadge} ${
                                isAbono
                                  ? styles.typeAbono
                                  : isCompra
                                    ? styles.typeCompra
                                    : styles.typeAjuste
                              }`}
                            >
                              {isAbono
                                ? "Abono"
                                : isCompra
                                  ? "Compra"
                                  : "Ajuste"}
                            </span>
                          </td>
                          <td className={styles.tdDesc}>
                            {mov.descripcion || "—"}
                          </td>
                          <td
                            className={`${styles.right} ${styles.tdMonto} ${
                              isAbono
                                ? styles.metricSuccess
                                : isCompra
                                  ? styles.tdCompra
                                  : ""
                            }`}
                          >
                            {mov.monto < 0 ? "−" : "+"}
                            {formatMoneda(Math.abs(mov.monto))}
                          </td>
                          <td className={`${styles.right} ${styles.tdSaldo}`}>
                            {formatMoneda(mov.saldoResultante)}
                          </td>
                          <td className={styles.tdMuted}>
                            {mov.metodo_pago || "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCreditPanel;