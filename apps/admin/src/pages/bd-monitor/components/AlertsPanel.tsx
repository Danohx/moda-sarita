import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  RefreshCw,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import styles from "../../../../styles/AdminDatabaseMonitoring.module.css";
import { backupsService } from "@admin/services/backups.service";
import { maintenanceService } from "@admin/services/maintenance.service";
import { monitoringService } from "@admin/services/monitoring.service";
import type { Backup } from "@shared/api/backups.api";
import type { DbVacuum, MaintenanceJob } from "../types";

type AlertSeverity = "info" | "warning" | "error";

type MonitoringAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
};

function hoursSince(dateString: string): number {
  const now = Date.now();
  const target = new Date(dateString).getTime();
  return (now - target) / (1000 * 60 * 60);
}

function buildBackupAlerts(backups: Backup[]): MonitoringAlert[] {
  if (backups.length === 0) {
    return [
      {
        id: "no-backups",
        severity: "error",
        title: "No hay respaldos disponibles",
        description: "Todavía no existe ningún respaldo generado en el sistema.",
      },
    ];
  }

  const latestBackup = backups[0];
  const ageHours = hoursSince(latestBackup.createdAt);

  if (ageHours >= 24) {
    return [
      {
        id: "backup-old",
        severity: "warning",
        title: "Último respaldo desactualizado",
        description: `El respaldo más reciente tiene más de ${Math.floor(ageHours)} horas.`,
      },
    ];
  }

  return [];
}

function buildMaintenanceAlerts(jobs: MaintenanceJob[]): MonitoringAlert[] {
  if (jobs.length === 0) {
    return [
      {
        id: "no-maintenance",
        severity: "warning",
        title: "Sin historial de mantenimiento",
        description: "No hay ejecuciones registradas de mantenimiento programado o manual.",
      },
    ];
  }

  const latestJob = jobs[0];

  if (latestJob.estado === "failed") {
    return [
      {
        id: `maintenance-failed-${latestJob.id}`,
        severity: "error",
        title: "Último mantenimiento falló",
        description:
          latestJob.detalle?.trim() ||
          "La ejecución más reciente de mantenimiento terminó con error.",
      },
    ];
  }

  if (latestJob.estado === "running") {
    return [
      {
        id: `maintenance-running-${latestJob.id}`,
        severity: "info",
        title: "Mantenimiento en ejecución",
        description: "Actualmente hay una tarea de mantenimiento corriendo.",
      },
    ];
  }

  return [];
}

function buildVacuumAlerts(vacuumRows: DbVacuum[]): MonitoringAlert[] {
  return vacuumRows
    .filter((row) => row.n_dead_tup > 100)
    .sort((a, b) => b.n_dead_tup - a.n_dead_tup)
    .slice(0, 2)
    .map((row) => ({
      id: `dead-tuples-${row.relname}`,
      severity: "warning" as const,
      title: `Dead tuples altos en ${row.relname}`,
      description: `La tabla ${row.relname} tiene ${row.n_dead_tup} registros muertos y podría requerir mantenimiento.`,
    }));
}

function getSeverityClass(severity: AlertSeverity): string {
  if (severity === "error") return styles.statusDanger;
  if (severity === "warning") return styles.statusWarning;
  return styles.statusInfo;
}

function getSeverityIcon(severity: AlertSeverity) {
  if (severity === "error") return <ShieldAlert size={16} />;
  if (severity === "warning") return <AlertTriangle size={16} />;
  return <Bell size={16} />;
}

export const AlertsPanel = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [maintenanceJobs, setMaintenanceJobs] = useState<MaintenanceJob[]>([]);
  const [vacuumRows, setVacuumRows] = useState<DbVacuum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [backupsData, maintenanceData, vacuumData] = await Promise.all([
        backupsService.getList(),
        maintenanceService.getList(),
        monitoringService.getVacuum(),
      ]);

      setBackups(backupsData ?? []);
      setMaintenanceJobs(maintenanceData ?? []);
      setVacuumRows(vacuumData ?? []);
    } catch (error) {
      console.error(error);
      setBackups([]);
      setMaintenanceJobs([]);
      setVacuumRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const alerts = useMemo<MonitoringAlert[]>(() => {
    const generated = [
      ...buildBackupAlerts(backups),
      ...buildMaintenanceAlerts(maintenanceJobs),
      ...buildVacuumAlerts(vacuumRows),
    ];

    const priority: Record<AlertSeverity, number> = {
      error: 0,
      warning: 1,
      info: 2,
    };

    return generated
      .sort((a, b) => priority[a.severity] - priority[b.severity])
      .slice(0, 3);
  }, [backups, maintenanceJobs, vacuumRows]);

  return (
    <section className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <div>
          <h3 className={styles.previewTitle}>Alertas</h3>
          <p className={styles.previewSubtitle}>
            Reglas automáticas sobre respaldos, mantenimiento y salud técnica.
          </p>
        </div>

        <button type="button" className={styles.previewAction} onClick={() => void load()}>
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className={styles.previewState}>
          <RefreshCw size={18} className={styles.spinning} />
          <span>Cargando alertas...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className={styles.previewState}>
          <Wrench size={18} />
          <span>Sin alertas relevantes por ahora.</span>
        </div>
      ) : (
        <div className={styles.logList}>
          {alerts.map((alert) => (
            <div key={alert.id} className={styles.logItem}>
              <div className={styles.logIconBox}>{getSeverityIcon(alert.severity)}</div>

              <div className={styles.logContent}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <strong className={styles.logTitle}>{alert.title}</strong>
                  <span className={`${styles.statusBadge} ${getSeverityClass(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>

                <span className={styles.logDescription}>{alert.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AlertsPanel;