import { useCallback, useEffect, useState } from "react";
import { Archive, HardDriveDownload, RefreshCw } from "lucide-react";
import styles from "../../../../styles/AdminDatabaseMonitoring.module.css";
import { backupsService } from "@admin/services/backups.service";
import type { Backup } from "@shared/api/backups.api";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const BackupsPreview = () => {
  const [backup, setBackup] = useState<Backup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await backupsService.getList();
      setBackup(data?.[0] ?? null);
    } catch (error) {
      console.error(error);
      setBackup(null);
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
          <h3 className={styles.previewTitle}>Último respaldo</h3>
          <p className={styles.previewSubtitle}>
            Resumen del respaldo más reciente disponible en el sistema.
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.previewState}>
          <RefreshCw size={18} className={styles.spinning} />
          <span>Cargando respaldo...</span>
        </div>
      ) : !backup ? (
        <div className={styles.previewState}>
          <Archive size={18} />
          <span>No hay respaldos aún.</span>
        </div>
      ) : (
        <div className={styles.previewBody}>
          <div className={styles.previewMainRow}>
            <div className={styles.previewMainLeft}>
              <div className={styles.previewIconBox}>
                <HardDriveDownload size={20} />
              </div>

              <div>
                <strong className={styles.previewMainTitle}>{backup.filename}</strong>
                <p className={styles.previewMainMeta}>Respaldo disponible</p>
              </div>
            </div>
          </div>

          <div className={styles.previewMetaGrid}>
            <div className={styles.previewMetaItem}>
              <span className={styles.previewMetaLabel}>Fecha</span>
              <span>{formatDate(backup.createdAt)}</span>
            </div>

            <div className={styles.previewMetaItem}>
              <span className={styles.previewMetaLabel}>Tamaño</span>
              <span>{(backup.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BackupsPreview;