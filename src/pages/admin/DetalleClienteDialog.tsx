// src/components/admin/DetalleClienteDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Close,
  ShoppingCart,
  LocalOffer,
  AccountBalance,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import clientesService, { type ClienteDetalle } from '../../services/clientes.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DetalleClienteDialogProps {
  open: boolean;
  clienteId: number;
  onClose: () => void;
  //onReload: () => void;
}

const DetalleClienteDialog: React.FC<DetalleClienteDialogProps> = ({
  open,
  clienteId,
  onClose,
  //onReload
}) => {
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open && clienteId) {
      cargarCliente();
    }
  }, [open, clienteId]);

  const cargarCliente = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getClienteById(clienteId);
      setCliente(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const formatFecha = (fecha: string) => {
    return format(new Date(fecha), "dd 'de' MMMM, yyyy", { locale: es });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        Detalle del Cliente
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : cliente ? (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información Personal
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Nombre
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {cliente.nombre}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Teléfono
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {cliente.telefono}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {cliente.email || 'No registrado'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Cliente desde
                    </Typography>
                    <Typography variant="body1">
                      {formatFecha(cliente.creado_en)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información de Crédito
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Límite de Crédito:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatMoneda(cliente.limite_credito)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Saldo Deudor:
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        color={cliente.saldo_deudor > 0 ? 'error' : 'success'}
                      >
                        {formatMoneda(cliente.saldo_deudor)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Crédito Disponible:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {formatMoneda(cliente.limite_credito - cliente.saldo_deudor)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
                <Tab icon={<ShoppingCart />} label="Compras" />
                <Tab icon={<LocalOffer />} label="Apartados" />
                <Tab icon={<AccountBalance />} label="Movimientos de Crédito" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <Box sx={{ py: 2 }}>
                {cliente.historial_compras && cliente.historial_compras.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Folio</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Vendedor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cliente.historial_compras.map((venta: any) => (
                        <TableRow key={venta.id}>
                          <TableCell>{venta.folio}</TableCell>
                          <TableCell>{formatFecha(venta.creado_en)}</TableCell>
                          <TableCell align="right">{formatMoneda(venta.total)}</TableCell>
                          <TableCell>{venta.vendedor}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                    No hay compras registradas
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ py: 2 }}>
                {cliente.historial_apartados && cliente.historial_apartados.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Folio</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cliente.historial_apartados.map((apartado: any) => (
                        <TableRow key={apartado.id}>
                          <TableCell>{apartado.folio}</TableCell>
                          <TableCell>{formatFecha(apartado.creado_en)}</TableCell>
                          <TableCell align="right">{formatMoneda(apartado.total)}</TableCell>
                          <TableCell align="right">{formatMoneda(apartado.saldo_restante)}</TableCell>
                          <TableCell>
                            <Chip label={apartado.estado} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                    No hay apartados registrados
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 2 && (
              <Box sx={{ py: 2 }}>
                {cliente.movimientos_credito && cliente.movimientos_credito.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="right">Saldo Nuevo</TableCell>
                        <TableCell>Usuario</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cliente.movimientos_credito.map((mov: any) => (
                        <TableRow key={mov.id}>
                          <TableCell>{formatFecha(mov.creado_en)}</TableCell>
                          <TableCell>
                            <Chip 
                              icon={mov.tipo === 'compra' ? <TrendingUp /> : <TrendingDown />}
                              label={mov.tipo}
                              size="small"
                              color={mov.tipo === 'compra' ? 'error' : 'success'}
                            />
                          </TableCell>
                          <TableCell align="right">{formatMoneda(mov.monto)}</TableCell>
                          <TableCell align="right">{formatMoneda(mov.saldo_nuevo)}</TableCell>
                          <TableCell>{mov.usuario_nombre}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                    No hay movimientos de crédito
                  </Typography>
                )}
              </Box>
            )}
          </>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<Close />}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetalleClienteDialog;