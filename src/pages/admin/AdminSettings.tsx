// src/pages/admin/AdminSettings.tsx

import React, { useState } from 'react';
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
  Grid,
  Switch,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Divider
} from '@mui/material';
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
  Store
} from '@mui/icons-material';
import { AdminLayout } from '../../components/layout/AdminLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'manual' | 'terminal' | 'gateway';
  status: 'active' | 'inactive';
  config: {
    apiKey?: string;
    bank?: string;
    account?: string;
    clabe?: string;
  };
}

const AdminSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const employees: Employee[] = [
    {
      id: '1',
      name: 'Ana García',
      email: 'ana@modasarita.com',
      role: 'Administrador',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      createdAt: '2023-05-10'
    },
    {
      id: '2',
      name: 'Carlos López',
      email: 'carlos@modasarita.com',
      role: 'Cajero',
      status: 'active',
      lastLogin: '2024-01-14 09:15',
      createdAt: '2023-08-22'
    }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Administrador',
      permissions: ['all'],
      userCount: 1,
      isSystem: true
    },
    {
      id: '2',
      name: 'Cajero',
      permissions: ['sales.view', 'sales.create', 'customers.view'],
      userCount: 2,
      isSystem: false
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'Efectivo',
      type: 'manual',
      status: 'active',
      config: {}
    },
    {
      id: '2',
      name: 'Tarjeta de Crédito/Débito',
      type: 'terminal',
      status: 'active',
      config: {}
    },
    {
      id: '3',
      name: 'Mercado Pago',
      type: 'gateway',
      status: 'inactive',
      config: { apiKey: 'sk_*************1234' }
    }
  ];

  const allPermissions = [
    { id: 'sales.view', name: 'Ver Ventas', category: 'Ventas' },
    { id: 'sales.create', name: 'Registrar Ventas', category: 'Ventas' },
    { id: 'customers.view', name: 'Ver Clientes', category: 'Clientes' },
    { id: 'inventory.view', name: 'Ver Inventario', category: 'Inventario' }
  ];

  return (
    <AdminLayout role="admin">
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>
          Configuración del Sistema
        </Typography>

        {/* Tabs */}
        <Paper sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold' },
              '& .Mui-selected': { color: '#E91E8C' },
              '& .MuiTabs-indicator': { bgcolor: '#E91E8C' }
            }}
          >
            <Tab icon={<People />} iconPosition="start" label="Empleados" />
            <Tab icon={<Shield />} iconPosition="start" label="Roles y Permisos" />
            <Tab icon={<CreditCard />} iconPosition="start" label="Métodos de Pago" />
            <Tab icon={<Store />} iconPosition="start" label="Datos de la Tienda" />
          </Tabs>
        </Paper>

        {/* TAB 1: EMPLEADOS */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Gestión de Empleados
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedEmployee(null);
                setOpenEmployeeModal(true);
              }}
              sx={{
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '25px',
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Nuevo Empleado
            </Button>
          </Box>

          <Paper sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FDE8F4' }}>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Empleado</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Rol</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Último Acceso</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Estado</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
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
                          {new Date(employee.lastLogin).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(employee.lastLogin).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={employee.status === 'active' ? 'Activo' : 'Inactivo'}
                          size="small"
                          sx={{
                            bgcolor: employee.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                            color: employee.status === 'active' ? '#2E7D32' : '#C62828',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setOpenEmployeeModal(true);
                          }}
                          sx={{ color: '#E91E8C' }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: employee.status === 'active' ? '#C62828' : '#2E7D32' }}
                        >
                          {employee.status === 'active' ? <Lock /> : <LockOpen />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* TAB 2: ROLES Y PERMISOS */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Roles y Permisos
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedRole(null);
                setOpenRoleModal(true);
              }}
              sx={{
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '25px',
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Nuevo Rol
            </Button>
          </Box>

          <Paper sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FDE8F4' }}>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Nombre del Rol</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Permisos</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Usuarios</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography fontWeight="bold">{role.name}</Typography>
                          {role.isSystem && (
                            <Chip
                              label="Sistema"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: '#FDE8F4',
                                color: '#E91E8C',
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {role.permissions[0] === 'all'
                            ? 'Todos los permisos'
                            : `${role.permissions.length} permisos`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">{role.userCount}</Typography> usuarios
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          disabled={role.isSystem}
                          onClick={() => {
                            setSelectedRole(role);
                            setOpenRoleModal(true);
                          }}
                          sx={{
                            borderColor: '#E91E8C',
                            color: '#E91E8C',
                            '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                            borderRadius: '20px',
                            textTransform: 'none'
                          }}
                        >
                          {role.isSystem ? 'Ver' : 'Editar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* TAB 3: MÉTODOS DE PAGO */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
            Métodos de Pago
          </Typography>

          <Grid container spacing={2}>
            {paymentMethods.map((method) => (
              <Grid size={{ xs: 12 }} key={method.id}>
                <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {method.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.type === 'gateway'
                            ? 'Pasarela de pago'
                            : method.type === 'terminal'
                            ? 'Terminal punto de venta'
                            : 'Método manual'}
                        </Typography>
                        {method.config?.bank && (
                          <Typography variant="caption" color="text.secondary">
                            {method.config.bank} - {method.config.account}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={method.status === 'active' ? 'Activo' : 'Inactivo'}
                          sx={{
                            bgcolor: method.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                            color: method.status === 'active' ? '#2E7D32' : '#C62828',
                            fontWeight: 'bold'
                          }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Settings />}
                          onClick={() => setOpenPaymentModal(true)}
                          sx={{
                            borderColor: '#E91E8C',
                            color: '#E91E8C',
                            '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                            borderRadius: '20px',
                            textTransform: 'none'
                          }}
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
        </TabPanel>

        {/* TAB 4: DATOS DE LA TIENDA */}
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#E91E8C', mb: 3 }}>
              Datos de la Tienda
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nombre de la Tienda"
                  defaultValue="Moda Sarita"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Dirección Física"
                  defaultValue="Av. Principal #123, Col. Centro, Huejutla"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono de Contacto"
                  defaultValue="771 123 4567"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  defaultValue="contacto@modasarita.com"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Métodos de Pago Aceptados
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel control={<Checkbox defaultChecked />} label="Efectivo" />
                  <FormControlLabel control={<Checkbox defaultChecked />} label="Tarjeta" />
                  <FormControlLabel control={<Checkbox defaultChecked />} label="Transferencia" />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#E91E8C',
                    '&:hover': { bgcolor: '#C2185B' },
                    borderRadius: '25px',
                    px: 4,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Guardar Cambios
                </Button>
              </Grid>
            </Grid>
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
          <DialogTitle sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', fontWeight: 'bold' }}>
            {selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  defaultValue={selectedEmployee?.name || ''}
                  placeholder="Ana García"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  defaultValue={selectedEmployee?.email || ''}
                  placeholder="empleado@modasarita.com"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    defaultValue={selectedEmployee?.role || ''}
                    label="Rol"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E91E8C' }
                    }}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    defaultValue={selectedEmployee?.status || 'active'}
                    label="Estado"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E91E8C' }
                    }}
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
                    placeholder="Generar automáticamente"
                    helperText="Se enviará un correo al empleado"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEmployeeModal(false)} sx={{ color: '#666' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '20px',
                px: 3
              }}
            >
              {selectedEmployee ? 'Actualizar' : 'Crear'}
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
          <DialogTitle sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', fontWeight: 'bold' }}>
            {selectedRole ? `Editar Rol: ${selectedRole.name}` : 'Nuevo Rol'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Rol"
              defaultValue={selectedRole?.name || ''}
              placeholder="Ej: Cajero, Vendedor"
              disabled={selectedRole?.isSystem}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
              }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Permisos
            </Typography>
            <Box
              sx={{
                maxHeight: 300,
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2
              }}
            >
              {allPermissions.map((permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      defaultChecked={
                        selectedRole?.permissions?.includes('all') ||
                        selectedRole?.permissions?.includes(permission.id)
                      }
                      disabled={selectedRole?.isSystem}
                    />
                  }
                  label={permission.name}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Box>

            {selectedRole?.isSystem && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#FDE8F4', borderRadius: 1 }}>
                <Typography variant="body2">
                  Este es un rol del sistema y no puede ser modificado.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenRoleModal(false)} sx={{ color: '#666' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={selectedRole?.isSystem}
              sx={{
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '20px',
                px: 3
              }}
            >
              {selectedRole ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* MODAL: MÉTODOS DE PAGO */}
        <Dialog
          open={openPaymentModal}
          onClose={() => setOpenPaymentModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', fontWeight: 'bold' }}>
            Configurar Método de Pago
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Clave Pública de API"
                  type={showApiKey ? 'text' : 'password'}
                  defaultValue="pk_************"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end">
                          {showApiKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Clave Secreta de API"
                  type="password"
                  defaultValue="sk_************"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    defaultValue="inactive"
                    label="Estado"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E91E8C' }
                    }}
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="inactive">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, bgcolor: '#FDE8F4', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Importante:</strong> Las claves API son información sensible. Se
                    almacenan encriptadas.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPaymentModal(false)} sx={{ color: '#666' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '20px',
                px: 3
              }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminSettings;