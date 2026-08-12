import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  CreditCard,
  Edit,
  History as HistoryIcon,
  PersonAddAlt1,
  PersonOff,
  Visibility,
  Warning,
} from "@mui/icons-material";
import styles from "../../../styles/AdminCustomers.module.css";
import type { Cliente } from "@admin/pages/admin/AdminCustomers";

type Props = {
  customers: Cliente[];
  loading: boolean;
  formatMoneda: (valor: number) => string;
  canEdit: boolean;
  canManageCredit: boolean;
  canManageStatus: boolean;
  onView: (customer: Cliente) => void;
  onEdit: (customer: Cliente) => void;
  onHistory: (customer: Cliente) => void;
  onToggleStatus: (customer: Cliente) => void;
};

const CustomersTableSection: React.FC<Props> = ({
  customers,
  loading,
  formatMoneda,
  canEdit,
  canManageCredit,
  canManageStatus,
  onView,
  onEdit,
  onHistory,
  onToggleStatus,
}) => {
  const skeletonRows = useMemo(() => Array.from({ length: 4 }), []);
  const totalColumns = canManageCredit ? 6 : 4;

  return (
    <TableContainer component={Paper} className={styles.tablePaper}>
      <Table>
        <TableHead>
          <TableRow className={styles.tableHeadRow}>
            <TableCell className={styles.headCell}>Cliente</TableCell>
            <TableCell className={styles.headCell}>Contacto</TableCell>

            {canManageCredit && (
              <>
                <TableCell className={styles.headCell}>Crédito</TableCell>
                <TableCell className={styles.headCell}>Saldo Deudor</TableCell>
              </>
            )}

            <TableCell className={styles.headCell}>Estatus</TableCell>
            <TableCell className={styles.headCell} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            skeletonRows.map((_, idx) => (
              <TableRow key={idx}>
                <TableCell colSpan={totalColumns}>
                  <Skeleton height={48} />
                </TableCell>
              </TableRow>
            ))
          ) : customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.id} className={styles.tableRowHover}>
                <TableCell>
                  <div className={styles.customerCell}>
                    <Avatar className={styles.customerAvatar}>
                      {customer.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Typography className={styles.customerName}>
                        {customer.name}
                      </Typography>
                      <Typography className={styles.cellMuted}>
                        {customer.id}
                      </Typography>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Typography className={styles.cellText}>
                    {customer.phone}
                  </Typography>
                  <Typography className={styles.cellMuted}>
                    {customer.email}
                  </Typography>
                </TableCell>

                {canManageCredit && (
                  <>
                    <TableCell>
                      {customer.creditLimit > 0 ? (
                        <Typography className={styles.creditOk}>
                          {formatMoneda(customer.creditLimit)}
                        </Typography>
                      ) : (
                        <Typography className={styles.noCredit}>
                          Sin crédito
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography
                        className={
                          customer.currentBalance > 0
                            ? styles.balanceBad
                            : styles.balanceGood
                        }
                      >
                        {formatMoneda(customer.currentBalance)}
                      </Typography>
                    </TableCell>
                  </>
                )}

                <TableCell>
                  <Chip
                    label={customer.status === "active" ? "Activo" : "Inactivo"}
                    className={`${styles.statusChip} ${
                      customer.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton
                    className={styles.iconPink}
                    onClick={() => onView(customer)}
                    title="Ver cliente"
                  >
                    <Visibility />
                  </IconButton>

                  <IconButton
                    className={styles.iconPink}
                    onClick={() => onHistory(customer)}
                    title="Historial comercial"
                  >
                    <HistoryIcon />
                  </IconButton>

                  {canEdit && (
                    <IconButton
                      className={styles.iconPink}
                      onClick={() => onEdit(customer)}
                      title="Editar cliente"
                    >
                      <Edit />
                    </IconButton>
                  )}

                  {canManageCredit && (
                    <IconButton
                      component={Link}
                      to={`/customers/${customer.id}/credit`}
                      className={styles.iconPink}
                      title="Gestionar crédito"
                    >
                      <CreditCard />
                    </IconButton>
                  )}

                  {canManageStatus && (
                    <IconButton
                      className={customer.status === "active" ? styles.iconRed : styles.iconGreen}
                      onClick={() => onToggleStatus(customer)}
                      title={customer.status === "active" ? "Desactivar cliente" : "Reactivar cliente"}
                    >
                      {customer.status === "active" ? <PersonOff /> : <PersonAddAlt1 />}
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={totalColumns}>
                <div className={styles.emptyInline}>
                  <Warning />
                  <Typography className={styles.emptyText}>
                    No se encontraron clientes con los filtros actuales.
                  </Typography>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomersTableSection;