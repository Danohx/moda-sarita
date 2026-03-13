// src/pages/public/TiendaPage.tsx

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Search, ShoppingCart } from '@mui/icons-material';
import PublicLayout from '../../components/layout/PublicLayout';

const TiendaPage: React.FC = () => {
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState('todas');

  // Productos de ejemplo (después conectarás con tu API)
  const productos = [
    { id: 1, nombre: 'Blusa Elegante', precio: 450, categoria: 'Blusas', imagen: '' },
    { id: 2, nombre: 'Vestido Casual', precio: 680, categoria: 'Vestidos', imagen: '' },
    { id: 3, nombre: 'Pantalón de Mezclilla', precio: 550, categoria: 'Pantalones', imagen: '' },
    { id: 4, nombre: 'Collar de Moda', precio: 180, categoria: 'Accesorios', imagen: '' },
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Catálogo de Productos
        </Typography>

        {/* Filtros */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Buscar productos..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={categoria}
                  label="Categoría"
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <MenuItem value="todas">Todas</MenuItem>
                  <MenuItem value="blusas">Blusas</MenuItem>
                  <MenuItem value="vestidos">Vestidos</MenuItem>
                  <MenuItem value="pantalones">Pantalones</MenuItem>
                  <MenuItem value="accesorios">Accesorios</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Productos */}
        <Grid container spacing={3}>
          {productos.map((producto) => (
            <Grid item xs={12} sm={6} md={3} key={producto.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 250,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {producto.nombre}
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    {formatMoneda(producto.precio)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {producto.categoria}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    Agregar al Carrito
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </PublicLayout>
  );
};

export default TiendaPage;