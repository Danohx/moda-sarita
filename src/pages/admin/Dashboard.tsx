// src/pages/admin/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  IconButton,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  People,
  AttachMoney,
  Refresh,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  Inventory,
  Receipt,
  LocalShipping,
  ArrowForward
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from "../../components/layout/AdminLayout";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tiempoReal, setTiempoReal] = useState(new Date());

  // Actualizar reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoReal(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const estadisticas = {
    ventasHoy: 12580,
    ventasMes: 156700,
    productosVendidos: 342,
    clientesActivos: 89,
    pedidosPendientes: 23,
    stockBajo: 18,
    apartadosActivos: 15,
    corteCajaPendiente: true
  };

  const ventasSemanales = [
    { dia: 'Lun', ventas: 12000, meta: 15000 },
    { dia: 'Mar', ventas: 19000, meta: 15000 },
    { dia: 'Mie', ventas: 15000, meta: 15000 },
    { dia: 'Jue', ventas: 22000, meta: 15000 },
    { dia: 'Vie', ventas: 28000, meta: 15000 },
    { dia: 'Sab', ventas: 35000, meta: 15000 },
    { dia: 'Dom', ventas: 25000, meta: 15000 },
  ];

  const ventasHoraHora = [
    { hora: '09:00', ventas: 850 },
    { hora: '10:00', ventas: 1200 },
    { hora: '11:00', ventas: 1500 },
    { hora: '12:00', ventas: 2100 },
    { hora: '13:00', ventas: 1800 },
    { hora: '14:00', ventas: 1600 },
    { hora: '15:00', ventas: 1900 },
    { hora: '16:00', ventas: 2300 },
  ];

  const productosMasVendidos = [
    { nombre: 'Blusa Elegante', ventas: 45, stock: 12, color: '#E91E8C' },
    { nombre: 'Vestido Casual', ventas: 38, stock: 8, color: '#F06292' },
    { nombre: 'Pantalón Mezclilla', ventas: 32, stock: 15, color: '#F8BBD0' },
    { nombre: 'Collar de Moda', ventas: 28, stock: 25, color: '#FCE4EC' },
  ];

  const ventasPorCategoria = [
    { name: 'Blusas', value: 35, color: '#E91E8C' },
    { name: 'Vestidos', value: 28, color: '#F06292' },
    { name: 'Pantalones', value: 22, color: '#F8BBD0' },
    { name: 'Accesorios', value: 15, color: '#FCE4EC' },
  ];

  const ultimasVentas = [
    { id: 'V-001', cliente: 'María González', monto: 1450, tiempo: 'Hace 5 min' },
    { id: 'V-002', cliente: 'Ana Martínez', monto: 2340, tiempo: 'Hace 12 min' },
    { id: 'V-003', cliente: 'Laura Rodríguez', monto: 890, tiempo: 'Hace 18 min' },
    { id: 'V-004', cliente: 'Carmen López', monto: 1680, tiempo: 'Hace 25 min' },
  ];

  const alertas = [
    { tipo: 'warning', mensaje: 'Corte de caja pendiente', icono: <Receipt />, accion: '/admin/corte-caja' },
    { tipo: 'info', mensaje: '23 pedidos por procesar', icono: <LocalShipping />, accion: '/admin/orders' },
    { tipo: 'error', mensaje: '18 productos con stock bajo', icono: <Warning />, accion: '/admin/inventory' },
    { tipo: 'success', mensaje: '15 apartados activos', icono: <Schedule />, accion: '/admin/settings' },
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const calcularCrecimiento = (actual: number, anterior: number) => {
    const crecimiento = ((actual - anterior) / anterior) * 100;
    return crecimiento.toFixed(1);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Datos actualizados');
    }, 1500);
  };

  const StatCard = ({ title, value, icon, gradient, trend, trendValue }: any) => (
    <Card sx={{ 
      height: '100%', 
      background: gradient,
      color: 'white',
      boxShadow: '0 4px 12px rgba(233, 30, 140, 0.15)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(233, 30, 140, 0.25)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ zIndex: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {trend === 'up' ? (
                  <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />
                )}
                <Typography variant="caption">
                  {trendValue}% vs mes anterior
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ opacity: 0.5 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0,
            bgcolor: 'rgba(255,255,255,0.3)',
            '& .MuiLinearProgress-bar': { bgcolor: 'white' }
          }} 
        />
      )}
    </Card>
  );

  return (
    <AdminLayout role="admin">
      <Box>
        {/* Header con hora en tiempo real */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tiempoReal.toLocaleDateString('es-MX', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} - {tiempoReal.toLocaleTimeString('es-MX')}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleRefresh}
            disabled={loading}
            sx={{ 
              color: '#E91E8C',
              animation: loading ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>

        {/* Estadísticas Principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Ventas Hoy"
              value={formatMoneda(estadisticas.ventasHoy)}
              icon={<AttachMoney sx={{ fontSize: 50 }} />}
              gradient="linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)"
              trend="up"
              trendValue={calcularCrecimiento(12580, 10200)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Ventas del Mes"
              value={formatMoneda(estadisticas.ventasMes)}
              icon={<TrendingUp sx={{ fontSize: 50 }} />}
              gradient="linear-gradient(135deg, #F06292 0%, #E91E8C 100%)"
              trend="up"
              trendValue={calcularCrecimiento(156700, 142000)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Productos Vendidos"
              value={estadisticas.productosVendidos}
              icon={<ShoppingCart sx={{ fontSize: 50 }} />}
              gradient="linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)"
              trend="up"
              trendValue="8.5"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Clientes Activos"
              value={estadisticas.clientesActivos}
              icon={<People sx={{ fontSize: 50 }} />}
              gradient="linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)"
              trend="up"
              trendValue="12.3"
            />
          </Grid>
        </Grid>

        {/* Alertas y Acciones Rápidas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ bgcolor: '#FFF', border: '1px solid #FDE8F4', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold', mb: 3 }}>
                  ⚠️ Alertas del Sistema
                </Typography>
                <Grid container spacing={2}>
                  {alertas.map((alerta, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Card 
                        sx={{ 
                          bgcolor: alerta.tipo === 'error' ? '#FFEBEE' : 
                                  alerta.tipo === 'warning' ? '#FFF3E0' :
                                  alerta.tipo === 'success' ? '#E8F5E9' : '#E3F2FD',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                        onClick={() => navigate(alerta.accion)}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: alerta.tipo === 'error' ? '#F44336' : 
                                      alerta.tipo === 'warning' ? '#FF9800' :
                                      alerta.tipo === 'success' ? '#4CAF50' : '#2196F3',
                              mr: 2
                            }}
                          >
                            {alerta.icono}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {alerta.mensaje}
                            </Typography>
                          </Box>
                          <ArrowForward sx={{ color: '#666' }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#FDE8F4', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold', mb: 3 }}>
                  🎯 Acciones Rápidas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => navigate('/admin/pos')}
                    sx={{
                      bgcolor: '#E91E8C',
                      '&:hover': { bgcolor: '#C2185B' },
                      borderRadius: '12px',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      py: 1.5
                    }}
                  >
                    Nueva Venta (POS)
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Schedule />}
                    onClick={() => navigate('/admin/pos')}
                    sx={{
                      borderColor: '#E91E8C',
                      color: '#E91E8C',
                      '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                      borderRadius: '12px',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      py: 1.5
                    }}
                  >
                    Registrar Apartado
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Receipt />}
                    onClick={() => navigate('/admin/corte-caja')}
                    sx={{
                      borderColor: '#E91E8C',
                      color: '#E91E8C',
                      '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                      borderRadius: '12px',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      py: 1.5
                    }}
                  >
                    Corte de Caja
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Inventory />}
                    onClick={() => navigate('/admin/inventory')}
                    sx={{
                      borderColor: '#E91E8C',
                      color: '#E91E8C',
                      '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                      borderRadius: '12px',
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      py: 1.5
                    }}
                  >
                    Ver Inventario
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficas de Ventas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
                Ventas de la Semana
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasSemanales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                  <Legend />
                  <Bar dataKey="ventas" fill="#E91E8C" radius={[8, 8, 0, 0]} name="Ventas" />
                  <Bar dataKey="meta" fill="#F8BBD0" radius={[8, 8, 0, 0]} name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
                Ventas por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ventasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ventasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Ventas Hora por Hora */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
                Ventas de Hoy (Hora por Hora)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={ventasHoraHora}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E91E8C" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#E91E8C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hora" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="#E91E8C" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVentas)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
                Productos Top
              </Typography>
              <List>
                {productosMasVendidos.map((producto, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: producto.color }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="bold">
                            {producto.nombre}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={`${producto.ventas} vendidos`} 
                              size="small"
                              sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', fontSize: '0.7rem' }}
                            />
                            <Chip 
                              label={`Stock: ${producto.stock}`} 
                              size="small"
                              sx={{ 
                                bgcolor: producto.stock < 10 ? '#FFEBEE' : '#E8F5E9',
                                color: producto.stock < 10 ? '#C62828' : '#2E7D32',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < productosMasVendidos.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Últimas Ventas */}
        <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
              Últimas Ventas
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/admin/reports')}
              sx={{ color: '#E91E8C', textTransform: 'none' }}
            >
              Ver todas →
            </Button>
          </Box>
          <List>
            {ultimasVentas.map((venta, index) => (
              <React.Fragment key={venta.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#FDE8F4', color: '#E91E8C' }}>
                      <Receipt />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {venta.id} - {venta.cliente}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" sx={{ color: '#E91E8C' }}>
                          {formatMoneda(venta.monto)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {venta.tiempo}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < ultimasVentas.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default Dashboard;