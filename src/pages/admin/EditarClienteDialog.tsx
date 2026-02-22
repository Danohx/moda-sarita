// src/components/admin/EditarClienteDialog.tsx

import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch
} from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import clientesService, { type Cliente } from '../../services/clientes.service';

interface EditarClienteDialogProps {
  open: boolean;
  cliente: Cliente;
  onClose: () => void;
  onSuccess: () => void;
}

const EditarClienteDialog: React.FC<EditarClienteDialogProps> = ({
  open,
  cliente,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        activo: cliente.activo
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activo' ? checked : value
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
      
      await clientesService.updateCliente(cliente.id, {
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email || undefined,
        direccion: formData.direccion || undefined,
        activo: formData.activo
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          Editar Cliente
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12 }}>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={handleChange}
                    name="activo"
                    color="primary"
                  />
                }
                label="Cliente Activo"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading} startIcon={<Close />}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditarClienteDialog;