// src/components/layout/PublicLayout.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Badge
} from '@mui/material';
import {
  ShoppingCart,
  Store,
  Login,
  Home
} from '@mui/icons-material';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Store sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Moda Sarita
          </Typography>

          <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/')}>
            Inicio
          </Button>
          
          <Button color="inherit" startIcon={<Store />} onClick={() => navigate('/tienda')}>
            Tienda
          </Button>

          <IconButton color="inherit" onClick={() => navigate('/carrito')}>
            <Badge badgeContent={0} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          <Button color="inherit" startIcon={<Login />} onClick={() => navigate('/login')}>
            Iniciar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* Contenido */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5' }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: '#333',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2">
            © 2025 Moda Sarita. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;