// src/pages/admin/InventarioPage.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Search,
  Warning,
  TrendingDown,
  TrendingUp,
  Inventory2,
  Error,
  CheckCircle
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AdminLayout } from "../../components/layout/AdminLayout";

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

const InventarioPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [buscar, setBuscar] = useState('');

  const estadisticas = {
    totalProductos: 1243,
    stockBajo: 18,
    agotados: 5,
    valorInventario: 456780
  };

  const productosStockBajo = [
    { id: 1, nombre: 'Blusa Rosa', stock: 3, minimo: 10, categoria: 'Blusas' },
    { id: 2, nombre: 'Vestido Negro', stock: 2, minimo: 8, categoria: 'Vestidos' },
    { id: 3, nombre: 'Pantalón Azul', stock: 1, minimo: 5, categoria: 'Pantalones' },
  ];

  const movimientos = [
    { id: 1, fecha: '2025-02-22', tipo: 'Venta', producto: 'Blusa Elegante', cantidad: -2, usuario: 'Ana García' },
    { id: 2, fecha: '2025-02-22', tipo: 'Entrada', producto: 'Vestido Casual', cantidad: 10, usuario: 'Admin' },
    { id: 3, fecha: '2025-02-21', tipo: 'Ajuste', producto: 'Pantalón', cantidad: -1, usuario: 'Admin' },
  ];

  const inventarioPorCategoria = [
    { categoria: 'Blusas', cantidad: 345 },
    { categoria: 'Vestidos', cantidad: 289 },
    { categoria: 'Pantalones', cantidad: 234 },
    { categoria: 'Accesorios', cantidad: 375 },
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  return (
    <AdminLayout role="admin">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Gestión de Inventario
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ 
              bgcolor: '#E91E8C',
              '&:hover': { bgcolor: '#C2185B' },
              borderRadius: '25px',
              px: 3,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Ajuste Manual
          </Button>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total en Stock</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.totalProductos}
                    </Typography>
                  </Box>
                  <Inventory2 sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Stock Bajo</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.stockBajo}
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FFA07A 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Agotados</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.agotados}
                    </Typography>
                  </Box>
                  <Error sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)', color: '#E91E8C' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Valor Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {formatMoneda(estadisticas.valorInventario)}
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold' },
              '& .Mui-selected': { color: '#E91E8C' },
              '& .MuiTabs-indicator': { bgcolor: '#E91E8C' }
            }}
          >
            <Tab label="Alertas de Stock" />
            <Tab label="Movimientos" />
            <Tab label="Por Categoría" />
          </Tabs>
        </Paper>

        {/* Tab 1: Alertas de Stock */}
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FDE8F4' }}>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Producto</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Categoría</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Stock Actual</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Stock Mínimo</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Estado</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosStockBajo.map((producto) => (
                    <TableRow key={producto.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
                      <TableCell sx={{ color: '#333' }}>{producto.nombre}</TableCell>
                      <TableCell>
                        <Chip 
                          label={producto.categoria} 
                          size="small" 
                          sx={{ bgcolor: '#FDE8F4', color: '#E91E8C' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold" color="error">
                          {producto.stock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{producto.minimo}</TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<Warning />}
                          label="Crítico"
                          size="small"
                          sx={{ bgcolor: '#fff3e0', color: '#ef6c00', fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          variant="contained"
                          sx={{ 
                            bgcolor: '#E91E8C',
                            '&:hover': { bgcolor: '#C2185B' },
                            textTransform: 'none',
                            borderRadius: '20px'
                          }}
                        >
                          Reabastecer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tab 2: Movimientos */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TextField
              fullWidth
              placeholder="Buscar movimientos..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
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

          <Paper sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FDE8F4' }}>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Fecha</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Tipo</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Producto</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Cantidad</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Usuario</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientos.map((mov) => (
                    <TableRow key={mov.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
                      <TableCell>{mov.fecha}</TableCell>
                      <TableCell>
                        <Chip 
                          label={mov.tipo} 
                          size="small" 
                          sx={{ 
                            bgcolor: mov.tipo === 'Entrada' ? '#e8f5e9' : mov.tipo === 'Venta' ? '#FDE8F4' : '#fff3e0',
                            color: mov.tipo === 'Entrada' ? '#2e7d32' : mov.tipo === 'Venta' ? '#E91E8C' : '#ef6c00'
                          }}
                        />
                      </TableCell>
                      <TableCell>{mov.producto}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {mov.cantidad > 0 ? (
                            <TrendingUp sx={{ color: '#2e7d32', mr: 0.5 }} />
                          ) : (
                            <TrendingDown sx={{ color: '#c62828', mr: 0.5 }} />
                          )}
                          <Typography 
                            fontWeight="bold" 
                            color={mov.cantidad > 0 ? 'success.main' : 'error.main'}
                          >
                            {Math.abs(mov.cantidad)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{mov.usuario}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tab 3: Por Categoría */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
              Inventario por Categoría
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventarioPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoria" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#E91E8C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </TabPanel>
      </Box>
    </AdminLayout>
  );
};

export default InventarioPage;