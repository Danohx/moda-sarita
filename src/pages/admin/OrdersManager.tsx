// src/pages/admin/OrdersManager.tsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Eye,
  Edit,
  Truck,
  User,
  DollarSign,
  XCircle,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/OrdersManager.module.css';

type OrderStatus = 'Por Enviar' | 'En Proceso' | 'Completado' | 'Cancelado';

interface Order {
  id: number;
  orderId: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
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

export const OrdersManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo (luego vienen del backend)
  const [orders] = useState<Order[]>([
    {
      id: 1,
      orderId: '#12345',
      customer: 'María González',
      items: 3,
      total: 1250,
      status: 'Por Enviar',
      time: 'Hace 2 horas'
    },
    {
      id: 2,
      orderId: '#12344',
      customer: 'Ana Martínez',
      items: 2,
      total: 890,
      status: 'En Proceso',
      time: 'Hace 5 horas'
    },
    {
      id: 3,
      orderId: '#12343',
      customer: 'Carmen López',
      items: 1,
      total: 550,
      status: 'Completado',
      time: 'Hace 1 día'
    }
  ]);

  const [apartados] = useState<Apartado[]>([
    {
      id: 1,
      customer: 'Laura Hernández',
      total: 2500,
      paid: 1500,
      remaining: 1000,
      deadline: '15 Mar',
      progress: 60
    },
    {
      id: 2,
      customer: 'Rosa Ramírez',
      total: 1800,
      paid: 600,
      remaining: 1200,
      deadline: '20 Mar',
      progress: 33
    },
    {
      id: 3,
      customer: 'Patricia Silva',
      total: 3200,
      paid: 2400,
      remaining: 800,
      deadline: '25 Mar',
      progress: 75
    }
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Por Enviar': return <AlertCircle size={16} />;
      case 'En Proceso': return <Clock size={16} />;
      case 'Completado': return <CheckCircle size={16} />;
      case 'Cancelado': return <XCircle size={16} />;
    }
  };

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'Por Enviar': return styles.statusPending;
      case 'En Proceso': return styles.statusProcessing;
      case 'Completado': return styles.statusCompleted;
      case 'Cancelado': return styles.statusCancelled;
    }
  };

  return (
    <AdminLayout role="admin">
      <div className={styles.orders}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gestión de Pedidos</h1>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 0 ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(0)}
          >
            <ShoppingBag size={20} />
            Pedidos Web
          </button>
          <button
            className={`${styles.tab} ${activeTab === 1 ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(1)}
          >
            <Clock size={20} />
            Apartados Físicos
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Tab 0: Pedidos Web */}
          {activeTab === 0 && (
            <div className={styles.ordersGrid}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.orderCard}>
                    <div className={styles.orderSkeleton}>
                      <div className={styles.skeleton}></div>
                      <div className={styles.skeleton}></div>
                      <div className={styles.skeleton}></div>
                    </div>
                  </div>
                ))
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderLeft}>
                        <h3 className={styles.orderId}>Orden {order.orderId}</h3>
                        <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                      </div>
                      <div className={styles.orderAmount}>{formatMoneda(order.total)}</div>
                    </div>

                    <div className={styles.orderDetails}>
                      <div className={styles.detailRow}>
                        <User size={16} />
                        <span>{order.customer}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <ShoppingBag size={16} />
                        <span>{order.items} artículos</span>
                      </div>
                      <div className={styles.detailRow}>
                        <Clock size={16} />
                        <span>{order.time}</span>
                      </div>
                    </div>

                    <div className={styles.orderActions}>
                      <button className={styles.viewBtn}>
                        <Eye size={16} />
                        Ver detalles
                      </button>
                      {order.status !== 'Completado' && (
                        <>
                          <button className={styles.editBtn}>
                            <Edit size={16} />
                          </button>
                          <button className={styles.shipBtn}>
                            <Truck size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <ShoppingBag size={48} />
                  <p>No hay pedidos web</p>
                  <span>Los pedidos aparecerán aquí cuando se conecte el backend</span>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: Apartados Físicos */}
          {activeTab === 1 && (
            <div className={styles.apartadosGrid}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.apartadoCard}>
                    <div className={styles.apartadoSkeleton}>
                      <div className={styles.skeleton}></div>
                      <div className={styles.skeleton}></div>
                      <div className={styles.skeleton}></div>
                      <div className={styles.skeleton}></div>
                    </div>
                  </div>
                ))
              ) : apartados.length > 0 ? (
                apartados.map(apartado => (
                  <div key={apartado.id} className={styles.apartadoCard}>
                    <div className={styles.apartadoHeader}>
                      <div className={styles.apartadoCustomer}>
                        <div className={styles.customerAvatar}>
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className={styles.customerName}>{apartado.customer}</h4>
                          <p className={styles.apartadoId}>APT-00{apartado.id}</p>
                        </div>
                      </div>
                      <div className={styles.deadlineBadge}>
                        <Calendar size={14} />
                        {apartado.deadline}
                      </div>
                    </div>

                    <div className={styles.apartadoStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total</span>
                        <span className={styles.statValue}>{formatMoneda(apartado.total)}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Abonado</span>
                        <span className={`${styles.statValue} ${styles.statGreen}`}>
                          {formatMoneda(apartado.paid)}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Resta</span>
                        <span className={`${styles.statValue} ${styles.statRed}`}>
                          {formatMoneda(apartado.remaining)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Progreso de pago</span>
                        <span className={styles.progressPercent}>{apartado.progress}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${apartado.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className={styles.apartadoActions}>
                      <button className={styles.payBtn}>
                        <DollarSign size={18} />
                        Abonar
                      </button>
                      <button className={styles.cancelBtn}>
                        <XCircle size={18} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <Clock size={48} />
                  <p>No hay apartados físicos</p>
                  <span>Los apartados aparecerán aquí cuando se conecte el backend</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersManager;