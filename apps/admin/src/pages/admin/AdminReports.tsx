import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import styles from "../../../styles/AdminReports.module.css";

type ReportType = "ventas" | "inventario" | "clientes" | "financiero";
type Period = "hoy" | "semana" | "mes" | "año";

interface SummaryCard {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<LucideProps>;
}

interface TopProduct {
  id: string;
  nombre: string;
  ventas: number;
  ingresos: number;
}

interface TopCustomer {
  id: string;
  nombre: string;
  compras: number;
  total: number;
}

type ReportsData = {
  summaryCards: SummaryCard[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
};

/**
 * Placeholder API
 * Reemplazar luego por endpoints de reportes reales.
 */
async function fetchReportsData(
  _reportType: ReportType,
  _period: Period,
  signal?: AbortSignal
): Promise<ReportsData> {
  void signal;

  return {
    summaryCards: [],
    topProducts: [],
    topCustomers: [],
  };
}

export const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>("ventas");
  const [period, setPeriod] = useState<Period>("mes");
  const [loading, setLoading] = useState(true);

  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  const load = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      const data = await fetchReportsData(reportType, period, controller.signal);
      setSummaryCards(data.summaryCards ?? []);
      setTopProducts(data.topProducts ?? []);
      setTopCustomers(data.topCustomers ?? []);
    } catch {
      setSummaryCards([]);
      setTopProducts([]);
      setTopCustomers([]);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [reportType, period]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  const exportarPDF = () => {
    // TODO: conectar exportación real
  };

  const exportarExcel = () => {
    // TODO: conectar exportación real
  };

  const reportTypes = useMemo(
    () => [
      { value: "ventas", label: "Ventas", icon: TrendingUp },
      { value: "inventario", label: "Inventario", icon: Package },
      { value: "clientes", label: "Clientes", icon: Users },
      { value: "financiero", label: "Financiero", icon: DollarSign },
    ],
    []
  );

  const periods = useMemo(
    () => [
      { value: "hoy", label: "Hoy" },
      { value: "semana", label: "Esta Semana" },
      { value: "mes", label: "Este Mes" },
      { value: "año", label: "Este Año" },
    ],
    []
  );

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reportes y Análisis</h1>
          <p className={styles.subtitle}>Análisis detallado del desempeño de tu negocio</p>
        </div>
      </div>

      <div className={styles.reportTypeSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <BarChart3 size={20} />
            Tipo de Reporte
          </h2>
        </div>

        <div className={styles.reportTypes}>
          {reportTypes.map((type) => (
            <button
              key={type.value}
              className={`${styles.reportTypeBtn} ${
                reportType === type.value ? styles.reportTypeActive : ""
              }`}
              onClick={() => setReportType(type.value as ReportType)}
              type="button"
            >
              <div className={styles.reportTypeIcon}>
                <type.icon size={24} />
              </div>
              <span className={styles.reportTypeLabel}>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filtersCard}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <Calendar size={18} />
            Período
          </label>

          <div className={styles.periodButtons}>
            {periods.map((p) => (
              <button
                key={p.value}
                className={`${styles.periodBtn} ${
                  period === p.value ? styles.periodActive : ""
                }`}
                onClick={() => setPeriod(p.value as Period)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.exportButtons}>
          <button className={styles.exportBtn} onClick={exportarPDF} type="button">
            <FileText size={18} />
            Exportar PDF
          </button>
          <button className={styles.exportBtn} onClick={exportarExcel} type="button">
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.summaryCard}>
              <div className={styles.skeleton}></div>
              <div className={styles.skeleton}></div>
              <div className={styles.skeleton}></div>
            </div>
          ))
        ) : summaryCards.length > 0 ? (
          summaryCards.map((card, i) => (
            <div key={i} className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <card.icon size={24} />
              </div>
              <div className={styles.summaryContent}>
                <p className={styles.summaryLabel}>{card.label}</p>
                <h3 className={styles.summaryValue}>{card.value}</h3>
                <div
                  className={`${styles.summaryChange} ${
                    card.change >= 0 ? styles.changePositive : styles.changeNegative
                  }`}
                >
                  <TrendingUp size={16} />
                  <span>{Math.abs(card.change)}%</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          [
            { label: "Ventas Totales", icon: DollarSign },
            { label: "Transacciones", icon: ShoppingBag },
            { label: "Ticket Promedio", icon: CreditCard },
            { label: "Productos Vendidos", icon: Package },
          ].map((item, i) => (
            <div key={i} className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <item.icon size={24} />
              </div>
              <div className={styles.summaryContent}>
                <p className={styles.summaryLabel}>{item.label}</p>
                <h3 className={styles.summaryValue}>—</h3>
                <div className={styles.summaryChange}>
                  <span>Pendiente de API</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
            <p>Gráfico pendiente de datos reales</p>
            <span className={styles.chartHint}>
              Conecta el backend para visualizar información del reporte.
            </span>
          </div>
        )}
      </div>

      <div className={styles.tablesGrid}>
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
                ) : topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td className={styles.rankCell}>
                        <div className={`${styles.rankBadge} ${index < 3 ? styles.rankTop : ""}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className={styles.productCell}>{product.nombre}</td>
                      <td className={styles.numberCell}>{product.ventas}</td>
                      <td className={styles.moneyCell}>{formatMoneda(product.ingresos)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.productCell}>
                      Sin datos de productos (pendiente de API).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
                ) : topCustomers.length > 0 ? (
                  topCustomers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td className={styles.rankCell}>
                        <div className={`${styles.rankBadge} ${index < 3 ? styles.rankTop : ""}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className={styles.productCell}>{customer.nombre}</td>
                      <td className={styles.numberCell}>{customer.compras}</td>
                      <td className={styles.moneyCell}>{formatMoneda(customer.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.productCell}>
                      Sin datos de clientes (pendiente de API).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;