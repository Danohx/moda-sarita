// src/pages/public/CheckoutPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import {
  CheckCircle
} from '@mui/icons-material';
import Grid from '@mui/material/GridLegacy';
import PublicLayout from '../../components/layout/PublicLayout';

const steps = ['Información de Envío', 'Método de Pago', 'Confirmación'];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [metodoPago, setMetodoPago] = useState('tarjeta');

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const total = 1580; // Ejemplo

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend">Selecciona un método de pago</FormLabel>
              <RadioGroup
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <FormControlLabel
                  value="tarjeta"
                  control={<Radio />}
                  label="Tarjeta de Crédito/Débito"
                />
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label="PayPal"
                />
                <FormControlLabel
                  value="efectivo"
                  control={<Radio />}
                  label="Pago contra entrega (Efectivo)"
                />
                <FormControlLabel
                  value="apartado"
                  control={<Radio />}
                  label="Apartado (50% anticipo)"
                />
              </RadioGroup>
            </FormControl>

            {metodoPago === 'tarjeta' && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Número de Tarjeta"
                      placeholder="1234 5678 9012 3456"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha de Expiración"
                      placeholder="MM/AA"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      placeholder="123"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {metodoPago === 'apartado' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Pagarás el 50% ahora ({formatMoneda(total * 0.5)}) y el resto al recoger tu pedido.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
              ¡Pedido confirmado! Revisa los detalles a continuación.
            </Alert>

            <Typography variant="h6" gutterBottom>
              Información de Envío
            </Typography>
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
              <Typography><strong>Nombre:</strong> {formData.nombre}</Typography>
              <Typography><strong>Teléfono:</strong> {formData.telefono}</Typography>
              <Typography><strong>Email:</strong> {formData.email}</Typography>
              <Typography><strong>Dirección:</strong> {formData.direccion}</Typography>
              <Typography><strong>Ciudad:</strong> {formData.ciudad}, CP: {formData.codigoPostal}</Typography>
            </Paper>

            <Typography variant="h6" gutterBottom>
              Método de Pago
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography>
                {metodoPago === 'tarjeta' && 'Tarjeta de Crédito/Débito'}
                {metodoPago === 'paypal' && 'PayPal'}
                {metodoPago === 'efectivo' && 'Pago contra entrega'}
                {metodoPago === 'apartado' && 'Apartado (50% anticipo)'}
              </Typography>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Finalizar Compra
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={3}>
          {/* Formulario */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  onClick={activeStep === steps.length - 1 ? () => navigate('/') : handleNext}
                  sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {activeStep === steps.length - 1 ? 'Confirmar Pedido' : 'Siguiente'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Resumen */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Resumen del Pedido
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    2 Productos
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatMoneda(1580)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Envío:</Typography>
                    <Typography color="success.main">Gratis</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatMoneda(total)}
                  </Typography>
                </Box>

                {metodoPago === 'apartado' && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">A pagar ahora (50%):</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatMoneda(total * 0.5)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Pendiente:</Typography>
                      <Typography variant="body2">
                        {formatMoneda(total * 0.5)}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
};

export default CheckoutPage;