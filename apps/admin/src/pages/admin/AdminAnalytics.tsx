import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  BrainCircuit,
  HandCoins,
  TrendingUp,
} from "lucide-react";

import {
  clientesService,
} from "@admin/services/clientes.service";

import {
  productosService,
} from "@admin/services/productos.service";

import {
  analiticaService,
} from "@admin/services/analitica.service";

import type {
  Cliente,
} from "@shared/api/cliente.api";

import type {
  Producto,
} from "@shared/api/productos.api";

import type {
  EvaluacionCreditoData,
  PrediccionVentasData,
} from "@shared/api/analitica.api";

import styles from "../../../styles/AdminAnalytics.module.css";

const money = new Intl.NumberFormat(
  "es-MX",
  {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  },
);

const percent = new Intl.NumberFormat(
  "es-MX",
  {
    style: "percent",
    maximumFractionDigits: 1,
  },
);

function nombreCliente(
  cliente: Cliente,
) {
  return [
    cliente.nombres,
    cliente.apellido_paterno,
    cliente.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatMonth(
  value: string,
) {
  const date = new Date(
    `${String(value).slice(0, 10)}T12:00:00`,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

export default function AdminAnalytics() {
  const [
    clientes,
    setClientes,
  ] = useState<Cliente[]>([]);

  const [
    productos,
    setProductos,
  ] = useState<Producto[]>([]);

  const [
    cliente,
    setCliente,
  ] = useState<Cliente | null>(null);

  const [
    producto,
    setProducto,
  ] = useState<Producto | null>(null);

  const [
    loadingCatalogs,
    setLoadingCatalogs,
  ] = useState(true);

  const [
    loadingCredito,
    setLoadingCredito,
  ] = useState(false);

  const [
    loadingVentas,
    setLoadingVentas,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    credito,
    setCredito,
  ] = useState<
    EvaluacionCreditoData | null
  >(null);

  const [
    ventas,
    setVentas,
  ] = useState<
    PrediccionVentasData | null
  >(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingCatalogs(true);
        setError(null);

        const [
          clientesData,
          productosData,
        ] = await Promise.all([
          clientesService.getList({
            includeInactive: false,
          }),
          productosService.getList({
            activo: true,
          }),
        ]);

        setClientes(
          clientesData,
        );

        setProductos(
          productosData,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar clientes y productos.",
        );
      } finally {
        setLoadingCatalogs(false);
      }
    }

    void load();
  }, []);

  const creditoPositivo =
    credito?.resultado
      === "RECOMENDADO";

  const resultadoCreditoTexto =
    credito?.resultado === "RECOMENDADO"
      ? "Apto para crédito"
      : credito?.resultado === "NO_RECOMENDADO"
        ? "No apto para crédito"
        : "";

  const diferenciaBaseline =
    useMemo(
      () => {
        if (!ventas) return 0;

        return (
          ventas.r2_modelo
          - ventas.r2_baseline
        );
      },
      [ventas],
    );

  async function evaluarCredito() {
    if (!cliente) return;

    try {
      setLoadingCredito(true);
      setError(null);
      setCredito(null);

      const data =
        await analiticaService
          .evaluarCredito(
            cliente.id,
          );

      setCredito(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo evaluar el crédito.",
      );
    } finally {
      setLoadingCredito(false);
    }
  }

  async function predecirVentas() {
    if (!producto) return;

    try {
      setLoadingVentas(true);
      setError(null);
      setVentas(null);

      const data =
        await analiticaService
          .predecirVentas(
            producto.id,
          );

      setVentas(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo generar la predicción.",
      );
    } finally {
      setLoadingVentas(false);
    }
  }

  return (
    <Box className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleIcon}>
          <BrainCircuit size={30} />
        </div>

        <div>
          <Typography
            variant="h4"
            className={styles.title}
          >
            Analítica predictiva
          </Typography>

          <Typography
            className={styles.subtitle}
          >
            Modelos de extracción de conocimiento integrados a Moda Sarita.
          </Typography>
        </div>
      </header>

      {error ? (
        <Alert
          severity="error"
          onClose={() =>
            setError(null)
          }
        >
          {error}
        </Alert>
      ) : null}

      {loadingCatalogs ? (
        <div
          className={
            styles.loading
          }
        >
          <CircularProgress />
          Cargando información...
        </div>
      ) : (
        <div
          className={
            styles.grid
          }
        >
          <Card
            className={
              styles.card
            }
          >
            <CardContent>
              <Stack
                spacing={2.25}
              >
                <div
                  className={
                    styles.cardHeading
                  }
                >
                  <div
                    className={
                      styles.cardIcon
                    }
                  >
                    <HandCoins
                      size={22}
                    />
                  </div>

                  <div>
                    <Typography
                      variant="h6"
                    >
                      Evaluación de crédito
                    </Typography>

                    <Typography
                      variant="body2"
                      className={
                        styles.muted
                      }
                    >
                      Clasificación mediante SVC a partir del historial de compras.
                    </Typography>
                  </div>
                </div>

                <Autocomplete
                  options={clientes}
                  value={cliente}
                  onChange={(
                    _,
                    value,
                  ) => {
                    setCliente(value);
                    setCredito(null);
                  }}
                  getOptionLabel={
                    nombreCliente
                  }
                  isOptionEqualToValue={(
                    option,
                    value,
                  ) =>
                    String(
                      option.id,
                    )
                    === String(
                      value.id,
                    )
                  }
                  renderInput={(
                    params,
                  ) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      placeholder="Buscar cliente"
                    />
                  )}
                />

                <Button
                  variant="contained"
                  onClick={
                    evaluarCredito
                  }
                  disabled={
                    !cliente
                    || loadingCredito
                  }
                  className={
                    styles.primaryButton
                  }
                >
                  {loadingCredito
                    ? "Evaluando..."
                    : "Evaluar para crédito"}
                </Button>

                {credito ? (
                  <>
                    <Divider />

                    <div
                      className={
                        styles.resultHeader
                      }
                    >
                      <div>
                        <span
                          className={
                            styles.eyebrow
                          }
                        >
                          Resultado
                        </span>

                        <Typography
                          variant="h5"
                        >
                          {
                            resultadoCreditoTexto
                          }
                        </Typography>
                      </div>

                      <Chip
                        label={
                          percent.format(
                            credito.probabilidad,
                          )
                        }
                        color={
                          creditoPositivo
                            ? "success"
                            : "warning"
                        }
                        variant="outlined"
                      />
                    </div>

                    <div
                      className={
                        styles.metricGrid
                      }
                    >
                      <div>
                        <span>
                          Compras
                        </span>
                        <strong>
                          {
                            credito
                              .resumen
                              .total_compras_historicas
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Gasto histórico
                        </span>
                        <strong>
                          {money.format(
                            credito
                              .resumen
                              .gasto_total_historico,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Ticket promedio
                        </span>
                        <strong>
                          {money.format(
                            credito
                              .resumen
                              .ticket_promedio_historico,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Meses activos
                        </span>
                        <strong>
                          {percent.format(
                            credito
                              .resumen
                              .porcentaje_meses_activos,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Última compra
                        </span>
                        <strong>
                          {
                            credito
                              .resumen
                              .dias_desde_ultima_compra
                          } días
                        </strong>
                      </div>

                      <div>
                        <span>
                          Modelo
                        </span>
                        <strong>
                          {
                            credito.modelo
                          }
                        </strong>
                      </div>
                    </div>

                    <Alert
                      severity={
                        creditoPositivo
                          ? "success"
                          : "info"
                      }
                    >
                      Esta evaluación funciona como apoyo a la decisión. No activa ni desactiva el crédito automáticamente.
                    </Alert>
                  </>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card
            className={
              styles.card
            }
          >
            <CardContent>
              <Stack
                spacing={2.25}
              >
                <div
                  className={
                    styles.cardHeading
                  }
                >
                  <div
                    className={
                      styles.cardIcon
                    }
                  >
                    <TrendingUp
                      size={22}
                    />
                  </div>

                  <div>
                    <Typography
                      variant="h6"
                    >
                      Predicción de ventas
                    </Typography>

                    <Typography
                      variant="body2"
                      className={
                        styles.muted
                      }
                    >
                      Regresión residual con Extra Trees para estimar el próximo mes.
                    </Typography>
                  </div>
                </div>

                <Autocomplete
                  options={
                    productos
                  }
                  value={
                    producto
                  }
                  onChange={(
                    _,
                    value,
                  ) => {
                    setProducto(
                      value,
                    );
                    setVentas(null);
                  }}
                  getOptionLabel={(
                    option,
                  ) =>
                    option.nombre
                  }
                  isOptionEqualToValue={(
                    option,
                    value,
                  ) =>
                    String(
                      option.id,
                    )
                    === String(
                      value.id,
                    )
                  }
                  renderInput={(
                    params,
                  ) => (
                    <TextField
                      {...params}
                      label="Producto"
                      placeholder="Buscar producto"
                    />
                  )}
                />

                <Button
                  variant="contained"
                  onClick={
                    predecirVentas
                  }
                  disabled={
                    !producto
                    || loadingVentas
                  }
                  className={
                    styles.primaryButton
                  }
                >
                  {loadingVentas
                    ? "Calculando..."
                    : "Predecir ventas"}
                </Button>

                {ventas ? (
                  <>
                    <Divider />

                    <div
                      className={
                        styles.salesHero
                      }
                    >
                      <span
                        className={
                          styles.eyebrow
                        }
                      >
                        Estimación para{" "}
                        {formatMonth(
                          ventas.mes_objetivo,
                        )}
                      </span>

                      <strong>
                        {money.format(
                          ventas.monto_estimado,
                        )}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.metricGrid
                      }
                    >
                      <div>
                        <span>
                          Último mes completo
                        </span>
                        <strong>
                          {money.format(
                            ventas.monto_mes_actual,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Cambio estimado
                        </span>
                        <strong>
                          {ventas.cambio_estimado >= 0
                            ? "+"
                            : ""}
                          {money.format(
                            ventas.cambio_estimado,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          R² del modelo
                        </span>
                        <strong>
                          {ventas.r2_modelo.toFixed(
                            4,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          R² línea base
                        </span>
                        <strong>
                          {ventas.r2_baseline.toFixed(
                            4,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Mejora vs. línea base
                        </span>
                        <strong>
                          +{diferenciaBaseline.toFixed(
                            4,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Modelo
                        </span>
                        <strong>
                          {
                            ventas.modelo === "ExtraTreesRegressor"
                              ? "Extra Trees"
                              : ventas.modelo
                          }
                        </strong>
                      </div>
                    </div>

                    <Alert
                      severity="info"
                    >
                      La estimación utiliza únicamente ventas históricas disponibles hasta el último mes completo.
                      {" "}El R² del modelo y el R² de la línea base corresponden a los resultados obtenidos en el conjunto de prueba.
                    </Alert>
                  </>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </div>
      )}
    </Box>
  );
}
