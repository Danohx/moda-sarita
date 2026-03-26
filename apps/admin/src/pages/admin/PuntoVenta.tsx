import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Receipt,
  Package,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import styles from "../../../styles/PuntoVenta.module.css";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  sku?: string;
  imagen?: string;
  categoria?: string;
}

interface CarritoItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
}

interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
}

type PosData = {
  productos: Producto[];
  cliente: Cliente | null;
};

/**
 * Placeholder API
 * Reemplazar después por endpoints reales:
 * - GET /inventario/existencias
 * - GET /clientes
 * - POST /ventas/pedidos
 * - POST /ventas/apartados
 */
async function fetchPosData(signal?: AbortSignal): Promise<PosData> {
  void signal;
  return {
    productos: [],
    cliente: null,
  };
}

export const POS: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      const data = await fetchPosData(controller.signal);
      setProductos(data.productos ?? []);
      setCliente(data.cliente ?? null);
    } catch {
      setProductos([]);
      setCliente(null);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return productos;

    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q)
    );
  }, [busqueda, productos]);

  const subtotal = useMemo(() => {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }, [carrito]);

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);

      if (existe) {
        if (existe.cantidad >= producto.stock) {
          return prev;
        }

        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          stock: producto.stock,
        },
      ];
    });
  };

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nuevaCantidad = Math.max(1, Math.min(item.stock, item.cantidad + delta));
        return { ...item, cantidad: nuevaCantidad };
      })
    );
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const procesarVenta = () => {
    if (carrito.length === 0) return;
    // TODO: conectar POST /ventas/pedidos
  };

  const crearApartado = () => {
    if (carrito.length === 0) return;
    // TODO: conectar POST /ventas/apartados
  };

  const seleccionarCliente = () => {
    // TODO: abrir modal / buscador real de clientes
  };

  return (
    <div className={styles.pos}>
      <div className={styles.header}>
        <h1 className={styles.title}>Punto de Venta</h1>
        <div className={styles.headerActions}>
          <span className={styles.date}>
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.productosPanel}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.productosGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.productSkeleton}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonPrice}></div>
                </div>
              ))
            ) : productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className={styles.productoCard}
                  onClick={() => agregarAlCarrito(producto)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      agregarAlCarrito(producto);
                    }
                  }}
                >
                  <div className={styles.productoIcono}>
                    <Package size={32} />
                  </div>

                  <div className={styles.productoInfo}>
                    <h3 className={styles.productoNombre}>{producto.nombre}</h3>
                    <p className={styles.productoSku}>SKU: {producto.sku ?? "N/A"}</p>

                    <div className={styles.productoFooter}>
                      <span className={styles.productoPrecio}>
                        {formatMoneda(producto.precio)}
                      </span>
                      <span
                        className={`${styles.stockBadge} ${
                          producto.stock < 10 ? styles.stockBajo : ""
                        }`}
                      >
                        Stock: {producto.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <AlertCircle size={48} />
                <p className={styles.emptyTitle}>Sin productos para mostrar</p>
                <p className={styles.emptySubtitle}>
                  Esta vista está pendiente de conexión a la API.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.carritoPanel}>
          <div className={styles.clienteCard}>
            <div className={styles.clienteHeader}>
              <User size={20} />
              <span className={styles.clienteLabel}>Cliente</span>
            </div>

            <button className={styles.clienteBtn} onClick={seleccionarCliente} type="button">
              {cliente ? (
                <div className={styles.clienteInfo}>
                  <span className={styles.clienteNombre}>{cliente.nombre}</span>
                  {cliente.telefono && (
                    <span className={styles.clienteTel}>{cliente.telefono}</span>
                  )}
                </div>
              ) : (
                <span className={styles.clientePlaceholder}>Seleccionar Cliente</span>
              )}
            </button>
          </div>

          <div className={styles.carritoCard}>
            <div className={styles.carritoHeader}>
              <h2 className={styles.carritoTitle}>
                <ShoppingCart size={20} />
                Carrito de Compra
              </h2>

              {carrito.length > 0 && (
                <span className={styles.carritoBadge}>{carrito.length}</span>
              )}
            </div>

            {carrito.length === 0 ? (
              <div className={styles.carritoVacio}>
                {loading ? <RefreshCw size={48} className={styles.spinning} /> : <ShoppingCart size={48} />}
                <p className={styles.vacioTitle}>
                  {loading ? "Cargando..." : "Carrito vacío"}
                </p>
                <p className={styles.vacioSubtitle}>
                  {loading
                    ? "Consultando productos..."
                    : "Agrega productos desde el panel izquierdo"}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.carritoItems}>
                  {carrito.map((item) => (
                    <div key={item.id} className={styles.carritoItem}>
                      <div className={styles.itemInfo}>
                        <h4 className={styles.itemNombre}>{item.nombre}</h4>
                        <p className={styles.itemPrecio}>{formatMoneda(item.precio)}</p>
                      </div>

                      <div className={styles.itemControls}>
                        <div className={styles.cantidadControl}>
                          <button
                            className={styles.cantidadBtn}
                            onClick={() => cambiarCantidad(item.id, -1)}
                            type="button"
                          >
                            <Minus size={16} />
                          </button>

                          <span className={styles.cantidadText}>{item.cantidad}</span>

                          <button
                            className={styles.cantidadBtn}
                            onClick={() => cambiarCantidad(item.id, 1)}
                            type="button"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          className={styles.eliminarBtn}
                          onClick={() => eliminarDelCarrito(item.id)}
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.resumen}>
                  <div className={styles.resumenRow}>
                    <span>Subtotal:</span>
                    <span>{formatMoneda(subtotal)}</span>
                  </div>

                  <div className={styles.resumenRow}>
                    <span>IVA (16%):</span>
                    <span>{formatMoneda(iva)}</span>
                  </div>

                  <div className={styles.resumenTotal}>
                    <span>Total:</span>
                    <span>{formatMoneda(total)}</span>
                  </div>
                </div>
              </>
            )}

            <div className={styles.acciones}>
              <button
                className={styles.procesarBtn}
                onClick={procesarVenta}
                disabled={carrito.length === 0}
                type="button"
              >
                <CreditCard size={20} />
                Procesar Pago
              </button>

              <button
                className={styles.apartarBtn}
                onClick={crearApartado}
                disabled={carrito.length === 0}
                type="button"
              >
                <Receipt size={20} />
                Apartar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;