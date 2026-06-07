import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  AttachMoney,
  Cancel,
  Edit,
  LocalShipping,
  Person,
  Schedule,
  ShoppingBag,
  Visibility,
  Warning,
  Search,
} from "@mui/icons-material";
import styles from "../../../styles/OrdersManager.module.css";
import {
  pedidosService,
  type Apartado,
  type ApartadoEstadoFilter,
  type Order,
  type OrderStatus,
  type WebEstadoFilter,
} from "@admin/services/pedidos.service";
import type { MetodoPago, PedidoDetalleAdmin } from "@shared/api/pedidos.api";
import OrderDetailModal from "@admin/components/components/OrderDetailModal";
import ApartadoActionModals from "@admin/components/components/ApartadoActionsModal";
import { useSearchParams } from "react-router-dom";

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(valor);
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
      {value === index ? (
        <Box className={styles.tabPanel}>{children}</Box>
      ) : null}
    </div>
  );
}

function getStatusVariant(status: OrderStatus) {
  switch (status) {
    case "PENDIENTE":
      return styles.statusPending;

    case "PAGADO":
    case "ENVIADO":
      return styles.statusProcessing;

    case "ENTREGADO":
      return styles.statusDone;

    case "CANCELADO":
    case "DEVUELTO":
    default:
      return styles.statusDefault;
  }
}

function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDIENTE":
      return "Pendiente";
    case "PAGADO":
      return "Pagado";
    case "ENVIADO":
      return "Enviado";
    case "ENTREGADO":
      return "Entregado";
    case "CANCELADO":
      return "Cancelado";
    case "DEVUELTO":
      return "Devuelto";
    default:
      return status;
  }
}

function getApartadoStatusLabel(status: Apartado["estado"]) {
  switch (status) {
    case "ACTIVO":
      return "Activo";
    case "LIQUIDADO":
      return "Liquidado";
    case "CANCELADO":
      return "Cancelado";
    case "VENCIDO":
      return "Vencido";
    default:
      return status;
  }
}

const OrdersManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [apartados, setApartados] = useState<Apartado[]>([]);

  const [webEstadoFilter, setWebEstadoFilter] =
    useState<WebEstadoFilter>("TODOS");
  const [apartadoEstadoFilter, setApartadoEstadoFilter] =
    useState<ApartadoEstadoFilter>("TODOS");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<PedidoDetalleAdmin | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [abonoOpen, setAbonoOpen] = useState(false);
  const [liquidarOpen, setLiquidarOpen] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);

  const [selectedApartado, setSelectedApartado] = useState<Apartado | null>(
    null,
  );

  const [abonoMonto, setAbonoMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [referenciaExterna, setReferenciaExterna] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  const [ticketLoading, setTicketLoading] = useState(false);

  const [searchParams] = useSearchParams();

  const clienteIdParam = searchParams.get("cliente_id");
  const tipoParam = searchParams.get("tipo");

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const resp = await pedidosService.getOrdersData({
        q: searchTerm,
        webEstado: webEstadoFilter,
        apartadoEstado: apartadoEstadoFilter,
        cliente_id: clienteIdParam ?? undefined,
      });

      setOrders(resp.orders);
      setApartados(resp.apartados);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
      setOrders([]);
      setApartados([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, webEstadoFilter, apartadoEstadoFilter, clienteIdParam]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (tipoParam === "APARTADO") {
      setTabValue(1);
      return;
    }

    if (tipoParam === "WEB") {
      setTabValue(0);
    }
  }, [tipoParam]);

  const handleOpenDetail = async (id: string) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setSelectedDetail(null);

      const data = await pedidosService.getById(id);
      setSelectedDetail(data);
    } catch (err) {
      console.error("Error cargando detalle:", err);
      setSelectedDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedDetail(null);
  };

  const skeletonRows = useMemo(() => Array.from({ length: 3 }), []);
  const skeletonCards = useMemo(() => Array.from({ length: 6 }), []);

  const openAbonoModal = (apartado: Apartado) => {
    setSelectedApartado(apartado);
    setAbonoMonto("");
    setMetodoPago("EFECTIVO");
    setReferenciaExterna("");
    setAbonoOpen(true);
  };

  const openLiquidarModal = (apartado: Apartado) => {
    setSelectedApartado(apartado);
    setMetodoPago("EFECTIVO");
    setReferenciaExterna("");
    setLiquidarOpen(true);
  };

  const openCancelarModal = (apartado: Apartado) => {
    setSelectedApartado(apartado);
    setMotivoCancelacion("");
    setCancelarOpen(true);
  };

  const closeActionModals = () => {
    if (actionLoading) return;

    setAbonoOpen(false);
    setLiquidarOpen(false);
    setCancelarOpen(false);
    setSelectedApartado(null);
    setAbonoMonto("");
    setReferenciaExterna("");
    setMotivoCancelacion("");
  };

  const handleRegistrarAbono = async () => {
    if (!selectedApartado) return;

    const monto = Number(abonoMonto);

    if (!Number.isFinite(monto) || monto <= 0) {
      alert("Ingresa un monto válido.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await pedidosService.registrarAbono(
        selectedApartado.id,
        {
          monto,
          metodo: metodoPago,
          referencia_externa: referenciaExterna.trim() || null,
        },
      );

      if (response.pago_generado?.id) {
        await pedidosService.abrirTicketPagoPdf(
          selectedApartado.id,
          response.pago_generado.id,
        );
      }

      setAbonoOpen(false);
      setSelectedApartado(null);
      await load();
    } catch (err) {
      console.error("Error registrando abono:", err);
      alert("No se pudo registrar el abono.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLiquidarApartado = async () => {
    if (!selectedApartado) return;

    try {
      setActionLoading(true);

      const response = await pedidosService.liquidar(selectedApartado.id, {
        metodo: metodoPago,
        referencia_externa: referenciaExterna.trim() || null,
      });

      if (response.pago_generado?.id) {
        await pedidosService.abrirTicketPagoPdf(
          selectedApartado.id,
          response.pago_generado.id,
        );
      }

      setLiquidarOpen(false);
      setSelectedApartado(null);
      await load();
    } catch (err) {
      console.error("Error liquidando apartado:", err);
      alert("No se pudo liquidar el apartado.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelarApartado = async () => {
    if (!selectedApartado) return;

    const motivo = motivoCancelacion.trim();

    if (motivo.length < 3) {
      alert("Escribe un motivo de cancelación.");
      return;
    }

    try {
      setActionLoading(true);

      await pedidosService.cancelar(selectedApartado.id, motivo);

      setCancelarOpen(false);
      setSelectedApartado(null);
      await load();
    } catch (err) {
      console.error("Error cancelando apartado:", err);
      alert("No se pudo cancelar el apartado.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenTicketPdf = async (id: string | number) => {
    try {
      setTicketLoading(true);
      await pedidosService.abrirTicketPdf(id);
    } catch (err) {
      console.error("Error abriendo ticket PDF:", err);
      alert("No se pudo abrir el ticket PDF.");
    } finally {
      setTicketLoading(false);
    }
  };

  const handleOpenPagoTicketPdf = async (pedidoId: string, pagoId: string) => {
    try {
      setTicketLoading(true);
      await pedidosService.abrirTicketPagoPdf(pedidoId, pagoId);
    } catch (err) {
      console.error("Error abriendo ticket de pago:", err);
      alert("No se pudo abrir el ticket de pago.");
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <Box className={styles.root}>
      <Typography variant="h4" className={styles.title}>
        Gestión de Pedidos
      </Typography>

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

      <TabPanel value={tabValue} index={0}>
        <Paper className={styles.filtersPaper}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por folio o cliente"
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className={styles.searchIcon} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth className={styles.filterControl}>
            <Select
              value={webEstadoFilter}
              onChange={(event) =>
                setWebEstadoFilter(event.target.value as WebEstadoFilter)
              }
              displayEmpty
            >
              <MenuItem value="TODOS">Todos los estados</MenuItem>
              <MenuItem value="PENDIENTE">Pendiente</MenuItem>
              <MenuItem value="PAGADO">Pagado</MenuItem>
              <MenuItem value="ENVIADO">Enviado</MenuItem>
              <MenuItem value="ENTREGADO">Entregado</MenuItem>
              <MenuItem value="CANCELADO">Cancelado</MenuItem>
              <MenuItem value="DEVUELTO">Devuelto</MenuItem>
            </Select>
          </FormControl>
        </Paper>

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
                          <Typography
                            variant="h6"
                            className={styles.orderTitle}
                          >
                            Orden {order.orderId}
                          </Typography>

                          <Chip
                            label={getOrderStatusLabel(order.status)}
                            size="small"
                            className={`${styles.statusChip} ${getStatusVariant(order.status)}`}
                          />
                        </Box>

                        <Box className={styles.orderCustomerRow}>
                          <Avatar className={styles.customerAvatar}>
                            <Person className={styles.customerAvatarIcon} />
                          </Avatar>

                          <Typography
                            variant="body2"
                            className={styles.orderCustomerText}
                          >
                            Cliente: {order.customer} • {order.items} artículos
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          className={styles.orderTime}
                        >
                          {order.time}
                        </Typography>
                      </Box>

                      <Box className={styles.orderRight}>
                        <Box className={styles.orderRightTop}>
                          <Typography
                            variant="h5"
                            className={styles.orderAmount}
                          >
                            {formatMoneda(order.total)}
                          </Typography>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            className={styles.viewBtn}
                            onClick={() => void handleOpenDetail(order.id)}
                          >
                            Ver detalles
                          </Button>
                        </Box>

                        {order.status !== "ENTREGADO" ? (
                          <Box className={styles.orderActions}>
                            <IconButton
                              size="small"
                              className={styles.actionPink}
                              onClick={() => {
                                alert("Deshabilitado");
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              className={styles.actionBlue}
                              onClick={() => {
                                alert("Deshabilitado");
                              }}
                            >
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
                    Sin pedidos web.
                  </Typography>
                </Box>
                <Typography className={styles.emptyHint}>
                  Cuando existan pedidos web, aquí se listarán automáticamente.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper className={styles.filtersPaper}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por folio o cliente"
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className={styles.searchIcon} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth className={styles.filterControl}>
            <Select
              value={apartadoEstadoFilter}
              onChange={(event) =>
                setApartadoEstadoFilter(
                  event.target.value as ApartadoEstadoFilter,
                )
              }
              displayEmpty
            >
              <MenuItem value="TODOS">Todos los apartados</MenuItem>
              <MenuItem value="ACTIVO">Apartados activos</MenuItem>
              <MenuItem value="LIQUIDADO">Apartados liquidados</MenuItem>
              <MenuItem value="CANCELADO">Apartados cancelados</MenuItem>
              <MenuItem value="VENCIDO">Apartados vencidos</MenuItem>
            </Select>
          </FormControl>
        </Paper>

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
                    <Box className={styles.apartadoHeader}>
                      <Box className={styles.apartadoHeaderLeft}>
                        <Avatar className={styles.apartadoAvatar}>
                          <Person />
                        </Avatar>

                        <Box className={styles.apartadoHeaderText}>
                          <Typography
                            variant="subtitle1"
                            className={styles.apartadoCustomer}
                          >
                            {apartado.customer}
                          </Typography>
                          <Typography
                            variant="caption"
                            className={styles.apartadoId}
                          >
                            Folio: APT-{apartado.folio}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        gap={1}
                        flexWrap="wrap"
                        justifyContent="flex-end"
                      >
                        <Chip
                          label={getApartadoStatusLabel(apartado.estado)}
                          size="small"
                          className={styles.deadlineChip}
                        />

                        <Chip
                          label={`Vence: ${apartado.deadline}`}
                          size="small"
                          className={styles.deadlineChip}
                        />
                      </Box>
                    </Box>

                    <Box className={styles.apartadoStatsBox}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                          <Typography
                            variant="caption"
                            className={styles.statLabel}
                          >
                            Total
                          </Typography>
                          <Typography variant="h6" className={styles.statValue}>
                            {formatMoneda(apartado.total)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                          <Typography
                            variant="caption"
                            className={styles.statLabel}
                          >
                            Abonado
                          </Typography>
                          <Typography
                            variant="h6"
                            className={`${styles.statValue} ${styles.statGreen}`}
                          >
                            {formatMoneda(apartado.paid)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 4 }}>
                          <Typography
                            variant="caption"
                            className={styles.statLabel}
                          >
                            Resta
                          </Typography>
                          <Typography
                            variant="h6"
                            className={`${styles.statValue} ${styles.statRed}`}
                          >
                            {formatMoneda(apartado.remaining)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box className={styles.progressWrap}>
                      <Box className={styles.progressTopRow}>
                        <Typography
                          variant="caption"
                          className={styles.progressLabel}
                        >
                          Progreso de pago
                        </Typography>
                        <Typography
                          variant="caption"
                          className={styles.progressPercent}
                        >
                          {apartado.progress}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={apartado.progress}
                        className={styles.progress}
                      />
                    </Box>

                    <Box className={styles.apartadoBtns}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        className={styles.viewBtn}
                        onClick={() => void handleOpenDetail(apartado.id)}
                      >
                        Ver detalle
                      </Button>

                      <Box className={styles.apartadoBtnsActions}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AttachMoney />}
                          className={styles.primaryButton}
                          disabled={apartado.estado !== "ACTIVO"}
                          onClick={() => openAbonoModal(apartado)}
                        >
                          Abonar
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          className={styles.primaryButton}
                          disabled={apartado.estado !== "ACTIVO"}
                          onClick={() => openLiquidarModal(apartado)}
                        >
                          Liquidar
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Cancel />}
                          className={styles.dangerButton}
                          disabled={apartado.estado !== "ACTIVO"}
                          onClick={() => openCancelarModal(apartado)}
                        >
                          Cancelar
                        </Button>
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
                    Sin apartados físicos.
                  </Typography>
                </Box>
                <Typography className={styles.emptyHint}>
                  Cuando existan apartados, aquí se listarán automáticamente.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <OrderDetailModal
        open={detailOpen}
        onClose={handleCloseDetail}
        loading={detailLoading}
        detail={selectedDetail}
        ticketLoading={ticketLoading}
        onOpenTicketPdf={(id) => void handleOpenTicketPdf(id)}
        onOpenPagoTicketPdf={(pedidoId, pagoId) =>
          void handleOpenPagoTicketPdf(pedidoId, pagoId)
        }
      />

      <ApartadoActionModals
        apartadoFolio={selectedApartado?.folio ?? null}
        apartadoRemaining={selectedApartado?.remaining ?? 0}
        abonoOpen={abonoOpen}
        abonoMonto={abonoMonto}
        onAbonoMontoChange={setAbonoMonto}
        liquidarOpen={liquidarOpen}
        cancelarOpen={cancelarOpen}
        motivoCancelacion={motivoCancelacion}
        onMotivoCancelacionChange={setMotivoCancelacion}
        metodoPago={metodoPago}
        onMetodoPagoChange={setMetodoPago}
        referenciaExterna={referenciaExterna}
        onReferenciaExternaChange={setReferenciaExterna}
        actionLoading={actionLoading}
        onClose={closeActionModals}
        onRegistrarAbono={() => void handleRegistrarAbono()}
        onLiquidarApartado={() => void handleLiquidarApartado()}
        onCancelarApartado={() => void handleCancelarApartado()}
      />
    </Box>
  );
};

export default OrdersManager;
