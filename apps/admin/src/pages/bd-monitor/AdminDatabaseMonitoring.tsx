import { Database, HardDriveDownload, ScrollText, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../../styles/AdminDatabaseMonitoring.module.css";
import AdminBreadcrumbs from "./components/AdminBreadcrumbs";
import { AlertsPanel } from "./components/AlertsPanel";
import { AuditLogsPreview } from "./components/AuditLogsPreview";
import { BackupsPreview } from "./components/BackupsPreview";
import { MaintenancePreview } from "./components/MaintenancePreview";
import { MetricsGrid } from "./components/MetricsGrid";

type QuickAccessItem = {
  title: string;
  description: string;
  icon: React.ElementType;
  actionLabel: string;
  to: string;
};

export const AdminDatabaseMonitoring = () => {
  const navigate = useNavigate();

  const quickAccess: QuickAccessItem[] = [
    {
      title: "Respaldos",
      description: "Consulta, descarga y administra los respaldos disponibles.",
      icon: HardDriveDownload,
      actionLabel: "Ir a respaldos",
      to: "/backups",
    },
    {
      title: "Historial de mantenimiento",
      description: "Consulta ejecuciones previas, estados y trazabilidad del mantenimiento.",
      icon: Wrench,
      actionLabel: "Ver historial",
      to: "/maintenance",
    },
    {
      title: "Bitácora",
      description: "Revisa la trazabilidad completa de eventos del monitoreo.",
      icon: ScrollText,
      actionLabel: "Ver bitácora",
      to: "/monitoring-logs",
    },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Database size={16} />
            Salud y estado técnico
          </div>

          <div>
            <AdminBreadcrumbs 
              items={[
                { label: "Monitoreo BD"}
              ]}
            />
            <h1 className={styles.title}>Monitoreo de Base de Datos</h1>
            <p className={styles.subtitle}>
              Vista general del estado del sistema, respaldos, alertas y trazabilidad operativa.
            </p>
          </div>
        </div>
      </section>

      <MetricsGrid />

      <section className={styles.contentGrid}>
        <div className={styles.contentColumn}>
          <BackupsPreview />
          <MaintenancePreview />
        </div>

        <div className={styles.contentColumn}>
          <AlertsPanel />
          <AuditLogsPreview />
        </div>
      </section>

      <section className={styles.quickAccessGrid}>
        {quickAccess.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className={styles.quickAccessCard}>
              <div className={styles.quickAccessIcon}>
                <Icon size={18} />
              </div>

              <div className={styles.quickAccessBody}>
                <h3 className={styles.quickAccessTitle}>{item.title}</h3>
                <p className={styles.quickAccessDescription}>{item.description}</p>
              </div>

              <button
                type="button"
                className={styles.quickAccessButton}
                onClick={() => navigate(item.to)}
              >
                {item.actionLabel}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default AdminDatabaseMonitoring;