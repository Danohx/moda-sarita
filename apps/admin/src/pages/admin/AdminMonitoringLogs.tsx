import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import styles from "../../../styles/Inventory.module.css";
import { auditLogsService } from "@admin/services/auditLogs.service";
import type { AuditLog } from "@shared/api/auditLogs.api";
import AdminBreadcrumbs from "../../components/layout/AdminBreadcrumbs";

const AdminMonitoringLogs: React.FC = () => {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await auditLogsService.getList();
      setItems(data ?? []);
    } catch (err) {
      console.error(err);
      setItems([]);
      setError("No se pudo cargar la bitácora.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <AdminBreadcrumbs
            items={[
              { label: "Monitoreo BD", to: "/bd-monitor" },
              { label: "Bitácora" },
            ]}
          />
          <h1 className={styles.title}>Auditoría y Bitácora</h1>
          <p className={styles.subtitle}>
            Eventos generados por respaldos y mantenimiento
          </p>
        </div>

        <button
          className={styles.refreshBtn}
          onClick={() => void loadItems(true)}
          type="button"
        >
          <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          Actualizar
        </button>
      </div>

      {error && <div className={styles.alertCard}>{error}</div>}

      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.sectionTitle}>Bitácora</h3>
        </div>

        {loading ? (
          <div className={styles.centerState}>Cargando bitácora...</div>
        ) : items.length === 0 ? (
          <div className={styles.centerState}>
            Aún no hay eventos registrados.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleString()}</td>
                    <td>{item.modulo}</td>
                    <td>{item.accion}</td>
                    <td>{item.descripcion ?? "—"}</td>
                    <td>{item.usuario_email ?? "Sistema"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMonitoringLogs;
