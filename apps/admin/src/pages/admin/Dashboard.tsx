import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../../styles/Dashboard.module.css";
import {
  AlertCircle,
  CalendarClock,
  Check,
  DollarSign,
  Image,
  Megaphone,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Box,
  SlidersHorizontal,
} from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";
import type {
  DashboardProductoCritico,
  DashboardQuery,
  DashboardRangeKey,
} from "@shared/api/dashboard.api";

interface Metric {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
}

interface Product {
  id: string;
  name: string;
  sold: number;
  revenue: string;
  image?: string | null;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
  actionLabel?: string;
  actionTo?: string;
}

type DashboardApiData = Awaited<ReturnType<typeof dashboardService.getData>>;

const TOP_PRODUCTS_LIMIT = 5;
const ALERTS_LIMIT = 3;
const ACTIVITY_LIMIT = 5;
const CRITICAL_PRODUCTS_LIMIT = 6;
const AUTO_REFRESH_MS = 60_000;

const QUICK_ACTIONS = [
  { label: "Nueva venta", icon: ShoppingBag, to: "/pos" },
  { label: "Registrar cliente", icon: UserPlus, to: "/customers" },
  { label: "Ajustar inventario", icon: SlidersHorizontal, to: "/inventory" },
  { label: "Corte de caja", icon: Wallet, to: "/corte" },
];

