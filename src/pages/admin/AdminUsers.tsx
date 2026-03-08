// src/pages/admin/AdminUsers.tsx

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
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Lock,
  Person,
  AdminPanelSettings,
  VerifiedUser,
  SupervisedUserCircle
} from '@mui/icons-material';
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

const AdminUsers: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [buscar, setBuscar] = useState('');

  const estadisticas = {
    totalUsuarios: 8,
    administradores: 2,
    empleados: 5,
    inactivos: 1
  };

  const usuarios = [
    { 
      id: 1, 
      nombre: 'Ana García', 
      email: 'ana@modasarita.com', 
      rol: 'Administrador', 
      activo: true,
      ultimoAcceso: '2025-02-22 14:30'
    },
    { 
      id: 2, 
      nombre: 'María López', 
      email: 'maria@modasarita.com', 
      rol: 'Empleado', 
      activo: true,
      ultimoAcceso: '2025-02-22 13:15'
    },
    { 
      id: 3, 
      nombre: 'Carlos Ruiz', 
      email: 'carlos@modasarita.com', 
      rol: 'Empleado', 
      activo: true,
      ultimoAcceso: '2025-02-21 18:45'
    },
    { 
      id: 4, 
      nombre: 'Laura Martínez', 
      email: 'laura@modasarita.com', 
      rol: 'Empleado', 
      activo: false,
      ultimoAcceso: '2025-02-15 10:20'
    },
  ];

  const roles = [
    { 
      id: 1, 
      nombre: 'Administrador', 
      usuarios: 2,
      permisos: ['Todos los permisos'],
      color: '#E91E8C'
    },
    { 
      id: 2, 
      nombre: 'Empleado', 
      usuarios: 5,
      permisos: ['Ventas', 'Inventario', 'Clientes'],
      color: '#F06292'
    },
    { 
      id: 3, 
      nombre: 'Vendedor', 
      usuarios: 1,
      permisos: ['Ventas', 'Clientes'],
      color: '#F8BBD0'
    },
  ];

  const getRolColor = (rol: string) => {
    switch(rol) {
      case 'Administrador': return { bg: '#FDE8F4', color: '#E91E8C' };
      case 'Empleado': return { bg: '#e3f2fd', color: '#1976d2' };
      default: return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Usuarios y Permisos
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
            Nuevo Usuario
          </Button>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Usuarios</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.totalUsuarios}
                    </Typography>
                  </Box>
                  <SupervisedUserCircle sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #F06292 0%, #E91E8C 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Administradores</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.administradores}
                    </Typography>
                  </Box>
                  <AdminPanelSettings sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Empleados</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.empleados}
                    </Typography>
                  </Box>
                  <VerifiedUser sx={{ fontSize: 50, opacity: 0.5 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)', color: '#E91E8C' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Inactivos</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                      {estadisticas.inactivos}
                    </Typography>
                  </Box>
                  <Person sx={{ fontSize: 50, opacity: 0.5 }} />
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
            <Tab label="Usuarios" />
            <Tab label="Roles y Permisos" />
          </Tabs>
        </Paper>

        {/* Tab 1: Usuarios */}
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <TextField
              fullWidth
              placeholder="Buscar usuarios por nombre o email..."
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
                    <TableCell><strong style={{ color: '#E91E8C' }}>Usuario</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Email</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Rol</strong></TableCell>
                    <TableCell><strong style={{ color: '#E91E8C' }}>Último Acceso</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Estado</strong></TableCell>
                    <TableCell align="center"><strong style={{ color: '#E91E8C' }}>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((usuario) => {
                    const rolStyle = getRolColor(usuario.rol);
                    return (
                      <TableRow key={usuario.id} hover sx={{ '&:hover': { bgcolor: '#FFF5FA' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: '#E91E8C', 
                                width: 40, 
                                height: 40, 
                                mr: 2,
                                fontWeight: 'bold'
                              }}
                            >
                              {usuario.nombre.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography fontWeight="bold">{usuario.nombre}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={usuario.rol}
                            size="small"
                            sx={{ 
                              bgcolor: rolStyle.bg, 
                              color: rolStyle.color,
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{usuario.ultimoAcceso}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={usuario.activo ? 'Activo' : 'Inactivo'}
                            size="small"
                            sx={{
                              bgcolor: usuario.activo ? '#e8f5e9' : '#ffebee',
                              color: usuario.activo ? '#2e7d32' : '#c62828',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" sx={{ color: '#E91E8C' }} title="Editar">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#E91E8C' }} title="Cambiar Contraseña">
                            <Lock />
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#C2185B' }} title="Eliminar">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Tab 2: Roles y Permisos */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {roles.map((rol) => (
              <Grid size={{ xs: 12, md: 4 }} key={rol.id}>
                <Card 
                  sx={{ 
                    border: `2px solid ${rol.color}`,
                    '&:hover': { 
                      boxShadow: `0 4px 12px ${rol.color}40`,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: rol.color, mr: 2 }}>
                        <AdminPanelSettings />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: rol.color }}>
                          {rol.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rol.usuarios} usuarios
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Permisos:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {rol.permisos.map((permiso, idx) => (
                        <Chip 
                          key={idx}
                          label={permiso} 
                          size="small"
                          sx={{ bgcolor: `${rol.color}20`, color: rol.color }}
                        />
                      ))}
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderColor: rol.color,
                        color: rol.color,
                        '&:hover': { 
                          borderColor: rol.color, 
                          bgcolor: `${rol.color}10` 
                        },
                        borderRadius: '20px',
                        textTransform: 'none'
                      }}
                    >
                      Editar Permisos
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Box>
  );
};

export default AdminUsers;