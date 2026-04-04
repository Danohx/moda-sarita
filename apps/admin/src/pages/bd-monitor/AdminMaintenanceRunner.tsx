import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  History,
  RefreshCw,
  Search,
  Table2,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/AdminMaintenanceRunner.module.css";
import { maintenanceService } from "@admin/services/maintenance.service";
import { monitoringService } from "@admin/services/monitoring.service";
import type { DbVacuum } from "./types";
import AdminBreadcrumbs from "./components/AdminBreadcrumbs";

function formatDate(value?: string | null) {
  if (!value) return "Nunca";

  return new Date(value).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AdminMaintenanceRunner: React.FC = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState<DbVacuum[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [runningAll, setRunningAll] = useState<boolean>(false);
  const [runningSelected, setRunningSelected] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      setError(null);

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [vacuumData, availableTables] = await Promise.all([
        monitoringService.getVacuum(),
        maintenanceService.getTables(),
      ]);

      setRows(vacuumData ?? []);
      setTables(availableTables ?? []);
    } catch (err) {
      console.error(err);
      setRows([]);
      setTables([]);
      setError("No se pudo cargar la información de mantenimiento.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return rows;

    return rows.filter((row) =>
      `${row.schemaname}.${row.relname}`.toLowerCase().includes(normalized),
    );
  }, [rows, query]);

  const totalDeadTuples = useMemo(() => {
    return rows.reduce((acc, row) => acc + Number(row.n_dead_tup ?? 0), 0);
  }, [rows]);

  const monitoredTables = rows.length;
  const executableTables = tables.length;

  const handleRunAll = async () => {
    try {
      setError(null);
      setRunningAll(true);
      await maintenanceService.run();
      await loadData(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo ejecutar el mantenimiento global.");
    } finally {
      setRunningAll(false);
    }
  };

  const handleRunSelected = async () => {
    if (!selectedTable) return;

    try {
      setError(null);
      setRunningSelected(true);
      await maintenanceService.run({ tables: [selectedTable] });
      await loadData(true);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo ejecutar el mantenimiento de la tabla seleccionada.",
      );
    } finally {
      setRunningSelected(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <AdminBreadcrumbs
            items={[
              { label: "Monitoreo BD", to: "/bd-monitor" },
              { label: "Mantenimiento", to: "/maintenance" },
              { label: "Ejecutar mantenimiento" },
            ]}
          />
          <h1 className={styles.title}>Ejecutar Mantenimiento</h1>
          <p className={styles.subtitle}>
            Ejecuta VACUUM ANALYZE global o por tabla y revisa el estado actual
            de las tablas monitoreadas.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => void loadData(true)}
            disabled={refreshing || runningAll || runningSelected}
          >
            <RefreshCw
              size={18}
              className={refreshing ? styles.spinning : ""}
            />
            Actualizar
          </button>

          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => navigate("/maintenance")}
          >
            <History size={18} />
            Ver historial
          </button>
        </div>
      </section>

      {error ? <div className={styles.alertCard}>{error}</div> : null}

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Database size={18} />
          </div>

          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Tablas monitoreadas</span>
            <strong className={styles.metricValue}>{monitoredTables}</strong>
            <span className={styles.metricHint}>
              Tablas reportadas por monitoreo actual
            </span>
          </div>
        </article>

        <article className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Table2 size={18} />
          </div>

          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Dead tuples acumulados</span>
            <strong className={styles.metricValue}>{totalDeadTuples}</strong>
            <span className={styles.metricHint}>
              Suma total detectada en las tablas monitoreadas
            </span>
          </div>
        </article>

        <article className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Wrench size={18} />
          </div>

          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Tablas ejecutables</span>
            <strong className={styles.metricValue}>{executableTables}</strong>
            <span className={styles.metricHint}>
              Disponibles para mantenimiento individual
            </span>
          </div>
        </article>
      </section>

      <section className={styles.actionsCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Acciones operativas</h2>
            <p className={styles.sectionSubtitle}>
              Busca una tabla específica, selecciónala y ejecuta mantenimiento
              individual o corre mantenimiento global.
            </p>
          </div>
        </div>

        <div className={styles.actionsGrid}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tabla por esquema o nombre"
            />
          </div>

          <select
            className={styles.select}
            value={selectedTable}
            onChange={(event) => setSelectedTable(event.target.value)}
          >
            <option value="">Selecciona una tabla</option>
            {tables.map((tableName) => (
              <option key={tableName} value={tableName}>
                {tableName}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => void handleRunSelected()}
            disabled={
              !selectedTable || runningSelected || runningAll || loading
            }
          >
            <Table2 size={18} />
            {runningSelected ? "Ejecutando..." : "Mantener tabla"}
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => void handleRunAll()}
            disabled={runningAll || runningSelected || loading}
          >
            <Wrench size={18} />
            {runningAll ? "Ejecutando..." : "Mantener todo"}
          </button>
        </div>

        <p className={styles.helperText}>
          El mantenimiento por tabla ejecuta la acción solo sobre el objeto
          seleccionado. El mantenimiento global recorre todas las tablas
          permitidas por el backend.
        </p>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Estado por tabla</h2>
            <p className={styles.sectionSubtitle}>
              Vista técnica del estado de vacuum y autovacuum por tabla.
            </p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            Cargando estado de tablas...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className={styles.emptyState}>
            No hay tablas que coincidan con la búsqueda actual.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tabla</th>
                  <th>Registros vivos</th>
                  <th>Dead tuples</th>
                  <th>Último vacuum</th>
                  <th>Último autovacuum</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const fullName = `${row.schemaname}.${row.relname}`;
                  const deadTuples = Number(row.n_dead_tup ?? 0);
                  const deadTuplesClass =
                    deadTuples > 0
                      ? styles.deadTuplesHigh
                      : styles.deadTuplesNormal;

                  return (
                    <tr key={fullName}>
                      <td className={styles.tableName}>{fullName}</td>
                      <td className={styles.numberCell}>
                        {Number(row.n_live_tup ?? 0)}
                      </td>
                      <td className={`${styles.numberCell} ${deadTuplesClass}`}>
                        {deadTuples}
                      </td>
                      <td>{formatDate(row.last_vacuum)}</td>
                      <td>{formatDate(row.last_autovacuum)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminMaintenanceRunner;
