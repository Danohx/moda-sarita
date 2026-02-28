// src/pages/admin/POSPage.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Search,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Person,
  Payment,
  Receipt
} from '@mui/icons-material';
import { AdminLayout } from "../../components/layout/AdminLayout";

const POSPage: React.FC = () => {
  const [carrito, setCarrito] = useState<any[]>([
    { id: 1, nombre: 'Blusa Elegante', precio: 450, cantidad: 2 },
    { id: 2, nombre: 'Vestido Casual', precio: 680, cantidad: 1 },
  ]);

  const [cliente, _setCliente] = useState<any>(null);
  const [buscarProducto, setBuscarProducto] = useState('');

  const productosDisponibles = [
    { id: 1, nombre: 'Blusa Elegante', precio: 450, stock: 15 },
    { id: 2, nombre: 'Vestido Casual', precio: 680, stock: 8 },
    { id: 3, nombre: 'Pantalón Mezclilla', precio: 550, stock: 12 },
    { id: 4, nombre: 'Collar de Moda', precio: 180, stock: 25 },
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal();
  };

  const handleAgregarAlCarrito = (producto: any) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const handleCambiarCantidad = (id: number, delta: number) => {
    setCarrito(carrito.map(item => 
      item.id === id 
        ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
        : item
    ));
  };

  const handleEliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  return (
    <AdminLayout role="admin">
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>
          Punto de Venta (POS)
        </Typography>

        <Grid container spacing={3}>
          {/* Panel Izquierdo: Productos */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Buscar producto por nombre o código de barras..."
                value={buscarProducto}
                onChange={(e) => setBuscarProducto(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#E91E8C' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#E91E8C' },
                    '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                  }
                }}
              />
            </Paper>

            <Grid container spacing={2}>
              {productosDisponibles.map((producto) => (
                <Grid size={{ xs: 12, sm: 6 }} key={producto.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { 
                        transform: 'scale(1.02)',
                        boxShadow: '0 4px 12px rgba(233, 30, 140, 0.2)'
                      }
                    }}
                    onClick={() => handleAgregarAlCarrito(producto)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            bgcolor: '#FDE8F4',
                            color: '#E91E8C',
                            mr: 2
                          }}
                        >
                          <ShoppingCart />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#333' }}>
                            {producto.nombre}
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                            {formatMoneda(producto.precio)}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={`Stock: ${producto.stock}`} 
                        size="small" 
                        sx={{ bgcolor: '#FDE8F4', color: '#E91E8C' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Panel Derecho: Carrito y Resumen */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ color: '#E91E8C', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
                  Cliente
                </Typography>
              </Box>
              <Button 
                fullWidth 
                variant="outlined"
                sx={{ 
                  borderColor: '#E91E8C',
                  color: '#E91E8C',
                  '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                  textTransform: 'none',
                  borderRadius: '20px'
                }}
              >
                {cliente ? cliente.nombre : 'Seleccionar Cliente'}
              </Button>
            </Paper>

            <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
                Carrito de Compra
              </Typography>

              <List>
                {carrito.map((item) => (
                  <ListItem 
                    key={item.id}
                    sx={{ 
                      bgcolor: '#FFF5FA', 
                      borderRadius: 2, 
                      mb: 1,
                      border: '1px solid #FDE8F4'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold" sx={{ color: '#333' }}>
                          {item.nombre}
                        </Typography>
                      }
                      secondary={formatMoneda(item.precio)}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCambiarCantidad(item.id, -1)}
                        sx={{ color: '#E91E8C' }}
                      >
                        <Remove />
                      </IconButton>
                      <Typography fontWeight="bold" sx={{ minWidth: 30, textAlign: 'center' }}>
                        {item.cantidad}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCambiarCantidad(item.id, 1)}
                        sx={{ color: '#E91E8C' }}
                      >
                        <Add />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEliminarDelCarrito(item.id)}
                        sx={{ color: '#C2185B' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography fontWeight="bold">{formatMoneda(calcularSubtotal())}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#E91E8C' }}>
                    {formatMoneda(calcularTotal())}
                  </Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Payment />}
                sx={{
                  bgcolor: '#E91E8C',
                  '&:hover': { bgcolor: '#C2185B' },
                  borderRadius: '25px',
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                Procesar Pago
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Receipt />}
                sx={{
                  mt: 2,
                  borderColor: '#E91E8C',
                  color: '#E91E8C',
                  '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                  borderRadius: '25px',
                  textTransform: 'none'
                }}
              >
                Apartar
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default POSPage;