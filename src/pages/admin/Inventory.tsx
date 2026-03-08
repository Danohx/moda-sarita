// src/pages/admin/Inventory.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  DollarSign,
  Archive,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/Inventory.module.css';

interface InventarioStats {
  totalProductos: number;
  stockBajo: number;
  agotados: number;
  valorInventario: number;
}

interface ProductoStockBajo {
  id: number;
  nombre: string;
  stock: number;
  minimo: number;
  categoria: string;
}

type MovimientoTipo = 'Entrada' | 'Venta' | 'Ajuste' | 'Otro';

interface Movimiento {
  id: number;
  fecha: string;
  tipo: MovimientoTipo;
  producto: string;
  cantidad: number;
  usuario: string;
}

interface InventarioCategoria {
  categoria: string;
  cantidad: number;
}

export const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo (luego vienen del backend)
  const [estadisticas] = useState<InventarioStats>({
    totalProductos: 245,
    stockBajo: 18,
    agotados: 5,
    valorInventario: 125450
  });

  const [productosStockBajo] = useState<ProductoStockBajo[]>([
    {
      id: 1,
      nombre: 'Blusa Floral Rosa',
      stock: 3,
      minimo: 10,
      categoria: 'Blusas'
    },
    {
      id: 2,
      nombre: 'Pantalón Mezclilla',
      stock: 5,
      minimo: 15,
      categoria: 'Pantalones'
    },
    {
      id: 3,
      nombre: 'Vestido Estampado',
      stock: 2,
      minimo: 8,
      categoria: 'Vestidos'
    }
  ]);

  const [movimientos] = useState<Movimiento[]>([
    {
      id: 1,
      fecha: '2025-03-07',
      tipo: 'Entrada',
      producto: 'Blusa Floral Rosa',
      cantidad: 20,
      usuario: 'Admin'
    },
    {
      id: 2,
      fecha: '2025-03-07',
      tipo: 'Venta',
      producto: 'Pantalón Mezclilla',
      cantidad: -3,
      usuario: 'Vendedor 1'
    },
    {
      id: 3,
      fecha: '2025-03-06',
      tipo: 'Ajuste',
      producto: 'Vestido Estampado',
      cantidad: -2,
      usuario: 'Admin'
    },
    {
      id: 4,
      fecha: '2025-03-06',
      tipo: 'Entrada',
      producto: 'Falda Plisada',
      cantidad: 15,
      usuario: 'Admin'
    }
  ]);

  const [categorias] = useState<InventarioCategoria[]>([
    { categoria: 'Blusas', cantidad: 45 },
    { categoria: 'Pantalones', cantidad: 32 },
    { categoria: 'Vestidos', cantidad: 28 },
    { categoria: 'Faldas', cantidad: 35 },
    { categoria: 'Accesorios', cantidad: 50 }
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const movimientosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return movimientos;
    return movimientos.filter(m =>
      m.fecha.includes(q) ||
      m.tipo.toLowerCase().includes(q) ||
      m.producto.toLowerCase().includes(q) ||
      m.usuario.toLowerCase().includes(q)
    );
  }, [busqueda, movimientos]);

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const getMovimientoClass = (tipo: MovimientoTipo) => {
    switch (tipo) {
      case 'Entrada': return styles.chipEntrada;
      case 'Venta': return styles.chipVenta;
      case 'Ajuste': return styles.chipAjuste;
      default: return styles.chipOtro;
    }
  };

  const maxCantidad = Math.max(...categorias.map(c => c.cantidad));

  return (
      <div className={styles.inventory}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gestión de Inventario</h1>
          <button className={styles.addBtn}>
            <Plus size={20} />
            Ajuste Manual
          </button>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statPink}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total en Stock</p>
              <h3 className={styles.statValue}>{estadisticas.totalProductos}</h3>
            </div>
            <div className={styles.statIcon}>
              <Package size={48} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statOrange}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Stock Bajo</p>
              <h3 className={styles.statValue}>{estadisticas.stockBajo}</h3>
            </div>
            <div className={styles.statIcon}>
              <AlertTriangle size={48} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statRed}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Agotados</p>
              <h3 className={styles.statValue}>{estadisticas.agotados}</h3>
            </div>
            <div className={styles.statIcon}>
              <XCircle size={48} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statLight}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabelDark}>Valor Total</p>
              <h3 className={styles.statValuePink}>{formatMoneda(estadisticas.valorInventario)}</h3>
            </div>
            <div className={styles.statIconPink}>
              <DollarSign size={48} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 0 ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(0)}
          >
            <AlertTriangle size={20} />
            Alertas de Stock
          </button>
          <button
            className={`${styles.tab} ${activeTab === 1 ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(1)}
          >
            <Archive size={20} />
            Movimientos
          </button>
          <button
            className={`${styles.tab} ${activeTab === 2 ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(2)}
          >
            <CheckCircle size={20} />
            Por Categoría
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Tab 0: Alertas de Stock */}
          {activeTab === 0 && (
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock Actual</th>
                      <th>Stock Mínimo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                        </tr>
                      ))
                    ) : productosStockBajo.length > 0 ? (
                      productosStockBajo.map(producto => (
                        <tr key={producto.id}>
                          <td className={styles.productName}>{producto.nombre}</td>
                          <td>
                            <span className={styles.categoryChip}>
                              {producto.categoria}
                            </span>
                          </td>
                          <td className={styles.stockCritical}>{producto.stock}</td>
                          <td>{producto.minimo}</td>
                          <td>
                            <span className={styles.criticalChip}>
                              <AlertTriangle size={14} />
                              Crítico
                            </span>
                          </td>
                          <td>
                            <button className={styles.reabastecerBtn}>
                              Reabastecer
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className={styles.emptyRow}>
                          <AlertTriangle size={20} />
                          <span>Sin alertas de stock</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 1: Movimientos */}
          {activeTab === 1 && (
            <>
              <div className={styles.searchBox}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Buscar movimientos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            <td><div className={styles.skeleton}></div></td>
                            <td><div className={styles.skeleton}></div></td>
                            <td><div className={styles.skeleton}></div></td>
                            <td><div className={styles.skeleton}></div></td>
                            <td><div className={styles.skeleton}></div></td>
                          </tr>
                        ))
                      ) : movimientosFiltrados.length > 0 ? (
                        movimientosFiltrados.map(mov => (
                          <tr key={mov.id}>
                            <td>{mov.fecha}</td>
                            <td>
                              <span className={`${styles.movChip} ${getMovimientoClass(mov.tipo)}`}>
                                {mov.tipo}
                              </span>
                            </td>
                            <td>{mov.producto}</td>
                            <td>
                              <div className={styles.cantidadCell}>
                                {mov.cantidad > 0 ? (
                                  <TrendingUp className={styles.trendUp} size={18} />
                                ) : (
                                  <TrendingDown className={styles.trendDown} size={18} />
                                )}
                                <span className={mov.cantidad > 0 ? styles.qtyUp : styles.qtyDown}>
                                  {Math.abs(mov.cantidad)}
                                </span>
                              </div>
                            </td>
                            <td>{mov.usuario}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className={styles.emptyRow}>
                            <AlertTriangle size={20} />
                            <span>Sin movimientos</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Por Categoría */}
          {activeTab === 2 && (
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Inventario por Categoría</h2>
              {loading ? (
                <div className={styles.chartSkeleton}></div>
              ) : categorias.length > 0 ? (
                <div className={styles.chartBars}>
                  {categorias.map((cat, i) => (
                    <div key={i} className={styles.barItem}>
                      <div className={styles.barLabel}>{cat.categoria}</div>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${(cat.cantidad / maxCantidad) * 100}%` }}
                        >
                          <span className={styles.barValue}>{cat.cantidad}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyChart}>
                  <AlertTriangle size={48} />
                  <p>Sin datos por categoría</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
};