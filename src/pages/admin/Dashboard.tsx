// src/pages/admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  CreditCard
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/Dashboard.module.css';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'up' | 'down';
  icon: React.ComponentType<any>;
}

interface Alert {
  id: number;
  type: 'warning' | 'error' | 'success';
  title: string;
  message: string;
  time: string;
  icon: React.ComponentType<any>;
}

interface QuickAction {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  action: () => void;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats: StatCard[] = [
    {
      title: 'Ventas del Día',
      value: '$1,240.00',
      change: 12,
      changeType: 'up',
      icon: DollarSign
    },
    {
      title: 'Ventas del Mes',
      value: '$34,500.00',
      change: 5,
      changeType: 'up',
      icon: TrendingUp
    },
    {
      title: 'Productos Vendidos',
      value: '156',
      change: -2,
      changeType: 'down',
      icon: Package
    },
    {
      title: 'Clientes Activos',
      value: '1,204',
      change: 18,
      changeType: 'up',
      icon: Users
    }
  ];

  const alerts: Alert[] = [
    {
      id: 1,
      type: 'warning',
      title: 'Advertencia de Stock Bajo',
      message: 'Los Audífonos Inalámbricos (Oro Rosa) están bajos a 5 unidades en el inventario central.',
      time: 'Hace 2 minutos',
      icon: AlertTriangle
    },
    {
      id: 2,
      type: 'error',
      title: 'Sincronización Fallida',
      message: 'La Terminal POS #4 falló al sincronizar las últimas 10 transacciones. Se requiere intervención manual.',
      time: 'Hace 1 hora',
      icon: XCircle
    },
    {
      id: 3,
      type: 'success',
      title: 'Respaldo Mensual Completado',
      message: 'Los datos del sistema se respaldaron exitosamente en el almacenamiento en la nube (Región: US-Este).',
      time: 'Hace 4 horas',
      icon: CheckCircle
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 1,
      title: 'Nueva Venta',
      subtitle: 'Abrir interfaz de punto de venta',
      icon: ShoppingBag,
      action: () => navigate('/admin/pos')
    },
    {
      id: 2,
      title: 'Registrar Depósito',
      subtitle: 'Agregar efectivo a caja',
      icon: Store,
      action: () => navigate('/admin/corte-caja')
    },
    {
      id: 3,
      title: 'Cerrar Caja',
      subtitle: 'Finalizar turno actual',
      icon: CreditCard,
      action: () => navigate('/admin/corte-caja')
    },
    {
      id: 4,
      title: 'Ver Inventario',
      subtitle: 'Verificar niveles de stock',
      icon: Package,
      action: () => navigate('/admin/inventario')
    }
  ];

  return (
      <div className={styles.dashboard}>
        {/* Encabezado */}
        <div className={styles.header}>
          <div className={styles.welcome}>
            <h1 className={styles.title}>Bienvenido de nuevo, Admin</h1>
            <p className={styles.subtitle}>Aquí tienes un resumen del rendimiento de tu tienda hoy.</p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'today' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Hoy
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'week' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('week')}
            >
              Semana
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'month' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('month')}
            >
              Mes
            </button>
          </div>
        </div>

        {/* Grid de Estadísticas */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <stat.icon className={styles.statIcon} size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statTitle}>{stat.title}</p>
                <h3 className={styles.statValue}>{stat.value}</h3>
                <div className={`${styles.statChange} ${stat.changeType === 'up' ? styles.statUp : styles.statDown}`}>
                  {stat.changeType === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid de Contenido Principal */}
        <div className={styles.mainGrid}>
          {/* Alertas del Sistema */}
          <div className={styles.alertsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <AlertTriangle size={20} />
                Alertas del Sistema
              </h2>
              <button className={styles.markAllRead}>Marcar todas como leídas</button>
            </div>

            <div className={styles.alertsList}>
              {alerts.map((alert) => (
                <div key={alert.id} className={`${styles.alertCard} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
                  <div className={styles.alertIcon}>
                    <alert.icon size={20} />
                  </div>
                  <div className={styles.alertContent}>
                    <div className={styles.alertHeader}>
                      <h4 className={styles.alertTitle}>{alert.title}</h4>
                      <span className={styles.alertTime}>{alert.time}</span>
                    </div>
                    <p className={styles.alertMessage}>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className={styles.actionsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Clock size={20} />
                Acciones Rápidas
              </h2>
            </div>

            <div className={styles.actionsList}>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={styles.actionCard}
                  onClick={action.action}
                >
                  <div className={styles.actionIcon}>
                    <action.icon size={24} />
                  </div>
                  <div className={styles.actionContent}>
                    <h4 className={styles.actionTitle}>{action.title}</h4>
                    <p className={styles.actionSubtitle}>{action.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};