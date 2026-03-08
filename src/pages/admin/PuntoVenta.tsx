// src/pages/admin/POS.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Tag
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/PuntoVenta.module.css';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  sku?: string;
  imagen?: string;
  categoria?: string;
}

interface CarritoItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
}

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
}

export const POS: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  // Productos de ejemplo (luego vienen del backend)
  const productosDisponibles: Producto[] = [
    {
      id: 1,
      nombre: 'Blusa Floral Rosa',
      precio: 299,
      stock: 15,
      sku: 'BF-001',
      categoria: 'Blusas'
    },
    {
      id: 2,
      nombre: 'Pantalón Mezclilla',
      precio: 450,
      stock: 8,
      sku: 'PM-002',
      categoria: 'Pantalones'
    },
    {
      id: 3,
      nombre: 'Vestido Estampado',
      precio: 550,
      stock: 12,
      sku: 'VE-003',
      categoria: 'Vestidos'
    },
    {
      id: 4,
      nombre: 'Falda Plisada',
      precio: 320,
      stock: 20,
      sku: 'FP-004',
      categoria: 'Faldas'
    }
  ];

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => setLoading(false), 800);
  }, []);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return productosDisponibles;
    return productosDisponibles.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q)
    );
  }, [busqueda, productosDisponibles]);

  const subtotal = useMemo(() => {
    return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }, [carrito]);

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          alert('No hay suficiente stock disponible');
          return prev;
        }
        return prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        stock: producto.stock
      }];
    });
  };

  const cambiarCantidad = (id: number, delta: number) => {
    setCarrito(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const nuevaCantidad = Math.max(1, Math.min(item.stock, item.cantidad + delta));
        return { ...item, cantidad: nuevaCantidad };
      })
    );
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const procesarVenta = () => {
    if (carrito.length === 0) return;
    // Aquí iría la lógica de procesamiento de pago
    alert('Procesando venta...\nTotal: ' + formatMoneda(total));
  };

  const crearApartado = () => {
    if (carrito.length === 0) return;
    // Aquí iría la lógica de apartado
    alert('Creando apartado...\nTotal: ' + formatMoneda(total));
  };

  const seleccionarCliente = () => {
    // Aquí iría modal de selección de cliente
    setCliente({
      id: 1,
      nombre: 'María González',
      telefono: '771 123 4567'
    });
  };

  return (
      <div className={styles.pos}>
        <div className={styles.header}>
          <h1 className={styles.title}>Punto de Venta</h1>
          <div className={styles.headerActions}>
            <span className={styles.date}>
              {new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Panel Izquierdo - Productos */}
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
                // Skeleton loading
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.productSkeleton}>
                    <div className={styles.skeletonImage}></div>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonPrice}></div>
                  </div>
                ))
              ) : productosFiltrados.length > 0 ? (
                productosFiltrados.map(producto => (
                  <div
                    key={producto.id}
                    className={styles.productoCard}
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <div className={styles.productoIcono}>
                      <Package size={32} />
                    </div>
                    <div className={styles.productoInfo}>
                      <h3 className={styles.productoNombre}>{producto.nombre}</h3>
                      <p className={styles.productoSku}>SKU: {producto.sku}</p>
                      <div className={styles.productoFooter}>
                        <span className={styles.productoPrecio}>
                          {formatMoneda(producto.precio)}
                        </span>
                        <span className={`${styles.stockBadge} ${producto.stock < 10 ? styles.stockBajo : ''}`}>
                          Stock: {producto.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <AlertCircle size={48} />
                  <p className={styles.emptyTitle}>No se encontraron productos</p>
                  <p className={styles.emptySubtitle}>Intenta con otra búsqueda</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel Derecho - Carrito */}
          <div className={styles.carritoPanel}>
            {/* Cliente */}
            <div className={styles.clienteCard}>
              <div className={styles.clienteHeader}>
                <User size={20} />
                <span className={styles.clienteLabel}>Cliente</span>
              </div>
              <button className={styles.clienteBtn} onClick={seleccionarCliente}>
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

            {/* Carrito */}
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
                  <ShoppingCart size={48} />
                  <p className={styles.vacioTitle}>Carrito vacío</p>
                  <p className={styles.vacioSubtitle}>
                    Agrega productos desde el panel izquierdo
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.carritoItems}>
                    {carrito.map(item => (
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
                            >
                              <Minus size={16} />
                            </button>
                            <span className={styles.cantidadText}>{item.cantidad}</span>
                            <button
                              className={styles.cantidadBtn}
                              onClick={() => cambiarCantidad(item.id, 1)}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <button
                            className={styles.eliminarBtn}
                            onClick={() => eliminarDelCarrito(item.id)}
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
                >
                  <CreditCard size={20} />
                  Procesar Pago
                </button>
                <button
                  className={styles.apartarBtn}
                  onClick={crearApartado}
                  disabled={carrito.length === 0}
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