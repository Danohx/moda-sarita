import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, RefreshCw, Wrench } from "lucide-react";
import styles from "../../../../styles/AdminDatabaseMonitoring.module.css";
import { maintenanceService } from "@admin/services/maintenance.service";
import type { MaintenanceJob } from "../types";

function formatDate(value: string | null): string {
  if (!value) return "N/A";

  return new Date(value).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: MaintenanceJob["estado"]): string {
  switch (status) {
    case "completed":
      return "Completado";
    case "failed":
      return "Fallido";
    case "running":
      return "En ejecución";
    case "pending":
      return "Pendiente";
    default:
      return status;
  }
}

function getStatusClass(status: MaintenanceJob["estado"]): string {
  switch (status) {
    case "completed":
      return styles.statusSuccess;
    case "failed":
      return styles.statusDanger;
    case "running":
      return styles.statusInfo;
    case "pending":
      return styles.statusWarning;
    default:
      return styles.statusMuted;
  }
}

export const MaintenancePreview = () => {
  const [job, setJob] = useState<MaintenanceJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getList();
      setJob(data?.[0] ?? null);
    } catch (error) {
      console.error(error);
      setJob(null);
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
          <h3 className={styles.previewTitle}>Último mantenimiento</h3>
          <p className={styles.previewSubtitle}>
            Última ejecución registrada del mantenimiento técnico.
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.previewState}>
          <RefreshCw size={18} className={styles.spinning} />
          <span>Cargando mantenimiento...</span>
        </div>
      ) : !job ? (
        <div className={styles.previewState}>
          <Wrench size={18} />
          <span>Sin mantenimientos registrados.</span>
        </div>
      ) : (
        <div className={styles.previewBody}>
          <div className={styles.previewMainRow}>
            <div className={styles.previewMainLeft}>
              <div className={styles.previewIconBox}>
                <Wrench size={20} />
              </div>

              <div>
                <strong className={styles.previewMainTitle}>{job.tipo}</strong>
                <p className={styles.previewMainMeta}>{job.ejecutado_por_email ?? "Sistema"}</p>
              </div>
            </div>

            <span className={`${styles.statusBadge} ${getStatusClass(job.estado)}`}>
              {job.estado === "completed" ? <CheckCircle2 size={14} /> : null}
              {job.estado === "failed" ? <AlertCircle size={14} /> : null}
              {job.estado === "running" ? <RefreshCw size={14} className={styles.spinning} /> : null}
              {job.estado === "pending" ? <Clock3 size={14} /> : null}
              {getStatusLabel(job.estado)}
            </span>
          </div>

          <div className={styles.previewMetaGrid}>
            <div className={styles.previewMetaItem}>
              <span className={styles.previewMetaLabel}>Inicio</span>
              <span>{formatDate(job.iniciado_en ?? job.created_at)}</span>
            </div>

            <div className={styles.previewMetaItem}>
              <span className={styles.previewMetaLabel}>Fin</span>
              <span>{formatDate(job.finalizado_en)}</span>
            </div>
          </div>

          {job.detalle ? <p className={styles.previewDetail}>{job.detalle}</p> : null}
        </div>
      )}
    </section>
  );
};

export default MaintenancePreview;
