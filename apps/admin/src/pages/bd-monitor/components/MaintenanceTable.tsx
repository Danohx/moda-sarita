import { useEffect, useState, useCallback, useMemo } from "react";
import { RefreshCw, Wrench, Search } from "lucide-react";
import styles from "../../../../styles/Inventory.module.css";
import { monitoringService } from "@admin/services/monitoring.service";
import type { DbVacuum } from "../types";
import { maintenanceService } from "@admin/services/maintenance.service";

function formatDate(value: string | null): string {
  if (!value) return "Nunca";

  return new Date(value).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const MaintenanceTable = () => {
  const [data, setData] = useState<DbVacuum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAll, setRunningAll] = useState<boolean>(false);
  const [runningSelected, setRunningSelected] = useState<boolean>(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [vacuumData, tablesData] = await Promise.all([
        monitoringService.getVacuum(),
        maintenanceService.getTables(),
      ]);

      setData(vacuumData ?? []);
      setAvailableTables(tablesData ?? []);
    } catch (err) {
      console.error(err);
      setData([]);
      setAvailableTables([]);
      setError("No se pudieron cargar los datos de mantenimiento.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return data;

    return data.filter((row) =>
      `${row.schemaname}.${row.relname}`.toLowerCase().includes(normalized),
    );
  }, [data, query]);

  const handleRunAll = async () => {
    try {
      setError(null);
      setRunningAll(true);
      await maintenanceService.run();
      await load();
    } catch (err) {
      console.error(err);
      setError("No se pudo ejecutar el mantenimiento general.");
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
      await load();
    } catch (err) {
      console.error(err);
      setError("No se pudo ejecutar el mantenimiento de la tabla seleccionada.");
    } finally {
      setRunningSelected(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.centerState}>
          <RefreshCw size={18} className={styles.spinning} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.sectionTitle}>Mantenimiento de tablas</h3>
      </div>

      {error ? <p style={{ marginBottom: 12 }}>{error}</p> : null}

      <div className={styles.filtersCard} style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr) auto auto",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar tabla por esquema o nombre"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className={styles.select}
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Selecciona una tabla</option>
            {availableTables.map((tableName) => (
              <option key={tableName} value={tableName}>
                {tableName}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={styles.actionBtnSecondary}
            onClick={() => void handleRunSelected()}
            disabled={!selectedTable || runningSelected || runningAll}
          >
            {runningSelected ? (
              <>
                <RefreshCw size={16} className={styles.spinning} />
                Ejecutando...
              </>
            ) : (
              <>
                <Wrench size={16} />
                Mantener tabla
              </>
            )}
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => void handleRunAll()}
            disabled={runningAll || runningSelected}
          >
            {runningAll ? (
              <>
                <RefreshCw size={16} className={styles.spinning} />
                Ejecutando...
              </>
            ) : (
              <>
                <Wrench size={16} />
                Mantener todo
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className={styles.tableWrapper}
        style={{
          maxHeight: "520px",
          overflow: "auto",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--border-radius-large)",
        }}
      >
        <table className={styles.table}>
          <thead
            style={{
              position: "sticky",
              top: 0,
              background: "var(--color-surface)",
              zIndex: 1,
            }}
          >
            <tr>
              <th>Tabla</th>
              <th>Registros vivos</th>
              <th>Dead tuples</th>
              <th>Último vacuum</th>
              <th>Último autovacuum</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((m) => (
              <tr key={`${m.schemaname}.${m.relname}`}>
                <td>{m.schemaname}.{m.relname}</td>
                <td>{m.n_live_tup}</td>
                <td>{m.n_dead_tup}</td>
                <td>{formatDate(m.last_vacuum)}</td>
                <td>{formatDate(m.last_autovacuum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenanceTable;