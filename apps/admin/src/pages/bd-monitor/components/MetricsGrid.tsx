import { useCallback, useEffect, useState } from "react";
import { Database, HardDrive, PlugZap } from "lucide-react";
import styles from "../../../../styles/Dashboard.module.css";
import { monitoringService } from "@admin/services/monitoring.service";
import type { DbSummary } from "../types";

export const MetricsGrid = () => {
  const [data, setData] = useState<DbSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await monitoringService.getSummary();
      setData(res);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || !data) return null;

  const metrics: Array<{
    title: string;
    value: string | number;
    icon: React.ElementType;
  }> = [
    { title: "Estado de la BD", value: data.status, icon: Database },
    { title: "Conexiones", value: data.connections, icon: PlugZap },
    { title: "Tamaño BD", value: data.size, icon: HardDrive },
  ];

  return (
    <div className={styles.metricsGrid}>
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div key={metric.title} className={styles.metricCard}>
            <div className={styles.metricBody}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Icon size={18} />
                <p className={styles.metricTitle}>{metric.title}</p>
              </div>
              <h3 className={styles.metricValue}>{metric.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
