import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "../../../styles/PrediccionesPage.module.css";
import { prediccionesService } from "@admin/services/predicciones.service";
import { productosService } from "@admin/services/productos.service";
import type { Producto, VarianteProducto } from "@shared/api/productos.api";
import type {
  PrediccionData,
  PrediccionFilters,
  PrediccionHistorialItem,
} from "@shared/api/predicciones.api";

type ProductoOption = {
  id: string;
  nombre: string;
  categoria_nombre?: string | null;
  stock_disponible_total?: number | null;
};

type TemporadaOption = {
  id: string;
  nombre: string;
  mes_inicio?: number | null;
  dia_inicio?: number | null;
  mes_fin?: number | null;
  dia_fin?: number | null;
};

type VarianteOption = {
  id: string;
  sku?: string | null;
  talla_nombre?: string | null;
  color_nombre?: string | null;
  stock_fisico?: number;
  stock_apartado?: number;
  stock_disponible?: number;
  activo?: boolean;
};

type ChartItem = {
  etiqueta: string;
  demanda: number | null;
  historico: number | null;
  proyectado: number | null;
  ventasObjetivo: number | null;
};

type TableItem = {
  key: string;
  periodo: string;
  tipo: string;
  ventas: number | null;
  inventario: number | null;
  detalle: string;
};

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_HISTORY_YEARS = 2;
const DEFAULT_SAFETY_MARGIN_PERCENT = 0;

function toProductoOption(item: Producto): ProductoOption {
  return {
    id: String(item.id),
    nombre: item.nombre,
    categoria_nombre: item.categoria_nombre ?? null,
    stock_disponible_total:
      item.stock_disponible_total !== undefined &&
      item.stock_disponible_total !== null
        ? Number(item.stock_disponible_total)
        : null,
  };
}

function toVarianteOption(item: VarianteProducto): VarianteOption {
  const stockFisico =
    item.stock_fisico !== undefined ? Number(item.stock_fisico) : undefined;
  const stockApartado =
    item.stock_apartado !== undefined ? Number(item.stock_apartado) : undefined;

  return {
    id: String(item.id),
    sku: item.sku ?? null,
    talla_nombre: item.talla_nombre ?? null,
    color_nombre: item.color_nombre ?? null,
    stock_fisico: stockFisico,
    stock_apartado: stockApartado,
    stock_disponible:
      item.stock_disponible !== undefined
        ? Number(item.stock_disponible)
        : stockFisico !== undefined && stockApartado !== undefined
          ? Math.max(stockFisico - stockApartado, 0)
          : undefined,
    activo: item.activo,
  };
}

function formatNumber(value?: number | null, maximumFractionDigits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "—";

  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(Number(value));
}

