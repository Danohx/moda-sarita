// src/pages/admin/AdminReports.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart,
  ShoppingBag,
  CreditCard,
  Filter
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/AdminReports.module.css';

type ReportType = 'ventas' | 'inventario' | 'clientes' | 'financiero';
type Period = 'hoy' | 'semana' | 'mes' | 'año';

interface SummaryCard {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
}

interface TopProduct {
  id: number;
  nombre: string;
  ventas: number;
  ingresos: number;
}

interface TopCustomer {
  id: number;
  nombre: string;
  compras: number;
  total: number;
}

export const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('ventas');
  const [period, setPeriod] = useState<Period>('mes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, [reportType, period]);

  const summaryCards: SummaryCard[] = [
    {
      label: 'Ventas Totales',
      value: '$125,450',
      change: 12.5,
      icon: DollarSign
    },
    {
      label: 'Transacciones',
      value: '1,247',
      change: 8.3,
      icon: ShoppingBag
    },
    {
      label: 'Ticket Promedio',
      value: '$850',
      change: -3.2,
      icon: CreditCard
    },
    {
      label: 'Productos Vendidos',
      value: '3,892',
      change: 15.7,
      icon: Package
    }
  ];

  const topProducts: TopProduct[] = [
    { id: 1, nombre: 'Blusa Floral Rosa', ventas: 45, ingresos: 13455 },
    { id: 2, nombre: 'Pantalón Mezclilla', ventas: 38, ingresos: 17100 },
    { id: 3, nombre: 'Vestido Estampado', ventas: 32, ingresos: 17600 },
    { id: 4, nombre: 'Falda Plisada', ventas: 28, ingresos: 8960 },
    { id: 5, nombre: 'Chamarra Denim', ventas: 25, ingresos: 18750 }
  ];

  const topCustomers: TopCustomer[] = [
    { id: 1, nombre: 'María González', compras: 12, total: 15600 },
    { id: 2, nombre: 'Ana Martínez', compras: 9, total: 12300 },
    { id: 3, nombre: 'Carmen López', compras: 8, total: 10800 },
    { id: 4, nombre: 'Laura Hernández', compras: 7, total: 9450 },
    { id: 5, nombre: 'Rosa Ramírez', compras: 6, total: 8200 }
  ];

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const exportarPDF = () => {
    alert('Exportando reporte a PDF...');
  };

  const exportarExcel = () => {
    alert('Exportando reporte a Excel...');
  };

  const reportTypes = [
    { value: 'ventas', label: 'Ventas', icon: TrendingUp },
    { value: 'inventario', label: 'Inventario', icon: Package },
    { value: 'clientes', label: 'Clientes', icon: Users },
    { value: 'financiero', label: 'Financiero', icon: DollarSign }
  ];

  const periods = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mes' },
    { value: 'año', label: 'Este Año' }
  ];

  return (
      <div className={styles.reports}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Reportes y Análisis</h1>
            <p className={styles.subtitle}>Análisis detallado del desempeño de tu negocio</p>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className={styles.reportTypeSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <BarChart3 size={20} />
              Tipo de Reporte
            </h2>
          </div>
          <div className={styles.reportTypes}>
            {reportTypes.map(type => (
              <button
                key={type.value}
                className={`${styles.reportTypeBtn} ${reportType === type.value ? styles.reportTypeActive : ''}`}
                onClick={() => setReportType(type.value as ReportType)}
              >
                <div className={styles.reportTypeIcon}>
                  <type.icon size={24} />
                </div>
                <span className={styles.reportTypeLabel}>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Period Selector */}
        <div className={styles.filtersCard}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <Calendar size={18} />
              Período
            </label>
            <div className={styles.periodButtons}>
              {periods.map(p => (
                <button
                  key={p.value}
                  className={`${styles.periodBtn} ${period === p.value ? styles.periodActive : ''}`}
                  onClick={() => setPeriod(p.value as Period)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.exportButtons}>
            <button className={styles.exportBtn} onClick={exportarPDF}>
              <FileText size={18} />
              Exportar PDF
            </button>
            <button className={styles.exportBtn} onClick={exportarExcel}>
              <Download size={18} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.summaryCard}>
                <div className={styles.skeleton}></div>
                <div className={styles.skeleton}></div>
                <div className={styles.skeleton}></div>
              </div>
            ))
          ) : (
            summaryCards.map((card, i) => (
              <div key={i} className={styles.summaryCard}>
                <div className={styles.summaryIcon}>
                  <card.icon size={24} />
                </div>
                <div className={styles.summaryContent}>
                  <p className={styles.summaryLabel}>{card.label}</p>
                  <h3 className={styles.summaryValue}>{card.value}</h3>
                  <div className={`${styles.summaryChange} ${card.change >= 0 ? styles.changePositive : styles.changeNegative}`}>
                    <TrendingUp size={16} />
                    <span>{Math.abs(card.change)}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chart Placeholder */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>
              <PieChart size={20} />
              Tendencia de Ventas
            </h2>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot}></span>
                <span>Ventas</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className={styles.chartSkeleton}></div>
          ) : (
            <div className={styles.chartPlaceholder}>
              <BarChart3 size={64} />
              <p>Gráfico de tendencias</p>
              <span className={styles.chartHint}>Conecta con backend para visualizar datos reales</span>
            </div>
          )}
        </div>

        {/* Tables Grid */}
        <div className={styles.tablesGrid}>
          {/* Top Products */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>
                <Package size={20} />
                Productos Más Vendidos
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Ventas</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td><div className={styles.skeletonSmall}></div></td>
                        <td><div className={styles.skeleton}></div></td>
                        <td><div className={styles.skeletonSmall}></div></td>
                        <td><div className={styles.skeleton}></div></td>
                      </tr>
                    ))
                  ) : (
                    topProducts.map((product, index) => (
                      <tr key={product.id}>
                        <td className={styles.rankCell}>
                          <div className={`${styles.rankBadge} ${index < 3 ? styles.rankTop : ''}`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className={styles.productCell}>{product.nombre}</td>
                        <td className={styles.numberCell}>{product.ventas}</td>
                        <td className={styles.moneyCell}>{formatMoneda(product.ingresos)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>
                <Users size={20} />
                Mejores Clientes
              </h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Compras</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td><div className={styles.skeletonSmall}></div></td>
                        <td><div className={styles.skeleton}></div></td>
                        <td><div className={styles.skeletonSmall}></div></td>
                        <td><div className={styles.skeleton}></div></td>
                      </tr>
                    ))
                  ) : (
                    topCustomers.map((customer, index) => (
                      <tr key={customer.id}>
                        <td className={styles.rankCell}>
                          <div className={`${styles.rankBadge} ${index < 3 ? styles.rankTop : ''}`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className={styles.productCell}>{customer.nombre}</td>
                        <td className={styles.numberCell}>{customer.compras}</td>
                        <td className={styles.moneyCell}>{formatMoneda(customer.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
};