import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Add,
  Edit,
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
  Settings,
  People,
  Shield,
  CreditCard,
  Store,
} from "@mui/icons-material";
import styles from "../../styles/AdminSettings.module.css";

type TabKey = 0 | 1 | 2 | 3;

type EmployeeStatus = "active" | "inactive";
type PaymentStatus = "active" | "inactive";
type PaymentType = "manual" | "terminal" | "gateway";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: EmployeeStatus;
  lastLogin?: string;
  createdAt?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  userCount?: number;
  isSystem: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  status: PaymentStatus;
  config?: {
    apiKeyPublic?: string;
    apiKeySecret?: string;
    bank?: string;
    account?: string;
    clabe?: string;
  };
}

interface PermissionItem {
  id: string;
  name: string;
  category: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Helpers
function paymentTypeLabel(type: PaymentType) {
  if (type === "gateway") return "Pasarela de pago";
  if (type === "terminal") return "Terminal punto de venta";
  return "Método manual";
}

export default function AdminSettings() {
  const [tabValue, setTabValue] = useState<TabKey>(0);

  // Data (VACÍO para API)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  // Selected
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [, setSelectedPayment] = useState<PaymentMethod | null>(null);

  // Payment UI
  const [showApiKey, setShowApiKey] = useState(false);

  // Forms (controlados para evitar warnings + listos para API)
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    role: "",
    status: "active" as EmployeeStatus,
    tempPassword: "",
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    permissions: [] as string[],
  });

  const [paymentForm, setPaymentForm] = useState({
    apiKeyPublic: "",
    apiKeySecret: "",
    status: "inactive" as PaymentStatus,
  });

  // ✅ Carga API (placeholder vacío)
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: conecta tu API aquí (axios/fetch)
      // const [emp, rol, pay, perms] = await Promise.all([...])
      // setEmployees(emp); setRoles(rol); setPaymentMethods(pay); setAllPermissions(perms);

      // Por ahora, vacío (sin datos de prueba)
      setEmployees([]);
      setRoles([]);
      setPaymentMethods([]);
      setAllPermissions([]);
    } catch {
      setError("No se pudo cargar la configuración (pendiente de API).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Tabs UI model
  const tabs = useMemo(
    () => [
      { label: "Empleados", icon: <People /> },
      { label: "Roles y Permisos", icon: <Shield /> },
      { label: "Métodos de Pago", icon: <CreditCard /> },
      { label: "Datos de la Tienda", icon: <Store /> },
    ],
    []
  );

  // --- Modal open helpers
  const openNewEmployee = () => {
    setSelectedEmployee(null);
    setEmployeeForm({ name: "", email: "", role: "", status: "active", tempPassword: "" });
    setOpenEmployeeModal(true);
  };

  const openEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEmployeeForm({
      name: emp.name ?? "",
      email: emp.email ?? "",
      role: emp.role ?? "",
      status: emp.status ?? "active",
      tempPassword: "",
    });
    setOpenEmployeeModal(true);
  };

  const openNewRole = () => {
    setSelectedRole(null);
    setRoleForm({ name: "", permissions: [] });
    setOpenRoleModal(true);
  };

  const openEditRole = (r: Role) => {
    setSelectedRole(r);
    setRoleForm({ name: r.name ?? "", permissions: r.permissions ?? [] });
    setOpenRoleModal(true);
  };

  const openConfigurePayment = (m: PaymentMethod) => {
    setSelectedPayment(m);
    setPaymentForm({
      apiKeyPublic: m.config?.apiKeyPublic ?? "",
      apiKeySecret: m.config?.apiKeySecret ?? "",
      status: m.status ?? "inactive",
    });
    setShowApiKey(false);
    setOpenPaymentModal(true);
  };

  // --- Submit placeholders (para API)
  const submitEmployee = async () => {
    // TODO: API create/update employee
    setOpenEmployeeModal(false);
    setSelectedEmployee(null);
    await load();
  };

  const submitRole = async () => {
    // TODO: API create/update role
    setOpenRoleModal(false);
    setSelectedRole(null);
    await load();
  };

  const submitPayment = async () => {
    // TODO: API update payment config/status
    setOpenPaymentModal(false);
    setSelectedPayment(null);
    await load();
  };

  // Permissions helpers
  const togglePermission = (permId: string) => {
    setRoleForm((prev) => {
      const has = prev.permissions.includes(permId);
      const next = has ? prev.permissions.filter((p) => p !== permId) : [...prev.permissions, permId];
      return { ...prev, permissions: next };
    });
  };

  return (
      <Box className={styles.root}>
        <Typography variant="h4" className={styles.title}>
          Configuración del Sistema
        </Typography>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        {loading && (
          <Alert severity="info" className={styles.alert}>
            Cargando configuración…
          </Alert>
        )}

        {/* Tabs */}
        <Paper className={styles.tabsPaper}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} className={styles.tabs}>
            {tabs.map((t, idx) => (
              <Tab
                key={t.label}
                id={`settings-tab-${idx}`}
                aria-controls={`settings-tabpanel-${idx}`}
                icon={t.icon}
                iconPosition="start"
                label={t.label}
              />
            ))}
          </Tabs>
        </Paper>

        {/* TAB 1: EMPLEADOS */}
        <TabPanel value={tabValue} index={0}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Gestión de Empleados
            </Typography>

            <Button variant="contained" startIcon={<Add />} onClick={openNewEmployee} className={styles.primaryBtn}>
              Nuevo Empleado
            </Button>
          </Box>

          {employees.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin empleados aún. Conecta tu API para mostrar empleados.
            </Alert>
          ) : (
            <Paper className={styles.paper}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell className={styles.th}>Empleado</TableCell>
                      <TableCell className={styles.th}>Rol</TableCell>
                      <TableCell className={styles.th}>Último Acceso</TableCell>
                      <TableCell className={styles.th} align="center">
                        Estado
                      </TableCell>
                      <TableCell className={styles.th} align="center">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id} hover className={styles.tableRowHover}>
                        <TableCell>
                          <Box>
                            <Typography fontWeight="bold">{employee.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.email}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>{employee.role}</TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString("es-MX") : "—"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.lastLogin ? new Date(employee.lastLogin).toLocaleTimeString("es-MX") : ""}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={employee.status === "active" ? "Activo" : "Inactivo"}
                            size="small"
                            className={employee.status === "active" ? styles.chipOk : styles.chipBad}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <IconButton size="small" onClick={() => openEditEmployee(employee)} className={styles.iconPink}>
                            <Edit />
                          </IconButton>

                          <IconButton
                            size="small"
                            className={employee.status === "active" ? styles.iconRed : styles.iconGreen}
                            onClick={() => {
                              // TODO: API toggle status
                            }}
                          >
                            {employee.status === "active" ? <Lock /> : <LockOpen />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </TabPanel>

        {/* TAB 2: ROLES Y PERMISOS */}
        <TabPanel value={tabValue} index={1}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Roles y Permisos
            </Typography>

            <Button variant="contained" startIcon={<Add />} onClick={openNewRole} className={styles.primaryBtn}>
              Nuevo Rol
            </Button>
          </Box>

          {roles.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin roles aún. Conecta tu API para mostrar roles.
            </Alert>
          ) : (
            <Paper className={styles.paper}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell className={styles.th}>Nombre del Rol</TableCell>
                      <TableCell className={styles.th}>Permisos</TableCell>
                      <TableCell className={styles.th}>Usuarios</TableCell>
                      <TableCell className={styles.th} align="center">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id} hover className={styles.tableRowHover}>
                        <TableCell>
                          <Box className={styles.rowFlex}>
                            <Typography fontWeight="bold">{role.name}</Typography>
                            {role.isSystem && <Chip label="Sistema" size="small" className={styles.chipSystem} />}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {role.permissions?.[0] === "all" ? "Todos los permisos" : `${role.permissions?.length ?? 0} permisos`}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography fontWeight="bold">{role.userCount ?? 0}</Typography> usuarios
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            disabled={role.isSystem}
                            onClick={() => openEditRole(role)}
                            className={styles.outlinedPinkBtn}
                          >
                            {role.isSystem ? "Ver" : "Editar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </TabPanel>

        {/* TAB 3: MÉTODOS DE PAGO */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" className={styles.sectionTitle} style={{ marginBottom: 12 }}>
            Métodos de Pago
          </Typography>

          {paymentMethods.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin métodos de pago aún. Conecta tu API para mostrar métodos.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {paymentMethods.map((method) => (
                <Grid key={method.id} size={{ xs: 12 }}>
                  <Card className={styles.card}>
                    <CardContent>
                      <Box className={styles.cardHeader}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {method.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {paymentTypeLabel(method.type)}
                          </Typography>

                          {method.config?.bank && (
                            <Typography variant="caption" color="text.secondary">
                              {method.config.bank} - {method.config.account}
                            </Typography>
                          )}
                        </Box>

                        <Box className={styles.cardActions}>
                          <Chip
                            label={method.status === "active" ? "Activo" : "Inactivo"}
                            className={method.status === "active" ? styles.chipOk : styles.chipBad}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Settings />}
                            onClick={() => openConfigurePayment(method)}
                            className={styles.outlinedPinkBtn}
                          >
                            Configurar
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* TAB 4: DATOS DE LA TIENDA */}
        <TabPanel value={tabValue} index={3}>
          <Paper className={styles.paperPadded}>
            <Typography variant="h6" className={styles.paperTitlePink}>
              Datos de la Tienda
            </Typography>

            <Alert severity="info" className={styles.alert}>
              Este tab está listo para conectar API (sin datos de prueba).
            </Alert>
          </Paper>
        </TabPanel>

        {/* MODAL: EMPLEADO */}
        <Dialog
          open={openEmployeeModal}
          onClose={() => {
            setOpenEmployeeModal(false);
            setSelectedEmployee(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className={styles.dialogTitle}>
            {selectedEmployee ? "Editar Empleado" : "Nuevo Empleado"}
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ana García"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="empleado@modasarita.com"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={employeeForm.role}
                    label="Rol"
                    onChange={(e) => setEmployeeForm((p) => ({ ...p, role: String(e.target.value) }))}
                  >
                    {roles.map((r) => (
                      <MenuItem key={r.id} value={r.name}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={employeeForm.status}
                    label="Estado"
                    onChange={(e) => setEmployeeForm((p) => ({ ...p, status: e.target.value as EmployeeStatus }))}
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="inactive">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {!selectedEmployee && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Contraseña temporal"
                    value={employeeForm.tempPassword}
                    onChange={(e) => setEmployeeForm((p) => ({ ...p, tempPassword: e.target.value }))}
                    placeholder="(Opcional) o generar automáticamente"
                    helperText="Cuando conectes API puedes enviar correo al empleado."
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setOpenEmployeeModal(false);
                setSelectedEmployee(null);
              }}
              className={styles.btnGhost}
            >
              Cancelar
            </Button>
            <Button onClick={submitEmployee} variant="contained" className={styles.primaryBtn}>
              {selectedEmployee ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* MODAL: ROLES */}
        <Dialog
          open={openRoleModal}
          onClose={() => {
            setOpenRoleModal(false);
            setSelectedRole(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className={styles.dialogTitle}>
            {selectedRole ? `Editar Rol: ${selectedRole.name}` : "Nuevo Rol"}
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Rol"
              value={roleForm.name}
              onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ej: Cajero, Vendedor"
              disabled={selectedRole?.isSystem ?? false}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Permisos
            </Typography>

            <Box className={styles.permsBox}>
              {allPermissions.length === 0 ? (
                <Alert severity="info" className={styles.alert}>
                  Sin catálogo de permisos. Conecta tu API para listar permisos.
                </Alert>
              ) : (
                allPermissions.map((permission) => {
                  const disabled = selectedRole?.isSystem ?? false;
                  const checked = roleForm.permissions.includes("all") || roleForm.permissions.includes(permission.id);

                  return (
                    <FormControlLabel
                      key={permission.id}
                      control={<Checkbox checked={checked} onChange={() => togglePermission(permission.id)} disabled={disabled} />}
                      label={permission.name}
                      sx={{ display: "block", mb: 1 }}
                    />
                  );
                })
              )}
            </Box>

            {selectedRole?.isSystem && (
              <Box className={styles.systemNote}>
                <Typography variant="body2">Este es un rol del sistema y no puede ser modificado.</Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setOpenRoleModal(false);
                setSelectedRole(null);
              }}
              className={styles.btnGhost}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitRole}
              variant="contained"
              disabled={selectedRole?.isSystem ?? false}
              className={styles.primaryBtn}
            >
              {selectedRole ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* MODAL: MÉTODOS DE PAGO */}
        <Dialog
          open={openPaymentModal}
          onClose={() => {
            setOpenPaymentModal(false);
            setSelectedPayment(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className={styles.dialogTitle}>Configurar Método de Pago</DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Clave Pública de API"
                  type={showApiKey ? "text" : "password"}
                  value={paymentForm.apiKeyPublic}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, apiKeyPublic: e.target.value }))}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowApiKey((s) => !s)} edge="end">
                          {showApiKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Clave Secreta de API"
                  type="password"
                  value={paymentForm.apiKeySecret}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, apiKeySecret: e.target.value }))}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={paymentForm.status}
                    label="Estado"
                    onChange={(e) => setPaymentForm((p) => ({ ...p, status: e.target.value as PaymentStatus }))}
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="inactive">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box className={styles.sensitiveBox}>
                  <Typography variant="body2">
                    <strong>Importante:</strong> Las claves API son información sensible. Se almacenan encriptadas.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setOpenPaymentModal(false);
                setSelectedPayment(null);
              }}
              className={styles.btnGhost}
            >
              Cancelar
            </Button>
            <Button onClick={submitPayment} variant="contained" className={styles.primaryBtn}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}