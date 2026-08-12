import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { clientesService } from "@admin/services/clientes.service";
import type { Cliente } from "@admin/pages/admin/AdminCustomers";
import type { ClienteHistorialComercial } from "@shared/api/cliente.api";
import styles from "../../../styles/AdminCustomers.module.css";

type Props = {
  open: boolean;
  customer: Cliente | null;
  onClose: () => void;
};

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value || 0));
}

function dateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function CustomerHistoryDialog({ open, customer, onClose }: Props) {
  const [data, setData] = useState<ClienteHistorialComercial | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !customer) return;

    let active = true;
    setLoading(true);
    setError(null);
    setData(null);

    clientesService
      .getHistorialComercial(customer.id)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("No se pudo consultar el historial del cliente.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, customer]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ className: styles.historyDialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        Historial comercial · {customer?.name || "Cliente"}
      </DialogTitle>

      <DialogContent className={styles.historyDialogContent}>
        {loading && (
          <div className={styles.historyLoading}>
            <CircularProgress size={28} />
            <span>Cargando historial...</span>
          </div>
        )}

        {error && <div className={styles.historyError}>{error}</div>}

        {!loading && data && (
          <>
            <section className={styles.historyMetrics}>
              <div className={styles.historyMetric}>
                <span>Operaciones</span>
                <strong>{Number(data.resumen.operaciones || 0)}</strong>
              </div>
              <div className={styles.historyMetric}>
                <span>Ventas POS</span>
                <strong>{Number(data.resumen.ventas_pos || 0)}</strong>
              </div>
              <div className={styles.historyMetric}>
                <span>Apartados</span>
                <strong>{Number(data.resumen.apartados || 0)}</strong>
              </div>
              <div className={styles.historyMetric}>
                <span>Total comprado</span>
                <strong>{money(data.resumen.total_comprado)}</strong>
              </div>
            </section>

            <section className={styles.historySection}>
              <div className={styles.historySectionHeader}>
                <div>
                  <Typography className={styles.historySectionTitle}>
                    Compras y apartados
                  </Typography>
                  <Typography className={styles.historySectionSubtitle}>
                    Última operación: {dateTime(data.resumen.ultima_operacion)}
                  </Typography>
                </div>
              </div>

              <div className={styles.historyTableWrap}>
                <Table size="small">
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell className={styles.headCell}>Folio</TableCell>
                      <TableCell className={styles.headCell}>Fecha</TableCell>
                      <TableCell className={styles.headCell}>Tipo</TableCell>
                      <TableCell className={styles.headCell}>Estado</TableCell>
                      <TableCell className={styles.headCell}>Unidades</TableCell>
                      <TableCell className={styles.headCell} align="right">Total</TableCell>
                      <TableCell className={styles.headCell} align="right">Pagado neto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.pedidos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className={styles.historyEmptyCell}>
                          Este cliente todavía no tiene operaciones registradas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.pedidos.map((pedido) => (
                        <TableRow key={pedido.id} className={styles.tableRowHover}>
                          <TableCell>#{pedido.folio}</TableCell>
                          <TableCell>{dateTime(pedido.fecha_creacion)}</TableCell>
                          <TableCell>{pedido.tipo.replaceAll("_", " ")}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={pedido.estado}
                              className={styles.historyStatusChip}
                            />
                          </TableCell>
                          <TableCell>{Number(pedido.unidades || 0)}</TableCell>
                          <TableCell align="right">{money(pedido.total)}</TableCell>
                          <TableCell align="right">{money(pedido.pagado_neto)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className={styles.historySection}>
              <Typography className={styles.historySectionTitle}>
                Movimientos recientes de crédito
              </Typography>
              {data.movimientos_credito.length === 0 ? (
                <p className={styles.historyEmptyText}>Sin movimientos de crédito.</p>
              ) : (
                <div className={styles.creditTimeline}>
                  {data.movimientos_credito.map((mov) => (
                    <article className={styles.creditTimelineItem} key={mov.id}>
                      <div>
                        <strong>{mov.tipo}</strong>
                        <p>{mov.descripcion}</p>
                        <small>{dateTime(mov.fecha)}</small>
                      </div>
                      <div className={styles.creditTimelineAmount}>
                        <strong>{money(mov.monto)}</strong>
                        <span>Saldo: {money(mov.saldo_resultante)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button className={styles.cancelBtn} onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
