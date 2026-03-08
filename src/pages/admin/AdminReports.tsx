import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  TrendingUp,
  Assessment,
  Description,
  BarChart as BarChartIcon,
  Print,
  Email,
  PictureAsPdf,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import styles from "../../styles/AdminReports.module.css";

type TipoReporte = "ventas" | "inventario" | "clientes" | "financiero";
type Periodo = "semana" | "mes" | "trimestre" | "ano" | "personalizado";

type VentaMensual = {
  mes: string;
  ventas: number;
  costos: number;
  ganancia: number;
};
type VentaCategoria = {
  name: string;
  value: number;
  ventas: number;
  color: string;
};
type ProductoTop = {
  id: number;
  nombre: string;
  cantidad: number;
  total: number;
  categoria: string;
};
type ClienteTop = {
  id: number;
  nombre: string;
  compras: number;
  total: number;
  ultimaCompra: string;
};
type VentaMetodo = {
  metodo: string;
  value: number;
  monto: number;
  color: string;
};

type Totales = {
  ventasTotal: number;
  costosTotal: number;
  gananciaTotal: number;
  margen: string;
};

type ReporteData = {
  ventasMensuales: VentaMensual[];
  ventasPorCategoria: VentaCategoria[];
  ventasPorMetodo: VentaMetodo[];
  productosMasVendidos: ProductoTop[];
  clientesTop: ClienteTop[];
};

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(valor);
}

/**
 * ✅ Placeholder para API
 * Cambias esta función por tu llamada real (axios/fetch).
 */
async function fetchReportData(params: {
  tipo: TipoReporte;
  periodo: Periodo;
  fechaInicio: string;
  fechaFin: string;
  signal: AbortSignal;
}): Promise<ReporteData> {
  const { signal } = params;

  await new Promise<void>((resolve, reject) => {
    const id = window.setTimeout(() => resolve(), 350);
    signal.addEventListener("abort", () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  return {
    ventasMensuales: [],
    ventasPorCategoria: [],
    ventasPorMetodo: [],
    productosMasVendidos: [],
    clientesTop: [],
  };
}

const AdminReports: React.FC = () => {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("ventas");
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [fechaInicio, setFechaInicio] = useState("2025-02-01");
  const [fechaFin, setFechaFin] = useState("2025-02-28");

  const [loading, setLoading] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [datosReporte, setDatosReporte] = useState<ReporteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reportesDisponibles = useMemo(
    () => [
      {
        id: "ventas" as const,
        nombre: "Reporte de Ventas",
        icon: <TrendingUp />,
        descripcion: "Análisis detallado de ventas",
      },
      {
        id: "inventario" as const,
        nombre: "Reporte de Inventario",
        icon: <Assessment />,
        descripcion: "Estado del inventario",
      },
      {
        id: "clientes" as const,
        nombre: "Reporte de Clientes",
        icon: <Description />,
        descripcion: "Análisis de clientes",
      },
      {
        id: "financiero" as const,
        nombre: "Reporte Financiero",
        icon: <BarChartIcon />,
        descripcion: "Estado financiero",
      },
    ],
    [],
  );

  const calcularTotales = useCallback(
    (ventasMensuales: VentaMensual[]): Totales => {
      const ventasTotal = ventasMensuales.reduce(
        (sum, item) => sum + item.ventas,
        0,
      );
      const costosTotal = ventasMensuales.reduce(
        (sum, item) => sum + item.costos,
        0,
      );
      const gananciaTotal = ventasTotal - costosTotal;
      const margen =
        ventasTotal > 0
          ? ((gananciaTotal / ventasTotal) * 100).toFixed(1)
          : "0.0";
      return { ventasTotal, costosTotal, gananciaTotal, margen };
    },
    [],
  );

  const totales = useMemo(() => {
    return calcularTotales(datosReporte?.ventasMensuales ?? []);
  }, [calcularTotales, datosReporte]);

  const load = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchReportData({
          tipo: tipoReporte,
          periodo,
          fechaInicio,
          fechaFin,
          signal,
        });
        setDatosReporte(resp);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setDatosReporte(null);
        setError("No se pudieron cargar los reportes (placeholder).");
      } finally {
        setLoading(false);
      }
    },
    [tipoReporte, periodo, fechaInicio, fechaFin],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleGenerarPDF = async () => {
    setGenerandoPDF(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      alert("PDF generado (placeholder). Conecta backend luego.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleEnviarEmail = () => {
    alert("Reporte enviado por email (placeholder).");
  };

  const handleImprimir = () => window.print();

  const renderReporteVentas = () => {
    const ventasMensuales = datosReporte?.ventasMensuales ?? [];
    const ventasPorCategoria = datosReporte?.ventasPorCategoria ?? [];
    const ventasPorMetodo = datosReporte?.ventasPorMetodo ?? [];
    const productosMasVendidos = datosReporte?.productosMasVendidos ?? [];

    return (
      <>
        <Grid container spacing={3} className={styles.section}>
          <Grid size={{ xs: 12 }}>
            <Paper className={styles.paper}>
              <Typography variant="h6" className={styles.paperTitle}>
                Ventas vs Costos - Últimos 7 Meses
              </Typography>

              {ventasMensuales.length === 0 ? (
                <Alert severity="info" className={styles.alert}>
                  Sin datos aún. Aquí se renderizará la serie mensual cuando
                  conectes la API.
                </Alert>
              ) : (
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={ventasMensuales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        formatter={(value) => formatMoneda(Number(value))}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ventas"
                        stroke="#E91E8C"
                        strokeWidth={3}
                        name="Ventas"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="costos"
                        stroke="#F8BBD0"
                        strokeWidth={3}
                        name="Costos"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ganancia"
                        stroke="#4CAF50"
                        strokeWidth={3}
                        name="Ganancia"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} className={styles.section}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className={styles.paper}>
              <Typography variant="h6" className={styles.paperTitle}>
                Ventas por Categoría
              </Typography>

              {ventasPorCategoria.length === 0 ? (
                <Alert severity="info" className={styles.alert}>
                  Sin datos aún. La API llenará{" "}
                  {`{ name, value, ventas, color }`}.
                </Alert>
              ) : (
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ventasPorCategoria}
                        cx="50%"
                        cy="50%"
                        labelLine
                        label={(p) => {
                          const payload = p.payload as
                            | VentaCategoria
                            | undefined;
                          if (!payload) return "";
                          return `${payload.name}: ${payload.value}%`;
                        }}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {ventasPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(
                          value: unknown,
                          name: unknown,
                          props: unknown,
                        ) => {
                          const p = props as { payload?: VentaCategoria };
                          const ventas = p.payload?.ventas ?? 0;
                          return [
                            `${String(value)}% (${formatMoneda(ventas)})`,
                            String(name),
                          ];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper className={styles.paper}>
              <Typography variant="h6" className={styles.paperTitle}>
                Ventas por Método de Pago
              </Typography>

              {ventasPorMetodo.length === 0 ? (
                <Alert severity="info" className={styles.alert}>
                  Sin datos aún. La API llenará {`{ metodo, monto, color }`}.
                </Alert>
              ) : (
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ventasPorMetodo}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="metodo" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        formatter={(value) => formatMoneda(Number(value))}
                      />
                      <Bar dataKey="monto" radius={[8, 8, 0, 0]}>
                        {ventasPorMetodo.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Paper className={styles.paper}>
          <Typography variant="h6" className={styles.paperTitle}>
            Top 5 Productos Más Vendidos
          </Typography>

          {productosMasVendidos.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin datos aún. La API llenará{" "}
              {`{ id, nombre, cantidad, total, categoria }`}.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow className={styles.tableHeadRow}>
                    <TableCell className={styles.th}>Producto</TableCell>
                    <TableCell className={styles.th}>Categoría</TableCell>
                    <TableCell className={styles.th} align="center">
                      Cantidad
                    </TableCell>
                    <TableCell className={styles.th} align="right">
                      Total Ventas
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosMasVendidos.map((p) => (
                    <TableRow key={p.id} hover className={styles.tableRowHover}>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.categoria}
                          size="small"
                          className={styles.pinkChip}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">{p.cantidad}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          fontWeight="bold"
                          className={styles.pinkText}
                        >
                          {formatMoneda(p.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </>
    );
  };

  const renderReporteClientes = () => {
    const clientesTop = datosReporte?.clientesTop ?? [];
    return (
      <Paper className={styles.paper}>
        <Typography variant="h6" className={styles.paperTitle}>
          Top 5 Mejores Clientes
        </Typography>

        {clientesTop.length === 0 ? (
          <Alert severity="info" className={styles.alert}>
            Sin datos aún. La API llenará{" "}
            {`{ id, nombre, compras, total, ultimaCompra }`}.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className={styles.tableHeadRow}>
                  <TableCell className={styles.th}>Cliente</TableCell>
                  <TableCell className={styles.th} align="center">
                    Compras
                  </TableCell>
                  <TableCell className={styles.th} align="right">
                    Total Gastado
                  </TableCell>
                  <TableCell className={styles.th}>Última Compra</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientesTop.map((c) => (
                  <TableRow key={c.id} hover className={styles.tableRowHover}>
                    <TableCell>
                      <Typography fontWeight="bold">{c.nombre}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={c.compras}
                        size="small"
                        className={styles.pinkChipBold}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" className={styles.pinkText}>
                        {formatMoneda(c.total)}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.ultimaCompra}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    );
  };

  const renderReporteInventario = () => {
    const ventasPorCategoria = datosReporte?.ventasPorCategoria ?? [];
    return (
      <Paper className={styles.paper}>
        <Typography variant="h6" className={styles.paperTitle}>
          Estado de Inventario por Categoría
        </Typography>

        {ventasPorCategoria.length === 0 ? (
          <Alert severity="info" className={styles.alert}>
            Sin datos aún. Puedes reutilizar la misma serie por categoría o
            crear una nueva para inventario.
          </Alert>
        ) : (
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ventasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Porcentaje"
                  fill="#E91E8C"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <Alert
          severity="info"
          className={styles.alert}
          style={{ marginTop: 12 }}
        >
          <Typography variant="body2">
            <strong>Nota:</strong> Este reporte mostrará la distribución por
            categoría según lo que tu API devuelva.
          </Typography>
        </Alert>
      </Paper>
    );
  };

  const renderReporteFinanciero = () => {
    const ventasMensuales = datosReporte?.ventasMensuales ?? [];

    return (
      <>
        <Paper className={styles.paper}>
          <Typography variant="h6" className={styles.paperTitle}>
            Estado Financiero Mensual
          </Typography>

          {ventasMensuales.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin datos aún. La API llenará{" "}
              {`{ mes, ventas, costos, ganancia }`}.
            </Alert>
          ) : (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ventasMensuales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                  <Legend />
                  <Bar
                    dataKey="ventas"
                    fill="#E91E8C"
                    name="Ingresos"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="costos"
                    fill="#F8BBD0"
                    name="Costos"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="ganancia"
                    fill="#4CAF50"
                    name="Ganancia"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Paper>

        <Grid container spacing={3} className={styles.section}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className={styles.kpiCard}>
              <CardContent>
                <Typography variant="h6" className={styles.kpiTitle}>
                  Flujo de Efectivo
                </Typography>

                <Box className={styles.kpiRow}>
                  <Typography>Ingresos Totales:</Typography>
                  <Typography fontWeight="bold" className={styles.greenText}>
                    {formatMoneda(totales.ventasTotal)}
                  </Typography>
                </Box>

                <Box className={styles.kpiRow}>
                  <Typography>Costos Totales:</Typography>
                  <Typography fontWeight="bold" className={styles.redText}>
                    {formatMoneda(totales.costosTotal)}
                  </Typography>
                </Box>

                <Box className={styles.kpiRowStrong}>
                  <Typography variant="h6" fontWeight="bold">
                    Ganancia Neta:
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    className={styles.pinkText}
                  >
                    {formatMoneda(totales.gananciaTotal)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card className={styles.kpiCard}>
              <CardContent>
                <Typography variant="h6" className={styles.kpiTitle}>
                  Indicadores Clave
                </Typography>

                <Box className={styles.kpiRow}>
                  <Typography>Margen de Ganancia:</Typography>
                  <Typography fontWeight="bold" className={styles.greenText}>
                    {totales.margen}%
                  </Typography>
                </Box>

                <Box className={styles.kpiRow}>
                  <Typography>Ticket Promedio:</Typography>
                  <Typography fontWeight="bold">
                    {formatMoneda(totales.ventasTotal / 156)}
                  </Typography>
                </Box>

                <Box className={styles.kpiRow}>
                  <Typography>ROI:</Typography>
                  <Typography fontWeight="bold" className={styles.greenText}>
                    {totales.costosTotal > 0
                      ? (
                          (totales.gananciaTotal / totales.costosTotal) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  const renderContenidoReporte = () => {
    switch (tipoReporte) {
      case "ventas":
        return renderReporteVentas();
      case "clientes":
        return renderReporteClientes();
      case "inventario":
        return renderReporteInventario();
      case "financiero":
        return renderReporteFinanciero();
      default:
        return renderReporteVentas();
    }
  };

  return (
    <Box className={styles.root}>
      {/* Header */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>
            Reportes y Análisis
          </Typography>
          <Typography variant="body2" className={styles.subtitle}>
            {loading ? "Cargando..." : "Listo para conectar API"}
          </Typography>
        </Box>

        <Box className={styles.headerActions}>
          <Button
            variant="outlined"
            startIcon={<Email />}
            onClick={handleEnviarEmail}
            className={styles.btnOutlined}
          >
            Enviar Email
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handleImprimir}
            className={styles.btnOutlined}
          >
            Imprimir
          </Button>
          <Button
            variant="contained"
            startIcon={
              generandoPDF ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PictureAsPdf />
              )
            }
            onClick={handleGenerarPDF}
            disabled={generandoPDF}
            className={styles.btnPrimary}
          >
            {generandoPDF ? "Generando..." : "Exportar PDF"}
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      {/* Tipos de Reportes */}
      <Grid container spacing={3} className={styles.section}>
        {reportesDisponibles.map((reporte) => {
          const selected = tipoReporte === reporte.id;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={reporte.id}>
              <Card
                className={`${styles.reportCard} ${selected ? styles.reportCardSelected : ""}`}
                onClick={() => setTipoReporte(reporte.id)}
                role="button"
              >
                <CardContent className={styles.reportCardContent}>
                  <Box
                    className={`${styles.reportIcon} ${selected ? styles.reportIconSelected : ""}`}
                  >
                    {reporte.icon}
                  </Box>
                  <Box>
                    <Typography className={styles.reportTitle}>
                      {reporte.nombre}
                    </Typography>
                    <Typography variant="caption" className={styles.reportDesc}>
                      {reporte.descripcion}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filtros */}
      <Paper className={styles.paper}>
        <Typography variant="h6" className={styles.paperTitlePink}>
          Filtros de Reporte
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodo}
                label="Período"
                onChange={(e) => setPeriodo(e.target.value as Periodo)}
              >
                <MenuItem value="semana">Esta Semana</MenuItem>
                <MenuItem value="mes">Este Mes</MenuItem>
                <MenuItem value="trimestre">Este Trimestre</MenuItem>
                <MenuItem value="ano">Este Año</MenuItem>
                <MenuItem value="personalizado">Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={periodo !== "personalizado"}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Fecha Fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={periodo !== "personalizado"}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Resumen */}
      <Paper className={`${styles.paper} ${styles.summaryPaper}`}>
        <Typography variant="h6" className={styles.paperTitlePink}>
          Resumen del Período Seleccionado
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" className={styles.muted}>
              Ventas Totales
            </Typography>
            <Typography variant="h5" className={styles.pinkTextStrong}>
              {formatMoneda(totales.ventasTotal)}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" className={styles.muted}>
              Ganancia Neta
            </Typography>
            <Typography variant="h5" className={styles.greenTextStrong}>
              {formatMoneda(totales.gananciaTotal)}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" className={styles.muted}>
              Margen de Ganancia
            </Typography>
            <Typography variant="h5" className={styles.pinkTextStrong}>
              {totales.margen}%
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="body2" className={styles.muted}>
              Crecimiento
            </Typography>
            <Typography variant="h5" className={styles.greenTextStrong}>
              +0.0%
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Contenido */}
      {loading ? (
        <Paper className={styles.paper}>
          <Box className={styles.loadingBox}>
            <CircularProgress />
            <Typography className={styles.loadingText}>
              Cargando reporte…
            </Typography>
          </Box>
        </Paper>
      ) : (
        renderContenidoReporte()
      )}
    </Box>
  );
};

export default AdminReports;
