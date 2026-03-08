import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  IconButton,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp,
  ShoppingCart,
  People,
  AttachMoney,
  Refresh,
  TrendingDown,
  Warning,
  Schedule,
  Inventory,
  Receipt,
  ArrowForward,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Dashboard.module.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TrendType = "up" | "down";
type AlertaTipo = "warning" | "info" | "error" | "success";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: TrendType;
  trendValue?: string | number;
  loading?: boolean;
};

type Alerta = {
  tipo: AlertaTipo;
  mensaje: string;
  icono: React.ReactNode;
  accion: string;
};

type DashboardStats = {
  ventasHoy: number;
  ventasMes: number;
  productosVendidos: number;
  clientesActivos: number;
  pedidosPendientes: number;
  stockBajo: number;
  apartadosActivos: number;
  corteCajaPendiente: boolean;
};

type VentaSemanal = { dia: string; ventas: number; meta: number };
type VentaHora = { hora: string; ventas: number };
type ProductoTop = { nombre: string; ventas: number; stock: number; color?: string };
type VentasCategoria = { name: string; value: number; color?: string };
type UltimaVenta = { id: string; cliente: string; monto: number; tiempo: string };

type DashboardData = {
  estadisticas: DashboardStats;
  ventasSemanales: VentaSemanal[];
  ventasHoraHora: VentaHora[];
  productosMasVendidos: ProductoTop[];
  ventasPorCategoria: VentasCategoria[];
  ultimasVentas: UltimaVenta[];
  alertas: Alerta[];
};

// ─── Constantes (fuera del componente, sin presión en GC) ─────────────────────

const SKELETON_ROWS = Array.from({ length: 4 });

const PRODUCTO_PALETTE = ["#E91E8C", "#F06292", "#F8BBD0", "#FCE4EC"];
const CATEGORIA_PALETTE = ["#E91E8C", "#F06292", "#F8BBD0", "#FCE4EC"];

const emptyData: DashboardData = {
  estadisticas: {
    ventasHoy: 0,
    ventasMes: 0,
    productosVendidos: 0,
    clientesActivos: 0,
    pedidosPendientes: 0,
    stockBajo: 0,
    apartadosActivos: 0,
    corteCajaPendiente: false,
  },
  ventasSemanales: [],
  ventasHoraHora: [],
  productosMasVendidos: [],
  ventasPorCategoria: [],
  ultimasVentas: [],
  alertas: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);
}

function calcularCrecimiento(actual: number, anterior: number) {
  if (!anterior) return "0.0";
  return (((actual - anterior) / anterior) * 100).toFixed(1);
}

/**
 * Placeholder API. Cuando tengas el endpoint real, cambia esto por fetch/axios.
 */
async function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  void signal;
  return emptyData;
}

// ─── Sub-componentes memoizados ───────────────────────────────────────────────

/**
 * Reloj en vivo aislado para que su tick de 1s
 * NO provoque re-render del dashboard completo.
 */
const LiveClock = React.memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Typography variant="body2" className={styles.headerSubtitle}>
      {time.toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}{" "}
      —{" "}
      {time.toLocaleTimeString("es-MX")}
    </Typography>
  );
});

LiveClock.displayName = "LiveClock";

