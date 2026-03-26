import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../../styles/Dashboard.module.css";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Image,
  Check,
  UserPlus,
  Megaphone,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Metric {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sold: number;
  revenue: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
}

type DashboardData = {
  metrics: Metric[];
  products: Product[];
  activities: Activity[];
};

/**
 * Placeholder API
 * Reemplazar por dashboard real cuando exista endpoint consolidado.
 */
async function fetchDashboardData(
  signal?: AbortSignal,
): Promise<DashboardData> {
  void signal;
  return {
    metrics: [],
    products: [],
    activities: [],
  };
}

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const load = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      const data = await fetchDashboardData(controller.signal);
      setMetrics(data.metrics ?? []);
      setProducts(data.products ?? []);
      setActivities(data.activities ?? []);
    } catch {
      setMetrics([]);
      setProducts([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fallbackMetrics = useMemo<Metric[]>(
    () => [
      {
        title: "Ingresos Totales",
        value: "—",
        icon: DollarSign,
        change: "Pendiente API",
      },
      {
        title: "Pedidos Totales",
        value: "—",
        icon: ShoppingBag,
        change: "Pendiente API",
      },
      {
        title: "Productos Totales",
        value: "—",
        icon: Package,
        change: "Pendiente API",
      },
      {
        title: "Clientes Totales",
        value: "—",
        icon: Users,
        change: "Pendiente API",
      },
    ],
    [],
  );

  const visibleMetrics = metrics.length > 0 ? metrics : fallbackMetrics;

  return (
    <div className={styles.dashboard}>
      <div className={styles.metricsGrid}>
        {visibleMetrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <div key={index} className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <Icon size={22} />
              </div>

              <div className={styles.metricBody}>
                <p className={styles.metricTitle}>{metric.title}</p>
                <h3 className={styles.metricValue}>
                  {loading ? "..." : metric.value}
                </h3>
              </div>

              <span className={styles.metricChange}>{metric.change}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3>Sales Overview</h3>
            <p>Global performance trend</p>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h3>Resumen de Ventas</h3>
                <p>Visualización pendiente de conexión con API</p>
              </div>
            </div>

            <div className={styles.chartContainer}>
              {loading ? (
                <div className={styles.chartPlaceholder}>
                  <RefreshCw size={48} className={styles.spinning} />
                  <p>Cargando dashboard...</p>
                </div>
              ) : (
                <div className={styles.chartPlaceholder}>
                  <AlertCircle size={48} />
                  <p>Gráfica no disponible</p>
                  <span>
                    Conecta el endpoint del dashboard para mostrar datos reales.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Top Selling Products</h3>
          </div>

          <div className={styles.productList}>
            {loading ? (
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <RefreshCw size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityTitle}>Cargando productos...</p>
                </div>
              </div>
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productLeft}>
                    <span className={styles.productRank}>#{index + 1}</span>

                    <div className={styles.productIcon}>
                      <Image size={18} />
                    </div>

                    <div>
                      <p className={styles.productName}>{product.name}</p>
                      <span className={styles.productMeta}>
                        {product.category} • {product.sold} Sold
                      </span>
                    </div>
                  </div>

                  <div className={styles.productRevenue}>{product.revenue}</div>
                </div>
              ))
            ) : (
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <AlertCircle size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityTitle}>Sin productos cargados</p>
                  <span className={styles.activityDesc}>
                    Pendiente de API dashboard.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Recent Activity</h3>
          </div>

          <div className={styles.activityList}>
            {loading ? (
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <RefreshCw size={16} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityTitle}>Cargando actividad...</p>
                </div>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <Icon size={16} />
                    </div>

                    <div className={styles.activityContent}>
                      <p className={styles.activityTitle}>{activity.title}</p>
                      <span className={styles.activityDesc}>
                        {activity.description}
                      </span>
                      <span className={styles.activityTime}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              [
                {
                  id: "empty-1",
                  title: "Sin actividad reciente",
                  description:
                    "Esta sección se llenará cuando conectes la API.",
                  time: "Pendiente",
                  icon: Check,
                },
                {
                  id: "empty-2",
                  title: "Sin nuevos usuarios",
                  description: "No hay eventos para mostrar.",
                  time: "Pendiente",
                  icon: UserPlus,
                },
                {
                  id: "empty-3",
                  title: "Sin anuncios del sistema",
                  description: "Dashboard listo para integración.",
                  time: "Pendiente",
                  icon: Megaphone,
                },
              ].map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <Icon size={16} />
                    </div>

                    <div className={styles.activityContent}>
                      <p className={styles.activityTitle}>{activity.title}</p>
                      <span className={styles.activityDesc}>
                        {activity.description}
                      </span>
                      <span className={styles.activityTime}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
