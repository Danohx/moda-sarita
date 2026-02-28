// src/pages/admin/OrdersManager.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Avatar
} from '@mui/material';
import {
  ShoppingBag,
  LocalShipping,
  Schedule,
  Visibility,
  Edit,
  Cancel,
  AttachMoney,
  Person
} from '@mui/icons-material';
import { AdminLayout } from '../../components/layout/AdminLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface Order {
  id: number;
  orderId: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  time: string;
}

interface Apartado {
  id: number;
  customer: string;
  total: number;
  paid: number;
  remaining: number;
  deadline: string;
  progress: number;
}

const OrdersManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const orders: Order[] = [
    {
      id: 1,
      orderId: '#2021',
      customer: 'Juan Pérez',
      items: 3,
      total: 1250,
      status: 'Por Enviar',
      time: 'Hace 2 horas'
    },
    {
      id: 2,
      orderId: '#2022',
      customer: 'María González',
      items: 5,
      total: 2340,
      status: 'En Proceso',
      time: 'Hace 5 horas'
    },
    {
      id: 3,
      orderId: '#2023',
      customer: 'Carlos Rodríguez',
      items: 2,
      total: 890,
      status: 'Completado',
      time: 'Hace 1 día'
    }
  ];

  const apartados: Apartado[] = [
    {
      id: 1,
      customer: 'María González',
      total: 2000,
      paid: 500,
      remaining: 1500,
      deadline: '25 Nov',
      progress: 25
    },
    {
      id: 2,
      customer: 'Ana Martínez',
      total: 3500,
      paid: 2100,
      remaining: 1400,
      deadline: '30 Nov',
      progress: 60
    },
    {
      id: 3,
      customer: 'Laura Torres',
      total: 1800,
      paid: 900,
      remaining: 900,
      deadline: '20 Nov',
      progress: 50
    }
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Por Enviar':
        return { bg: '#FFF3E0', color: '#EF6C00' };
      case 'En Proceso':
        return { bg: '#E3F2FD', color: '#1976D2' };
      case 'Completado':
        return { bg: '#E8F5E9', color: '#2E7D32' };
      default:
        return { bg: '#F5F5F5', color: '#757575' };
    }
  };

  return (
    <AdminLayout role="admin">
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>
          Gestión de Pedidos
        </Typography>

        {/* Tabs */}
        <Paper sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold' },
              '& .Mui-selected': { color: '#E91E8C' },
              '& .MuiTabs-indicator': { bgcolor: '#E91E8C' }
            }}
          >
            <Tab icon={<ShoppingBag />} iconPosition="start" label="Pedidos Web" />
            <Tab icon={<Schedule />} iconPosition="start" label="Apartados Físicos" />
          </Tabs>
        </Paper>

        {/* TAB 1: PEDIDOS WEB */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              return (
                <Grid size={{ xs: 12 }} key={order.id}>
                  <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold', color: '#E91E8C', mr: 2 }}
                            >
                              Orden {order.orderId}
                            </Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Avatar
                              sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', width: 24, height: 24, mr: 1 }}
                            >
                              <Person sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="body2">
                              Cliente: {order.customer} • {order.items} Artículos
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            {order.time}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#E91E8C' }}>
                              {formatMoneda(order.total)}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              sx={{
                                mt: 1,
                                borderColor: '#E91E8C',
                                color: '#E91E8C',
                                '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                                borderRadius: '20px',
                                textTransform: 'none'
                              }}
                            >
                              Ver Detalles
                            </Button>
                          </Box>

                          {order.status !== 'Completado' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <IconButton size="small" sx={{ color: '#E91E8C' }}>
                                <Edit />
                              </IconButton>
                              <IconButton size="small" sx={{ color: '#1976D2' }}>
                                <LocalShipping />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        {/* TAB 2: APARTADOS FÍSICOS */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {apartados.map((apartado) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={apartado.id}>
                <Card
                  sx={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(233, 30, 140, 0.2)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s'
                    }
                  }}
                >
                  <CardContent>
                    {/* Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#E91E8C', mr: 1 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {apartado.customer}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: APT-00{apartado.id}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`Vence: ${apartado.deadline}`}
                        size="small"
                        sx={{
                          bgcolor: '#FFF3E0',
                          color: '#EF6C00',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    {/* Estadísticas */}
                    <Box
                      sx={{
                        bgcolor: '#FDE8F4',
                        borderRadius: 2,
                        p: 2,
                        mb: 2
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Total
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatMoneda(apartado.total)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Abonado
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                            {formatMoneda(apartado.paid)}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4}}>
                          <Typography variant="caption" color="text.secondary">
                            Resta
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: '#F44336' }}>
                            {formatMoneda(apartado.remaining)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Progreso */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Progreso de pago
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: '#E91E8C' }}>
                          {apartado.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={apartado.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#E91E8C',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    {/* Acciones */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AttachMoney />}
                        sx={{
                          bgcolor: '#E91E8C',
                          '&:hover': { bgcolor: '#C2185B' },
                          borderRadius: '20px',
                          textTransform: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Abonar
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Cancel />}
                        sx={{
                          borderColor: '#F44336',
                          color: '#F44336',
                          '&:hover': {
                            borderColor: '#D32F2F',
                            bgcolor: '#FFEBEE'
                          },
                          borderRadius: '20px',
                          textTransform: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Box>
    </AdminLayout>
  );
};

export default OrdersManager;