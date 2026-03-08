import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Add,
  Search,
  Warning,
  TrendingDown,
  TrendingUp,
  Inventory2,
  Error as ErrorIcon,
  CheckCircle,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "../../styles/Inventory.module.css";

type InventarioStats = {
  totalProductos: number;
  stockBajo: number;
  agotados: number;
  valorInventario: number;
};

type ProductoStockBajo = {
  id: number;
  nombre: string;
  stock: number;
  minimo: number;
  categoria: string;
};

type MovimientoTipo = "Entrada" | "Venta" | "Ajuste" | "Otro";

type Movimiento = {
  id: number;
  fecha: string; // ideal ISO (YYYY-MM-DD)
  tipo: MovimientoTipo;
  producto: string;
  cantidad: number; // + entrada, - salida
  usuario: string;
};

type InventarioCategoria = {
  categoria: string;
  cantidad: number;
};

type InventarioData = {
  estadisticas: InventarioStats;
  productosStockBajo: ProductoStockBajo[];
  movimientos: Movimiento[];
  inventarioPorCategoria: InventarioCategoria[];
};

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);
}

/**
 * Placeholder API:
 * - GET /api/admin/inventario/dashboard
 */
async function fetchInventarioData(signal?: AbortSignal): Promise<InventarioData> {
  // Cuando conectes backend:
  // const res = await fetch("/api/admin/inventario/dashboard", { signal });
  // return await res.json();

  void signal; // ✅ evita warning no-unused-vars

  return {
    estadisticas: { totalProductos: 0, stockBajo: 0, agotados: 0, valorInventario: 0 },
    productosStockBajo: [],
    movimientos: [],
    inventarioPorCategoria: [],
  };
}

function a11yProps(index: number) {
  return {
    id: `inventory-tab-${index}`,
    "aria-controls": `inventory-tabpanel-${index}`,
  };
}

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
    >
      {value === index ? <Box className={styles.tabPanel}>{children}</Box> : null}
    </div>
  );
}

function getMovimientoChipClass(tipo: MovimientoTipo) {
  switch (tipo) {
    case "Entrada":
      return styles.chipEntrada;
    case "Venta":
      return styles.chipVenta;
    case "Ajuste":
      return styles.chipAjuste;
    default:
      return styles.chipOtro;
  }
}

const InventarioPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [buscar, setBuscar] = useState("");
  const [loading, setLoading] = useState(true);

  const [estadisticas, setEstadisticas] = useState<InventarioStats>({
    totalProductos: 0,
    stockBajo: 0,
    agotados: 0,
    valorInventario: 0,
  });

  const [productosStockBajo, setProductosStockBajo] = useState<ProductoStockBajo[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [inventarioPorCategoria, setInventarioPorCategoria] = useState<InventarioCategoria[]>([]);

  const load = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      const resp = await fetchInventarioData(controller.signal);
      setEstadisticas(resp.estadisticas);
      setProductosStockBajo(resp.productosStockBajo);
      setMovimientos(resp.movimientos);
      setInventarioPorCategoria(resp.inventarioPorCategoria);
    } catch {
      setEstadisticas({ totalProductos: 0, stockBajo: 0, agotados: 0, valorInventario: 0 });
      setProductosStockBajo([]);
      setMovimientos([]);
      setInventarioPorCategoria([]);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const movimientosFiltrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return movimientos;
    return movimientos.filter((m) => {
      return (
        m.fecha.toLowerCase().includes(q) ||
        m.tipo.toLowerCase().includes(q) ||
        m.producto.toLowerCase().includes(q) ||
        m.usuario.toLowerCase().includes(q)
      );
    });
  }, [buscar, movimientos]);

  const handleAjusteManual = () => {
    // Placeholder: abrir modal / navegar a ajuste manual
  };

  const skeletonCards = useMemo(() => Array.from({ length: 4 }), []);
  const skeletonRows = useMemo(() => Array.from({ length: 4 }), []);

  return (
    <Box className={styles.root}>
      {/* Header */}
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          Gestión de Inventario
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          className={styles.primaryButton}
          onClick={handleAjusteManual}
        >
          Ajuste Manual
        </Button>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} className={styles.statsGrid}>
        {loading
          ? skeletonCards.map((_, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Card className={styles.statCard}>
                  <CardContent>
                    <Skeleton width="60%" />
                    <Skeleton height={42} />
                    <Skeleton width="30%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card className={`${styles.statCard} ${styles.statCardPink}`}>
                  <CardContent className={styles.statCardContent}>
                    <Box>
                      <Typography variant="body2" className={styles.statLabel}>
                        Total en Stock
                      </Typography>
                      <Typography variant="h4" className={styles.statValueWhite}>
                        {estadisticas.totalProductos}
                      </Typography>
                    </Box>
                    <Inventory2 className={styles.statIconWhite} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card className={`${styles.statCard} ${styles.statCardSoftPink}`}>
                  <CardContent className={styles.statCardContent}>
                    <Box>
                      <Typography variant="body2" className={styles.statLabel}>
                        Stock Bajo
                      </Typography>
                      <Typography variant="h4" className={styles.statValueWhite}>
                        {estadisticas.stockBajo}
                      </Typography>
                    </Box>
                    <Warning className={styles.statIconWhite} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card className={`${styles.statCard} ${styles.statCardOrange}`}>
                  <CardContent className={styles.statCardContent}>
                    <Box>
                      <Typography variant="body2" className={styles.statLabel}>
                        Agotados
                      </Typography>
                      <Typography variant="h4" className={styles.statValueWhite}>
                        {estadisticas.agotados}
                      </Typography>
                    </Box>
                    <ErrorIcon className={styles.statIconWhite} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card className={`${styles.statCard} ${styles.statCardLight}`}>
                  <CardContent className={styles.statCardContent}>
                    <Box>
                      <Typography variant="body2" className={styles.statLabelDark}>
                        Valor Total
                      </Typography>
                      <Typography variant="h5" className={styles.statValuePink}>
                        {formatMoneda(estadisticas.valorInventario)}
                      </Typography>
                    </Box>
                    <CheckCircle className={styles.statIconPink} />
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
      </Grid>

      {/* Tabs */}
      <Paper className={styles.tabsPaper}>
        <Tabs value={tabValue} onChange={(_, v: number) => setTabValue(v)} className={styles.tabs}>
          <Tab label="Alertas de Stock" className={styles.tab} {...a11yProps(0)} />
          <Tab label="Movimientos" className={styles.tab} {...a11yProps(1)} />
          <Tab label="Por Categoría" className={styles.tab} {...a11yProps(2)} />
        </Tabs>
      </Paper>

      {/* Tab 1: Alertas de Stock */}
      <TabPanel value={tabValue} index={0}>
        <Paper className={styles.tablePaper}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className={styles.tableHeadRow}>
                  <TableCell className={styles.headCell}>Producto</TableCell>
                  <TableCell className={styles.headCell}>Categoría</TableCell>
                  <TableCell className={styles.headCell} align="center">
                    Stock Actual
                  </TableCell>
                  <TableCell className={styles.headCell} align="center">
                    Stock Mínimo
                  </TableCell>
                  <TableCell className={styles.headCell} align="center">
                    Estado
                  </TableCell>
                  <TableCell className={styles.headCell} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  skeletonRows.map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton width={90} /></TableCell>
                      <TableCell align="center"><Skeleton width={40} /></TableCell>
                      <TableCell align="center"><Skeleton width={40} /></TableCell>
                      <TableCell align="center"><Skeleton width={90} /></TableCell>
                      <TableCell align="center"><Skeleton width={110} height={34} /></TableCell>
                    </TableRow>
                  ))
                ) : productosStockBajo.length > 0 ? (
                  productosStockBajo.map((producto) => (
                    <TableRow key={producto.id} hover className={styles.tableRowHover}>
                      <TableCell className={styles.cellText}>{producto.nombre}</TableCell>
                      <TableCell>
                        <Chip label={producto.categoria} size="small" className={styles.categoryChip} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography className={styles.stockCritical}>{producto.stock}</Typography>
                      </TableCell>
                      <TableCell align="center" className={styles.cellText}>
                        {producto.minimo}
                      </TableCell>
                      <TableCell align="center">
                        <Chip icon={<Warning />} label="Crítico" size="small" className={styles.criticalChip} />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="contained" className={styles.smallPrimaryButton}>
                          Reabastecer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box className={styles.emptyInline}>
                        <Warning fontSize="small" />
                        <Typography className={styles.emptyText}>
                          Sin alertas de stock (pendiente de API).
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Tab 2: Movimientos */}
      <TabPanel value={tabValue} index={1}>
        <Paper className={styles.searchPaper}>
          <TextField
            fullWidth
            placeholder="Buscar movimientos..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className={styles.searchIcon} />
                </InputAdornment>
              ),
            }}
            className={styles.searchInput}
          />
        </Paper>

        <Paper className={styles.tablePaper}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className={styles.tableHeadRow}>
                  <TableCell className={styles.headCell}>Fecha</TableCell>
                  <TableCell className={styles.headCell}>Tipo</TableCell>
                  <TableCell className={styles.headCell}>Producto</TableCell>
                  <TableCell className={styles.headCell} align="center">
                    Cantidad
                  </TableCell>
                  <TableCell className={styles.headCell}>Usuario</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  skeletonRows.map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton width={90} /></TableCell>
                      <TableCell><Skeleton width={80} /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell align="center"><Skeleton width={70} /></TableCell>
                      <TableCell><Skeleton width={120} /></TableCell>
                    </TableRow>
                  ))
                ) : movimientosFiltrados.length > 0 ? (
                  movimientosFiltrados.map((mov) => {
                    const isEntrada = mov.cantidad > 0;
                    return (
                      <TableRow key={mov.id} hover className={styles.tableRowHover}>
                        <TableCell className={styles.cellText}>{mov.fecha}</TableCell>
                        <TableCell>
                          <Chip label={mov.tipo} size="small" className={`${styles.movChip} ${getMovimientoChipClass(mov.tipo)}`} />
                        </TableCell>
                        <TableCell className={styles.cellText}>{mov.producto}</TableCell>
                        <TableCell align="center">
                          <Box className={styles.qtyCell}>
                            {isEntrada ? (
                              <TrendingUp className={styles.trendUp} />
                            ) : (
                              <TrendingDown className={styles.trendDown} />
                            )}
                            <Typography className={isEntrada ? styles.qtyUp : styles.qtyDown}>
                              {Math.abs(mov.cantidad)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell className={styles.cellText}>{mov.usuario}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box className={styles.emptyInline}>
                        <Warning fontSize="small" />
                        <Typography className={styles.emptyText}>
                          Sin movimientos (pendiente de API).
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Tab 3: Por Categoría */}
      <TabPanel value={tabValue} index={2}>
        <Paper className={styles.chartPaper}>
          <Typography variant="h6" className={styles.chartTitle}>
            Inventario por Categoría
          </Typography>

          {loading ? (
            <Skeleton height={320} />
          ) : inventarioPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={inventarioPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoria" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#E91E8C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box className={styles.emptyChart}>
              <Warning fontSize="small" />
              <Typography className={styles.emptyText}>
                Sin datos por categoría (pendiente de API).
              </Typography>
            </Box>
          )}
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default InventarioPage;