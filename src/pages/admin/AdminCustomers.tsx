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
  IconButton,
  Chip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Add,
  Search,
  Edit,
  Visibility,
  CreditCard,
  FilterList,
  Person,
  ShoppingBag,
  AttachMoney,
  History,
  Inventory,
  Warning,
} from "@mui/icons-material";
import styles from "../../styles/AdminCustomers.module.css";

type CustomerStatus = "active" | "inactive";

type Cliente = {
  id: string;
  name: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  status: CustomerStatus;
  lastPurchase: string; // ideal ISO
  joinDate: string; // ideal ISO
  address?: string;
  totalPurchases?: number;
  totalLayaways?: number;
  totalSpent?: number;
};

type CustomersData = {
  customers: Cliente[];
};

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);
}

/**
 * Placeholder API:
 * - GET /api/admin/clientes?search=&status=
 */
async function fetchCustomersData(signal?: AbortSignal): Promise<CustomersData> {
  void signal; // ✅ evita warning no-unused-vars
  return { customers: [] }; // ✅ vacío para API
}

const AdminCustomers: React.FC = () => {
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openCreditModal, setOpenCreditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>("all");

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Cliente[]>([]);

  const load = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      const resp = await fetchCustomersData(controller.signal);
      setCustomers(resp.customers);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const customersFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return customers.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      const matchStatus = statusFilter === "all" ? true : c.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const estadisticas = useMemo(() => {
    const totalClientes = customers.length;
    const clientesActivos = customers.filter((c) => c.status === "active").length;
    const clientesConCredito = customers.filter((c) => c.creditLimit > 0).length;
    const saldoTotal = customers.reduce((sum, c) => sum + c.currentBalance, 0);
    return { totalClientes, clientesActivos, clientesConCredito, saldoTotal };
  }, [customers]);

  const handleViewCustomer = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setOpenCustomerModal(true);
  };

  const handleEditCustomer = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setOpenCustomerModal(true);
  };

  const handleEditCredit = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setOpenCreditModal(true);
  };

  const handleCloseCustomerModal = () => {
    setOpenCustomerModal(false);
    setSelectedCustomer(null);
  };

  const handleCloseCreditModal = () => {
    setOpenCreditModal(false);
    setSelectedCustomer(null);
  };

  const handleNuevoCliente = () => {
    setSelectedCustomer(null);
    setOpenCustomerModal(true);
  };

  const skeletonStats = useMemo(() => Array.from({ length: 4 }), []);
  const skeletonRows = useMemo(() => Array.from({ length: 4 }), []);

  return (
    <Box className={styles.root}>
      {/* Header */}
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          Gestión de Clientes
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          className={styles.primaryButton}
          onClick={handleNuevoCliente}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} className={styles.statsGrid}>
        {loading ? (
          skeletonStats.map((_, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card className={styles.statCard}>
                <CardContent>
                  <Skeleton width="60%" />
                  <Skeleton height={42} />
                  <Skeleton width="35%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className={`${styles.statCard} ${styles.statCardPink}`}>
                <CardContent className={styles.statCardContent}>
                  <Box>
                    <Typography variant="body2" className={styles.statLabelWhite}>
                      Total Clientes
                    </Typography>
                    <Typography variant="h4" className={styles.statValueWhite}>
                      {estadisticas.totalClientes}
                    </Typography>
                  </Box>
                  <Person className={styles.statIconWhite} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className={`${styles.statCard} ${styles.statCardHotPink}`}>
                <CardContent className={styles.statCardContent}>
                  <Box>
                    <Typography variant="body2" className={styles.statLabelWhite}>
                      Activos
                    </Typography>
                    <Typography variant="h4" className={styles.statValueWhite}>
                      {estadisticas.clientesActivos}
                    </Typography>
                  </Box>
                  <ShoppingBag className={styles.statIconWhite} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className={`${styles.statCard} ${styles.statCardSoftPink}`}>
                <CardContent className={styles.statCardContent}>
                  <Box>
                    <Typography variant="body2" className={styles.statLabelWhite}>
                      Con Crédito
                    </Typography>
                    <Typography variant="h4" className={styles.statValueWhite}>
                      {estadisticas.clientesConCredito}
                    </Typography>
                  </Box>
                  <CreditCard className={styles.statIconWhite} />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card className={`${styles.statCard} ${styles.statCardLight}`}>
                <CardContent className={styles.statCardContent}>
                  <Box>
                    <Typography variant="body2" className={styles.statLabelDark}>
                      Saldo Total
                    </Typography>
                    <Typography variant="h5" className={styles.statValuePink}>
                      {formatMoneda(estadisticas.saldoTotal)}
                    </Typography>
                  </Box>
                  <AttachMoney className={styles.statIconPink} />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Filtros */}
      <Paper className={styles.filtersPaper}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className={styles.searchIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.searchInput}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value as "all" | CustomerStatus)}
                className={styles.select}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              className={styles.moreFiltersBtn}
            >
              Más Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla */}
      <Paper className={styles.tablePaper}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className={styles.tableHeadRow}>
                <TableCell className={styles.headCell}>Cliente</TableCell>
                <TableCell className={styles.headCell}>Contacto</TableCell>
                <TableCell className={styles.headCell} align="center">
                  Límite Crédito
                </TableCell>
                <TableCell className={styles.headCell} align="center">
                  Saldo Actual
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
                    <TableCell>
                      <Box className={styles.customerCell}>
                        <Skeleton variant="circular" width={38} height={38} />
                        <Skeleton width={180} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                      <Skeleton width={180} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={70} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={90} />
                    </TableCell>
                  </TableRow>
                ))
              ) : customersFiltrados.length > 0 ? (
                customersFiltrados.map((customer) => (
                  <TableRow key={customer.id} hover className={styles.tableRowHover}>
                    <TableCell>
                      <Box className={styles.customerCell}>
                        <Avatar className={styles.customerAvatar}>
                          {customer.name ? customer.name.charAt(0).toUpperCase() : "?"}
                        </Avatar>
                        <Typography className={styles.customerName}>{customer.name}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" className={styles.cellText}>
                        {customer.phone}
                      </Typography>
                      <Typography variant="caption" className={styles.cellMuted}>
                        {customer.email}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {customer.creditLimit > 0 ? (
                        <Typography className={styles.creditOk}>
                          {formatMoneda(customer.creditLimit)}
                        </Typography>
                      ) : (
                        <Typography className={styles.noCredit}>Sin crédito</Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      {customer.creditLimit > 0 ? (
                        <Typography
                          className={customer.currentBalance > 0 ? styles.balanceBad : styles.balanceGood}
                        >
                          {formatMoneda(customer.currentBalance)}
                        </Typography>
                      ) : (
                        <Typography className={styles.cellMuted}>—</Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={customer.status === "active" ? "Activo" : "Inactivo"}
                        size="small"
                        className={`${styles.statusChip} ${
                          customer.status === "active" ? styles.statusActive : styles.statusInactive
                        }`}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton size="small" className={styles.iconPink} onClick={() => handleViewCustomer(customer)}>
                        <Visibility />
                      </IconButton>

                      <IconButton size="small" className={styles.iconPink} onClick={() => handleEditCustomer(customer)}>
                        <Edit />
                      </IconButton>

                      {customer.creditLimit > 0 ? (
                        <IconButton size="small" className={styles.iconPink} onClick={() => handleEditCredit(customer)}>
                          <CreditCard />
                        </IconButton>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box className={styles.emptyInline}>
                      <Warning fontSize="small" />
                      <Typography className={styles.emptyText}>
                        Sin clientes (pendiente de API).
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* MODAL: Detalles / Nuevo Cliente */}
      <Dialog open={openCustomerModal} onClose={handleCloseCustomerModal} maxWidth="md" fullWidth>
        <DialogTitle className={styles.dialogTitle}>
          {selectedCustomer ? `Detalles de ${selectedCustomer.name}` : "Nuevo Cliente"}
        </DialogTitle>

        <DialogContent className={styles.dialogContent}>
          <Grid container spacing={3}>
            {/* Izquierda */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Información Personal
              </Typography>

              <Box className={styles.formCol}>
                <TextField fullWidth label="Nombre completo" defaultValue={selectedCustomer?.name ?? ""} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Teléfono" defaultValue={selectedCustomer?.phone ?? ""} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField fullWidth label="Email" defaultValue={selectedCustomer?.email ?? ""} />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Dirección"
                  multiline
                  rows={3}
                  defaultValue={selectedCustomer?.address ?? ""}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Fecha de registro"
                      type="date"
                      defaultValue={selectedCustomer?.joinDate ?? ""}
                      InputLabelProps={{ shrink: true }}
                      disabled={!!selectedCustomer}
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Estado</InputLabel>
                      <Select defaultValue={selectedCustomer?.status ?? "active"} label="Estado">
                        <MenuItem value="active">Activo</MenuItem>
                        <MenuItem value="inactive">Inactivo</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Derecha */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Información Adicional
              </Typography>

              <Card className={styles.creditCard}>
                <CardContent>
                  <Box className={styles.creditHeader}>
                    <Typography className={styles.creditTitle}>Línea de Crédito</Typography>
                    <Chip
                      label={selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0 ? "Activa" : "Inactiva"}
                      size="small"
                      className={
                        selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0
                          ? styles.creditActive
                          : styles.creditInactive
                      }
                    />
                  </Box>

                  {selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0 ? (
                    <>
                      <Box className={styles.creditRow}>
                        <Typography variant="body2">Límite:</Typography>
                        <Typography variant="body2" className={styles.bold}>
                          {formatMoneda(selectedCustomer.creditLimit)}
                        </Typography>
                      </Box>

                      <Box className={styles.creditRow}>
                        <Typography variant="body2">Saldo actual:</Typography>
                        <Typography
                          variant="body2"
                          className={`${styles.bold} ${
                            selectedCustomer.currentBalance > 0 ? styles.balanceBad : styles.balanceGood
                          }`}
                        >
                          {formatMoneda(selectedCustomer.currentBalance)}
                        </Typography>
                      </Box>

                      <Box className={styles.creditRow}>
                        <Typography variant="body2">Disponible:</Typography>
                        <Typography variant="body2" className={`${styles.bold} ${styles.balanceGood}`}>
                          {formatMoneda(selectedCustomer.creditLimit - selectedCustomer.currentBalance)}
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={(selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100}
                        className={styles.creditProgress}
                      />
                    </>
                  ) : (
                    <Typography variant="body2" className={styles.muted}>
                      Este cliente no tiene línea de crédito activa.
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card className={styles.activityCard}>
                <CardContent>
                  <Typography variant="subtitle2" className={styles.activityTitle}>
                    Resumen de Actividad
                  </Typography>

                  <Grid container spacing={2} className={styles.activityGrid}>
                    <Grid size={{ xs: 4 }} className={styles.center}>
                      <Typography variant="h6" className={styles.activityValue}>
                        {selectedCustomer?.totalPurchases ?? 0}
                      </Typography>
                      <Typography variant="caption" className={styles.muted}>
                        Compras
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 4 }} className={styles.center}>
                      <Typography variant="h6" className={styles.activityValue}>
                        {selectedCustomer?.totalLayaways ?? 0}
                      </Typography>
                      <Typography variant="caption" className={styles.muted}>
                        Apartados
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 4 }} className={styles.center}>
                      <Typography variant="h6" className={styles.activityValue}>
                        {formatMoneda(selectedCustomer?.totalSpent ?? 0)}
                      </Typography>
                      <Typography variant="caption" className={styles.muted}>
                        Total
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Box>
                <Typography variant="subtitle2" className={styles.quickTitle}>
                  Acciones Rápidas
                </Typography>

                <Box className={styles.quickActions}>
                  <Button size="small" variant="outlined" startIcon={<History />} className={styles.quickBtn}>
                    Historial
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<Inventory />} className={styles.quickBtn}>
                    Apartados
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<AttachMoney />} className={styles.quickBtn}>
                    Abonar
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={handleCloseCustomerModal} className={styles.cancelBtn}>
            Cancelar
          </Button>
          <Button variant="contained" className={styles.saveBtn}>
            {selectedCustomer ? "Actualizar Cliente" : "Guardar Cliente"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Gestión de Crédito */}
      <Dialog open={openCreditModal} onClose={handleCloseCreditModal} maxWidth="sm" fullWidth>
        <DialogTitle className={styles.dialogTitle}>
          Gestión de Crédito - {selectedCustomer?.name ?? ""}
        </DialogTitle>

        <DialogContent className={styles.dialogContent}>
          <Card className={styles.creditBanner}>
            <CardContent>
              <Typography variant="subtitle1" className={styles.bannerTitle}>
                Estado Actual del Crédito
              </Typography>

              <Box className={styles.bannerRows}>
                <Box className={styles.creditRow}>
                  <Typography variant="body2">Límite actual:</Typography>
                  <Typography variant="body2" className={styles.bold}>
                    {formatMoneda(selectedCustomer?.creditLimit ?? 0)}
                  </Typography>
                </Box>

                <Box className={styles.creditRow}>
                  <Typography variant="body2">Saldo utilizado:</Typography>
                  <Typography variant="body2" className={styles.bold}>
                    {formatMoneda(selectedCustomer?.currentBalance ?? 0)}
                  </Typography>
                </Box>

                <Box className={styles.creditRow}>
                  <Typography variant="body2">Crédito disponible:</Typography>
                  <Typography variant="body2" className={styles.bold}>
                    {formatMoneda((selectedCustomer?.creditLimit ?? 0) - (selectedCustomer?.currentBalance ?? 0))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="subtitle1" className={styles.sectionTitlePink}>
            Configuración de Crédito
          </Typography>

          <Box className={styles.creditConfig}>
            <TextField fullWidth label="Nuevo Límite de Crédito" type="number" defaultValue={selectedCustomer?.creditLimit ?? 0} />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!(selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0)}
                  onChange={() => {
                    // placeholder
                  }}
                  className={styles.checkbox}
                />
              }
              label="Habilitar línea de crédito para este cliente"
            />
          </Box>

          <Typography variant="subtitle1" className={styles.sectionTitlePink}>
            Registrar Abono
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 8 }}>
              <TextField fullWidth label="Monto a abonar" type="number" placeholder="0.00" />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Button fullWidth variant="outlined" startIcon={<AttachMoney />} className={styles.abonarBtn}>
                Abonar
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={handleCloseCreditModal} className={styles.cancelBtn}>
            Cancelar
          </Button>
          <Button variant="contained" className={styles.saveBtn}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCustomers;