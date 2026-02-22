// src/components/admin/CrearClienteDialog.tsx

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
  CircularProgress
} from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import clientesService from '../../services/clientes.service';

interface CrearClienteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CrearClienteDialog: React.FC<CrearClienteDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    limite_credito: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limite_credito' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.telefono) {
      setError('Nombre y teléfono son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await clientesService.createCliente({
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email || undefined,
        direccion: formData.direccion || undefined,
        limite_credito: formData.limite_credito
      });

      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        limite_credito: 0
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        limite_credito: 0
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          Registrar Nuevo Cliente
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                autoFocus
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                inputProps={{ maxLength: 15 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Límite de Crédito (opcional)"
                name="limite_credito"
                type="number"
                value={formData.limite_credito}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading} startIcon={<Close />}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Guardar Cliente
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CrearClienteDialog;