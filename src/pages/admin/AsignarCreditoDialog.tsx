// src/components/admin/AsignarCreditoDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { Save, Close, CreditCard, Payments } from '@mui/icons-material';
import type { Cliente } from '../../services/clientes.service';
import clientesService from '../../services/clientes.service';

interface AsignarCreditoDialogProps {
  open: boolean;
  cliente: Cliente;
  onClose: () => void;
  onSuccess: () => void;
}

const AsignarCreditoDialog: React.FC<AsignarCreditoDialogProps> = ({
  open,
  cliente,
  onClose,
  onSuccess
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [limiteCredito, setLimiteCredito] = useState(cliente.limite_credito);
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const handleAsignarCredito = async () => {
    try {
      setLoading(true);
      setError('');
      
      await clientesService.asignarCredito(cliente.id, limiteCredito);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar crédito');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarAbono = async () => {
    const monto = parseFloat(montoAbono);
    
    if (!monto || monto <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (monto > cliente.saldo_deudor) {
      setError('El monto no puede ser mayor al saldo deudor');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await clientesService.registrarAbono(cliente.id, monto, metodoPago);
      setMontoAbono('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar abono');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        Gestionar Crédito
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            {cliente.nombre}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Límite de Crédito:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatMoneda(cliente.limite_credito)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Saldo Deudor:
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="error">
                {formatMoneda(cliente.saldo_deudor)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab icon={<CreditCard />} label="Asignar Crédito" />
          <Tab icon={<Payments />} label="Registrar Abono" disabled={cliente.saldo_deudor === 0} />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Asigna o modifica el límite de crédito disponible para este cliente.
            </Typography>
            
            <TextField
              fullWidth
              label="Límite de Crédito"
              type="number"
              value={limiteCredito}
              onChange={(e) => setLimiteCredito(parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <span style={{ marginRight: 8 }}>$</span>,
              }}
              inputProps={{ min: 0, step: 100 }}
            />
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Registra un pago para reducir el saldo deudor del cliente.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Monto del Abono"
                  type="number"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                  }}
                  inputProps={{ min: 0, max: cliente.saldo_deudor, step: 0.01 }}
                  helperText={`Máximo: ${formatMoneda(cliente.saldo_deudor)}`}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Método de Pago"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  SelectProps={{ native: true }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} startIcon={<Close />}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          onClick={tabValue === 0 ? handleAsignarCredito : handleRegistrarAbono}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          {tabValue === 0 ? 'Guardar Límite' : 'Registrar Abono'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AsignarCreditoDialog;