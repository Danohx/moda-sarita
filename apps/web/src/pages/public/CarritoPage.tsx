// src/pages/public/CarritoPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Divider,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCart,
  ArrowBack,
  LocalOffer
} from '@mui/icons-material';
import PublicLayout from '@shared/components/layout/PublicLayout';

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

const CarritoPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado del carrito (después usar Context o Redux)
  const [items, setItems] = useState<ItemCarrito[]>([
    { id: 1, nombre: 'Blusa Elegante', precio: 450, cantidad: 2, imagen: '' },
    { id: 2, nombre: 'Vestido Casual', precio: 680, cantidad: 1, imagen: '' },
  ]);
  
  const [codigoCupon, setCodigoCupon] = useState('');
  const [descuento, setDescuento] = useState(0);

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const handleCantidad = (id: number, operacion: 'sumar' | 'restar') => {
    setItems(items.map(item => {
      if (item.id === id) {
        const nuevaCantidad = operacion === 'sumar' ? item.cantidad + 1 : item.cantidad - 1;
        return { ...item, cantidad: Math.max(1, nuevaCantidad) };
      }
      return item;
    }));
  };

  const handleEliminar = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const aplicarCupon = () => {
    if (codigoCupon === 'DESCUENTO10') {
      setDescuento(0.10);
    } else {
      setDescuento(0);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const montoDescuento = subtotal * descuento;
  const total = subtotal - montoDescuento;

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            Carrito de Compras
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tienda')}
          >
            Continuar Comprando
          </Button>
        </Box>

        {items.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Tu carrito está vacío
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/tienda')}
              sx={{ mt: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Ir a la Tienda
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Lista de productos */}
            <Box sx={{ flex: 2 }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Producto</strong></TableCell>
                      <TableCell align="center"><strong>Precio</strong></TableCell>
                      <TableCell align="center"><strong>Cantidad</strong></TableCell>
                      <TableCell align="center"><strong>Subtotal</strong></TableCell>
                      <TableCell align="center"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 1
                              }}
                            />
                            <Typography>{item.nombre}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="bold">
                            {formatMoneda(item.precio)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleCantidad(item.id, 'restar')}
                              disabled={item.cantidad === 1}
                            >
                              <Remove />
                            </IconButton>
                            <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                              {item.cantidad}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleCantidad(item.id, 'sumar')}
                            >
                              <Add />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="bold" color="primary">
                            {formatMoneda(item.precio * item.cantidad)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => handleEliminar(item.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Resumen del pedido */}
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Resumen del Pedido
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>{formatMoneda(subtotal)}</Typography>
                    </Box>

                    {descuento > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="success.main">Descuento ({descuento * 100}%):</Typography>
                        <Typography color="success.main">- {formatMoneda(montoDescuento)}</Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Envío:</Typography>
                      <Typography color="success.main">Gratis</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Total:</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatMoneda(total)}
                    </Typography>
                  </Box>

                  {/* Cupón */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom>
                      ¿Tienes un cupón?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Código de cupón"
                        value={codigoCupon}
                        onChange={(e) => setCodigoCupon(e.target.value)}
                      />
                      <Button
                        variant="outlined"
                        onClick={aplicarCupon}
                        startIcon={<LocalOffer />}
                      >
                        Aplicar
                      </Button>
                    </Box>
                    {descuento > 0 && (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        ¡Cupón aplicado exitosamente!
                      </Alert>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/checkout')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      py: 1.5
                    }}
                  >
                    Proceder al Pago
                  </Button>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ✓ Envío gratis en compras mayores a $500
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ✓ Garantía de satisfacción
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ✓ Pagos seguros
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Container>
    </PublicLayout>
  );
};

export default CarritoPage;