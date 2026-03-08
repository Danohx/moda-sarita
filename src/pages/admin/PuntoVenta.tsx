import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Search,
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Person,
  Payment,
  Receipt,
  Warning,
} from "@mui/icons-material";
import styles from "../../styles/PuntoVenta.module.css";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  sku?: string;
  barcode?: string;
};

type CarritoItem = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock?: number;
};

type Cliente = {
  id: number;
  nombre: string;
};

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);
}

/**
 * Placeholder de API (aún no implementas backend).
 * Luego lo cambias por fetch/axios:
 * - GET /api/admin/productos?search=...
 */
async function fetchProductos(_params: { q: string }, signal?: AbortSignal): Promise<Producto[]> {
  void signal;
  return []; // ✅ vacío
}

const PuntoVenta: React.FC = () => {
  const [loadingProductos, setLoadingProductos] = useState(true);

  const [carrito, setCarrito] = useState<CarritoItem[]>([]); // ✅ vacío
  const [cliente, setCliente] = useState<Cliente | null>(null); // ✅ vacío
  const [buscarProducto, setBuscarProducto] = useState("");

  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]); // ✅ vacío

  const loadProductos = useCallback(async (q: string) => {
    const controller = new AbortController();
    try {
      setLoadingProductos(true);
      const resp = await fetchProductos({ q }, controller.signal);
      setProductosDisponibles(resp);
    } catch {
      setProductosDisponibles([]);
    } finally {
      setLoadingProductos(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void loadProductos("");
  }, [loadProductos]);

  const productosFiltrados = useMemo(() => {
    const q = buscarProducto.trim().toLowerCase();
    if (!q) return productosDisponibles;
    return productosDisponibles.filter((p) => {
      const inNombre = p.nombre.toLowerCase().includes(q);
      const inSku = (p.sku ?? "").toLowerCase().includes(q);
      const inBarcode = (p.barcode ?? "").toLowerCase().includes(q);
      return inNombre || inSku || inBarcode;
    });
  }, [buscarProducto, productosDisponibles]);

  const subtotal = useMemo(() => {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }, [carrito]);

  const total = subtotal;

  const handleAgregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prev,
        { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, stock: producto.stock },
      ];
    });
  };

  const handleCambiarCantidad = (id: number, delta: number) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: next };
      })
    );
  };

  const handleEliminarDelCarrito = (id: number) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSeleccionarCliente = () => {
    // Placeholder: aquí abrirías modal/buscador y harías setCliente(...)
    setCliente(null);
  };

  const handleProcesar = () => {
    // Placeholder: aquí luego haces POST /api/admin/pos (venta) o navegas a confirmación
  };

  const handleApartar = () => {
    // Placeholder: aquí luego haces POST /api/admin/apartados
  };

  const skeletonProducts = useMemo(() => Array.from({ length: 4 }), []);

  return (
    <Box className={styles.root}>
      <Typography variant="h4" className={styles.title}>
        Punto de Venta (POS)
      </Typography>

      <Grid container spacing={3}>
        {/* Panel Izquierdo: Productos */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper className={styles.searchPaper}>
            <TextField
              fullWidth
              placeholder="Buscar producto por nombre, SKU o código de barras..."
              value={buscarProducto}
              onChange={(e) => setBuscarProducto(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className={styles.searchIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.searchInput}
            />
          </Paper>

          <Grid container spacing={2}>
            {loadingProductos ? (
              skeletonProducts.map((_, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Card className={styles.productCard}>
                    <CardContent>
                      <Box className={styles.productHeader}>
                        <Skeleton variant="circular" width={60} height={60} />
                        <Box className={styles.productMeta}>
                          <Skeleton width="75%" />
                          <Skeleton width="45%" />
                        </Box>
                      </Box>
                      <Skeleton width="40%" height={28} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <Grid size={{ xs: 12, sm: 6 }} key={producto.id}>
                  <Card
                    className={styles.productCard}
                    onClick={() => handleAgregarAlCarrito(producto)}
                    role="button"
                  >
                    <CardContent>
                      <Box className={styles.productHeader}>
                        <Avatar className={styles.productAvatar}>
                          <ShoppingCart />
                        </Avatar>

                        <Box className={styles.productMeta}>
                          <Typography variant="subtitle1" className={styles.productName}>
                            {producto.nombre}
                          </Typography>

                          <Typography variant="h6" className={styles.productPrice}>
                            {formatMoneda(producto.precio)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box className={styles.productFooter}>
                        <Chip label={`Stock: ${producto.stock}`} size="small" className={styles.stockChip} />
                        {producto.sku ? <Chip label={`SKU: ${producto.sku}`} size="small" className={styles.skuChip} /> : null}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Paper className={styles.emptyPaper}>
                  <Box className={styles.emptyRow}>
                    <Warning fontSize="small" />
                    <Typography className={styles.emptyText}>Sin productos (pendiente de API).</Typography>
                  </Box>
                  <Typography className={styles.emptyHint}>
                    Cuando conectes backend, aquí se listarán productos por búsqueda.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Panel Derecho: Carrito y Resumen */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper className={styles.clientPaper}>
            <Box className={styles.clientHeader}>
              <Person className={styles.clientIcon} />
              <Typography variant="h6" className={styles.clientTitle}>
                Cliente
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleSeleccionarCliente}
              className={styles.clientButton}
            >
              {cliente ? cliente.nombre : "Seleccionar Cliente"}
            </Button>
          </Paper>

          <Paper className={styles.cartPaper}>
            <Typography variant="h6" className={styles.cartTitle}>
              Carrito de Compra
            </Typography>

            {carrito.length === 0 ? (
              <Box className={styles.cartEmpty}>
                <Typography className={styles.emptyText}>Carrito vacío.</Typography>
                <Typography className={styles.emptyHint}>
                  Agrega productos desde el panel izquierdo.
                </Typography>
              </Box>
            ) : (
              <>
                <List className={styles.cartList}>
                  {carrito.map((item) => (
                    <ListItem key={item.id} className={styles.cartItem}>
                      <ListItemText
                        primary={<Typography className={styles.cartItemName}>{item.nombre}</Typography>}
                        secondary={formatMoneda(item.precio)}
                      />

                      <Box className={styles.cartActions}>
                        <IconButton
                          size="small"
                          onClick={() => handleCambiarCantidad(item.id, -1)}
                          className={styles.qtyBtn}
                        >
                          <Remove />
                        </IconButton>

                        <Typography className={styles.qtyText}>{item.cantidad}</Typography>

                        <IconButton
                          size="small"
                          onClick={() => handleCambiarCantidad(item.id, 1)}
                          className={styles.qtyBtn}
                        >
                          <Add />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleEliminarDelCarrito(item.id)}
                          className={styles.deleteBtn}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>

                <Divider className={styles.divider} />

                <Box className={styles.totals}>
                  <Box className={styles.totalRow}>
                    <Typography>Subtotal:</Typography>
                    <Typography className={styles.totalValue}>{formatMoneda(subtotal)}</Typography>
                  </Box>

                  <Box className={styles.totalRow}>
                    <Typography variant="h6" className={styles.totalLabel}>
                      Total:
                    </Typography>
                    <Typography variant="h6" className={styles.totalPink}>
                      {formatMoneda(total)}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Payment />}
              className={styles.primaryButton}
              disabled={carrito.length === 0}
              onClick={handleProcesar}
            >
              Procesar Pago
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Receipt />}
              className={styles.outlinedButton}
              disabled={carrito.length === 0}
              onClick={handleApartar}
            >
              Apartar
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PuntoVenta;