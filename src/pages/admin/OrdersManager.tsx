import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Avatar,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ShoppingBag,
  LocalShipping,
  Schedule,
  Visibility,
  Edit,
  Cancel,
  AttachMoney,
  Person,
  Warning,
} from "@mui/icons-material";
import styles from "../../styles/OrdersManager.module.css";

type OrderStatus = "Por Enviar" | "En Proceso" | "Completado" | "Cancelado";

type Order = {
  id: number;
  orderId: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
  time: string;
};

type Apartado = {
  id: number;
  customer: string;
  total: number;
  paid: number;
  remaining: number;
  deadline: string; // ej "25 Nov" (lo ideal: ISO date)
  progress: number; // 0..100
};

type OrdersData = {
  orders: Order[];
  apartados: Apartado[];
};

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);
}

/**
 * Placeholder API: cuando conectes backend lo sustituyes por axios/fetch.
 * - GET /api/admin/pedidos?tipo=web
 * - GET /api/admin/apartados
 */
async function fetchOrdersData(signal?: AbortSignal): Promise<OrdersData> {
  void signal;
  return { orders: [], apartados: [] }; // ✅ vacío
}

function a11yProps(index: number) {
  return {
    id: `orders-tab-${index}`,
    "aria-controls": `orders-tabpanel-${index}`,
  };
}

type TabPanelProps = {
  value: number;
  index: number;
  children?: React.ReactNode;
};

function TabPanel({ value, index, children }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
    >
      {value === index ? <Box className={styles.tabPanel}>{children}</Box> : null}
    </div>
  );
}

function getStatusVariant(status: OrderStatus) {
  switch (status) {
    case "Por Enviar":
      return styles.statusPending;
    case "En Proceso":
      return styles.statusProcessing;
    case "Completado":
      return styles.statusDone;
    case "Cancelado":
    default:
      return styles.statusDefault;
  }
}

const OrdersManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [apartados, setApartados] = useState<Apartado[]>([]);

  const load = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      const resp = await fetchOrdersData(controller.signal);
      setOrders(resp.orders);
      setApartados(resp.apartados);
    } catch {
      setOrders([]);
      setApartados([]);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const skeletonRows = useMemo(() => Array.from({ length: 3 }), []);
  const skeletonCards = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <Box className={styles.root}>
      <Typography variant="h4" className={styles.title}>
        Gestión de Pedidos
      </Typography>

      {/* Tabs */}
      <Paper className={styles.tabsPaper}>
        <Tabs
          value={tabValue}
          onChange={(_, v: number) => setTabValue(v)}
          className={styles.tabs}
        >
          <Tab
            icon={<ShoppingBag />}
            iconPosition="start"
            label="Pedidos Web"
            className={styles.tab}
            {...a11yProps(0)}
          />
          <Tab
            icon={<Schedule />}
            iconPosition="start"
            label="Apartados Físicos"
            className={styles.tab}
            {...a11yProps(1)}
          />
        </Tabs>
      </Paper>

      {/* TAB 1: PEDIDOS WEB */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {loading ? (
            skeletonRows.map((_, idx) => (
              <Grid size={{ xs: 12 }} key={idx}>
                <Card className={styles.orderCard}>
                  <CardContent>
                    <Box className={styles.orderRow}>
                      <Box className={styles.orderLeft}>
                        <Box className={styles.orderTitleRow}>
                          <Skeleton width={160} height={30} />
                          <Skeleton width={100} height={24} />
                        </Box>

                        <Box className={styles.orderCustomerRow}>
                          <Skeleton variant="circular" width={24} height={24} />
                          <Skeleton width={240} />
                        </Box>

                        <Skeleton width={90} />
                      </Box>

                      <Box className={styles.orderRight}>
                        <Skeleton width={140} height={34} />
                        <Skeleton width={120} height={34} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <Grid size={{ xs: 12 }} key={order.id}>
                <Card className={styles.orderCard}>
                  <CardContent>
                    <Box className={styles.orderRow}>
                      <Box className={styles.orderLeft}>
                        <Box className={styles.orderTitleRow}>
                          <Typography variant="h6" className={styles.orderTitle}>
                            Orden {order.orderId}
                          </Typography>

                          <Chip
                            label={order.status}
                            size="small"
                            className={`${styles.statusChip} ${getStatusVariant(order.status)}`}
                          />
                        </Box>

                        <Box className={styles.orderCustomerRow}>
                          <Avatar className={styles.customerAvatar}>
                            <Person className={styles.customerAvatarIcon} />
                          </Avatar>

                          <Typography variant="body2" className={styles.orderCustomerText}>
                            Cliente: {order.customer} • {order.items} artículos
                          </Typography>
                        </Box>

                        <Typography variant="caption" className={styles.orderTime}>
                          {order.time}
                        </Typography>
                      </Box>

                      <Box className={styles.orderRight}>
                        <Box className={styles.orderRightTop}>
                          <Typography variant="h5" className={styles.orderAmount}>
                            {formatMoneda(order.total)}
                          </Typography>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            className={styles.viewBtn}
                          >
                            Ver detalles
                          </Button>
                        </Box>

                        {order.status !== "Completado" ? (
                          <Box className={styles.orderActions}>
                            <IconButton size="small" className={styles.actionPink}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" className={styles.actionBlue}>
                              <LocalShipping />
                            </IconButton>
                          </Box>
                        ) : null}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Paper className={styles.emptyPaper}>
                <Box className={styles.emptyRow}>
                  <Warning fontSize="small" />
                  <Typography className={styles.emptyText}>
                    Sin pedidos web (pendiente de API).
                  </Typography>
                </Box>
                <Typography className={styles.emptyHint}>
                  Cuando conectes backend, aquí se listarán los pedidos.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* TAB 2: APARTADOS FÍSICOS */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {loading ? (
            skeletonCards.map((_, idx) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={idx}>
                <Card className={styles.apartadoCard}>
                  <CardContent>
                    <Box className={styles.apartadoHeader}>
                      <Box className={styles.apartadoHeaderLeft}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                          <Skeleton width={140} />
                          <Skeleton width={90} />
                        </Box>
                      </Box>
                      <Skeleton width={90} height={24} />
                    </Box>

                    <Box className={styles.apartadoStatsBox}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                          <Skeleton width="80%" />
                          <Skeleton height={28} />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Skeleton width="80%" />
                          <Skeleton height={28} />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Skeleton width="80%" />
                          <Skeleton height={28} />
                        </Grid>
                      </Grid>
                    </Box>

                    <Skeleton width="60%" />
                    <Skeleton height={14} />
                    <Box className={styles.apartadoBtns}>
                      <Skeleton height={40} />
                      <Skeleton height={40} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : apartados.length > 0 ? (
            apartados.map((apartado) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={apartado.id}>
                <Card className={styles.apartadoCard}>
                  <CardContent>
                    {/* Header */}
                    <Box className={styles.apartadoHeader}>
                      <Box className={styles.apartadoHeaderLeft}>
                        <Avatar className={styles.apartadoAvatar}>
                          <Person />
                        </Avatar>

                        <Box className={styles.apartadoHeaderText}>
                          <Typography variant="subtitle1" className={styles.apartadoCustomer}>
                            {apartado.customer}
                          </Typography>
                          <Typography variant="caption" className={styles.apartadoId}>
                            ID: APT-00{apartado.id}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={`Vence: ${apartado.deadline}`}
                        size="small"
                        className={styles.deadlineChip}
                      />
                    </Box>

                    {/* Estadísticas */}
                    <Box className={styles.apartadoStatsBox}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" className={styles.statLabel}>
                            Total
                          </Typography>
                          <Typography variant="h6" className={styles.statValue}>
                            {formatMoneda(apartado.total)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" className={styles.statLabel}>
                            Abonado
                          </Typography>
                          <Typography variant="h6" className={`${styles.statValue} ${styles.statGreen}`}>
                            {formatMoneda(apartado.paid)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" className={styles.statLabel}>
                            Resta
                          </Typography>
                          <Typography variant="h6" className={`${styles.statValue} ${styles.statRed}`}>
                            {formatMoneda(apartado.remaining)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Progreso */}
                    <Box className={styles.progressWrap}>
                      <Box className={styles.progressTopRow}>
                        <Typography variant="caption" className={styles.progressLabel}>
                          Progreso de pago
                        </Typography>
                        <Typography variant="caption" className={styles.progressPercent}>
                          {apartado.progress}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={apartado.progress}
                        className={styles.progress}
                      />
                    </Box>

                    {/* Acciones */}
                    <Box className={styles.apartadoBtns}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AttachMoney />}
                        className={styles.primaryButton}
                      >
                        Abonar
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Cancel />}
                        className={styles.dangerButton}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Paper className={styles.emptyPaper}>
                <Box className={styles.emptyRow}>
                  <Warning fontSize="small" />
                  <Typography className={styles.emptyText}>
                    Sin apartados físicos (pendiente de API).
                  </Typography>
                </Box>
                <Typography className={styles.emptyHint}>
                  Cuando conectes backend, aquí se listarán los apartados.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default OrdersManager;