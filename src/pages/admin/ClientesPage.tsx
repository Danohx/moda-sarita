// src/pages/admin/ClientesPage.tsx

import React, { useState, useEffect } from 'react';
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
  Grid, // Usando Grid2 para compatibilidad
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  CreditCard,
  People,
  PersonAdd,
  AccountBalance
} from '@mui/icons-material';
import ErrorLayout from '../../components/layout/ErrorLayout';
import clientesService, { type Cliente } from '../../services/clientes.service';
import CrearClienteDialog from './CrearClienteDialog'; 
import EditarClienteDialog from './EditarClienteDialog';
import DetalleClienteDialog from './DetalleClienteDialog';
import AsignarCreditoDialog from './AsignarCreditoDialog';

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [error, setError] = useState('');
  const [estadisticas, setEstadisticas] = useState<any>(null);

  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [openCredito, setOpenCredito] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  useEffect(() => {
    cargarClientes();
    cargarEstadisticas();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getAllClientes();
      setClientes(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await clientesService.getEstadisticas();
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getAllClientes(buscar);
      setClientes(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al buscar');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setOpenDetalle(true);
  };

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setOpenEditar(true);
  };

  const handleAsignarCredito = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setOpenCredito(true);
  };

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    cliente.telefono.includes(buscar) ||
    cliente.email?.toLowerCase().includes(buscar.toLowerCase())
  );

  // Si hay un error crítico que impide mostrar la página, usamos ErrorLayout aquí
  if (error && clientes.length === 0) {
    return (
      <ErrorLayout 
        code="500" 
        title="Error de Conexión" 
        message={error} 
        icon="error" 
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Gestión de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCrear(true)}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* Alerta de error no crítico (ej. error en búsqueda) */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {estadisticas && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md:3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Clientes</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.total_clientes}
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md:3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Activos</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.clientes_activos}
                    </Typography>
                  </Box>
                  <PersonAdd sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md:3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Con Crédito</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.clientes_con_credito}
                    </Typography>
                  </Box>
                  <CreditCard sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md:3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Saldo Deudor</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {formatMoneda(parseFloat(estadisticas.total_saldo_deudor))}
                    </Typography>
                  </Box>
                  <AccountBalance sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, teléfono o email..."
          value={buscar}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuscar(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleBuscar()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Teléfono</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell align="center"><strong>Crédito</strong></TableCell>
                <TableCell align="right"><strong>Saldo Deudor</strong></TableCell>
                <TableCell align="center"><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : clientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No se encontraron clientes</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id} hover>
                    <TableCell>{cliente.nombre}</TableCell>
                    <TableCell>{cliente.telefono}</TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell align="center">
                      {cliente.limite_credito > 0 ? (
                        <Chip label={formatMoneda(cliente.limite_credito)} color="info" size="small" />
                      ) : (
                        <Chip label="Sin crédito" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {cliente.saldo_deudor > 0 ? (
                        <Typography color="error" fontWeight="bold">
                          {formatMoneda(cliente.saldo_deudor)}
                        </Typography>
                      ) : (
                        <Typography color="text.secondary">{formatMoneda(0)}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={cliente.activo ? 'Activo' : 'Inactivo'}
                        color={cliente.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleVerDetalle(cliente)} title="Ver detalles">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditar(cliente)} title="Editar">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleAsignarCredito(cliente)} title="Gestionar crédito" color="primary">
                        <CreditCard />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogos */}
      <CrearClienteDialog
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        onSuccess={() => {
          setOpenCrear(false);
          cargarClientes();
          cargarEstadisticas();
        }}
      />

      {clienteSeleccionado && (
        <>
          <EditarClienteDialog
            open={openEditar}
            cliente={clienteSeleccionado}
            onClose={() => {
              setOpenEditar(false);
              setClienteSeleccionado(null);
            }}
            onSuccess={() => {
              setOpenEditar(false);
              setClienteSeleccionado(null);
              cargarClientes();
            }}
          />

          <DetalleClienteDialog
            open={openDetalle}
            clienteId={clienteSeleccionado.id}
            onClose={() => {
              setOpenDetalle(false);
              setClienteSeleccionado(null);
            }}
          />

          <AsignarCreditoDialog
            open={openCredito}
            cliente={clienteSeleccionado}
            onClose={() => {
              setOpenCredito(false);
              setClienteSeleccionado(null);
            }}
            onSuccess={() => {
              setOpenCredito(false);
              setClienteSeleccionado(null);
              cargarClientes();
              cargarEstadisticas();
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ClientesPage;