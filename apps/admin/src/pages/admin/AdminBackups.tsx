import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  Download,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileArchive,
  Trash2,
  RefreshCw,
  Settings,
} from "lucide-react";
import styles from "../../../styles/AdminBackup.module.css";
import { backupsService } from "@admin/services/backups.service";
import type { Backup } from "@shared/api/backups.api";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";

type BackupConfig = {
  autoBackup: boolean;
  frequency: "daily" | "weekly" | "monthly";
  retention: number;
  compression: boolean;
};

const DEFAULT_CONFIG: BackupConfig = {
  autoBackup: true,
  frequency: "daily",
  retention: 30,
  compression: true,
};

const AdminBackups: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [config, setConfig] = useState<BackupConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const data = await backupsService.getList();
      setBackups(data ?? []);
    } catch (err) {
      console.error(err);
      setBackups([]);
      setError("No se pudieron cargar los respaldos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBackups();
  }, [loadBackups]);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setError(null);
      await backupsService.create();
      await loadBackups();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el respaldo.");
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      setError(null);
      await backupsService.download(backup);
    } catch (err) {
      console.error(err);
      setError("No se pudo descargar el respaldo.");
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      setError(null);
      await backupsService.remove(backupId);
      await loadBackups();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el respaldo.");
    }
  };

  const saveConfig = async () => {
    setShowConfig(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const skeletonCards = useMemo(() => Array.from({ length: 3 }), []);
  const totalBackupsSize = backups.reduce(
    (sum, backup) => sum + backup.size,
    0,
  );
  const lastBackup = backups.length > 0 ? backups[0] : null;

  return (
    <div className={styles.backups}>
      <div className={styles.header}>
        <div>
          <AdminBreadcrumbs
            items={[
              { label: "Monitoreo BD", to: "/bd-monitor" },
              { label: "Respaldos" },
            ]}
          />
          <h1 className={styles.title}>Respaldos de Base de Datos</h1>
          <p className={styles.subtitle}>
            Gestiona y descarga copias de seguridad
          </p>
        </div>

        <button
          className={styles.configBtn}
          onClick={() => setShowConfig(true)}
          type="button"
        >
          <Settings size={20} /> Configuración
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statPrimary}`}>
          <div className={styles.statIcon}>
            <Database size={32} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total de Respaldos</span>
            <span className={styles.statValue}>{backups.length}</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statSuccess}`}>
          <div className={styles.statIcon}>
            <HardDrive size={32} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Espacio Utilizado</span>
            <span className={styles.statValue}>
              {formatBytes(totalBackupsSize)}
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statInfo}`}>
          <div className={styles.statIcon}>
            <Clock size={32} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Último Respaldo</span>
            <span className={styles.statValue}>
              {lastBackup ? formatDate(lastBackup.createdAt) : "N/A"}
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statWarning}`}>
          <div className={styles.statIcon}>
            <Calendar size={32} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Retención</span>
            <span className={styles.statValue}>{config.retention} días</span>
          </div>
        </div>
      </div>

      <div className={styles.createSection}>
        <h2 className={styles.sectionTitle}>Crear Nuevo Respaldo</h2>

        <div className={styles.createForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Formato de Exportación</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="format"
                    value="gz"
                    checked
                    readOnly
                  />
                  <div className={styles.radioLabel}>
                    <FileArchive size={20} />
                    <div>
                      <strong>SQL comprimido (.backup.gz)</strong>
                      <span>Generado desde la API real del sistema</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            className={styles.createBtn}
            onClick={() => void handleCreateBackup()}
            disabled={creating}
            type="button"
          >
            {creating ? (
              <>
                <RefreshCw size={20} className={styles.spinning} /> Creando
                Respaldo...
              </>
            ) : (
              <>
                <Database size={20} /> Crear Respaldo Ahora
              </>
            )}
          </button>
        </div>
      </div>

      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2 className={styles.sectionTitle}>Historial de Respaldos</h2>

          <button
            className={styles.refreshBtn}
            onClick={() => void loadBackups()}
            type="button"
          >
            <RefreshCw size={18} /> Actualizar
          </button>
        </div>

        {error && <p className={styles.subtitle}>{error}</p>}

        {loading ? (
          <div className={styles.backupsList}>
            {skeletonCards.map((_, idx) => (
              <div key={idx} className={styles.backupCard}>
                <div className={styles.backupIcon}>
                  <FileArchive size={32} />
                </div>
                <div className={styles.backupInfo}>
                  <div className={styles.backupHeader}>
                    <h3 className={styles.backupFilename}>Cargando...</h3>
                  </div>
                  <div className={styles.backupMeta}>
                    <div className={styles.metaItem}>
                      <Clock size={16} /> <span>Consultando API...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div className={styles.empty}>
            <Database size={48} />
            <p>No hay respaldos disponibles</p>
            <span>Crea tu primer respaldo desde esta pantalla.</span>
          </div>
        ) : (
          <div className={styles.backupsList}>
            {backups.map((backup) => (
              <div key={backup.id} className={styles.backupCard}>
                <div className={styles.backupIcon}>
                  <FileArchive size={32} />
                </div>

                <div className={styles.backupInfo}>
                  <div className={styles.backupHeader}>
                    <h3 className={styles.backupFilename}>{backup.filename}</h3>

                    <div className={styles.backupBadges}>
                      <span className={`${styles.badge} ${styles.badgeFull}`}>
                        Completo
                      </span>
                      <span
                        className={`${styles.badge} ${
                          backup.status === "completed"
                            ? styles.badgeSuccess
                            : styles.badgeDanger
                        }`}
                      >
                        {backup.status === "completed" ? (
                          <>
                            <CheckCircle size={14} /> Completado
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} /> Fallido
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className={styles.backupMeta}>
                    <div className={styles.metaItem}>
                      <Clock size={16} />{" "}
                      <span>{formatDate(backup.createdAt)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <HardDrive size={16} />{" "}
                      <span>{formatBytes(backup.size)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Database size={16} />
                      <span>
                        {backup.tables} tablas •{" "}
                        {backup.records?.toLocaleString()} registros
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span>Por: {backup.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.backupActions}>
                  <button
                    className={styles.downloadBtn}
                    onClick={() => handleDownloadBackup(backup)}
                    title="Descargar"
                    type="button"
                  >
                    <Download size={18} /> Descargar
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => void handleDeleteBackup(backup.id)}
                    title="Eliminar"
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showConfig && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowConfig(false)}
          role="presentation"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h2>Configuración de Respaldos Automáticos</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowConfig(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.configGroup}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={config.autoBackup}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        autoBackup: e.target.checked,
                      }))
                    }
                  />
                  <span>Habilitar respaldos automáticos</span>
                </label>
              </div>

              {config.autoBackup && (
                <>
                  <div className={styles.configGroup}>
                    <label>Frecuencia</label>
                    <select
                      value={config.frequency}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          frequency: e.target
                            .value as BackupConfig["frequency"],
                        }))
                      }
                      className={styles.select}
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>

                  <div className={styles.configGroup}>
                    <label>Retención de Respaldos</label>
                    <select
                      value={config.retention}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          retention: parseInt(e.target.value, 10),
                        }))
                      }
                      className={styles.select}
                    >
                      <option value={7}>7 días</option>
                      <option value={15}>15 días</option>
                      <option value={30}>30 días</option>
                      <option value={60}>60 días</option>
                      <option value={90}>90 días</option>
                    </select>
                  </div>

                  <div className={styles.configGroup}>
                    <label className={styles.switchLabel}>
                      <input
                        type="checkbox"
                        checked={config.compression}
                        readOnly
                      />
                      <span>Comprimir respaldos (.gz)</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowConfig(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className={styles.saveBtn}
                onClick={() => void saveConfig()}
                type="button"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackups;
