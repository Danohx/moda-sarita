import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Add,
  Search,
  Edit,
  Delete,
  Lock,
  Person,
  AdminPanelSettings,
  VerifiedUser,
  SupervisedUserCircle,
  Warning,
} from "@mui/icons-material";

type UserRole = string;

type UserItem = {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  ultimoAcceso: string | null;
};

type RoleItem = {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: string[];
  usuarios: number;
};

type UsersData = {
  usuarios: UserItem[];
  roles: RoleItem[];
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Placeholder API
 * Puedes reemplazarlo después por:
 * - GET /auth/me
 * - GET /security/roles
 * - GET /security/permisos
 * - GET /security/roles/:rolId/permisos
 * - GET /admin/users (cuando exista)
 */
async function fetchUsersData(signal?: AbortSignal): Promise<UsersData> {
  void signal;
  return {
    usuarios: [],
    roles: [],
  };
}

const AdminUsers: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [buscar, setBuscar] = useState("");
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);

  const load = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      const data = await fetchUsersData(controller.signal);
      setUsuarios(data.usuarios ?? []);
      setRoles(data.roles ?? []);
    } catch {
      setUsuarios([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const usuariosFiltrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return usuarios;

    return usuarios.filter(
      (usuario) =>
        usuario.nombre.toLowerCase().includes(q) ||
        usuario.email.toLowerCase().includes(q) ||
        usuario.rol.toLowerCase().includes(q)
    );
  }, [buscar, usuarios]);

  const estadisticas = useMemo(() => {
    const administradores = usuarios.filter((u) =>
      u.rol.toLowerCase().includes("admin")
    ).length;

    const empleados = usuarios.filter(
      (u) => !u.rol.toLowerCase().includes("admin")
    ).length;

    const inactivos = usuarios.filter((u) => !u.activo).length;

    return {
      totalUsuarios: usuarios.length,
      administradores,
      empleados,
      inactivos,
    };
  }, [usuarios]);

  const getRolColor = (rol: string) => {
    const r = rol.toLowerCase();
    if (r.includes("admin")) {
      return { bg: "#FDE8F4", color: "#E91E8C" };
    }
    if (r.includes("empleado")) {
      return { bg: "#e3f2fd", color: "#1976d2" };
    }
    return { bg: "#f5f5f5", color: "#757575" };
  };

  const skeletonRows = useMemo(() => Array.from({ length: 4 }), []);
  const skeletonRoleCards = useMemo(() => Array.from({ length: 3 }), []);

  return (
    <Box>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333" }}>
          Usuarios y Permisos
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            bgcolor: "#E91E8C",
            "&:hover": { bgcolor: "#C2185B" },
            borderRadius: "25px",
            px: 3,
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Usuarios
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                    {estadisticas.totalUsuarios}
                  </Typography>
                </Box>
                <SupervisedUserCircle sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #F06292 0%, #E91E8C 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Administradores
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                    {estadisticas.administradores}
                  </Typography>
                </Box>
                <AdminPanelSettings sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #F8BBD0 0%, #F06292 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Empleados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                    {estadisticas.empleados}
                  </Typography>
                </Box>
                <VerifiedUser sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: "linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)", color: "#E91E8C" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Inactivos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
                    {estadisticas.inactivos}
                  </Typography>
                </Box>
                <Person sx={{ fontSize: 50, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: "bold" },
            "& .Mui-selected": { color: "#E91E8C" },
            "& .MuiTabs-indicator": { bgcolor: "#E91E8C" },
          }}
        >
          <Tab label="Usuarios" />
          <Tab label="Roles y Permisos" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3, mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <TextField
            fullWidth
            placeholder="Buscar usuarios por nombre, email o rol..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#E91E8C" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#E91E8C" },
                "&.Mui-focused fieldset": { borderColor: "#E91E8C" },
              },
            }}
          />
        </Paper>

        <Paper sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#FDE8F4" }}>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Usuario</strong></TableCell>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Email</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Rol</strong></TableCell>
                  <TableCell><strong style={{ color: "#E91E8C" }}>Último Acceso</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Estado</strong></TableCell>
                  <TableCell align="center"><strong style={{ color: "#E91E8C" }}>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  skeletonRows.map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell><Skeleton variant="text" width={180} /></TableCell>
                      <TableCell><Skeleton variant="text" width={220} /></TableCell>
                      <TableCell align="center"><Skeleton variant="rounded" width={90} height={24} /></TableCell>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell align="center"><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                      <TableCell align="center"><Skeleton variant="text" width={90} /></TableCell>
                    </TableRow>
                  ))
                ) : usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((usuario) => {
                    const rolStyle = getRolColor(usuario.rol);

                    return (
                      <TableRow key={usuario.id} hover sx={{ "&:hover": { bgcolor: "#FFF5FA" } }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: "#E91E8C",
                                width: 40,
                                height: 40,
                                mr: 2,
                                fontWeight: "bold",
                              }}
                            >
                              {usuario.nombre
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")}
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
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {usuario.ultimoAcceso ?? "Sin registro"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={usuario.activo ? "Activo" : "Inactivo"}
                            size="small"
                            sx={{
                              bgcolor: usuario.activo ? "#e8f5e9" : "#ffebee",
                              color: usuario.activo ? "#2e7d32" : "#c62828",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <IconButton size="small" sx={{ color: "#E91E8C" }} title="Editar">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" sx={{ color: "#E91E8C" }} title="Cambiar Contraseña">
                            <Lock />
                          </IconButton>
                          <IconButton size="small" sx={{ color: "#C2185B" }} title="Eliminar">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.2, color: "#666" }}>
                        <Warning fontSize="small" />
                        <Typography>Sin usuarios para mostrar (pendiente de API).</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {loading ? (
            skeletonRoleCards.map((_, idx) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width={160} height={40} />
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 2 }} />
                    <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1 }} />
                    <Skeleton variant="rounded" width="100%" height={40} sx={{ mt: 3 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : roles.length > 0 ? (
            roles.map((rol) => (
              <Grid size={{ xs: 12, md: 4 }} key={rol.id}>
                <Card
                  sx={{
                    border: "2px solid #E91E8C22",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(233,30,140,0.18)",
                      transform: "translateY(-4px)",
                      transition: "all 0.3s",
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "#E91E8C", mr: 2 }}>
                        <AdminPanelSettings />
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#E91E8C" }}>
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

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                      {rol.permisos.length > 0 ? (
                        rol.permisos.map((permiso, idx) => (
                          <Chip
                            key={idx}
                            label={permiso}
                            size="small"
                            sx={{ bgcolor: "#FDE8F4", color: "#E91E8C" }}
                          />
                        ))
                      ) : (
                        <Chip label="Sin permisos cargados" size="small" />
                      )}
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderColor: "#E91E8C",
                        color: "#E91E8C",
                        "&:hover": {
                          borderColor: "#E91E8C",
                          bgcolor: "#FDE8F4",
                        },
                        borderRadius: "20px",
                        textTransform: "none",
                      }}
                    >
                      Editar Permisos
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  Sin roles para mostrar (pendiente de API).
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default AdminUsers;