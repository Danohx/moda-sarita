// src/pages/public/ProductoDetallePage.tsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Chip,
  TextField,
  Breadcrumbs,
  Link,
  Divider,
  Rating
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
  Favorite,
  LocalShipping,
  Verified
} from '@mui/icons-material';
import Grid from '@mui/material/GridLegacy';
import PublicLayout from '@shared/components/layout/PublicLayout';

const ProductoDetallePage: React.FC = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(1);

  // Datos de ejemplo (después conectar con API)
  const producto = {
    id: 1,
    nombre: 'Blusa Elegante de Seda',
    precio: 450,
    descripcion: 'Blusa elegante ideal para ocasiones especiales. Confeccionada en seda de alta calidad con acabados refinados.',
    categoria: 'Blusas',
    stock: 15,
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Negro', 'Blanco', 'Rosa'],
    imagen: ''
  };

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const handleAgregarCarrito = () => {
    // Aquí agregarías al carrito (Context o LocalStorage)
    console.log('Agregado al carrito:', { producto, cantidad });
    navigate('/carrito');
  };

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            Inicio
          </Link>
          <Link underline="hover" color="inherit" onClick={() => navigate('/tienda')} sx={{ cursor: 'pointer' }}>
            Tienda
          </Link>
          <Typography color="text.primary">{producto.nombre}</Typography>
        </Breadcrumbs>

        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tienda')}
          sx={{ mb: 3 }}
        >
          Volver a la tienda
        </Button>

        <Grid container spacing={4}>
          {/* Imagen del producto */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="div"
                sx={{
                  height: 500,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              />
            </Card>

            {/* Miniaturas (opcional) */}
            <Grid container spacing={1} sx={{ mt: 2 }}>
              {[1, 2, 3, 4].map((img) => (
                <Grid item xs={3} key={img}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      '&:hover': {
                        border: '2px solid #667eea'
                      }
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 80,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Información del producto */}
          <Grid item xs={12} md={6}>
            <Box>
              <Chip label={producto.categoria} color="primary" sx={{ mb: 2 }} />
              
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {producto.nombre}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={4.5} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  (24 reseñas)
                </Typography>
              </Box>

              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
                {formatMoneda(producto.precio)}
              </Typography>

              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {producto.descripcion}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Stock */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Disponibilidad
                </Typography>
                <Chip
                  label={`${producto.stock} en stock`}
                  color="success"
                  size="small"
                  icon={<Verified />}
                />
              </Box>

              {/* Tallas */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Talla
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {producto.tallas.map((talla) => (
                    <Chip
                      key={talla}
                      label={talla}
                      onClick={() => console.log(talla)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Colores */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {producto.colores.map((color) => (
                    <Chip
                      key={color}
                      label={color}
                      onClick={() => console.log(color)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Cantidad */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cantidad
                </Typography>
                <TextField
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: producto.stock }}
                  sx={{ width: 100 }}
                />
              </Box>

              {/* Botones */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAgregarCarrito}
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 1.5
                  }}
                >
                  Agregar al Carrito
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Favorite />}
                  sx={{ px: 3 }}
                >
                  Me Gusta
                </Button>
              </Box>

              {/* Beneficios */}
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalShipping sx={{ mr: 1, color: '#667eea' }} />
                  <Typography variant="body2">
                    Envío gratis en compras mayores a $500
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Verified sx={{ mr: 1, color: '#667eea' }} />
                  <Typography variant="body2">
                    Garantía de satisfacción
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Productos relacionados */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Productos Relacionados
          </Typography>
          {/* Aquí irían más productos */}
        </Box>
      </Container>
    </PublicLayout>
  );
};

export default ProductoDetallePage;