/** Stat card memoizado: solo re-renderiza si sus props cambian. */
const StatCard = React.memo<StatCardProps>(
  ({ title, value, icon, gradient, trend, trendValue, loading }) => (
    <Card className={styles.statCard} style={{ background: gradient }}>
      <CardContent className={styles.statCardContent}>
        <Box className={styles.statCardHeader}>
          <Box className={styles.statCardLeft}>
            <Typography variant="body2" className={styles.statCardTitle}>
              {title}
            </Typography>

            {loading ? (
              <Skeleton width={130} height={44} sx={{ bgcolor: "rgba(255,255,255,0.25)" }} />
            ) : (
              <Typography variant="h4" className={styles.statCardValue}>
                {value}
              </Typography>
            )}

            {trend && (
              <Box className={styles.statCardTrend}>
                {trend === "up" ? (
                  <TrendingUp className={styles.trendIcon} />
                ) : (
                  <TrendingDown className={styles.trendIcon} />
                )}
                {loading ? (
                  <Skeleton width={150} sx={{ bgcolor: "rgba(255,255,255,0.25)" }} />
                ) : (
                  <Typography variant="caption" className={styles.trendText}>
                    {trendValue}% vs mes anterior
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box className={styles.statCardRight}>{icon}</Box>
        </Box>
      </CardContent>

      {loading && <LinearProgress className={styles.statCardProgress} />}
    </Card>
  )
);

StatCard.displayName = "StatCard";

// ─── Helpers de clase de alerta (fuera del componente) ────────────────────────

function alertaCardClass(tipo: AlertaTipo) {
  switch (tipo) {
    case "error":   return styles.alertCardError;
    case "warning": return styles.alertCardWarning;
    case "success": return styles.alertCardSuccess;
    default:        return styles.alertCardInfo;
  }
}

function alertaAvatarClass(tipo: AlertaTipo) {
  switch (tipo) {
    case "error":   return styles.alertAvatarError;
    case "warning": return styles.alertAvatarWarning;
    case "success": return styles.alertAvatarSuccess;
    default:        return styles.alertAvatarInfo;
  }
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData]           = useState<DashboardData>(emptyData);

  // Callbacks de navegación memoizados (evitan re-crear lambdas en cada render)
  const goToPOS       = useCallback(() => navigate("/admin/pos"), [navigate]);
  const goToCorteCaja = useCallback(() => navigate("/admin/corte-caja"), [navigate]);
  const goToInventory = useCallback(() => navigate("/admin/inventory"), [navigate]);
  const goToReports   = useCallback(() => navigate("/admin/reports"), [navigate]);

  const load = useCallback(async (mode: "initial" | "refresh") => {
    const controller = new AbortController();
    try {
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);

      const resp = await fetchDashboard(controller.signal);
      setData(resp);
    } catch {
      setData(emptyData);
    } finally {
      if (mode === "initial") setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load("initial");
  }, [load]);

  const busy = loading || refreshing;

  const handleRefresh = useCallback(async () => {
    await load("refresh");
  }, [load]);

  // Colores por defecto si la API no los trae
  const productosTop = useMemo(
    () =>
      (data.productosMasVendidos ?? []).map((p, idx) => ({
        ...p,
        color: p.color || PRODUCTO_PALETTE[idx % PRODUCTO_PALETTE.length],
      })),
    [data.productosMasVendidos]
  );

  const categorias = useMemo(
    () =>
      (data.ventasPorCategoria ?? []).map((c, idx) => ({
        ...c,
        color: c.color || CATEGORIA_PALETTE[idx % CATEGORIA_PALETTE.length],
      })),
    [data.ventasPorCategoria]
  );

  const { estadisticas } = data;

  const noData =
    !busy &&
    data.alertas.length === 0 &&
    data.ventasSemanales.length === 0 &&
    data.ventasHoraHora.length === 0 &&
    data.ultimasVentas.length === 0;

  return (
    <Box className={styles.root}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.headerTitle}>
            Dashboard
          </Typography>
          <LiveClock />
        </Box>

        <IconButton
          onClick={handleRefresh}
          disabled={busy}
          className={`${styles.refreshButton} ${busy ? styles.refreshSpinning : ""}`}
          aria-label="Actualizar dashboard"
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* ── Estadísticas ────────────────────────────────────────────────────── */}
      <Grid container spacing={3} className={styles.section}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ventas Hoy"
            value={formatMoneda(estadisticas.ventasHoy)}
            icon={<AttachMoney className={styles.bigIcon} />}
            gradient="linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)"
            trend="up"
            trendValue={calcularCrecimiento(estadisticas.ventasHoy, Math.max(1, estadisticas.ventasHoy - 1))}
            loading={busy}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Ventas del Mes"
            value={formatMoneda(estadisticas.ventasMes)}
            icon={<TrendingUp className={styles.bigIcon} />}
            gradient="linear-gradient(135deg, #F06292 0%, #E91E8C 100%)"
            trend="up"
            trendValue={calcularCrecimiento(estadisticas.ventasMes, Math.max(1, estadisticas.ventasMes - 1))}
            loading={busy}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Productos Vendidos"
            value={estadisticas.productosVendidos}
            icon={<ShoppingCart className={styles.bigIcon} />}
            gradient="linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)"
            trend="up"
            trendValue="0.0"
            loading={busy}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Clientes Activos"
            value={estadisticas.clientesActivos}
            icon={<People className={styles.bigIcon} />}
            gradient="linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)"
            trend="up"
            trendValue="0.0"
            loading={busy}
          />
        </Grid>
      </Grid>

      {/* ── Alertas + Acciones rápidas ──────────────────────────────────────── */}
      <Grid container spacing={3} className={styles.section}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card className={styles.alertsContainer}>
            <CardContent>
              <Typography variant="h6" className={styles.alertsTitle}>
                ⚠️ Alertas del Sistema
              </Typography>

              <Grid container spacing={2}>
                {busy ? (
                  SKELETON_ROWS.map((_, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Card className={styles.alertCard}>
                        <CardContent className={styles.alertCardContent}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box className={styles.alertTextWrap}>
                            <Skeleton width="80%" />
                          </Box>
                          <Skeleton variant="rounded" width={18} height={18} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : data.alertas.length > 0 ? (
                  data.alertas.map((alerta, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Card
                        className={`${styles.alertCard} ${alertaCardClass(alerta.tipo)}`}
                        onClick={() => navigate(alerta.accion)}
                        role="button"
                      >
                        <CardContent className={styles.alertCardContent}>
                          <Avatar className={`${styles.alertAvatar} ${alertaAvatarClass(alerta.tipo)}`}>
                            {alerta.icono}
                          </Avatar>

                          <Box className={styles.alertTextWrap}>
                            <Typography variant="body2" className={styles.alertText}>
                              {alerta.mensaje}
                            </Typography>
                          </Box>

                          <ArrowForward className={styles.alertArrow} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography className={styles.emptyState}>Sin alertas (pendiente de API)</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className={styles.quickActionsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.quickActionsTitle}>
                🎯 Acciones Rápidas
              </Typography>

              <Box className={styles.quickActionsList}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={goToPOS}
                  className={styles.primaryButton}
                >
                  Nueva Venta (POS)
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Schedule />}
                  onClick={goToPOS}
                  className={styles.outlinedButton}
                >
                  Registrar Apartado
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={goToCorteCaja}
                  className={styles.outlinedButton}
                >
                  Corte de Caja
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Inventory />}
                  onClick={goToInventory}
                  className={styles.outlinedButton}
                >
                  Ver Inventario
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Gráficas principales ─────────────────────────────────────────────── */}
      <Grid container spacing={3} className={styles.section}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper className={styles.paper}>
            <Typography variant="h6" className={styles.paperTitle}>
              Ventas de la Semana
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ventasSemanales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dia" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                <Legend />
                <Bar dataKey="ventas" fill="#E91E8C" radius={[8, 8, 0, 0]} name="Ventas" />
                <Bar dataKey="meta"   fill="#F8BBD0" radius={[8, 8, 0, 0]} name="Meta" />
              </BarChart>
            </ResponsiveContainer>

            {!busy && data.ventasSemanales.length === 0 && (
              <Typography className={styles.emptyState}>Sin datos (pendiente de API)</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper className={styles.paper}>
            <Typography variant="h6" className={styles.paperTitle}>
              Ventas por Categoría
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || "#E91E8C"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {!busy && categorias.length === 0 && (
              <Typography className={styles.emptyState}>Sin datos (pendiente de API)</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Hora por hora + Top productos ───────────────────────────────────── */}
      <Grid container spacing={3} className={styles.section}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper className={styles.paper}>
            <Typography variant="h6" className={styles.paperTitle}>
              Ventas de Hoy (Hora por Hora)
            </Typography>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.ventasHoraHora}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E91E8C" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#E91E8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hora" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#E91E8C"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {!busy && data.ventasHoraHora.length === 0 && (
              <Typography className={styles.emptyState}>Sin datos (pendiente de API)</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper className={`${styles.paper} ${styles.paperFullHeight}`}>
            <Typography variant="h6" className={styles.paperTitle}>
              Productos Top
            </Typography>

            <List>
              {busy ? (
                SKELETON_ROWS.map((_, index) => (
                  <React.Fragment key={index}>
                    <ListItem className={styles.listItemNoXPadding}>
                      <ListItemAvatar>
                        <Skeleton variant="circular" width={40} height={40} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Skeleton width="70%" />}
                        secondary={<Skeleton width="90%" />}
                      />
                    </ListItem>
                    {index < SKELETON_ROWS.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : productosTop.length > 0 ? (
                productosTop.map((producto, index) => (
                  <React.Fragment key={index}>
                    <ListItem className={styles.listItemNoXPadding}>
                      <ListItemAvatar>
                        <Avatar style={{ backgroundColor: producto.color || "#E91E8C" }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography variant="body2" className={styles.productName}>
                            {producto.nombre}
                          </Typography>
                        }
                        secondary={
                          <Box className={styles.productChipsRow}>
                            <Chip
                              label={`${producto.ventas} vendidos`}
                              size="small"
                              className={styles.pinkChip}
                            />
                            <Chip
                              label={`Stock: ${producto.stock}`}
                              size="small"
                              className={producto.stock < 10 ? styles.stockChipLow : styles.stockChipOk}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < productosTop.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography className={styles.emptyState}>Sin datos (pendiente de API)</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Últimas ventas ──────────────────────────────────────────────────── */}
      <Paper className={styles.paper}>
        <Box className={styles.lastSalesHeader}>
          <Typography variant="h6" className={styles.paperTitle}>
            Últimas Ventas
          </Typography>

          <Button size="small" onClick={goToReports} className={styles.linkButton}>
            Ver todas →
          </Button>
        </Box>

        <List>
          {busy ? (
            SKELETON_ROWS.map((_, index) => (
              <React.Fragment key={index}>
                <ListItem className={styles.listItemNoXPadding}>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton width="70%" />}
                    secondary={<Skeleton width="40%" />}
                  />
                </ListItem>
                {index < SKELETON_ROWS.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : data.ultimasVentas.length > 0 ? (
            data.ultimasVentas.map((venta, index) => (
              <React.Fragment key={venta.id}>
                <ListItem className={styles.listItemNoXPadding}>
                  <ListItemAvatar>
                    <Avatar className={styles.saleAvatar}>
                      <Receipt />
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box className={styles.saleRow}>
                        <Typography variant="body2" className={styles.saleTitle}>
                          {venta.id} — {venta.cliente}
                        </Typography>
                        <Typography variant="body1" className={styles.saleAmount}>
                          {formatMoneda(venta.monto)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" className={styles.saleTime}>
                        {venta.tiempo}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < data.ultimasVentas.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <Typography className={styles.emptyState}>Sin datos (pendiente de API)</Typography>
          )}
        </List>
      </Paper>

      {/* ── Estado sin API ───────────────────────────────────────────────────── */}
      {noData && (
        <Paper className={styles.paper}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning fontSize="small" color="disabled" />
            <Typography variant="body2" className={styles.emptyState}>
              Dashboard listo para conectar API (sin datos estáticos).
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}