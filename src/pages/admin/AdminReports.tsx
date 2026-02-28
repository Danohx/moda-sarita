// src/pages/admin/AdminReports.tsx

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Description,
  BarChart as BarChartIcon,
  Print,
  Email,
  PictureAsPdf
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AdminLayout } from "../../components/layout/AdminLayout";

interface ReporteData {
  ventas: any[];
  productos: any[];
  clientes: any[];
  estadisticas: any;
}

const AdminReports: React.FC = () => {
  const [tipoReporte, setTipoReporte] = useState('ventas');
  const [periodo, setPeriodo] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState('2025-02-01');
  const [fechaFin, setFechaFin] = useState('2025-02-28');
  const [loading, setLoading] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [datosReporte, setDatosReporte] = useState<ReporteData | null>(null);

  // Datos de ejemplo más completos
  const ventasMensuales = [
    { mes: 'Ago', ventas: 45000, costos: 28000, ganancia: 17000 },
    { mes: 'Sep', ventas: 52000, costos: 31000, ganancia: 21000 },
    { mes: 'Oct', ventas: 48000, costos: 29000, ganancia: 19000 },
    { mes: 'Nov', ventas: 61000, costos: 35000, ganancia: 26000 },
    { mes: 'Dic', ventas: 78000, costos: 42000, ganancia: 36000 },
    { mes: 'Ene', ventas: 55000, costos: 33000, ganancia: 22000 },
    { mes: 'Feb', ventas: 67000, costos: 38000, ganancia: 29000 },
  ];

  const ventasSemanales = [
    { semana: 'Sem 1', lunes: 1200, martes: 1500, miercoles: 1800, jueves: 2100, viernes: 2800, sabado: 3500, domingo: 2200 },
    { semana: 'Sem 2', lunes: 1400, martes: 1700, miercoles: 2000, jueves: 2300, viernes: 3000, sabado: 3800, domingo: 2400 },
    { semana: 'Sem 3', lunes: 1300, martes: 1600, miercoles: 1900, jueves: 2200, viernes: 2900, sabado: 3600, domingo: 2300 },
    { semana: 'Sem 4', lunes: 1500, martes: 1800, miercoles: 2100, jueves: 2400, viernes: 3100, sabado: 3900, domingo: 2500 },
  ];

  const ventasPorCategoria = [
    { name: 'Blusas', value: 35, ventas: 23450, color: '#E91E8C' },
    { name: 'Vestidos', value: 28, ventas: 18760, color: '#F06292' },
    { name: 'Pantalones', value: 22, ventas: 14740, color: '#F8BBD0' },
    { name: 'Accesorios', value: 15, ventas: 10050, color: '#FCE4EC' },
  ];

  const productosMasVendidos = [
    { id: 1, nombre: 'Blusa Elegante Rosa', cantidad: 45, total: 20250, categoria: 'Blusas' },
    { id: 2, nombre: 'Vestido Negro Casual', cantidad: 38, total: 25840, categoria: 'Vestidos' },
    { id: 3, nombre: 'Pantalón Mezclilla Azul', cantidad: 32, total: 17600, categoria: 'Pantalones' },
    { id: 4, nombre: 'Collar Dorado', cantidad: 28, total: 5040, categoria: 'Accesorios' },
    { id: 5, nombre: 'Blusa Blanca Básica', cantidad: 25, total: 8750, categoria: 'Blusas' },
  ];

  const clientesTop = [
    { id: 1, nombre: 'María González', compras: 12, total: 15680, ultimaCompra: '2025-02-20' },
    { id: 2, nombre: 'Ana Martínez', compras: 10, total: 13450, ultimaCompra: '2025-02-19' },
    { id: 3, nombre: 'Laura Rodríguez', compras: 8, total: 11230, ultimaCompra: '2025-02-18' },
    { id: 4, nombre: 'Carmen López', compras: 7, total: 9870, ultimaCompra: '2025-02-17' },
    { id: 5, nombre: 'Sofia Torres', compras: 6, total: 8560, ultimaCompra: '2025-02-16' },
  ];

  const ventasPorMetodo = [
    { metodo: 'Efectivo', value: 45, monto: 30150, color: '#E91E8C' },
    { metodo: 'Tarjeta', value: 35, monto: 23450, color: '#F06292' },
    { metodo: 'Transferencia', value: 20, monto: 13400, color: '#F8BBD0' },
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const reportesDisponibles = [
    { id: 'ventas', nombre: 'Reporte de Ventas', icon: <TrendingUp />, descripcion: 'Análisis detallado de ventas' },
    { id: 'inventario', nombre: 'Reporte de Inventario', icon: <Assessment />, descripcion: 'Estado del inventario' },
    { id: 'clientes', nombre: 'Reporte de Clientes', icon: <Description />, descripcion: 'Análisis de clientes' },
    { id: 'financiero', nombre: 'Reporte Financiero', icon: <BarChartIcon />, descripcion: 'Estado financiero' },
  ];

  const handleGenerarPDF = async () => {
    setGenerandoPDF(true);
    // Simular generación de PDF
    setTimeout(() => {
      console.log('PDF generado:', {
        tipo: tipoReporte,
        periodo,
        fechaInicio,
        fechaFin
      });
      alert('PDF generado exitosamente');
      setGenerandoPDF(false);
    }, 2000);
  };

  const handleEnviarEmail = () => {
    console.log('Enviando reporte por email...');
    alert('Reporte enviado por email');
  };

  const handleImprimir = () => {
    window.print();
  };

  const calcularTotales = () => {
    const ventasTotal = ventasMensuales.reduce((sum, item) => sum + item.ventas, 0);
    const costosTotal = ventasMensuales.reduce((sum, item) => sum + item.costos, 0);
    const gananciaTotal = ventasTotal - costosTotal;
    const margen = ((gananciaTotal / ventasTotal) * 100).toFixed(1);
    
    return { ventasTotal, costosTotal, gananciaTotal, margen };
  };

  const totales = calcularTotales();

  const renderReporteVentas = () => (
    <>
      {/* Gráfica de Ventas Mensuales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
              Ventas vs Costos - Últimos 7 Meses
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#E91E8C" 
                  strokeWidth={3}
                  name="Ventas"
                  dot={{ fill: '#E91E8C', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="costos" 
                  stroke="#F8BBD0" 
                  strokeWidth={3}
                  name="Costos"
                  dot={{ fill: '#F8BBD0', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ganancia" 
                  stroke="#4CAF50" 
                  strokeWidth={3}
                  name="Ganancia"
                  dot={{ fill: '#4CAF50', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficas de Categorías y Métodos de Pago */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
              Ventas por Categoría
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ventasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ventasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [
                  `${value}% (${formatMoneda(props.payload.ventas)})`,
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
              Ventas por Método de Pago
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorMetodo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="metodo" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value) => formatMoneda(Number(value))} />
                <Bar dataKey="monto" fill="#E91E8C" radius={[8, 8, 0, 0]}>
                  {ventasPorMetodo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Productos Más Vendidos */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
          Top 5 Productos Más Vendidos
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FDE8F4' }}>
                <TableCell><strong style={{ color: '#E91E8C' }}>Producto</strong></TableCell>
                <TableCell><strong style={{ color: '#E91E8C' }}>Categoría</strong></TableCell>
                <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Cantidad</strong></TableCell>
                <TableCell align="right"><strong style={{ color: '#E91E8C' }}>Total Ventas</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productosMasVendidos.map((producto) => (
                <TableRow key={producto.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>
                    <Chip 
                      label={producto.categoria} 
                      size="small"
                      sx={{ bgcolor: '#FDE8F4', color: '#E91E8C' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold">{producto.cantidad}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" sx={{ color: '#E91E8C' }}>
                      {formatMoneda(producto.total)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );

  const renderReporteClientes = () => (
    <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 2 }}>
        Top 5 Mejores Clientes
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#FDE8F4' }}>
              <TableCell><strong style={{ color: '#E91E8C' }}>Cliente</strong></TableCell>
              <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Compras</strong></TableCell>
              <TableCell align="right"><strong style={{ color: '#E91E8C' }}>Total Gastado</strong></TableCell>
              <TableCell><strong style={{ color: '#E91E8C' }}>Última Compra</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesTop.map((cliente) => (
              <TableRow key={cliente.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
                <TableCell>
                  <Typography fontWeight="bold">{cliente.nombre}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={cliente.compras} 
                    size="small"
                    sx={{ bgcolor: '#FDE8F4', color: '#E91E8C', fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold" sx={{ color: '#E91E8C' }}>
                    {formatMoneda(cliente.total)}
                  </Typography>
                </TableCell>
                <TableCell>{cliente.ultimaCompra}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  const renderReporteInventario = () => (
    <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 3 }}>
        Estado de Inventario por Categoría
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={ventasPorCategoria}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Porcentaje de Stock" fill="#E91E8C" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Este reporte muestra la distribución actual del inventario por categoría. 
          Para un análisis más detallado, consulte el módulo de Inventario.
        </Typography>
      </Alert>
    </Paper>
  );

  const renderReporteFinanciero = () => (
    <>
      <Paper sx={{ p: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold', mb: 3 }}>
          Estado Financiero Mensual
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={ventasMensuales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip formatter={(value) => formatMoneda(Number(value))} />
            <Legend />
            <Bar dataKey="ventas" fill="#E91E8C" name="Ingresos" radius={[8, 8, 0, 0]} />
            <Bar dataKey="costos" fill="#F8BBD0" name="Costos" radius={[8, 8, 0, 0]} />
            <Bar dataKey="ganancia" fill="#4CAF50" name="Ganancia" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#FDE8F4' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                Flujo de Efectivo
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Ingresos Totales:</Typography>
                  <Typography fontWeight="bold" sx={{ color: '#4CAF50' }}>
                    {formatMoneda(totales.ventasTotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Costos Totales:</Typography>
                  <Typography fontWeight="bold" sx={{ color: '#f44336' }}>
                    {formatMoneda(totales.costosTotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '2px solid #E91E8C' }}>
                  <Typography variant="h6" fontWeight="bold">Ganancia Neta:</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#E91E8C' }}>
                    {formatMoneda(totales.gananciaTotal)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#FDE8F4' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                Indicadores Clave
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Margen de Ganancia:</Typography>
                  <Typography fontWeight="bold" sx={{ color: '#4CAF50' }}>
                    {totales.margen}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Ticket Promedio:</Typography>
                  <Typography fontWeight="bold">
                    {formatMoneda(totales.ventasTotal / 156)} {/* 156 es el ejemplo de transacciones */}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>ROI:</Typography>
                  <Typography fontWeight="bold" sx={{ color: '#4CAF50' }}>
                    {((totales.gananciaTotal / totales.costosTotal) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  const renderContenidoReporte = () => {
    switch(tipoReporte) {
      case 'ventas':
        return renderReporteVentas();
      case 'clientes':
        return renderReporteClientes();
      case 'inventario':
        return renderReporteInventario();
      case 'financiero':
        return renderReporteFinanciero();
      default:
        return renderReporteVentas();
    }
  };

  return (
    <AdminLayout role="admin">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Reportes y Análisis
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={handleEnviarEmail}
              sx={{ 
                borderColor: '#E91E8C',
                color: '#E91E8C',
                '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Enviar Email
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handleImprimir}
              sx={{ 
                borderColor: '#E91E8C',
                color: '#E91E8C',
                '&:hover': { borderColor: '#C2185B', bgcolor: '#FFF5FA' },
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Imprimir
            </Button>
            <Button
              variant="contained"
              startIcon={generandoPDF ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
              onClick={handleGenerarPDF}
              disabled={generandoPDF}
              sx={{ 
                bgcolor: '#E91E8C',
                '&:hover': { bgcolor: '#C2185B' },
                borderRadius: '25px',
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              {generandoPDF ? 'Generando...' : 'Exportar PDF'}
            </Button>
          </Box>
        </Box>

        {/* Tipos de Reportes */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {reportesDisponibles.map((reporte) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={reporte.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: tipoReporte === reporte.id ? '#FDE8F4' : 'white',
                  border: tipoReporte === reporte.id ? '2px solid #E91E8C' : '1px solid #f0f0f0',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 12px rgba(233, 30, 140, 0.2)'
                  }
                }}
                onClick={() => setTipoReporte(reporte.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      bgcolor: tipoReporte === reporte.id ? '#E91E8C' : '#f5f5f5', 
                      color: tipoReporte === reporte.id ? 'white' : '#666', 
                      p: 1.5, 
                      borderRadius: 2,
                      mr: 2,
                      transition: 'all 0.2s'
                    }}>
                      {reporte.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight="bold" sx={{ color: '#333' }}>
                        {reporte.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reporte.descripcion}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold', mb: 2 }}>
            Filtros de Reporte
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md:4 }}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodo}
                  label="Período"
                  onChange={(e) => setPeriodo(e.target.value)}
                  sx={{
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E91E8C' }
                  }}
                >
                  <MenuItem value="semana">Esta Semana</MenuItem>
                  <MenuItem value="mes">Este Mes</MenuItem>
                  <MenuItem value="trimestre">Este Trimestre</MenuItem>
                  <MenuItem value="ano">Este Año</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md:4 }}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={periodo !== 'personalizado'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md:4 }}>
              <TextField
                fullWidth
                label="Fecha Fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={periodo !== 'personalizado'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': { borderColor: '#E91E8C' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#E91E8C' }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen Estadístico */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#FDE8F4', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#E91E8C', fontWeight: 'bold', mb: 3 }}>
            Resumen del Período Seleccionado
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md:3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Ventas Totales</Typography>
                <Typography variant="h5" sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                  {formatMoneda(totales.ventasTotal)}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md:3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Ganancia Neta</Typography>
                <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  {formatMoneda(totales.gananciaTotal)}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md:3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Margen de Ganancia</Typography>
                <Typography variant="h5" sx={{ color: '#E91E8C', fontWeight: 'bold' }}>
                  {totales.margen}%
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md:3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Crecimiento</Typography>
                <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  +12.8%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Contenido del Reporte */}
        {renderContenidoReporte()}
      </Box>
    </AdminLayout>
  );
};

export default AdminReports;