import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Skeleton,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Close,
  Person,
  ShoppingBag,
  AttachMoney,
  LocalShipping,
  Receipt,
  Store,
  Schedule,
  CheckCircle,
  Cancel,
  Info,
} from "@mui/icons-material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import type { PedidoDetalleAdmin } from "@shared/api/pedidos.api";
import styles from "../../../styles/OrderDetailModal.module.css";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatMoneda(valor: string | number | null | undefined) {
  const n = Number(valor ?? 0);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.isFinite(n) ? n : 0);
}

function toNumber(value: string | number | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function formatFecha(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ─── estado helpers ────────────────────────────────────────────────────────────

function getEstadoIcon(estado: string) {
  switch (estado) {
    case "PAGADO":
    case "ENTREGADO":
    case "LIQUIDADO":
      return <CheckCircle fontSize="small" />;
    case "ENVIADO":
      return <LocalShipping fontSize="small" />;
    case "PENDIENTE":
    case "ACTIVO":
      return <Schedule fontSize="small" />;
    case "CANCELADO":
    case "DEVUELTO":
    case "VENCIDO":
      return <Cancel fontSize="small" />;
    default:
      return <Info fontSize="small" />;
  }
}

function getEstadoClass(estado: string, styles: Record<string, string>) {
  switch (estado) {
    case "PAGADO":
    case "ENTREGADO":
    case "LIQUIDADO":
      return styles.estadoSuccess;
    case "ENVIADO":
    case "PENDIENTE":
    case "ACTIVO":
      return styles.estadoInfo;
    case "CANCELADO":
    case "DEVUELTO":
    case "VENCIDO":
      return styles.estadoDanger;
    default:
      return styles.estadoDefault;
  }
}

function getTipoIcon(tipo: string) {
  switch (tipo) {
    case "WEB":
      return <ShoppingBag fontSize="small" />;
    case "PUNTO_VENTA":
      return <Store fontSize="small" />;
    case "APARTADO":
      return <Schedule fontSize="small" />;
    default:
      return <Receipt fontSize="small" />;
  }
}

function getTipoLabel(tipo: string) {
  switch (tipo) {
    case "WEB":
      return "Pedido Web";
    case "PUNTO_VENTA":
      return "Punto de venta";
    case "APARTADO":
      return "Apartado físico";
    default:
      return tipo;
  }
}

function formatConceptoPago(concepto: string) {
  switch (concepto) {
    case "PAGO_TOTAL":
      return "Pago inicial";
    case "ANTICIPO_APARTADO":
      return "Anticipo";
    case "ABONO_APARTADO":
      return "Abono";
    case "LIQUIDACION_APARTADO":
      return "Liquidación";
    case "REEMBOLSO":
      return "Reembolso";
    default:
      return concepto;
  }
}

function formatEstadoPago(estado: string) {
  switch (estado) {
    case "CONFIRMADO":
      return "Confirmado";
    case "PENDIENTE":
      return "Pendiente";
    case "RECHAZADO":
      return "Rechazado";
    case "CANCELADO":
      return "Cancelado";
    default:
      return estado;
  }
}

function formatMetodoPago(metodo: string) {
  switch (metodo) {
    case "EFECTIVO":
      return "Efectivo";
    case "TARJETA_CREDITO":
      return "Tarjeta crédito";
    case "TARJETA_DEBITO":
      return "Tarjeta débito";
    case "TRANSFERENCIA":
      return "Transferencia";
    case "PAYPAL":
      return "PayPal";
    case "MERCADO_PAGO":
      return "Mercado Pago";
    case "CREDITO_TIENDA":
      return "Crédito tienda";
    default:
      return metodo;
  }
}

// ─── props ────────────────────────────────────────────────────────────────────

type OrderDetailModalProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  detail: PedidoDetalleAdmin | null;
  ticketLoading: boolean;
  onOpenTicketPdf?: (id: string | number) => void;
  onOpenPagoTicketPdf?: (pedidoId: string, pagoId: string) => void;
};

// ─── component ────────────────────────────────────────────────────────────────

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  open,
  onClose,
  loading,
  detail,
  ticketLoading = false,
  onOpenTicketPdf,
  onOpenPagoTicketPdf,
}) => {
  const pedido = detail?.pedido;
  const detalles = detail?.detalles ?? [];
  const pagos = detail?.pagos ?? [];

  const total = toNumber(pedido?.total);
  const pagado = toNumber(pedido?.total_pagado);
  const pendiente = toNumber(pedido?.saldo_pendiente);
  const descuento = toNumber(pedido?.descuento);
  const subtotal = toNumber(pedido?.subtotal);
  const envio = toNumber(pedido?.costo_envio);

  const progressPct =
    total > 0 ? Math.min(100, Math.round((pagado / total) * 100)) : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: styles.paper }}
    >
      {/* ── Header ── */}
      <DialogTitle className={styles.dialogTitle}>
        <Box className={styles.titleRow}>
          <Box className={styles.titleLeft}>
            {pedido && (
              <Box className={styles.tipoChip}>
                {getTipoIcon(pedido.tipo)}
                <Typography variant="caption" className={styles.tipoLabel}>
                  {getTipoLabel(pedido.tipo)}
                </Typography>
              </Box>
            )}
            <Typography variant="h6" className={styles.titleText}>
              {pedido ? `Folio #${pedido.folio}` : "Detalle del pedido"}
            </Typography>
          </Box>

          <Box className={styles.titleRight}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdfIcon />}
              disabled={!detail?.pedido?.id || ticketLoading}
              onClick={() => {
                if (detail?.pedido?.id) {
                  onOpenTicketPdf?.(detail.pedido.id);
                }
              }}
            >
              {ticketLoading ? "Generando..." : "Ticket PDF"}
            </Button>
            {pedido && (
              <Chip
                icon={getEstadoIcon(pedido.estado)}
                label={pedido.estado}
                size="small"
                className={`${styles.estadoChip} ${getEstadoClass(pedido.estado, styles)}`}
              />
            )}
            <IconButton
              onClick={onClose}
              size="small"
              className={styles.closeBtn}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent className={styles.content}>
        {loading ? (
          <LoadingSkeleton />
        ) : !pedido ? (
          <Box className={styles.errorBox}>
            <Cancel className={styles.errorIcon} />
            <Typography className={styles.errorText}>
              No se pudo cargar el detalle del pedido.
            </Typography>
          </Box>
        ) : (
          <Box className={styles.body}>
            {/* ── Cliente + Fechas ── */}
            <Box className={styles.clienteSection}>
              <Avatar className={styles.clienteAvatar}>
                <Person />
              </Avatar>

              <Box className={styles.clienteInfo}>
                <Typography className={styles.clienteNombre}>
                  {pedido.cliente_nombre || "Cliente no asignado"}
                </Typography>
                {pedido.vendedor_nombre && (
                  <Typography className={styles.clienteMeta}>
                    Vendedor: {pedido.vendedor_nombre}
                  </Typography>
                )}
              </Box>

              <Box className={styles.fechasBox}>
                <Box className={styles.fechaItem}>
                  <Typography className={styles.fechaLabel}>Creado</Typography>
                  <Typography className={styles.fechaValue}>
                    {formatFecha(pedido.fecha_creacion)}
                  </Typography>
                </Box>
                {pedido.fecha_limite_apartado && (
                  <Box className={styles.fechaItem}>
                    <Typography className={styles.fechaLabel}>
                      Límite apartado
                    </Typography>
                    <Typography
                      className={`${styles.fechaValue} ${styles.fechaWarning}`}
                    >
                      {formatFecha(pedido.fecha_limite_apartado)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* ── Resumen financiero ── */}
            <Box className={styles.finanzasSection}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box className={styles.statCard}>
                    <Typography className={styles.statLabel}>
                      Subtotal
                    </Typography>
                    <Typography className={styles.statValue}>
                      {formatMoneda(subtotal)}
                    </Typography>
                  </Box>
                </Grid>

                {descuento > 0 && (
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box
                      className={`${styles.statCard} ${styles.statCardDiscount}`}
                    >
                      <Typography className={styles.statLabel}>
                        Descuento
                      </Typography>
                      <Typography
                        className={`${styles.statValue} ${styles.statDiscount}`}
                      >
                        −{formatMoneda(descuento)}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {envio > 0 && (
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box className={styles.statCard}>
                      <Typography className={styles.statLabel}>
                        Envío
                      </Typography>
                      <Typography className={styles.statValue}>
                        {formatMoneda(envio)}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box className={`${styles.statCard} ${styles.statCardTotal}`}>
                    <Typography className={styles.statLabel}>Total</Typography>
                    <Typography
                      className={`${styles.statValue} ${styles.statTotal}`}
                    >
                      {formatMoneda(total)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box className={`${styles.statCard} ${styles.statCardPaid}`}>
                    <Typography className={styles.statLabel}>Pagado</Typography>
                    <Typography
                      className={`${styles.statValue} ${styles.statPaid}`}
                    >
                      {formatMoneda(pagado)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box
                    className={`${styles.statCard} ${styles.statCardPending}`}
                  >
                    <Typography className={styles.statLabel}>Saldo</Typography>
                    <Typography
                      className={`${styles.statValue} ${styles.statPending}`}
                    >
                      {formatMoneda(pendiente)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* barra de progreso solo si hay saldo */}
              {total > 0 && (
                <Box className={styles.progressWrap}>
                  <Box className={styles.progressRow}>
                    <Typography className={styles.progressLabel}>
                      Progreso de pago
                    </Typography>
                    <Typography className={styles.progressPct}>
                      {progressPct}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPct}
                    className={styles.progress}
                  />
                </Box>
              )}
            </Box>

            <Divider className={styles.divider} />

            {/* ── Productos ── */}
            <Box className={styles.section}>
              <Box className={styles.sectionHeader}>
                <ShoppingBag className={styles.sectionIcon} />
                <Typography className={styles.sectionTitle}>
                  Productos
                </Typography>
                <Chip
                  label={`${detalles.length} artículo${detalles.length !== 1 ? "s" : ""}`}
                  size="small"
                  className={styles.countChip}
                />
              </Box>

              {detalles.length > 0 ? (
                <Box className={styles.productosList}>
                  {detalles.map((d, idx) => (
                    <Box key={d.id} className={styles.productoRow}>
                      <Box className={styles.productoNum}>{idx + 1}</Box>

                      <Box className={styles.productoInfo}>
                        <Typography className={styles.productoNombre}>
                          {d.producto_nombre}
                        </Typography>
                        <Box className={styles.productoMeta}>
                          {d.talla_nombre && (
                            <Chip
                              label={d.talla_nombre}
                              size="small"
                              className={styles.metaChip}
                            />
                          )}
                          {d.color_nombre && (
                            <Chip
                              label={d.color_nombre}
                              size="small"
                              className={styles.metaChip}
                            />
                          )}
                          <Typography className={styles.productoCantidad}>
                            ×{d.cantidad}
                          </Typography>
                          <Typography className={styles.productoUnitPrice}>
                            {formatMoneda(d.precio_unitario)} c/u
                          </Typography>
                        </Box>
                      </Box>

                      <Typography className={styles.productoImporte}>
                        {formatMoneda(d.importe)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <EmptyState text="Sin productos registrados." />
              )}
            </Box>

            <Divider className={styles.divider} />

            {/* ── Pagos ── */}
            <Box className={styles.section}>
              <Box className={styles.sectionHeader}>
                <AttachMoney className={styles.sectionIcon} />
                <Typography className={styles.sectionTitle}>Pagos</Typography>
                <Chip
                  label={`${pagos.length} pago${pagos.length !== 1 ? "s" : ""}`}
                  size="small"
                  className={styles.countChip}
                />
              </Box>

              {pagos.length > 0 ? (
                <Box className={styles.pagosList}>
                  {pagos.map((p) => (
                    <Box key={p.id} className={styles.pagoRow}>
                      <Box className={styles.pagoLeft}>
                        <Box
                          className={`${styles.pagoEstadoDot} ${getEstadoClass(
                            p.estado,
                            styles,
                          )}`}
                        />

                        <Box>
                          <Typography className={styles.pagoConcepto}>
                            {formatConceptoPago(p.concepto)}
                          </Typography>

                          <Box className={styles.pagoMeta}>
                            <Chip
                              label={formatMetodoPago(p.metodo)}
                              size="small"
                              className={styles.metodoPill}
                            />

                            <Typography className={styles.pagoEstadoText}>
                              {formatEstadoPago(p.estado)}
                            </Typography>

                            {p.usuario_nombre ? (
                              <Typography className={styles.pagoUsuarioText}>
                                Registró: {p.usuario_nombre}
                              </Typography>
                            ) : null}
                          </Box>

                          {p.referencia_externa ? (
                            <Typography className={styles.pagoReferenciaText}>
                              Ref: {p.referencia_externa}
                            </Typography>
                          ) : null}
                        </Box>
                      </Box>

                      <Box className={styles.pagoRight}>
                        <Typography className={styles.pagoMonto}>
                          {formatMoneda(p.monto)}
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          className={styles.ticketSmallBtn}
                          disabled={ticketLoading}
                          onClick={() => {
                            if (pedido.id) {
                              onOpenPagoTicketPdf?.(pedido.id, p.id);
                            }
                          }}
                        >
                          Ticket
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <EmptyState text="Sin pagos registrados." />
              )}
            </Box>

            {/* ── Observaciones / cancelación ── */}
            {(pedido.observaciones || pedido.motivo_cancelacion) && (
              <>
                <Divider className={styles.divider} />
                <Box className={styles.section}>
                  {pedido.observaciones && (
                    <Box className={styles.notaBox}>
                      <Typography className={styles.notaLabel}>
                        Observaciones
                      </Typography>
                      <Typography className={styles.notaText}>
                        {pedido.observaciones}
                      </Typography>
                    </Box>
                  )}
                  {pedido.motivo_cancelacion && (
                    <Box className={`${styles.notaBox} ${styles.notaDanger}`}>
                      <Typography className={styles.notaLabel}>
                        Motivo de cancelación
                      </Typography>
                      <Typography className={styles.notaText}>
                        {pedido.motivo_cancelacion}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <Box p={1}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box flex={1}>
          <Skeleton width="40%" height={22} />
          <Skeleton width="25%" height={16} />
        </Box>
      </Box>
      <Grid container spacing={2} mb={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={i}>
            <Skeleton height={70} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
      <Skeleton height={20} width="30%" sx={{ mb: 2 }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} height={56} sx={{ borderRadius: 1, mb: 1 }} />
      ))}
    </Box>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      py={2}
      px={1}
      sx={{ opacity: 0.45 }}
    >
      <Info fontSize="small" />
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
}

export default OrderDetailModal;
