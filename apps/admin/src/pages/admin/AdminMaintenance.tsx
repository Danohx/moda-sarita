import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/Inventory.module.css";
import { maintenanceService } from "@admin/services/maintenance.service";
import type { MaintenanceJob } from "@shared/api/maintenance.api";
import AdminBreadcrumbs from "../bd-monitor/components/AdminBreadcrumbs";

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeStatusLabel(value: string) {
  switch (value) {
    case "completed":
      return "Completado";
    case "failed":
      return "Fallido";
    case "running":
      return "En ejecución";
    case "pending":
      return "Pendiente";
    default:
      return value;
  }
}

const AdminMaintenance: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  const loadItems = useCallback(async (isRefresh = false) => {
    try {
      setError(null);

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await maintenanceService.getList();
      setItems(data ?? []);
    } catch (err) {
      console.error(err);
      setItems([]);
      setError("No se pudo cargar el historial de mantenimiento.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return items;

    return items.filter((item) => {
      const bucket = [
        item.tipo,
        item.estado,
        item.detalle,
        item.ejecutado_por_email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return bucket.includes(normalized);
    });
  }, [items, query]);

  const summary = useMemo(() => {
    const total = items.length;
    const completed = items.filter(
      (item) => item.estado === "completed",
    ).length;
    const failed = items.filter((item) => item.estado === "failed").length;
    const running = items.filter((item) => item.estado === "running").length;

    return {
      total,
      completed,
      failed,
      running,
      lastRun: items[0]?.iniciado_en ?? null,
    };
  }, [items]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <AdminBreadcrumbs
            items={[
              { label: "Monitoreo BD", to: "/bd-monitor" },
              { label: "Mantenimiento" },
            ]}
          />
          <h1 className={styles.title}>Historial de Mantenimiento</h1>
          <p className={styles.subtitle}>
            Consulta ejecuciones anteriores, su resultado y la trazabilidad del
            módulo.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={() => void loadItems(true)}
            type="button"
            disabled={refreshing}
          >
            <RefreshCw
              size={18}
              className={refreshing ? styles.spinning : ""}
            />
            Actualizar
          </button>

          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/maintenance/run")}
            type="button"
          >
            <Wrench size={18} />
            Ejecutar mantenimiento
          </button>
        </div>
      </div>

      {error ? <div className={styles.alertCard}>{error}</div> : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "16px",
        }}
      >
        <div className={styles.card}>
          <p className={styles.subtitle}>Total ejecuciones</p>
          <h3 className={styles.title} style={{ fontSize: "1.8rem" }}>
            {summary.total}
          </h3>
        </div>

        <div className={styles.card}>
          <p className={styles.subtitle}>Completadas</p>
          <h3 className={styles.title} style={{ fontSize: "1.8rem" }}>
            {summary.completed}
          </h3>
        </div>

        <div className={styles.card}>
          <p className={styles.subtitle}>Fallidas</p>
          <h3 className={styles.title} style={{ fontSize: "1.8rem" }}>
            {summary.failed}
          </h3>
        </div>

        <div className={styles.card}>
          <p className={styles.subtitle}>Última ejecución</p>
          <h3
            className={styles.title}
            style={{ fontSize: "1.1rem", lineHeight: 1.3 }}
          >
            {summary.lastRun ? formatDate(summary.lastRun) : "Sin registros"}
          </h3>
        </div>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.sectionTitle}>Filtros</h3>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tipo, estado, detalle o usuario"
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.sectionTitle}>Historial</h3>
        </div>

        {loading ? (
          <div className={styles.centerState}>Cargando historial...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.centerState}>
            No hay ejecuciones registradas.
          </div>
        ) : (
          <div
            className={styles.tableWrapper}
            style={{ maxHeight: "560px", overflow: "auto" }}
          >
            <table className={styles.table}>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: "var(--color-surface)",
                }}
              >
                <tr>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Ejecutado por</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const statusIcon =
                    item.estado === "completed" ? (
                      <CheckCircle2 size={14} />
                    ) : item.estado === "failed" ? (
                      <TriangleAlert size={14} />
                    ) : (
                      <Clock3 size={14} />
                    );

                  return (
                    <tr key={item.id}>
                      <td>{item.tipo}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: 700,
                          }}
                        >
                          {statusIcon}
                          {normalizeStatusLabel(item.estado)}
                        </span>
                      </td>
                      <td>{formatDate(item.iniciado_en ?? item.created_at)}</td>
                      <td>{formatDate(item.finalizado_en)}</td>
                      <td>{item.ejecutado_por_email ?? "Sistema"}</td>
                      <td>{item.detalle ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMaintenance;
