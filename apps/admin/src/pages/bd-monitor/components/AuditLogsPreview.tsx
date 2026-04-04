import { useCallback, useEffect, useState } from "react";
import { History, RefreshCw, ScrollText } from "lucide-react";
import styles from "../../../../styles/AdminDatabaseMonitoring.module.css";
import { auditLogsService } from "@admin/services/auditLogs.service";
import type { AuditLog } from "../types";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-MX", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const AuditLogsPreview = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await auditLogsService.getList();
      setLogs((data ?? []).slice(0, 2));
    } catch (error) {
      console.error(error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <div>
          <h3 className={styles.previewTitle}>Actividad reciente</h3>
          <p className={styles.previewSubtitle}>Bitácora reciente del módulo de monitoreo.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.previewState}>
          <RefreshCw size={18} className={styles.spinning} />
          <span>Cargando actividad...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className={styles.previewState}>
          <History size={18} />
          <span>Sin actividad reciente.</span>
        </div>
      ) : (
        <div className={styles.logList}>
          {logs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logIconBox}>
                <ScrollText size={16} />
              </div>

              <div className={styles.logContent}>
                <strong className={styles.logTitle}>
                  {log.modulo} · {log.accion}
                </strong>
                <span className={styles.logDescription}>
                  {log.descripcion ?? "Sin descripción"}
                </span>
                <span className={styles.logTime}>
                  {formatDate(log.created_at)}
                  {log.usuario_email ? ` · ${log.usuario_email}` : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AuditLogsPreview;