const RANGE_OPTIONS: Array<{ label: string; value: DashboardRangeKey }> = [
  { label: "Hoy", value: "today" },
  { label: "7 días", value: "7d" },
  { label: "30 días", value: "30d" },
  { label: "Este mes", value: "month" },
  { label: "Personalizado", value: "custom" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(Number(value || 0));
}

function formatDateLabel(value: string) {
  const safeValue = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(safeValue);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value: string | null) {
  if (!value) return "Fecha no disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Hace unos segundos";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays === 1 ? "" : "s"}`;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function navigateTo(path?: string) {
  if (!path) return;
  window.location.href = path;
}

function getActivityIcon(tipo: string, severity?: string) {
  if (severity === "alta") return AlertCircle;

  const icons: Record<string, React.ElementType> = {
    PEDIDO: ShoppingBag,
    PAGO: DollarSign,
    INVENTARIO: Package,
    CLIENTE: UserPlus,
    CORTE_CAJA: Wallet,
    BAJO_STOCK: AlertCircle,
    APARTADO_POR_VENCER: CalendarClock,
    APARTADO_VENCIDO: AlertCircle,
  };

  return icons[tipo] ?? Megaphone;
}

function getAlertAction(tipo: string, referenciaId: string) {
  if (tipo === "BAJO_STOCK") {
    return {
      label: "Ver inventario",
      to: `/inventory?varianteId=${encodeURIComponent(referenciaId)}`,
    };
  }

  if (tipo === "APARTADO_POR_VENCER" || tipo === "APARTADO_VENCIDO") {
    return {
      label: "Ver apartado",
      to: `/orders/${referenciaId}`,
    };
  }

  return undefined;
}

function getCriticalIcon(item: DashboardProductoCritico) {
  if (item.tipo === "SIN_IMAGEN") return Image;
  if (item.tipo === "SIN_CATEGORIA") return Box;
  return AlertCircle;
}

function getCriticalAction(item: DashboardProductoCritico) {
  if (item.varianteId) {
    return {
      label: "Ver inventario",
      to: `/inventory?productoId=${encodeURIComponent(
        item.productoId,
      )}&varianteId=${encodeURIComponent(item.varianteId)}`,
    };
  }

  return {
    label: "Ver producto",
    to: `/products/${item.productoId}`,
  };
}

function getRangeDescription(range?: DashboardApiData["range"]) {
  if (!range?.from || !range?.to) return "Periodo seleccionado";

  const from = formatDateLabel(range.from);
  const toDate = new Date(`${range.to}T00:00:00`);
  toDate.setDate(toDate.getDate() - 1);

  const to = Number.isNaN(toDate.getTime())
    ? range.to
    : formatDateLabel(toDate.toISOString());

  return `${from} - ${to}`;
}

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardApiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [range, setRange] = useState<DashboardRangeKey>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const buildQuery = useCallback((): DashboardQuery => {
    const query: DashboardQuery = {
      range,
      topLimit: TOP_PRODUCTS_LIMIT,
      actividadLimit: ACTIVITY_LIMIT,
      alertasLimit: ALERTS_LIMIT,
      productosCriticosLimit: CRITICAL_PRODUCTS_LIMIT,
    };

    if (range === "custom" && customFrom && customTo) {
      query.from = customFrom;
      query.to = customTo;
    }

    return query;
  }, [customFrom, customTo, range]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getData(buildQuery());

      setDashboard(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard load error:", err);
      setDashboard(null);
      setError("No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;

    const id = window.setInterval(() => {
      void load();
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(id);
  }, [autoRefresh, load]);

  const metrics = useMemo<Metric[]>(() => {
    const resumen = dashboard?.resumen;

    if (!resumen) {
      return [
        {
          title: "Ingresos",
          value: "—",
          icon: DollarSign,
          change: "Sin datos",
        },
        { title: "Ventas", value: "—", icon: ShoppingBag, change: "Sin datos" },
        { title: "Bajo Stock", value: "—", icon: Package, change: "Sin datos" },
        { title: "Clientes", value: "—", icon: Users, change: "Sin datos" },
      ];
    }

    const ingresos = resumen.ingresosPeriodo ?? resumen.ingresosHoy;
    const ventas = resumen.ventasPeriodo ?? resumen.ventasHoy;
    const ticket = resumen.ticketPromedioPeriodo ?? resumen.ticketPromedioHoy;

    return [
      {
        title: "Ingresos",
        value: formatMoney(ingresos),
        icon: DollarSign,
        change: `${formatMoney(ticket)} ticket prom.`,
      },
      {
        title: "Ventas",
        value: formatNumber(ventas),
        icon: ShoppingBag,
        change: `${formatNumber(resumen.pagosPeriodo ?? 0)} pagos`,
      },
      {
        title: "Bajo Stock",
        value: formatNumber(resumen.productosBajoStock),
        icon: Package,
        change:
          resumen.variantesSinStock > 0
            ? `${formatNumber(resumen.variantesSinStock)} sin stock`
            : `${formatNumber(resumen.productosActivos)} activos`,
      },
      {
        title: "Clientes",
        value: formatNumber(resumen.clientesTotales),
        icon: Users,
        change: `${formatNumber(resumen.apartadosActivos)} apartados`,
      },
    ];
  }, [dashboard]);

  const products = useMemo<Product[]>(() => {
    return (dashboard?.topProductos ?? []).map((product) => ({
      id: String(product.productoId),
      name: product.nombre,
      sold: product.unidadesVendidas,
      revenue: formatMoney(product.totalVendido),
      image: product.imagenPrincipal,
    }));
  }, [dashboard]);

  const alertItems = useMemo<Activity[]>(() => {
    return (dashboard?.alertasOperativas ?? []).map((alert) => {
      const action = getAlertAction(alert.tipo, alert.referenciaId);

      return {
        id: `alert-${alert.tipo}-${alert.referenciaId}`,
        title: alert.titulo,
        description: alert.detalle,
        time: formatRelativeTime(alert.fecha),
        icon: getActivityIcon(alert.tipo, alert.severidad),
        actionLabel: action?.label,
        actionTo: action?.to,
      };
    });
  }, [dashboard]);

  const activityItems = useMemo<Activity[]>(() => {
    return (dashboard?.actividadReciente ?? []).map((activity) => ({
      id: `${activity.tipo}-${activity.referenciaId}`,
      title: activity.titulo,
      description: activity.detalle,
      time: formatRelativeTime(activity.fecha),
      icon: getActivityIcon(activity.tipo),
    }));
  }, [dashboard]);

  const criticalProducts = dashboard?.productosCriticos ?? [];
  const caja = dashboard?.cajaActual ?? null;
  const salesData = useMemo(() => {
    return dashboard?.ventasUltimos7Dias ?? [];
  }, [dashboard]);

  const useCompactChart = salesData.length > 14;

  const maxSalesValue = useMemo(() => {
    const max = Math.max(...salesData.map((item) => item.totalIngresos), 0);
    return max > 0 ? max : 1;
  }, [salesData]);

  const totalPeriodSales = useMemo(() => {
    return salesData.reduce((acc, item) => acc + item.totalIngresos, 0);
  }, [salesData]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardToolbar}>
        <div>
          <h2 className={styles.dashboardTitle}>Dashboard</h2>
          <p className={styles.dashboardSubtitle}>
            {getRangeDescription(dashboard?.range)}
          </p>
        </div>

        <div className={styles.toolbarActions}>
          <div className={styles.rangeButtons}>
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.rangeButton} ${
                  range === option.value ? styles.rangeButtonActive : ""
                }`}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.autoRefreshButton} ${
              autoRefresh ? styles.autoRefreshActive : ""
            }`}
            onClick={() => setAutoRefresh((value) => !value)}
          >
            Auto 60s
          </button>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className={styles.refreshButton}
          >
            <RefreshCw
              size={16}
              className={loading ? styles.spinning : undefined}
            />
            Actualizar
          </button>
        </div>
      </div>

      {range === "custom" && (
        <div className={styles.customRangeBox}>
          <label>
            Desde
            <input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
            />
          </label>

          <label>
            Hasta
            <input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
            />
          </label>

          <button
            type="button"
            className={styles.applyRangeButton}
            onClick={() => void load()}
            disabled={!customFrom || !customTo || loading}
          >
            Aplicar rango
          </button>
        </div>
      )}

      <div className={styles.quickActions}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className={styles.quickActionButton}
              onClick={() => navigateTo(action.to)}
            >
              <span>
                <Icon size={17} />
              </span>
              {action.label}
            </button>
          );
        })}
      </div>

      <div className={styles.metricsGrid}>
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.title} className={styles.metricCard}>
              <div className={styles.metricTop}>
                <div className={styles.metricIcon}>
                  <Icon size={22} />
                </div>

                <span className={styles.metricChange}>
                  {loading ? "Cargando..." : metric.change}
                </span>
              </div>

              <div className={styles.metricBody}>
                <p className={styles.metricTitle}>{metric.title}</p>
                <h3 className={styles.metricValue}>
                  {loading ? "..." : metric.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.dashboardMainGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3>Ventas por periodo</h3>
              <p>
                {loading
                  ? "Cargando rendimiento..."
                  : `Total: ${formatMoney(totalPeriodSales)}`}
              </p>
            </div>
          </div>

          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.chartPlaceholder}>
                <RefreshCw size={44} className={styles.spinning} />
                <p>Cargando dashboard...</p>
              </div>
            ) : error ? (
              <div className={styles.chartPlaceholder}>
                <AlertCircle size={44} />
                <p>{error}</p>
                <span>Verifica la sesión o el endpoint del dashboard.</span>
              </div>
            ) : salesData.length > 0 ? (
              useCompactChart ? (
                <CompactSalesLineChart
                  data={salesData}
                  maxValue={maxSalesValue}
                />
              ) : (
                <SalesBarChart data={salesData} maxValue={maxSalesValue} />
              )
            ) : (
              <div className={styles.chartPlaceholder}>
                <TrendingUp size={44} />
                <p>Sin ventas en este periodo</p>
                <span>
                  Registra una venta desde Punto de Venta para ver actividad
                  aquí.
                </span>
              </div>
            )}
          </div>

          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Última actualización: {lastUpdated.toLocaleTimeString("es-MX")}
            </p>
          )}
        </div>

        <div className={styles.cashCard}>
          <div className={styles.sectionHeader}>
            <h3>Caja actual</h3>
          </div>

          {loading ? (
            <div className={styles.emptyMiniState}>
              <RefreshCw size={18} className={styles.spinning} />
              Cargando caja...
            </div>
          ) : caja?.abierta ? (
            <>
              <div className={styles.cashStatusOpen}>Caja abierta</div>

              <div className={styles.cashInfo}>
                <span>Responsable</span>
                <strong>{caja.usuarioNombre ?? "Sin responsable"}</strong>
              </div>

              <div className={styles.cashInfo}>
                <span>Inicio</span>
                <strong>{formatDateTime(caja.inicioTurno)}</strong>
              </div>

              <div className={styles.cashTotal}>
                <span>Total sistema</span>
                <strong>{formatMoney(caja.totalSistema)}</strong>
              </div>

              <div className={styles.cashBreakdown}>
                <span>Efectivo: {formatMoney(caja.totalEfectivo)}</span>
                <span>Tarjeta: {formatMoney(caja.totalTarjeta)}</span>
                <span>
                  Transferencia: {formatMoney(caja.totalTransferencia)}
                </span>
              </div>

              <button
                type="button"
                className={styles.cardActionButton}
                onClick={() => navigateTo("/corte")}
              >
                Ver corte de caja
              </button>
            </>
          ) : (
            <div className={styles.emptyState}>
              <Wallet size={34} />
              <p>Sin caja abierta</p>
              <span>
                Abre una caja desde Corte de Caja para iniciar operaciones.
              </span>
              <button
                type="button"
                className={styles.cardActionButton}
                onClick={() => navigateTo("/ventas/corte")}
              >
                Ir a corte de caja
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={`${styles.sectionCard} ${styles.alertsCard}`}>
          <div className={styles.sectionHeader}>
            <h3>Alertas operativas</h3>
          </div>

          <div className={styles.activityList}>
            {loading ? (
              <LoadingRow text="Cargando alertas..." />
            ) : alertItems.length > 0 ? (
              alertItems.map((alert) => {
                const Icon = alert.icon;

                return (
                  <div key={alert.id} className={styles.activityItem}>
                    <div
                      className={`${styles.activityIcon} ${styles.alertIcon}`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className={styles.activityContent}>
                      <p className={styles.activityTitle}>{alert.title}</p>
                      <span className={styles.activityDesc}>
                        {alert.description}
                      </span>
                      <span className={styles.activityTime}>{alert.time}</span>

                      {alert.actionTo && (
                        <button
                          type="button"
                          className={styles.inlineActionButton}
                          onClick={() => navigateTo(alert.actionTo)}
                        >
                          {alert.actionLabel}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyRow
                icon={Check}
                title="Sin alertas activas"
                description="No hay apartados vencidos ni productos críticos."
              />
            )}
          </div>
        </div>

        <div className={`${styles.sectionCard} ${styles.criticalCard}`}>
          <div className={styles.sectionHeader}>
            <h3>Productos críticos</h3>
          </div>

          <div className={styles.activityList}>
            {loading ? (
              <LoadingRow text="Cargando productos críticos..." />
            ) : criticalProducts.length > 0 ? (
              criticalProducts.map((item) => {
                const Icon = getCriticalIcon(item);
                const action = getCriticalAction(item);

                return (
                  <div
                    key={`${item.tipo}-${item.productoId}-${item.varianteId ?? "base"}`}
                    className={styles.activityItem}
                  >
                    <div
                      className={`${styles.activityIcon} ${
                        item.severidad === "alta"
                          ? styles.alertIcon
                          : styles.warningIcon
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className={styles.activityContent}>
                      <p className={styles.activityTitle}>{item.nombre}</p>
                      <span className={styles.activityDesc}>
                        {item.detalle}
                      </span>
                      <span className={styles.activityTime}>{item.tipo}</span>

                      <button
                        type="button"
                        className={styles.inlineActionButton}
                        onClick={() => navigateTo(action.to)}
                      >
                        {action.label}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyRow
                icon={Check}
                title="Inventario en buen estado"
                description="No hay productos sin stock, sin imagen o sin categoría."
              />
            )}
          </div>
        </div>

        <div className={`${styles.sectionCard} ${styles.productsCard}`}>
          <div className={styles.sectionHeader}>
            <h3>Productos más vendidos</h3>
          </div>

          <div className={styles.productList}>
            {loading ? (
              <LoadingRow text="Cargando productos..." />
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <div key={product.id} className={styles.productItem}>
                  <div className={styles.productLeft}>
                    <span className={styles.productRank}>#{index + 1}</span>

                    <div className={styles.productIcon}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className={styles.productImage}
                        />
                      ) : (
                        <Image size={18} />
                      )}
                    </div>

                    <div>
                      <p className={styles.productName}>{product.name}</p>
                      <span className={styles.productMeta}>
                        {product.sold} unidades vendidas
                      </span>
                    </div>
                  </div>

                  <div className={styles.productRevenue}>{product.revenue}</div>
                </div>
              ))
            ) : (
              <EmptyRow
                icon={TrendingUp}
                title="Sin productos vendidos"
                description="Aún no hay ventas confirmadas en este periodo."
              />
            )}
          </div>
        </div>

        <div className={`${styles.sectionCard} ${styles.activityCard}`}>
          <div className={styles.sectionHeader}>
            <h3>Actividad reciente</h3>
          </div>

          <div className={styles.activityList}>
            {loading ? (
              <LoadingRow text="Cargando actividad..." />
            ) : activityItems.length > 0 ? (
              activityItems.map((activity) => {
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
              <EmptyRow
                icon={Megaphone}
                title="Sin actividad reciente"
                description="No hay eventos operativos para mostrar."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function LoadingRow({ text }: { text: string }) {
  return (
    <div className={styles.activityItem}>
      <div className={styles.activityIcon}>
        <RefreshCw size={16} className={styles.spinning} />
      </div>
      <div className={styles.activityContent}>
        <p className={styles.activityTitle}>{text}</p>
      </div>
    </div>
  );
}

function EmptyRow({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.activityItem}>
      <div className={styles.activityIcon}>
        <Icon size={16} />
      </div>
      <div className={styles.activityContent}>
        <p className={styles.activityTitle}>{title}</p>
        <span className={styles.activityDesc}>{description}</span>
      </div>
    </div>
  );
}

function SalesBarChart({
  data,
  maxValue,
}: {
  data: Array<{ fecha: string; totalIngresos: number; pedidosPagados: number }>;
  maxValue: number;
}) {
  return (
    <div className={styles.salesChart}>
      {data.map((day) => {
        const hasSales = day.totalIngresos > 0;

        const percentage = Math.max(
          (day.totalIngresos / maxValue) * 100,
          hasSales ? 10 : 3,
        );

        return (
          <div
            key={day.fecha}
            className={styles.salesBarItem}
            title={`${formatDateLabel(day.fecha)}: ${formatMoney(
              day.totalIngresos,
            )}`}
          >
            <span className={styles.salesAmount}>
              {hasSales ? formatMoney(day.totalIngresos) : ""}
            </span>

            <div className={styles.salesBarTrack}>
              <div
                className={`${styles.salesBar} ${
                  !hasSales ? styles.salesBarEmpty : ""
                }`}
                style={{ height: `${percentage}%` }}
              />
            </div>

            <span className={styles.salesDate}>
              {formatDateLabel(day.fecha)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CompactSalesLineChart({
  data,
  maxValue,
}: {
  data: Array<{ fecha: string; totalIngresos: number; pedidosPagados: number }>;
  maxValue: number;
}) {
  const width = 1000;
  const height = 260;
  const paddingLeft = 42;
  const paddingRight = 28;
  const paddingTop = 24;
  const paddingBottom = 42;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const safeMax = maxValue > 0 ? maxValue : 1;

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? paddingLeft + plotWidth / 2
        : paddingLeft + (index / (data.length - 1)) * plotWidth;

    const y =
      paddingTop + plotHeight - (item.totalIngresos / safeMax) * plotHeight;

    return {
      x,
      y,
      value: item.totalIngresos,
      fecha: item.fecha,
    };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  const areaPath =
    points.length > 0
      ? [
          `M ${points[0].x} ${height - paddingBottom}`,
          ...points.map((point) => `L ${point.x} ${point.y}`),
          `L ${points[points.length - 1].x} ${height - paddingBottom}`,
          "Z",
        ].join(" ")
      : "";

  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  const maxPoint = points.reduce(
    (best, current) => (current.value > best.value ? current : best),
    points[0],
  );

  const lastPoint = points[points.length - 1];

  return (
    <div className={styles.compactChartWrap}>
      <svg
        className={styles.lineChart}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfica de ventas del periodo"
      >
        <defs>
          <linearGradient id="dashboardSalesArea" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary-vibrant)"
              stopOpacity="0.20"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary-vibrant)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((line) => {
          const y = paddingTop + (line / 3) * plotHeight;

          return (
            <line
              key={line}
              className={styles.lineChartGrid}
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
            />
          );
        })}

        <path className={styles.lineChartArea} d={areaPath} />
        <polyline className={styles.lineChartLine} points={linePoints} />

        {points.map((point, index) => {
          const shouldShow =
            point.value > 0 || index === 0 || index === points.length - 1;

          if (!shouldShow) return null;

          return (
            <circle
              key={`${point.fecha}-${index}`}
              className={
                point.value > 0
                  ? styles.lineChartPoint
                  : styles.lineChartPointMuted
              }
              cx={point.x}
              cy={point.y}
              r={point.value > 0 ? 5 : 3}
            />
          );
        })}

        {[maxPoint, lastPoint].map((point, index) => {
          if (!point || point.value <= 0) return null;

          return (
            <text
              key={`${point.fecha}-${index}`}
              className={styles.lineChartValueLabel}
              x={point.x}
              y={Math.max(point.y - 12, 14)}
              textAnchor={
                point.x > width - 120
                  ? "end"
                  : point.x < 120
                    ? "start"
                    : "middle"
              }
            >
              {formatMoney(point.value)}
            </text>
          );
        })}

        {points.map((point, index) => {
          const shouldLabel =
            index === 0 ||
            index === points.length - 1 ||
            index % labelStep === 0;

          if (!shouldLabel) return null;

          return (
            <text
              key={`label-${point.fecha}`}
              className={styles.lineChartLabel}
              x={point.x}
              y={height - 12}
              textAnchor={
                index === 0
                  ? "start"
                  : index === points.length - 1
                    ? "end"
                    : "middle"
              }
            >
              {formatDateLabel(point.fecha)}
            </text>
          );
        })}
      </svg>

      <div className={styles.compactChartHint}>
        <span>Vista compacta para rangos largos</span>
        <strong>
          {formatNumber(data.filter((item) => item.totalIngresos > 0).length)}{" "}
          días con ventas
        </strong>
      </div>
    </div>
  );
}

export default Dashboard;
