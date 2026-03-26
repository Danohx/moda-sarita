import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Add,
  Email,
  Campaign,
  Percent,
  TrendingUp,
  Edit,
  Delete,
  Visibility,
  Share,
  Warning,
} from "@mui/icons-material";

type Promocion = {
  id: number;
  nombre: string;
  descuento: string;
  inicio: string;
  fin: string;
  activo: boolean;
  usos: number;
};

type Campana = {
  id: number;
  nombre: string;
  tipo: string;
  enviados: number;
  abiertos: number;
  clicks: number;
  fecha: string;
};

type MarketingData = {
  promociones: Promocion[];
  campanas: Campana[];
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Placeholder API
 * Puedes conectar después a:
 * - GET /marketing/cupones
 * - GET /marketing/campanas
 * - POST /marketing/lanzamiento-oficial
 * o endpoints nuevos para admin marketing
 */
async function fetchMarketingData(signal?: AbortSignal): Promise<MarketingData> {
  void signal;
  return {
    promociones: [],
    campanas: [],
  };
}

const AdminMarketing: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);

  const load = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      const data = await fetchMarketingData(controller.signal);
      setPromociones(data.promociones ?? []);
      setCampanas(data.campanas ?? []);
    } catch {
      setPromociones([]);
      setCampanas([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const estadisticas = useMemo(() => {
    const promocionesActivas = promociones.filter((p) => p.activo).length;
    const clientesAlcanzados = campanas.reduce((sum, c) => sum + c.enviados, 0);
    const totalAbiertos = campanas.reduce((sum, c) => sum + c.abiertos, 0);
    const tasaConversion =
      clientesAlcanzados > 0 ? Number(((totalAbiertos / clientesAlcanzados) * 100).toFixed(1)) : 0;

    return {
      promocionesActivas,
      clientesAlcanzados,
      tasaConversion,
      ventasGeneradas: 0,
    };
  }, [promociones, campanas]);

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  const skeletonRows = useMemo(() => Array.from({ length: 3 }), []);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
          Marketing y Promociones
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            bgcolor: "#E91E8C",
            "&:hover": { bgcolor: "#C2185B" },
            borderRadius: "25px",
            px: 3,
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Nueva Campaña
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Promociones Activas
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                    {estadisticas.promocionesActivas}
                  </Typography>
                </Box>
                <Percent sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Clientes Alcanzados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                    {estadisticas.clientesAlcanzados}
                  </Typography>
                </Box>
                <Campaign sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Tasa de Conversión
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                    {estadisticas.tasaConversion}%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)", color: "#E91E8C" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ventas Generadas
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
                    {formatMoneda(estadisticas.ventasGeneradas)}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <Tabs
          value={tabValue}
          onChange={(_: React.SyntheticEvent, v: number) => setTabValue(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: "bold" },
            "& .Mui-selected": { color: "#E91E8C" },
            "& .MuiTabs-indicator": { bgcolor: "#E91E8C" },
          }}
        >
          <Tab label="Promociones" />
          <Tab label="Campañas" />
          <Tab label="Newsletter" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#FDE8F4" }}>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Promoción</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Descuento</strong></TableCell>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Inicio</strong></TableCell>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Fin</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Usos</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Estado</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  skeletonRows.map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton width={180} /></TableCell>
                      <TableCell align="center"><Skeleton width={60} /></TableCell>
                      <TableCell><Skeleton width={90} /></TableCell>
                      <TableCell><Skeleton width={90} /></TableCell>
                      <TableCell align="center"><Skeleton width={40} /></TableCell>
                      <TableCell align="center"><Skeleton width={50} /></TableCell>
                      <TableCell align="center"><Skeleton width={90} /></TableCell>
                    </TableRow>
                  ))
                ) : promociones.length > 0 ? (
                  promociones.map((promo) => (
                    <TableRow key={promo.id} hover sx={{ "&:hover": { bgcolor: "#FFF5FA" } }}>
                      <TableCell>
                        <Typography fontWeight="bold" sx={{ color: "#333" }}>
                          {promo.nombre}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={promo.descuento}
                          sx={{ bgcolor: "#FDE8F4", color: "#E91E8C", fontWeight: "bold" }}
                        />
                      </TableCell>

                      <TableCell>{promo.inicio}</TableCell>
                      <TableCell>{promo.fin}</TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">{promo.usos}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={promo.activo}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: "#E91E8C" },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#E91E8C" },
                              }}
                            />
                          }
                          label=""
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton size="small" sx={{ color: "#E91E8C" }}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "#E91E8C" }}>
                          <Share />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "#C2185B" }}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, color: "#666" }}>
                        <Warning fontSize="small" />
                        <Typography>Sin promociones (pendiente de API).</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#FDE8F4" }}>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Campaña</strong></TableCell>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Tipo</strong></TableCell>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Fecha</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Enviados</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Abiertos</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Clicks</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  skeletonRows.map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton width={180} /></TableCell>
                      <TableCell><Skeleton width={90} /></TableCell>
                      <TableCell><Skeleton width={90} /></TableCell>
                      <TableCell align="center"><Skeleton width={50} /></TableCell>
                      <TableCell align="center"><Skeleton width={50} /></TableCell>
                      <TableCell align="center"><Skeleton width={50} /></TableCell>
                      <TableCell align="center"><Skeleton width={90} /></TableCell>
                    </TableRow>
                  ))
                ) : campanas.length > 0 ? (
                  campanas.map((camp) => {
                    const tasaApertura =
                      camp.enviados > 0 ? ((camp.abiertos / camp.enviados) * 100).toFixed(1) : "0.0";
                    const tasaClick =
                      camp.abiertos > 0 ? ((camp.clicks / camp.abiertos) * 100).toFixed(1) : "0.0";

                    return (
                      <TableRow key={camp.id} hover sx={{ "&:hover": { bgcolor: "#FFF5FA" } }}>
                        <TableCell>
                          <Typography fontWeight="bold" sx={{ color: "#333" }}>
                            {camp.nombre}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={camp.tipo}
                            icon={camp.tipo === "Email" ? <Email /> : undefined}
                            sx={{ bgcolor: "#FDE8F4", color: "#E91E8C" }}
                          />
                        </TableCell>

                        <TableCell>{camp.fecha}</TableCell>
                        <TableCell align="center">{camp.enviados}</TableCell>

                        <TableCell align="center">
                          <Box>
                            <Typography fontWeight="bold">{camp.abiertos}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({tasaApertura}%)
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Box>
                            <Typography fontWeight="bold" sx={{ color: "#E91E8C" }}>
                              {camp.clicks}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({tasaClick}%)
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <IconButton size="small" sx={{ color: "#E91E8C" }}>
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" sx={{ color: "#E91E8C" }}>
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, color: "#666" }}>
                        <Warning fontSize="small" />
                        <Typography>Sin campañas (pendiente de API).</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <Typography variant="h6" gutterBottom sx={{ color: "#333", fontWeight: "bold", mb: 3 }}>
            Crear Newsletter
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Asunto del Email"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#E91E8C" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#E91E8C" },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mensaje"
                multiline
                rows={8}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#E91E8C" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#E91E8C" },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Email />}
                sx={{
                  bgcolor: "#E91E8C",
                  "&:hover": { bgcolor: "#C2185B" },
                  borderRadius: "25px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                Enviar Newsletter
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default AdminMarketing;