function getChartMaxValue(data: ChartItem[]) {
  const values = data.flatMap((item) => [
    item.demanda ?? 0,
    item.historico ?? 0,
    item.proyectado ?? 0,
    item.ventasObjetivo ?? 0,
  ]);

  const max = Math.max(...values, 0);

  if (max <= 10) return 10;
  return Math.ceil(max * 1.15);
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "—";
  return `${formatNumber(value, 2)}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPeriodo(
  item: Pick<PrediccionHistorialItem, "anio" | "fecha_inicio" | "fecha_fin">,
) {
  return `${item.anio} · ${formatDate(item.fecha_inicio)} - ${formatDate(item.fecha_fin)}`;
}

function getVarianteLabel(variante: VarianteOption) {
  const talla = variante.talla_nombre || "Sin talla";
  const color = variante.color_nombre || "Sin color";
  const sku = variante.sku ? ` · SKU ${variante.sku}` : "";
  const stock =
    variante.stock_disponible !== undefined
      ? ` · Stock ${variante.stock_disponible}`
      : "";

  return `${talla} / ${color}${sku}${stock}`;
}

function getStatusSeverity(status?: string) {
  if (status === "FINALIZADA") return "default";
  if (status === "EN_CURSO") return "warning";
  return "success";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function PrediccionesPage() {
  const [productos, setProductos] = useState<ProductoOption[]>([]);
  const [temporadas, setTemporadas] = useState<TemporadaOption[]>([]);
  const [variantes, setVariantes] = useState<VarianteOption[]>([]);

  const [selectedProductoId, setSelectedProductoId] = useState("");
  const [selectedVarianteId, setSelectedVarianteId] = useState("");
  const [selectedTemporadaId, setSelectedTemporadaId] = useState("");

  const [anioObjetivo, setAnioObjetivo] = useState(CURRENT_YEAR);
  const [fromYear] = useState("");
  const [historyYears, setHistoryYears] = useState<number | string>(
    DEFAULT_HISTORY_YEARS,
  );
  const [safetyMarginPercent, setSafetyMarginPercent] = useState<
    number | string
  >(DEFAULT_SAFETY_MARGIN_PERCENT);

  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingVariantes, setLoadingVariantes] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [prediction, setPrediction] = useState<PrediccionData | null>(null);
  const [isChartOpen, setIsChartOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchCatalogs() {
      try {
        setLoadingCatalogs(true);
        setError("");

        const [temporadasData, productosData] = await Promise.all([
          productosService.getTemporadasCatalog(),
          productosService.getList({ activo: true }),
        ]);

        if (ignore) return;

        const temporadaOptions = (temporadasData ?? []).map((item) => ({
          id: String(item.id),
          nombre: item.nombre,
          mes_inicio: item.mes_inicio ?? null,
          dia_inicio: item.dia_inicio ?? null,
          mes_fin: item.mes_fin ?? null,
          dia_fin: item.dia_fin ?? null,
        }));

        const productoOptions = (productosData ?? []).map(toProductoOption);

        setTemporadas(temporadaOptions);
        setProductos(productoOptions);

        if (productoOptions.length > 0) {
          setSelectedProductoId((current) => current || productoOptions[0].id);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(
            getErrorMessage(
              err,
              "No se pudieron cargar productos y temporadas.",
            ),
          );
        }
      } finally {
        if (!ignore) setLoadingCatalogs(false);
      }
    }

    fetchCatalogs();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProductoId) {
      setVariantes([]);
      setSelectedVarianteId("");
      return;
    }

    let ignore = false;

    async function fetchVariantes() {
      try {
        setLoadingVariantes(true);
        setSelectedVarianteId("");
        setPrediction(null);

        const variantesData =
          await productosService.getVariantesAdmin(selectedProductoId);

        if (!ignore) {
          setVariantes((variantesData ?? []).map(toVarianteOption));
        }
      } catch (err: unknown) {
        if (!ignore) {
          setVariantes([]);
          setError(
            getErrorMessage(
              err,
              "No se pudieron cargar las variantes del producto.",
            ),
          );
        }
      } finally {
        if (!ignore) setLoadingVariantes(false);
      }
    }

    fetchVariantes();

    return () => {
      ignore = true;
    };
  }, [selectedProductoId]);

  const selectedProducto = useMemo(
    () =>
      productos.find((producto) => producto.id === selectedProductoId) ?? null,
    [productos, selectedProductoId],
  );

  const selectedTemporada = useMemo(
    () =>
      temporadas.find((temporada) => temporada.id === selectedTemporadaId) ??
      null,
    [temporadas, selectedTemporadaId],
  );

  const chartData = useMemo<ChartItem[]>(() => {
    if (!prediction) return [];

    const historialBase = prediction.historial.map((item) => ({
      etiqueta: String(item.anio),
      demanda: item.ventas,
      historico: item.ventas,
      proyectado: null,
      ventasObjetivo: null,
    }));

    if (!prediction.prediccion) return historialBase;

    const lastHistoricalIndex = historialBase.length - 1;

    const historialConAncla = historialBase.map((item, index) => ({
      ...item,
      proyectado: index === lastHistoricalIndex ? item.historico : null,
    }));

    const proyeccionesIntermedias = (
      prediction.proyecciones_intermedias ?? []
    ).map((item) => ({
      etiqueta: String(item.anio),
      demanda: item.demanda_estimada_redondeada,
      historico: null,
      proyectado: item.demanda_estimada_redondeada,
      ventasObjetivo: null,
    }));

    return [
      ...historialConAncla,
      ...proyeccionesIntermedias,
      {
        etiqueta: String(prediction.prediccion.anio),
        demanda: prediction.prediccion.demanda_estimada_redondeada,
        historico: null,
        proyectado: prediction.prediccion.demanda_estimada_redondeada,
        ventasObjetivo:
          prediction.prediccion.ventas_reales_objetivo > 0
            ? prediction.prediccion.ventas_reales_objetivo
            : null,
      },
    ];
  }, [prediction]);

  const tableData = useMemo<TableItem[]>(() => {
    if (!prediction) return [];

    const historialRows = prediction.historial.map((item) => ({
      key: `historial-${item.anio}`,
      periodo: formatPeriodo(item),
      tipo: "Histórico",
      ventas: item.ventas,
      inventario: null,
      detalle:
        item.ventas > 0
          ? "Usado para revisar demanda histórica"
          : "Sin ventas en el periodo",
    }));

    const proyeccionRows = (prediction.proyecciones_intermedias ?? []).map(
      (item) => ({
        key: `proyeccion-${item.anio}`,
        periodo: formatPeriodo(item),
        tipo: "Proyección",
        ventas: item.demanda_estimada_redondeada,
        inventario: null,
        detalle: "Proyección intermedia calculada con el modelo exponencial",
      }),
    );

    if (!prediction.prediccion) {
      return [...historialRows, ...proyeccionRows];
    }

    return [
      ...historialRows,
      ...proyeccionRows,
      {
        key: `prediccion-${prediction.prediccion.anio}`,
        periodo: `${prediction.prediccion.anio} · ${formatDate(prediction.prediccion.fecha_inicio)} - ${formatDate(prediction.prediccion.fecha_fin)}`,
        tipo: "Predicción",
        ventas: prediction.prediccion.demanda_estimada_redondeada,
        inventario: prediction.inventario?.unidades_a_preparar ?? null,
        detalle:
          prediction.inventario?.recomendacion ??
          "Demanda estimada para la temporada objetivo",
      },
    ];
  }, [prediction]);

  const canCalculate =
    Boolean(selectedProductoId) && !loadingCatalogs && !loadingPrediction;

  function clearResultState() {
    setError("");
    setInfoMessage("");
    setPrediction(null);
  }

  async function handleCalculatePrediction() {
    if (!selectedProductoId) {
      setError("Selecciona un producto para calcular la predicción.");
      return;
    }

    const historyYearsNumber =
      historyYears === "" ? DEFAULT_HISTORY_YEARS : Number(historyYears);

    const safetyMarginNumber =
      safetyMarginPercent === ""
        ? DEFAULT_SAFETY_MARGIN_PERCENT
        : Number(safetyMarginPercent);

    const safeHistoryYears = Number.isFinite(historyYearsNumber)
      ? Math.max(2, Math.min(historyYearsNumber, 20))
      : DEFAULT_HISTORY_YEARS;
    const safeMargin = Number.isFinite(safetyMarginNumber)
      ? Math.max(0, Math.min(safetyMarginNumber, 100)) / 100
      : 0;

    const payload: PrediccionFilters = {
      temporada_id: selectedTemporadaId || undefined,
      variante_id: selectedVarianteId || undefined,
      anio_objetivo: anioObjetivo,
      from_year: fromYear ? Number(fromYear) : undefined,
      history_years: safeHistoryYears,
      margen_seguridad: safeMargin,
    };

    try {
      setLoadingPrediction(true);
      setError("");
      setInfoMessage("");

      const response = await prediccionesService.getByProducto(
        selectedProductoId,
        payload,
      );

      if (!response) {
        setPrediction(null);
        setInfoMessage(
          "No se recibió información de predicción para los parámetros seleccionados.",
        );
        return;
      }

      setPrediction(response);
      setInfoMessage(response.message ?? "");
    } catch (err: unknown) {
      setPrediction(null);
      setError(getErrorMessage(err, "No se pudo calcular la predicción."));
    } finally {
      setLoadingPrediction(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <Typography className={styles.title}>
            Predicción de demanda
          </Typography>
          <Typography className={styles.subtitle}>
            Analiza ventas históricas por temporada objetivo y estima la demanda
            futura del producto o variante.
          </Typography>
        </div>
      </div>

      <Paper className={styles.filtersCard}>
        <div className={styles.filtersIntro}>
          <Typography className={styles.sectionTitle}>
            Parámetros del modelo
          </Typography>
          <Typography className={styles.helperText}>
            La temporada seleccionada define el periodo histórico a comparar. No
            limita el producto por su etiqueta comercial.
          </Typography>
        </div>

        <div className={styles.filtersGrid}>
          <div className={`${styles.fieldWrapper} ${styles.fullWidthField}`}>
            <div className={styles.fieldLabel}>Producto</div>
            <FormControl fullWidth>
              <InputLabel id="producto-prediccion-label">Producto</InputLabel>
              <Select
                labelId="producto-prediccion-label"
                value={selectedProductoId}
                label="Producto"
                disabled={loadingCatalogs || productos.length === 0}
                onChange={(event) => {
                  clearResultState();
                  setSelectedProductoId(String(event.target.value));
                }}
              >
                {productos.length === 0 ? (
                  <MenuItem value="" disabled>
                    No hay productos activos
                  </MenuItem>
                ) : (
                  productos.map((producto) => (
                    <MenuItem key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>

          <div className={`${styles.fieldWrapper} ${styles.fullWidthField}`}>
            <div className={styles.fieldLabel}>Variante</div>
            <FormControl fullWidth>
              <InputLabel id="variante-prediccion-label">Variante</InputLabel>
              <Select
                labelId="variante-prediccion-label"
                value={selectedVarianteId}
                label="Variante"
                disabled={!selectedProductoId || loadingVariantes}
                onChange={(event) => {
                  clearResultState();
                  setSelectedVarianteId(String(event.target.value));
                }}
              >
                <MenuItem value="">Producto completo</MenuItem>
                {variantes.map((variante) => (
                  <MenuItem key={variante.id} value={variante.id}>
                    {getVarianteLabel(variante)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className={styles.fieldWrapper}>
            <div className={styles.fieldLabel}>Temporada objetivo</div>
            <FormControl fullWidth>
              <InputLabel id="temporada-prediccion-label">
                Temporada objetivo
              </InputLabel>
              <Select
                labelId="temporada-prediccion-label"
                value={selectedTemporadaId}
                label="Temporada objetivo"
                disabled={loadingCatalogs}
                onChange={(event) => {
                  clearResultState();
                  setSelectedTemporadaId(String(event.target.value));
                }}
              >
                <MenuItem value="">
                  Usar temporada asignada al producto
                </MenuItem>
                {temporadas.map((temporada) => (
                  <MenuItem key={temporada.id} value={temporada.id}>
                    {temporada.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className={styles.fieldWrapper}>
            <div className={styles.fieldLabel}>Año objetivo</div>
            <TextField
              label="Año objetivo"
              type="number"
              value={anioObjetivo}
              onChange={(event) => {
                clearResultState();
                setAnioObjetivo(Number(event.target.value) || CURRENT_YEAR);
              }}
              inputProps={{ min: 2020, max: 2100 }}
              fullWidth
            />
          </div>

          {/* <div className={styles.fieldWrapper}>
            <div className={styles.fieldLabel}>Año inicial histórico</div>
            <TextField
              label="Año inicial histórico"
              type="number"
              value={fromYear}
              onChange={(event) => {
                clearResultState();
                setFromYear(event.target.value);
              }}
              inputProps={{ min: 2020, max: 2100 }}
              placeholder="Automático"
              fullWidth
            />
          </div> */}

          <div className={styles.fieldWrapper}>
            <div className={styles.fieldLabel}>Años históricos</div>
            <TextField
              label="Años históricos"
              type="number"
              value={historyYears}
              onChange={(event) => {
                clearResultState();
                setHistoryYears(event.target.value);
              }}
              inputProps={{ min: 2, max: 20 }}
              fullWidth
            />
          </div>

          <div className={styles.fieldWrapper}>
            <div className={styles.fieldLabel}>Margen de seguridad</div>
            <TextField
              label="Margen de seguridad (%)"
              type="number"
              value={safetyMarginPercent}
              onChange={(event) => {
                clearResultState();
                setSafetyMarginPercent(event.target.value);
              }}
              inputProps={{ min: 0, max: 100, step: 1 }}
              helperText="Regla de negocio posterior al cálculo. No altera la fórmula base."
              fullWidth
            />
          </div>
        </div>

        <div className={styles.actionsRow}>
          <Button
            variant="contained"
            className={styles.calcButton}
            disabled={!canCalculate}
            onClick={handleCalculatePrediction}
          >
            {loadingPrediction ? "Calculando..." : "Calcular predicción"}
          </Button>
        </div>
      </Paper>

      {loadingCatalogs ? (
        <Paper className={styles.statusCard}>
          <CircularProgress size={22} />
          <Typography>Cargando productos y temporadas...</Typography>
        </Paper>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}
      {infoMessage && !error ? (
        <Alert severity="info">{infoMessage}</Alert>
      ) : null}

      {prediction ? (
        <>
          <Paper className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <div>
                <Typography className={styles.sectionTitle}>
                  Resultado del modelo
                </Typography>
                <Typography className={styles.helperText}>
                  {prediction.modelo?.nombre ??
                    "Modelo pendiente por falta de datos históricos suficientes"}
                </Typography>
              </div>

              {prediction.prediccion ? (
                <Chip
                  label={prediction.prediccion.estado_temporada.replace(
                    "_",
                    " ",
                  )}
                  color={getStatusSeverity(
                    prediction.prediccion.estado_temporada,
                  )}
                  variant="outlined"
                />
              ) : null}
            </div>

            <div className={styles.contextGrid}>
              <div className={styles.contextItem}>
                <span>Producto</span>
                <strong>{prediction.producto.nombre}</strong>
              </div>
              <div className={styles.contextItem}>
                <span>Variante</span>
                <strong>
                  {prediction.variante
                    ? `${prediction.variante.talla_nombre ?? "Sin talla"} / ${prediction.variante.color_nombre ?? "Sin color"}`
                    : "Producto completo"}
                </strong>
              </div>
              <div className={styles.contextItem}>
                <span>Temporada</span>
                <strong>{prediction.temporada.nombre}</strong>
              </div>
              <div className={styles.contextItem}>
                <span>Modo</span>
                <strong>
                  {prediction.temporada.modo === "DIRIGIDA"
                    ? "Predicción dirigida"
                    : "Automática por etiqueta"}
                </strong>
              </div>
            </div>

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span>V0</span>
                <strong>{formatNumber(prediction.modelo?.V0, 0)}</strong>
                <small>Ventas iniciales</small>
              </div>
              <div className={styles.metricCard}>
                <span>Vf</span>
                <strong>{formatNumber(prediction.modelo?.Vf, 0)}</strong>
                <small>Ventas finales históricas</small>
              </div>
              <div className={styles.metricCard}>
                <span>k</span>
                <strong>{formatNumber(prediction.modelo?.k, 6)}</strong>
                <small>
                  {prediction.modelo?.interpretacion ?? "Sin cálculo"}
                </small>
              </div>
              <div className={styles.metricCard}>
                <span>Demanda estimada</span>
                <strong>
                  {formatNumber(
                    prediction.prediccion?.demanda_estimada_redondeada,
                    0,
                  )}
                </strong>
                <small>Año {prediction.prediccion?.anio ?? anioObjetivo}</small>
              </div>
              <div className={styles.metricCard}>
                <span>Stock disponible</span>
                <strong>
                  {formatNumber(prediction.inventario?.stock_disponible, 0)}
                </strong>
                <small>Stock físico menos apartado</small>
              </div>
              <div className={styles.metricCard}>
                <span>Preparar</span>
                <strong>
                  {formatNumber(prediction.inventario?.unidades_a_preparar, 0)}
                </strong>
                <small>Unidades adicionales</small>
              </div>
            </div>

            {/* {prediction.modelo ? (
              <div className={styles.formulaBox}>
                <span>Ecuación aplicada</span>
                <strong>{prediction.modelo.ecuacion_aplicada}</strong>
              </div>
            ) : null} */}
          </Paper>

          <div className={styles.metricsHeaderRow}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Histórico y predicción
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setIsChartOpen(true)}
              className={styles.chartButton}
              disabled={chartData.length === 0}
            >
              Ver gráfica
            </Button>
          </div>

          <Paper className={styles.tableCard}>
            <div className={styles.simpleTable}>
              <div className={`${styles.tableRow} ${styles.tableHead}`}>
                <span>Periodo</span>
                <span>Tipo</span>
                <span>Ventas / Demanda</span>
                <span>Inventario</span>
                <span>Detalle</span>
              </div>

              {tableData.map((item) => (
                <div className={styles.tableRow} key={item.key}>
                  <span>{item.periodo}</span>
                  <span
                    className={
                      item.tipo === "Histórico"
                        ? styles.labelHist
                        : styles.labelProj
                    }
                  >
                    {item.tipo}
                  </span>
                  <span>{formatNumber(item.ventas, 0)}</span>
                  <span>
                    {item.inventario === null
                      ? "—"
                      : `${formatNumber(item.inventario, 0)} unidad(es)`}
                  </span>
                  <span>{item.detalle}</span>
                </div>
              ))}
            </div>
          </Paper>

          {prediction.prediccion?.estado_temporada === "FINALIZADA" ? (
            <Alert severity="success">
              Error absoluto:{" "}
              {formatNumber(prediction.prediccion.error_absoluto, 0)}{" "}
              unidad(es). Error porcentual:{" "}
              {formatPercent(prediction.prediccion.error_porcentual)}.
            </Alert>
          ) : null}

          <Dialog
            open={isChartOpen}
            onClose={() => setIsChartOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Comportamiento histórico y demanda estimada
            </DialogTitle>
            <DialogContent>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={420}>
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 28, left: 8, bottom: 8 }}
                  >
                    <defs>
                      <linearGradient
                        id="demandaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ec1380"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ec1380"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(34, 16, 25, 0.12)"
                    />

                    <XAxis
                      dataKey="etiqueta"
                      tickLine={false}
                      axisLine={{ stroke: "rgba(34, 16, 25, 0.25)" }}
                    />

                    <YAxis
                      allowDecimals={false}
                      domain={[0, getChartMaxValue(chartData)]}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(34, 16, 25, 0.25)" }}
                      label={{
                        value: "Unidades",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />

                    <RechartsTooltip
                      formatter={(value, name) => {
                        const numericValue =
                          typeof value === "number" ? value : Number(value);

                        const key = String(name ?? "");

                        const labelMap: Record<string, string> = {
                          demanda: "Demanda",
                          historico: "Ventas históricas",
                          proyectado: "Demanda estimada",
                          ventasObjetivo: "Venta real objetivo",
                        };

                        return [
                          formatNumber(
                            Number.isFinite(numericValue) ? numericValue : 0,
                            0,
                          ),
                          labelMap[key] ?? key,
                        ];
                      }}
                      labelFormatter={(label) => `Año ${label}`}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(34, 16, 25, 0.12)",
                        boxShadow: "0 12px 30px rgba(34, 16, 25, 0.12)",
                      }}
                    />

                    <Legend
                      formatter={(value) => {
                        const labels: Record<string, string> = {
                          historico: "Histórico",
                          proyectado: "Predicción",
                          ventasObjetivo: "Venta real objetivo",
                        };

                        return labels[String(value)] ?? String(value);
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="demanda"
                      name="demanda"
                      stroke="none"
                      fill="url(#demandaGradient)"
                      activeDot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="historico"
                      name="historico"
                      stroke="#ec1380"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#ec1380",
                        fill: "#ffffff",
                      }}
                      activeDot={{ r: 7 }}
                      connectNulls={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="proyectado"
                      name="proyectado"
                      stroke="#221019"
                      strokeWidth={3}
                      strokeDasharray="7 5"
                      dot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#221019",
                        fill: "#ffffff",
                      }}
                      activeDot={{ r: 7 }}
                      connectNulls={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="ventasObjetivo"
                      name="ventasObjetivo"
                      stroke="#6b7280"
                      strokeWidth={2.5}
                      dot={{
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#6b7280",
                        fill: "#ffffff",
                      }}
                      activeDot={{ r: 7 }}
                      connectNulls={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsChartOpen(false)}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}

      {!prediction && !loadingPrediction && selectedProducto ? (
        <Paper className={styles.emptyCard}>
          <Typography className={styles.sectionTitle}>
            Listo para calcular
          </Typography>
          <Typography className={styles.helperText}>
            Producto seleccionado: {selectedProducto.nombre}
            {selectedTemporada
              ? ` · Temporada objetivo: ${selectedTemporada.nombre}`
              : " · Temporada automática por etiqueta"}
          </Typography>
        </Paper>
      ) : null}
    </div>
  );
}
