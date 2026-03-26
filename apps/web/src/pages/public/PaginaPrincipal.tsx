// src/pages/public/HomePage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { ShoppingBag, LocalOffer, Verified } from '@mui/icons-material';
import PublicLayout from '@shared/components/layout/PublicLayout';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenidos a Moda Sarita
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4 }}>
            Encuentra las últimas tendencias en moda femenina
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/tienda')}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Ver Catálogo
          </Button>
        </Container>
      </Box>

      {/* Características */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <ShoppingBag sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Amplio Catálogo
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Encuentra blusas, vestidos, pantalones y accesorios para cada ocasión
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <LocalOffer sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Promociones
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Descuentos especiales y ofertas exclusivas todo el año
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
              <Verified sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Calidad Garantizada
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Productos de la mejor calidad al mejor precio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Categorías Destacadas */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6 }}>
            Categorías Destacadas
          </Typography>
          <Grid container spacing={3}>
            {['Blusas', 'Vestidos', 'Pantalones', 'Accesorios'].map((categoria) => (
              <Grid item xs={12} sm={6} md={3} key={categoria}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                  onClick={() => navigate('/tienda')}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {categoria}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default HomePage;
