import { useEffect, useState, useMemo } from "react";
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

const fmt = (v: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    v,
  );

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

function getTone(diff: number): "success" | "danger" | "warning" {
  if (diff === 0) return "success";
  return diff < 0 ? "danger" : "warning";
}

const PAGE_SIZE = 5;

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
  const [selectedCorteIndex, setSelectedCorteIndex] = useState<number | null>(
    null,
  );

  const cajerosDisponibles = useMemo(() => {
    const nombres = cortes.map((c) => c.usuario_nombre);
    return ["Todos", ...Array.from(new Set(nombres))];
  }, [cortes]);

  const filtered = useMemo(() => {
    return cortes.filter((c) => {
      if (cajero !== "Todos" && c.usuario_nombre !== cajero) return false;
      if (estado === "abierto" && c.fin_turno) return false;
      if (estado === "cerrado" && !c.fin_turno) return false;
      if (soloDiff && c.fin_turno) {
        const diff = (c.total_real ?? 0) - c.total_sistema;
        if (diff === 0) return false;
      }
      if (busqueda) {
        const q = busqueda.toLowerCase();
        if (
          !c.usuario_nombre.toLowerCase().includes(q) &&
          !String(c.id).includes(q)
        )
          return false;
      }
      return true;
    });
  }, [cortes, cajero, estado, soloDiff, busqueda]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const cerrados = cortes.filter((c) => c.fin_turno);
    const abiertos = cortes.filter((c) => !c.fin_turno);
    const conDiff = cerrados.filter(
      (c) => (c.total_real ?? c.total_sistema) !== c.total_sistema,
    );
    const totalVentas = cerrados.reduce(
      (s, c) => s + Number(c.total_sistema),
      0,
    );
    return {
      cerrados: cerrados.length,
      abiertos: abiertos.length,
      conDiff: conDiff.length,
      totalVentas,
    };
  }, [cortes]);

  const loadHistorial = async () => {
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
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const handleVerDetalle = (id: string | number) => {
    const index = filtered.findIndex((c) => c.id === id);
    if (index !== -1) {
      setSelectedCorteIndex(index);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            <AdminBreadcrumbs items={[{ label: "Corte de Caja", to: "/corte" }, { label: "Historial de cortes" }]} />
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
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "6px",
            margin: "0 24px",
          }}
        >
          <AlertTriangle
            size={16}
            style={{
              display: "inline",
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          {error}
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar cajero o ID de corte..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <Calendar size={13} />
          <div className={styles.segmented}>
            {(["hoy", "semana", "mes", "personalizado"] as RangoFiltro[]).map(
              (r) => (
                <button
                  key={r}
                  type="button"
                  className={rango === r ? styles.segActive : ""}
                  onClick={() => {
                    setRango(r);
                    setPage(1);
                  }}
                >
                  {r === "personalizado"
                    ? "Custom"
                    : r.charAt(0).toUpperCase() + r.slice(1)}
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
              onChange={(e) => setFechaDesde(e.target.value)}
            />
            <span>–</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        )}

        <div className={styles.selectWrap}>
          <User size={13} />
          <select
            value={cajero}
            onChange={(e) => {
              setCajero(e.target.value);
              setPage(1);
            }}
          >
            {cajerosDisponibles.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={13} />
        </div>

        <div className={styles.selectWrap}>
          <Filter size={13} />
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as EstadoFiltro);
              setPage(1);
            }}
          >
            <option value="todos">Todos</option>
            <option value="cerrado">Cerrados</option>
            <option value="abierto">Abiertos</option>
          </select>
          <ChevronDown size={13} />
        </div>

        <button
          type="button"
          className={`${styles.toggleBtn} ${soloDiff ? styles.toggleActive : ""}`}
          onClick={() => {
            setSoloDiff((p) => !p);
            setPage(1);
          }}
        >
          <AlertTriangle size={13} />
          Solo diferencias
        </button>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.skeleton}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={styles.skeletonRow}
                style={{ animationDelay: `${i * 0.08}s` }}
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
              {paginated.map((c) => {
                const isClosed = !!c.fin_turno;
                const diff = isClosed
                  ? (c.total_real ?? 0) - c.total_sistema
                  : null;
                const tone = diff !== null ? getTone(diff) : null;

                return (
                  <tr key={c.id} className={styles.row}>
                    <td className={styles.idCell}>
                      <span className={styles.idBadge}>
                        #{String(c.id).slice(0, 8)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <span className={styles.dateMain}>
                          {fmtFecha(c.inicio_turno)}
                        </span>
                        <span className={styles.dateSub}>
                          {fmtHora(c.inicio_turno)}
                        </span>
                      </div>
                    </td>
                    <td>
                      {isClosed ? (
                        <div className={styles.dateCell}>
                          <span className={styles.dateMain}>
                            {fmtFecha(c.fin_turno!)}
                          </span>
                          <span className={styles.dateSub}>
                            {fmtHora(c.fin_turno!)}
                          </span>
                        </div>
                      ) : (
                        <span className={styles.enCurso}>En curso…</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.cajeroCell}>
                        <div className={styles.avatar}>
                          {c.usuario_nombre
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <span>{c.usuario_nombre}</span>
                      </div>
                    </td>
                    <td className={styles.moneyCell}>{fmt(c.total_sistema)}</td>
                    <td className={styles.moneyCell}>
                      {isClosed ? fmt(c.total_real ?? 0) : "---"}
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
                        onClick={() => handleVerDetalle(c.id)}
                        title="Ver detalle"
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={15} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                type="button"
                className={page === i + 1 ? styles.pageActive : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {selectedCorteIndex !== null && (
        <CorteDetalleModal
          corte={filtered[selectedCorteIndex]}
          onClose={() => setSelectedCorteIndex(null)}
          onPrev={() =>
            setSelectedCorteIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : prev,
            )
          }
          onNext={() =>
            setSelectedCorteIndex((prev) =>
              prev !== null && prev < filtered.length - 1 ? prev + 1 : prev,
            )
          }
          hasPrev={selectedCorteIndex > 0}
          hasNext={selectedCorteIndex < filtered.length - 1}
        />
      )}
    </div>
  );
}
