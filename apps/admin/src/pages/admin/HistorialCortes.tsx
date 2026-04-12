import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  History,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock3,
  User,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import styles from "../../../styles/HistorialCortes.module.css";
import { ventasService } from "@admin/services/ventas.service";
import CorteDetalleModal from "../../components/components/CorteDetalleModal";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";

interface CorteHistorial {
  id: string | number;
  usuario_id: string | number;
  usuario_nombre: string;
  inicio_turno: string;
  fin_turno: string | null;
  total_sistema: number;
  total_real: number | null;
  observaciones: string | null;
}

interface ApiError {
  response?: {
    data?: {
      msg?: string;
      detail?: string;
    };
  };
  message?: string;
}

type EstadoFiltro = "todos" | "abierto" | "cerrado";
type RangoFiltro = "hoy" | "semana" | "mes" | "personalizado";
type Tone = "success" | "danger" | "warning";

const PAGE_SIZE = 5;
const CURRENCY_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const fmt = (value: number) => CURRENCY_FORMATTER.format(value);

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtHora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

function getTone(diff: number): Tone {
  if (diff === 0) return "success";
  return diff < 0 ? "danger" : "warning";
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateRange(
  rango: RangoFiltro,
  fechaDesde: string,
  fechaHasta: string,
) {
  const now = new Date();
  const today = normalizeDate(now);

  if (rango === "hoy") {
    const start = today;
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (rango === "semana") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    const end = new Date(today);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (rango === "mes") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { start, end };
  }

  const start = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
  const end = fechaHasta ? new Date(`${fechaHasta}T23:59:59.999`) : null;
  return { start, end };
}

function isWithinRange(
  iso: string,
  range: { start: Date | null; end: Date | null },
) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  if (range.start && date < range.start) return false;
  if (range.end && date > range.end) return false;
  return true;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function HistorialCortes() {
  const [cortes, setCortes] = useState<CorteHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rango, setRango] = useState<RangoFiltro>("mes");
  const [cajero, setCajero] = useState("Todos");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");
  const [soloDiff, setSoloDiff] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [page, setPage] = useState(1);
  const [selectedCorteId, setSelectedCorteId] = useState<
    string | number | null
  >(null);

  const searchQuery = useMemo(() => busqueda.trim().toLowerCase(), [busqueda]);
  const activeRange = useMemo(
    () => getDateRange(rango, fechaDesde, fechaHasta),
    [rango, fechaDesde, fechaHasta],
  );

  const cajerosDisponibles = useMemo(() => {
    const nombres = cortes.map((corte) => corte.usuario_nombre);
    return ["Todos", ...Array.from(new Set(nombres))];
  }, [cortes]);

  const filtered = useMemo(() => {
    return cortes.filter((corte) => {
      if (!isWithinRange(corte.inicio_turno, activeRange)) return false;
      if (cajero !== "Todos" && corte.usuario_nombre !== cajero) return false;
      if (estado === "abierto" && corte.fin_turno) return false;
      if (estado === "cerrado" && !corte.fin_turno) return false;

      if (soloDiff && corte.fin_turno) {
        const diff = (corte.total_real ?? 0) - corte.total_sistema;
        if (diff === 0) return false;
      }

      if (searchQuery) {
        const matchesName = corte.usuario_nombre
          .toLowerCase()
          .includes(searchQuery);
        const matchesId = String(corte.id).toLowerCase().includes(searchQuery);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [activeRange, cajero, cortes, estado, searchQuery, soloDiff]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => {
    const cerrados = cortes.filter((corte) => corte.fin_turno);
    const abiertos = cortes.filter((corte) => !corte.fin_turno);
    const conDiff = cerrados.filter(
      (corte) =>
        (corte.total_real ?? corte.total_sistema) !== corte.total_sistema,
    );

    const totalVentas = cerrados.reduce(
      (sum, corte) => sum + Number(corte.total_sistema),
      0,
    );

    return {
      cerrados: cerrados.length,
      abiertos: abiertos.length,
      conDiff: conDiff.length,
      totalVentas,
    };
  }, [cortes]);

  const selectedCorteIndex = useMemo(
    () => filtered.findIndex((corte) => corte.id === selectedCorteId),
    [filtered, selectedCorteId],
  );

  const selectedCorte =
    selectedCorteIndex >= 0 ? filtered[selectedCorteIndex] : null;

  useEffect(() => {
    if (selectedCorteId === null) return;
    const stillExists = filtered.some((corte) => corte.id === selectedCorteId);
    if (!stillExists) {
      setSelectedCorteId(null);
    }
  }, [filtered, selectedCorteId]);

  const loadHistorial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ventasService.getHistorialCortes();
      setCortes(data as CorteHistorial[]);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg =
        apiErr.response?.data?.msg ||
        apiErr.message ||
        "Error al cargar historial.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistorial();
  }, [loadHistorial]);

  // ─── Refs para handlePrev/handleNext estables ───────────────────────────────
  // Se evita recrear las callbacks cuando filtered o selectedCorteIndex cambian,
  // lo que evita que el modal reciba nuevas referencias de props en cada render.
  const filteredRef = useRef(filtered);
  const selectedCorteIndexRef = useRef(selectedCorteIndex);

  useEffect(() => {
    filteredRef.current = filtered;
  }, [filtered]);

  useEffect(() => {
    selectedCorteIndexRef.current = selectedCorteIndex;
  }, [selectedCorteIndex]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBusqueda(event.target.value);
      setPage(1);
    },
    [],
  );

  const handleRangoChange = useCallback((nextRange: RangoFiltro) => {
    setRango(nextRange);
    setPage(1);
  }, []);

  const handleCajeroChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCajero(event.target.value);
      setPage(1);
    },
    [],
  );

  const handleEstadoChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setEstado(event.target.value as EstadoFiltro);
      setPage(1);
    },
    [],
  );

  const handleToggleDiff = useCallback(() => {
    setSoloDiff((prev) => !prev);
    setPage(1);
  }, []);

  const handleOpenDetail = useCallback((id: string | number) => {
    setSelectedCorteId(id);
  }, []);

  // Sin dependencias → referencia estable siempre.
  // Leen el estado actual mediante refs para no necesitar las vars directamente.
  const handlePrev = useCallback(() => {
    const idx = selectedCorteIndexRef.current;
    if (idx <= 0) return;
    setSelectedCorteId(filteredRef.current[idx - 1]?.id ?? null);
  }, []);

  const handleNext = useCallback(() => {
    const idx = selectedCorteIndexRef.current;
    if (idx < 0 || idx >= filteredRef.current.length - 1) return;
    setSelectedCorteId(filteredRef.current[idx + 1]?.id ?? null);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <AdminBreadcrumbs
              items={[
                { label: "Corte de Caja", to: "/corte" },
                { label: "Historial de cortes" },
              ]}
            />
            <span className={styles.badge}>
              <History size={14} /> Historial de cortes
            </span>
            <h1 className={styles.title}>Registro de turnos</h1>
            <p className={styles.subtitle}>
              Consulta y audita todos los cortes de caja de tu negocio.
            </p>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span>Cerrados</span>
              <strong>{stats.cerrados}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statOpen}`}>
              <span>Abiertos</span>
              <strong>{stats.abiertos}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statDiff}`}>
              <span>Con diferencia</span>
              <strong>{stats.conDiff}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statVentas}`}>
              <span>Total ventas (mes)</span>
              <strong>{fmt(stats.totalVentas)}</strong>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar cajero o ID de corte..."
            value={busqueda}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <Calendar size={13} />
          <div className={styles.segmented}>
            {(["hoy", "semana", "mes", "personalizado"] as RangoFiltro[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  className={rango === item ? styles.segActive : ""}
                  onClick={() => handleRangoChange(item)}
                >
                  {item === "personalizado"
                    ? "Custom"
                    : item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>

        {rango === "personalizado" && (
          <div className={styles.dateRange}>
            <input
              type="date"
              value={fechaDesde}
              onChange={(event) => {
                setFechaDesde(event.target.value);
                setPage(1);
              }}
            />
            <span>–</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(event) => {
                setFechaHasta(event.target.value);
                setPage(1);
              }}
            />
          </div>
        )}

        <div className={styles.selectWrap}>
          <User size={13} />
          <select value={cajero} onChange={handleCajeroChange}>
            {cajerosDisponibles.map((nombreCajero) => (
              <option key={nombreCajero}>{nombreCajero}</option>
            ))}
          </select>
          <ChevronDown size={13} />
        </div>

        <div className={styles.selectWrap}>
          <Filter size={13} />
          <select value={estado} onChange={handleEstadoChange}>
            <option value="todos">Todos</option>
            <option value="cerrado">Cerrados</option>
            <option value="abierto">Abiertos</option>
          </select>
          <ChevronDown size={13} />
        </div>

        <button
          type="button"
          className={`${styles.toggleBtn} ${soloDiff ? styles.toggleActive : ""}`}
          onClick={handleToggleDiff}
          aria-pressed={soloDiff}
        >
          <AlertTriangle size={13} />
          Solo diferencias
        </button>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.skeleton}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={styles.skeletonRow}
                style={{ animationDelay: `${index * 0.08}s` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Wallet size={32} />
            <p>No se encontraron cortes con los filtros seleccionados.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>
                  <Clock3 size={12} /> Apertura
                </th>
                <th>
                  <Clock3 size={12} /> Cierre
                </th>
                <th>
                  <User size={12} /> Cajero
                </th>
                <th>Esperado</th>
                <th>Real</th>
                <th>Diferencia</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((corte) => {
                const isClosed = Boolean(corte.fin_turno);
                const diff = isClosed
                  ? (corte.total_real ?? 0) - corte.total_sistema
                  : null;
                const tone = diff !== null ? getTone(diff) : null;

                return (
                  <tr key={corte.id} className={styles.row}>
                    <td className={styles.idCell}>
                      <span className={styles.idBadge}>
                        #{String(corte.id).slice(0, 8)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <span className={styles.dateMain}>
                          {fmtFecha(corte.inicio_turno)}
                        </span>
                        <span className={styles.dateSub}>
                          {fmtHora(corte.inicio_turno)}
                        </span>
                      </div>
                    </td>
                    <td>
                      {isClosed ? (
                        <div className={styles.dateCell}>
                          <span className={styles.dateMain}>
                            {fmtFecha(corte.fin_turno as string)}
                          </span>
                          <span className={styles.dateSub}>
                            {fmtHora(corte.fin_turno as string)}
                          </span>
                        </div>
                      ) : (
                        <span className={styles.enCurso}>En curso…</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.cajeroCell}>
                        <div className={styles.avatar}>
                          {getInitials(corte.usuario_nombre)}
                        </div>
                        <span>{corte.usuario_nombre}</span>
                      </div>
                    </td>
                    <td className={styles.moneyCell}>
                      {fmt(corte.total_sistema)}
                    </td>
                    <td className={styles.moneyCell}>
                      {isClosed ? fmt(corte.total_real ?? 0) : "---"}
                    </td>
                    <td>
                      {diff !== null && tone ? (
                        <span
                          className={`${styles.diffPill} ${styles[`pill_${tone}`]}`}
                        >
                          {tone === "success" && <CheckCircle2 size={11} />}
                          {tone === "danger" && <TrendingDown size={11} />}
                          {tone === "warning" && <TrendingUp size={11} />}
                          {tone === "success" ? "Exacto" : fmt(diff)}
                        </span>
                      ) : (
                        <span className={styles.pendPill}>Pendiente</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.estadoPill} ${isClosed ? styles.estadoClosed : styles.estadoOpen}`}
                      >
                        {isClosed ? "Cerrado" : "Abierto"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => handleOpenDetail(corte.id)}
                        title="Ver detalle"
                        aria-label={`Ver detalle del corte ${corte.id}`}
                      >
                        <Eye size={14} />
                        <ArrowUpRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}{" "}
            cortes
          </span>
          <div className={styles.pageButtons}>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  className={page === pageNumber ? styles.pageActive : ""}
                  onClick={() => setPage(pageNumber)}
                  aria-label={`Ir a la página ${pageNumber}`}
                  aria-current={page === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      <CorteDetalleModal
        corte={selectedCorte}
        onClose={() => setSelectedCorteId(null)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={selectedCorteIndex > 0}
        hasNext={
          selectedCorteIndex >= 0 && selectedCorteIndex < filtered.length - 1
        }
      />
    </div>
  );
}