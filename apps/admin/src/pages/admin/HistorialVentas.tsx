import { useCallback, useEffect, useMemo, useState, memo } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  X,
  Filter,
} from "lucide-react";
import styles from "../../../styles/HistorialVentas.module.css";
import {
  ventasService,
  type VentaHistorial,
  type VentaHistorialDetalle,
} from "@admin/services/ventas.service";

type HistorialVentasPOSProps = {
  onOpenTicket?: (venta: VentaHistorial) => void;
};

const ESTADOS = [
  { value: "", label: "Todos los estados" },
  { value: "PAGADO", label: "Pagado" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "DEVUELTO", label: "Devuelto" },
];

const METODOS = [
  { value: "", label: "Todos los métodos" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA_CREDITO", label: "Tarjeta de crédito" },
  { value: "TARJETA_DEBITO", label: "Tarjeta de débito" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "CREDITO_TIENDA", label: "Crédito de tienda" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// ─── Helpers ──────────────────────────────────────────────────────────

function formatMoneda(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value || 0);
}

function formatFecha(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getEstadoClass(estado: string) {
  const normalized = estado.toUpperCase();
  if (normalized === "PAGADO") return styles.estadoPagado;
  if (normalized === "PENDIENTE") return styles.estadoPendiente;
  if (normalized === "CANCELADO") return styles.estadoCancelado;
  if (normalized === "DEVUELTO") return styles.estadoDevuelto;
  return styles.estadoDefault;
}

function formatMetodoPago(metodo: string | null | undefined): string {
  if (!metodo) return "—";
  const formatos: Record<string, string> = {
    EFECTIVO: "Efectivo",
    TARJETA_CREDITO: "Tarjeta de crédito",
    TARJETA_DEBITO: "Tarjeta de débito",
    TRANSFERENCIA: "Transferencia",
    CREDITO_TIENDA: "Crédito de tienda",
  };
  return formatos[metodo.toUpperCase()] || metodo;
}

function getMetodoBadgeClass(metodo: string | null | undefined): string {
  const normalized = metodo?.toUpperCase() || "";
  if (normalized === "EFECTIVO") return styles.metodoEfectivo;
  if (normalized === "TARJETA_CREDITO" || normalized === "TARJETA_DEBITO")
    return styles.metodoTarjeta;
  if (normalized === "TRANSFERENCIA") return styles.metodoTransferencia;
  if (normalized === "CREDITO_TIENDA") return styles.metodoCredito;
  return styles.metodoDefault;
}

function EmptyValue({ children = "—" }: { children?: string }) {
  return <span className={styles.emptyValue}>{children}</span>;
}

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      <td>
        <div className={styles.skeleton} style={{ width: "120px" }}></div>
      </td>
      <td>
        <div className={styles.skeleton} style={{ width: "80px" }}></div>
      </td>
      <td>
        <div className={styles.skeleton} style={{ width: "140px" }}></div>
      </td>
      <td>
        <div className={styles.skeleton} style={{ width: "120px" }}></div>
      </td>
      <td>
        <div className={styles.skeleton} style={{ width: "100px" }}></div>
      </td>
      <td className={styles.center}>
        <div
          className={styles.skeleton}
          style={{ width: "40px", margin: "0 auto" }}
        ></div>
      </td>
      <td className={styles.right}>
        <div
          className={styles.skeleton}
          style={{ width: "90px", marginLeft: "auto" }}
        ></div>
      </td>
      <td>
        <div className={styles.skeleton} style={{ width: "100px" }}></div>
      </td>
      <td>
        <div
          className={styles.skeleton}
          style={{ width: "120px", marginLeft: "auto" }}
        ></div>
      </td>
    </tr>
  );
}

// ─── Modal memoizado ──────────────────────────────────────────────────

const ModalDetalle = memo(function ModalDetalle({
  detalle,
  loadingDetalle,
  onOpenTicket,
  cerrarDetalle,
}: {
  detalle: VentaHistorialDetalle | null;
  loadingDetalle: boolean;
  onOpenTicket?: (venta: VentaHistorial) => void;
  cerrarDetalle: () => void;
}) {
  return (
    <>
      <header className={styles.modalHeader}>
        <div className={styles.modalHeaderContent}>
          <p className={styles.kicker}>Detalle de venta</p>
          <h3>{detalle ? detalle.venta.folioLabel : "Cargando…"}</h3>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={cerrarDetalle}
          aria-label="Cerrar detalle"
        >
          <X size={18} />
        </button>
      </header>

      <div className={styles.modalBody}>
        {loadingDetalle && (
          <div className={styles.loadingState}>
            <RefreshCw size={24} className={styles.spinning} />
            <span>Cargando detalle…</span>
          </div>
        )}

        {detalle && (
          <>
            <section className={styles.detailGrid}>
              <article className={styles.detailCard}>
                <div className={styles.detailCardIcon}>
                  <User size={18} />
                </div>
                <div className={styles.detailCardContent}>
                  <span>Cliente</span>
                  <strong>{detalle.venta.clienteNombre || "—"}</strong>
                  {detalle.venta.clienteTelefono && (
                    <small>Tel. {detalle.venta.clienteTelefono}</small>
                  )}
                  {detalle.venta.clienteEmail && (
                    <small>{detalle.venta.clienteEmail}</small>
                  )}
                </div>
              </article>

              <article className={styles.detailCard}>
                <div className={styles.detailCardIcon}>
                  <User size={18} />
                </div>
                <div className={styles.detailCardContent}>
                  <span>Vendedor</span>
                  <strong>{detalle.venta.vendedorNombre || "—"}</strong>
                  {detalle.venta.vendedorEmail && (
                    <small>{detalle.venta.vendedorEmail}</small>
                  )}
                </div>
              </article>

              <article className={styles.detailCard}>
                <div className={styles.detailCardIcon}>
                  <Calendar size={18} />
                </div>
                <div className={styles.detailCardContent}>
                  <span>Fecha y estado</span>
                  <strong>{formatFecha(detalle.venta.fechaCreacion)}</strong>
                  <span
                    className={`${styles.estadoBadge} ${getEstadoClass(detalle.venta.estado)}`}
                  >
                    {detalle.venta.estadoLabel}
                  </span>
                </div>
              </article>
            </section>

            {detalle.venta.observaciones && (
              <div className={styles.noteBox}>
                <strong>Observaciones:</strong> {detalle.venta.observaciones}
              </div>
            )}

            <section className={styles.modalSection}>
              <h4>Productos vendidos</h4>
              <div className={styles.tableScrollSmall}>
                <table className={styles.innerTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>SKU</th>
                      <th>Variante</th>
                      <th className={styles.center}>Cant.</th>
                      <th className={styles.right}>Precio unit.</th>
                      <th className={styles.right}>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.detalles.map((item) => (
                      <tr key={item.id}>
                        <td>{item.productoNombre}</td>
                        <td>{item.sku || <EmptyValue />}</td>
                        <td>
                          {[item.tallaNombre, item.colorNombre]
                            .filter(Boolean)
                            .join(" / ") || <EmptyValue />}
                        </td>
                        <td className={styles.center}>{item.cantidad}</td>
                        <td className={styles.right}>
                          {formatMoneda(item.precioUnitario)}
                        </td>
                        <td className={styles.right}>
                          <strong>{formatMoneda(item.importe)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.modalSection}>
              <h4>Pagos registrados</h4>
              <div className={styles.tableScrollSmall}>
                <table className={styles.innerTable}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Método</th>
                      <th>Concepto</th>
                      <th>Referencia</th>
                      <th>Registró</th>
                      <th className={styles.right}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.pagos.map((pago) => (
                      <tr key={pago.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatFecha(pago.fechaPago)}
                        </td>
                        <td>
                          <span
                            className={`${styles.metodoBadge} ${getMetodoBadgeClass(pago.metodo)}`}
                          >
                            {formatMetodoPago(pago.metodo)}
                          </span>
                        </td>
                        <td>{pago.conceptoLabel}</td>
                        <td>{pago.referenciaExterna || <EmptyValue />}</td>
                        <td>{pago.usuarioNombre}</td>
                        <td className={styles.right}>
                          <strong>{formatMoneda(pago.monto)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={styles.totalsBox}>
              <div className={styles.totalItem}>
                <span>Subtotal</span>
                <strong>{formatMoneda(detalle.venta.subtotal)}</strong>
              </div>
              <div className={styles.totalItem}>
                <span>Descuento</span>
                <strong>{formatMoneda(detalle.venta.descuento)}</strong>
              </div>
              <div className={`${styles.totalItem} ${styles.totalLine}`}>
                <span>Total</span>
                <strong>{formatMoneda(detalle.venta.total)}</strong>
              </div>
              <div className={styles.totalItem}>
                <span>Pagado</span>
                <strong>{formatMoneda(detalle.venta.totalPagado)}</strong>
              </div>
            </section>
          </>
        )}
      </div>

      <footer className={styles.modalFooter}>
        {detalle && onOpenTicket && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onOpenTicket(detalle.venta)}
          >
            <ReceiptText size={15} />
            <span>Reimprimir ticket</span>
          </button>
        )}
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={cerrarDetalle}
        >
          <span>Cerrar</span>
        </button>
      </footer>
    </>
  );
});

// ─── Componente principal ─────────────────────────────────────────────

export default function HistorialVentasPOS({
  onOpenTicket,
}: HistorialVentasPOSProps) {
  const [ventas, setVentas] = useState<VentaHistorial[]>([]);
  const [detalle, setDetalle] = useState<VentaHistorialDetalle | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [metodo, setMetodo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [, setTicketLoadingId] = useState<string | null>(null);

  const totalPages = Math.max(Math.ceil(total / rowsPerPage), 1);

  const filtros = useMemo(
    () => ({
      q: q.trim(),
      estado,
      metodo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    }),
    [estado, fechaFin, fechaInicio, metodo, page, q, rowsPerPage],
  );

  const cargarVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ventasService.list(filtros);
      setVentas(response.data);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el historial de ventas.",
      );
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    void cargarVentas();
  }, [cargarVentas]);

  const resetPage = () => setPage(0);

  const limpiarFiltros = () => {
    setQ("");
    setEstado("");
    setMetodo("");
    setFechaInicio("");
    setFechaFin("");
    setPage(0);
  };

  const abrirDetalle = async (venta: VentaHistorial) => {
    setModalOpen(true);
    setDetalle(null);
    setLoadingDetalle(true);
    setError(null);
    try {
      const data = await ventasService.getById(venta.id);
      setDetalle(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el detalle de la venta.",
      );
      setModalOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarDetalle = useCallback(() => {
    setModalOpen(false);
    setDetalle(null);
  }, []);

  const hasFiltros = Boolean(q || estado || metodo || fechaInicio || fechaFin);

  async function handleOpenTicket(ventaId: string | number) {
    const id = String(ventaId);

    try {
      setTicketLoadingId(id);
      await ventasService.abrirTicketPdf(id, "reimpresion");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo abrir el ticket de venta.",
      );
    } finally {
      setTicketLoadingId(null);
    }
  }

  return (
    <section className={styles.wrapper}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.kicker}>Ventas / POS</p>
          <h2 className={styles.title}>Historial de ventas</h2>
          <p className={styles.subtitle}>
            Consulta folios, pagos, productos vendidos y el detalle de cada
            transacción.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconOnlyButton}
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            title={filtrosAbiertos ? "Ocultar filtros" : "Mostrar filtros"}
            aria-label="Alternar filtros"
          >
            <Filter size={18} />
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => void cargarVentas()}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={loading ? styles.spinning : undefined}
            />
            <span>{loading ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>
      </header>

      {/* ── Error ── */}
      {error && (
        <div className={styles.errorBox} role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button
            type="button"
            className={styles.errorCloseButton}
            onClick={() => setError(null)}
            aria-label="Cerrar mensaje de error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Filtros ── */}
      {filtrosAbiertos && (
        <section className={styles.filtersCard}>
          {/* Fila 1: Búsqueda */}
          <div className={styles.searchField}>
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                resetPage();
              }}
              placeholder="Buscar folio, cliente, vendedor, correo o teléfono…"
              aria-label="Buscar ventas"
            />
          </div>

          {/* Fila 2: Filtros */}
          <div className={styles.filtersRow}>
            <label className={styles.field}>
              <span>Estado</span>
              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  resetPage();
                }}
                aria-label="Filtrar por estado"
              >
                {ESTADOS.map((item) => (
                  <option key={item.value || "all-estados"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Método de pago</span>
              <select
                value={metodo}
                onChange={(e) => {
                  setMetodo(e.target.value);
                  resetPage();
                }}
                aria-label="Filtrar por método de pago"
              >
                {METODOS.map((item) => (
                  <option key={item.value || "all-metodos"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Desde</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  resetPage();
                }}
                aria-label="Fecha inicio"
              />
            </label>

            <label className={styles.field}>
              <span>Hasta</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value);
                  resetPage();
                }}
                aria-label="Fecha fin"
              />
            </label>

            <button
              type="button"
              className={styles.clearButton}
              onClick={limpiarFiltros}
              disabled={!hasFiltros || loading}
              title="Limpiar todos los filtros"
            >
              <X size={15} />
              <span>Limpiar</span>
            </button>
          </div>
        </section>
      )}

      {/* ── Resumen ── */}
      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <ShoppingBag size={20} />
          </div>
          <div className={styles.summaryContent}>
            <span>Ventas encontradas</span>
            <strong>{total.toLocaleString("es-MX")}</strong>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <CreditCard size={20} />
          </div>
          <div className={styles.summaryContent}>
            <span>Mostrando ahora</span>
            <strong>{ventas.length}</strong>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <Calendar size={20} />
          </div>
          <div className={styles.summaryContent}>
            <span>Página</span>
            <strong>
              {page + 1} / {totalPages}
            </strong>
          </div>
        </div>
      </section>

      {/* ── Tabla ── */}
      <section className={styles.tableCard}>
        <header className={styles.pagination}>
          <div className={styles.rowsSelector}>
            <span>Filas por página</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              aria-label="Seleccionar número de filas por página"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.pageControls}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0 || loading}
              aria-label="Página anterior"
            >
              <ChevronLeft size={15} />
              <span>Anterior</span>
            </button>

            <span className={styles.pageInfo}>
              Página <strong>{page + 1}</strong> de{" "}
              <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={page >= totalPages - 1 || loading}
              aria-label="Página siguiente"
            >
              <span>Siguiente</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </header>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Método</th>
                <th className={styles.center}>Artículos</th>
                <th className={styles.right}>Total</th>
                <th>Estado</th>
                <th className={styles.right}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <>
                  {Array.from({ length: rowsPerPage }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </>
              )}

              {!loading && ventas.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        <ShoppingBag size={48} />
                      </div>
                      <strong>Sin resultados</strong>
                      <span>No hay ventas que coincidan con los filtros.</span>
                      {hasFiltros && (
                        <button
                          type="button"
                          className={styles.clearFiltersButton}
                          onClick={limpiarFiltros}
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                ventas.map((venta) => (
                  <tr key={venta.id} className={styles.tableRow}>
                    <td className={styles.fechaCell}>
                      {formatFecha(venta.fechaCreacion)}
                    </td>
                    <td>
                      <strong className={styles.folio}>
                        {venta.folioLabel}
                      </strong>
                    </td>
                    <td>
                      <div className={styles.clienteCell}>
                        {venta.clienteNombre || <EmptyValue />}
                        {venta.clienteTelefono && (
                          <small className={styles.clienteInfo}>
                            {venta.clienteTelefono}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>{venta.vendedorNombre || <EmptyValue />}</td>
                    <td>
                      <span
                        className={`${styles.metodoBadge} ${getMetodoBadgeClass(venta.metodosPago)}`}
                      >
                        {formatMetodoPago(venta.metodosPago)}
                      </span>
                    </td>
                    <td className={styles.center}>
                      <span className={styles.articulosBadge}>
                        {venta.totalProductos}
                      </span>
                    </td>
                    <td className={styles.right}>
                      <strong className={styles.totalCell}>
                        {formatMoneda(venta.total)}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.estadoBadge} ${getEstadoClass(venta.estado)}`}
                      >
                        {venta.estadoLabel}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => void abrirDetalle(venta)}
                          title="Ver detalle de la venta"
                          aria-label={`Ver detalle de venta ${venta.folioLabel}`}
                        >
                          <Eye size={15} />
                          <span>Ver</span>
                        </button>

                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={() => handleOpenTicket(venta.id)}
                          title={
                            onOpenTicket
                              ? "Reimprimir ticket"
                              : "Ticket no disponible"
                          }
                          aria-label={`Reimprimir ticket ${venta.folioLabel}`}
                        >
                          <ReceiptText size={15} />
                          <span>Ticket</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <footer className={styles.pagination}>
          <div className={styles.rowsSelector}>
            <span>Filas por página</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              aria-label="Seleccionar número de filas por página"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.pageControls}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0 || loading}
              aria-label="Página anterior"
            >
              <ChevronLeft size={15} />
              <span>Anterior</span>
            </button>

            <span className={styles.pageInfo}>
              Página <strong>{page + 1}</strong> de{" "}
              <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={page >= totalPages - 1 || loading}
              aria-label="Página siguiente"
            >
              <span>Siguiente</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </footer>
      </section>

      {/* ── Modal detalle ── */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarDetalle();
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de venta"
          >
            <ModalDetalle
              detalle={detalle}
              loadingDetalle={loadingDetalle}
              onOpenTicket={onOpenTicket}
              cerrarDetalle={cerrarDetalle}
            />
          </div>
        </div>
      )}
    </section>
  );
}
