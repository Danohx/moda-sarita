// src/pages/admin/AdminCustomers.tsx

import React, { useState } from 'react';
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
  Grid,
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
  FormControlLabel
} from '@mui/material';
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
  Inventory
} from '@mui/icons-material';
import { AdminLayout } from '../../components/layout/AdminLayout';

interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'inactive';
  lastPurchase: string;
  joinDate: string;
  address?: string;
  totalPurchases?: number;
  totalLayaways?: number;
  totalSpent?: number;
}

const AdminCustomers: React.FC = () => {
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openCreditModal, setOpenCreditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const customers: Cliente[] = [
    {
      id: '1',
      name: 'María González',
      email: 'maria@email.com',
      phone: '771 123 4567',
      creditLimit: 5000,
      currentBalance: 1250,
      status: 'active',
      lastPurchase: '2024-01-15',
      joinDate: '2023-05-15',
      address: 'Av. Principal #123, Col. Centro',
      totalPurchases: 12,
      totalLayaways: 3,
      totalSpent: 8500
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      phone: '771 987 6543',
      creditLimit: 3000,
      currentBalance: 0,
      status: 'active',
      lastPurchase: '2024-01-10',
      joinDate: '2023-06-20',
      address: 'Calle Hidalgo #456',
      totalPurchases: 8,
      totalLayaways: 1,
      totalSpent: 5200
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana@email.com',
      phone: '771 555 7890',
      creditLimit: 0,
      currentBalance: 0,
      status: 'active',
      lastPurchase: '2024-01-08',
      joinDate: '2023-07-12',
      address: 'Av. Revolución #789',
      totalPurchases: 5,
      totalLayaways: 0,
      totalSpent: 2800
    }
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const handleViewCustomer = (customer: Cliente) => {
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

  const estadisticas = {
    totalClientes: customers.length,
    clientesActivos: customers.filter((c) => c.status === 'active').length,
    clientesConCredito: customers.filter((c) => c.creditLimit > 0).length,
    saldoTotal: customers.reduce((sum, c) => sum + c.currentBalance, 0)
  };

  return (
    <AdminLayout role="admin">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Gestión de Clientes
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedCustomer(null);
              setOpenCustomerModal(true);
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
            Nuevo Cliente
          </Button>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Clientes
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.totalClientes}
                    </Typography>
                  </Box>
                  <Person sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #F06292 0%, #E91E8C 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Activos
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.clientesActivos}
                    </Typography>
                  </Box>
                  <ShoppingBag sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Con Crédito
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.clientesConCredito}
                    </Typography>
                  </Box>
                  <CreditCard sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)', color: '#E91E8C' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Saldo Total
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {formatMoneda(estadisticas.saldoTotal)}
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#E91E8C' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#E91E8C' },
                    '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E91E8C' }
                  }}
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
                sx={{
                  height: '56px',
                  borderColor: '#E91E8C',
                  color: '#E91E8C',
                  '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                  borderRadius: '8px',
                  textTransform: 'none'
                }}
              >
                Más Filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Clientes */}
        <Paper sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#FDE8F4' }}>
                  <TableCell>
                    <strong style={{ color: '#E91E8C' }}>Cliente</strong>
                  </TableCell>
                  <TableCell>
                    <strong style={{ color: '#E91E8C' }}>Contacto</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong style={{ color: '#E91E8C' }}>Límite Crédito</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong style={{ color: '#E91E8C' }}>Saldo Actual</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong style={{ color: '#E91E8C' }}>Estado</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong style={{ color: '#E91E8C' }}>Acciones</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#E91E8C', mr: 2 }}>{customer.name.charAt(0)}</Avatar>
                        <Typography fontWeight="bold">{customer.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {customer.creditLimit > 0 ? (
                        <Typography fontWeight="bold" sx={{ color: '#4CAF50' }}>
                          {formatMoneda(customer.creditLimit)}
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">Sin crédito</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {customer.creditLimit > 0 && (
                        <Typography
                          fontWeight="bold"
                          sx={{ color: customer.currentBalance > 0 ? '#F44336' : '#4CAF50' }}
                        >
                          {formatMoneda(customer.currentBalance)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={customer.status === 'active' ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          bgcolor: customer.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                          color: customer.status === 'active' ? '#2E7D32' : '#C62828',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewCustomer(customer)}
                        sx={{ color: '#E91E8C' }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleViewCustomer(customer)}
                        sx={{ color: '#E91E8C' }}
                      >
                        <Edit />
                      </IconButton>
                      {customer.creditLimit > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => handleEditCredit(customer)}
                          sx={{ color: '#E91E8C' }}
                        >
                          <CreditCard />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* MODAL: Detalles del Cliente */}
        <Dialog open={openCustomerModal} onClose={handleCloseCustomerModal} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', fontWeight: 'bold' }}>
            {selectedCustomer ? `Detalles de ${selectedCustomer.name}` : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Columna Izquierda - Información Personal */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold', mb: 2 }}>
                  Información Personal
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    defaultValue={selectedCustomer?.name || ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Teléfono"
                        defaultValue={selectedCustomer?.phone || ''}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        defaultValue={selectedCustomer?.email || ''}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Dirección"
                    multiline
                    rows={3}
                    defaultValue={selectedCustomer?.address || ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Fecha de registro"
                        type="date"
                        defaultValue={selectedCustomer?.joinDate || ''}
                        disabled={!!selectedCustomer}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                          },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          defaultValue={selectedCustomer?.status || 'active'}
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
                  </Grid>
                </Box>
              </Grid>

              {/* Columna Derecha - Información Adicional */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold', mb: 2 }}>
                  Información Adicional
                </Typography>

                {/* Línea de Crédito */}
                <Card sx={{ bgcolor: '#FDE8F4', mb: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Typography fontWeight="bold">Línea de Crédito</Typography>
                      <Chip
                        label={
                          selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0
                            ? 'Activa'
                            : 'Inactiva'
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0
                              ? '#E8F5E9'
                              : '#FFEBEE',
                          color:
                            selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0
                              ? '#2E7D32'
                              : '#C62828',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    {selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0 ? (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Límite:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatMoneda(selectedCustomer.creditLimit)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Saldo actual:</Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ color: selectedCustomer.currentBalance > 0 ? '#F44336' : '#4CAF50' }}
                          >
                            {formatMoneda(selectedCustomer.currentBalance)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Disponible:</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                            {formatMoneda(selectedCustomer.creditLimit - selectedCustomer.currentBalance)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100}
                          sx={{
                            mt: 2,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': { bgcolor: '#E91E8C' }
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Este cliente no tiene línea de crédito activa.
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Resumen de Actividad */}
                <Card sx={{ bgcolor: '#FFF', border: '1px solid #FDE8F4', mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                      Resumen de Actividad
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                          {selectedCustomer?.totalPurchases || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Compras
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                          {selectedCustomer?.totalLayaways || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Apartados
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                          {formatMoneda(selectedCustomer?.totalSpent || 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Acciones Rápidas */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Acciones Rápidas
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<History />}
                      sx={{
                        borderColor: '#E91E8C',
                        color: '#E91E8C',
                        '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                        textTransform: 'none',
                        fontSize: '0.75rem'
                      }}
                    >
                      Historial
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Inventory />}
                      sx={{
                        borderColor: '#E91E8C',
                        color: '#E91E8C',
                        '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                        textTransform: 'none',
                        fontSize: '0.75rem'
                      }}
                    >
                      Apartados
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AttachMoney />}
                      sx={{
                        borderColor: '#E91E8C',
                        color: '#E91E8C',
                        '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                        textTransform: 'none',
                        fontSize: '0.75rem'
                      }}
                    >
                      Abonar
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseCustomerModal} sx={{ color: '#666', textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '20px',
                textTransform: 'none',
                px: 3
              }}
            >
              {selectedCustomer ? 'Actualizar Cliente' : 'Guardar Cliente'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* MODAL: Gestión de Crédito */}
        <Dialog open={openCreditModal} onClose={handleCloseCreditModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', fontWeight: 'bold' }}>
            Gestión de Crédito - {selectedCustomer?.name}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {/* Estado Actual */}
            <Card
              sx={{
                background: 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)',
                color: 'white',
                mb: 3
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Estado Actual del Crédito
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Límite actual:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatMoneda(selectedCustomer?.creditLimit || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Saldo utilizado:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatMoneda(selectedCustomer?.currentBalance || 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Crédito disponible:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatMoneda(
                        (selectedCustomer?.creditLimit || 0) - (selectedCustomer?.currentBalance || 0)
                      )}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Configuración de Crédito */}
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: '#E91E8C' }}>
              Configuración de Crédito
            </Typography>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Nuevo Límite de Crédito"
                type="number"
                defaultValue={selectedCustomer?.creditLimit || 0}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    // Usamos !! para asegurar que el resultado sea estrictamente true o false
                    checked={!!(selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0)}
                    onChange={(e) => {
                      /* Aquí deberías manejar el cambio de estado si es necesario */
                      console.log("Crédito habilitado:", e.target.checked);
                    }}
                    sx={{
                      color: '#E91E8C',
                      '&.Mui-checked': { color: '#E91E8C' },
                    }}
                  />
                }
                label="Habilitar línea de crédito para este cliente"
              />
            </Box>

            {/* Registrar Abono */}
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: '#E91E8C' }}>
              Registrar Abono
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <TextField
                  fullWidth
                  label="Monto a abonar"
                  type="number"
                  placeholder="0.00"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AttachMoney />}
                  sx={{
                    height: '56px',
                    borderColor: '#E91E8C',
                    color: '#E91E8C',
                    '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                    textTransform: 'none'
                  }}
                >
                  Abonar
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseCreditModal} sx={{ color: '#666', textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '20px',
                textTransform: 'none',
                px: 3
              }}
            >
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminCustomers;