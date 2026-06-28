import { useEffect, useMemo, useState } from "react";
import { reportesApi } from "@shared/api/reportes.api";
import ReporteMetricCard from "@admin/components/components/reportes/ReporteMetricCard";
import {
  addDaysYmd,
  formatMoney,
  formatNumber,
  todayYmd,
} from "@admin/utils/reportesFormat";
import type {
  ReporteFiltros,
  ReporteGroupBy,
  ReporteResumenGeneral,
  ReporteTabData,
  ReporteExportable,
} from "@admin/types/reportes.types";
import VentasTab from "@admin/components/components/reportes/VentasTab";
import ProductosTab from "@admin/components/components/reportes/ProductosTab";
import InventarioTab from "@admin/components/components/reportes/InventarioTab";
import ClientesTab from "@admin/components/components/reportes/ClientesTab";
import CreditoTab from "@admin/components/components/reportes/CreditoTab";
import ApartadosTab from "@admin/components/components/reportes/ApartadosTab";
import FinancieroTab from "@admin/components/components/reportes/FinancieroTab";
import CortesTab from "@admin/components/components/reportes/CortesTab";
import type {
  VentasTabData,
  ProductosTabData,
  InventarioTabData,
  ClientesTabData,
  CreditoTabData,
  ApartadosTabData,
  FinancieroTabData,
  CortesTabData,
} from "@admin/types/reportes.types";
import styles from "../../../styles/AdminReports.module.css";

type ActiveTab =
  | "ventas"
  | "productos"
  | "inventario"
  | "clientes"
  | "credito"
  | "apartados"
  | "financiero"
  | "cortes";

type PeriodPreset = "7d" | "30d" | "month" | "custom";

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "ventas", label: "Ventas" },
  { id: "productos", label: "Productos" },
  { id: "inventario", label: "Inventario" },
  { id: "clientes", label: "Clientes" },
  { id: "credito", label: "Crédito" },
  { id: "apartados", label: "Apartados" },
  { id: "financiero", label: "Financiero" },
  { id: "cortes", label: "Cortes" },
];

const PERIODS: { id: PeriodPreset; label: string }[] = [
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "month", label: "Mes actual" },
  { id: "custom", label: "Personalizado" },
];

function parseGroupBy(value: string): ReporteGroupBy {
  if (value === "week") return "week";
  if (value === "month") return "month";
  return "day";
}

function firstDayOfMonthYmd() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function applyPeriodPreset(
  preset: PeriodPreset,
  setFrom: (value: string) => void,
  setTo: (value: string) => void,
) {
  if (preset === "7d") {
    setFrom(addDaysYmd(-7));
    setTo(todayYmd());
    return;
  }

  if (preset === "30d") {
    setFrom(addDaysYmd(-30));
    setTo(todayYmd());
    return;
  }

  if (preset === "month") {
    setFrom(firstDayOfMonthYmd());
    setTo(todayYmd());
  }
}

async function getTabData(
  activeTab: ActiveTab,
  filters: ReporteFiltros,
): Promise<ReporteTabData> {
  if (activeTab === "ventas") return reportesApi.getVentasTab(filters);
  if (activeTab === "productos") return reportesApi.getProductosTab(filters);
  if (activeTab === "inventario") return reportesApi.getInventarioTab(filters);
  if (activeTab === "clientes") return reportesApi.getClientesTab(filters);
  if (activeTab === "credito") return reportesApi.getCreditoTab(filters);
  if (activeTab === "apartados") return reportesApi.getApartadosTab(filters);
  if (activeTab === "financiero") return reportesApi.getFinancieroTab(filters);

  return reportesApi.getCortesTab(filters);
}

function isVentasTabData(data: ReporteTabData | null): data is VentasTabData {
  return (
    data !== null &&
    "resumen" in data &&
    "tendencia" in data &&
    "metodosPago" in data &&
    "empleados" in data
  );
}

function isProductosTabData(
  data: ReporteTabData | null,
): data is ProductosTabData {
  return (
    data !== null &&
    "masVendidos" in data &&
    "menosVendidos" in data &&
    "sinVentas" in data
  );
}

function isInventarioTabData(
  data: ReporteTabData | null,
): data is InventarioTabData {
  return (
    data !== null &&
    "resumen" in data &&
    "critico" in data &&
    "movimientos" in data
  );
}

function isClientesTabData(
  data: ReporteTabData | null,
): data is ClientesTabData {
  return (
    data !== null &&
    "resumen" in data &&
    "tendencia" in data &&
    "frecuentes" in data
  );
}

function isCreditoTabData(data: ReporteTabData | null): data is CreditoTabData {
  return data !== null && "resumen" in data && "cuentasCobrar" in data;
}

function isApartadosTabData(
  data: ReporteTabData | null,
): data is ApartadosTabData {
  return data !== null && "resumen" in data && "detalle" in data;
}

function isFinancieroTabData(
  data: ReporteTabData | null,
): data is FinancieroTabData {
  return data !== null && "resumen" in data && "metodosPago" in data;
}

function isCortesTabData(data: ReporteTabData | null): data is CortesTabData {
  return data !== null && "resumen" in data && "detalle" in data;
}

function getReporteExportable(tab: ActiveTab): ReporteExportable {
  return tab;
}

export default function AdminReportes() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("ventas");
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("30d");
  const [from, setFrom] = useState(addDaysYmd(-30));
  const [to, setTo] = useState(todayYmd());
  const [groupBy, setGroupBy] = useState<ReporteGroupBy>("day");

  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState<ReporteResumenGeneral | null>(null);
  const [tabData, setTabData] = useState<ReporteTabData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const filters = useMemo<ReporteFiltros>(
    () => ({
      from,
      to,
      groupBy,
      limit: 20,
      offset: 0,
    }),
    [from, to, groupBy],
  );

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);

      const [resumenResponse, tabResponse] = await Promise.all([
        reportesApi.getResumen(filters),
        getTabData(activeTab, filters),
      ]);

      setResumen(resumenResponse);
      setTabData(tabResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando reportes");
    } finally {
      setLoading(false);
    }
  }

  function handlePeriodChange(preset: PeriodPreset) {
    setPeriodPreset(preset);

    if (preset !== "custom") {
      applyPeriodPreset(preset, setFrom, setTo);
    }
  }

  async function handleExportPdf() {
    try {
      setExporting("pdf");
      await reportesApi.exportPdf(getReporteExportable(activeTab), filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exportando PDF");
    } finally {
      setExporting(null);
    }
  }

  async function handleExportExcel() {
    try {
      setExporting("excel");
      await reportesApi.exportExcel(getReporteExportable(activeTab), filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exportando Excel");
    } finally {
      setExporting(null);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [activeTab, filters]);

  return (
    <main className={styles.reports}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reportes</h1>
          <p className={styles.subtitle}>
            Consulta el rendimiento de ventas, inventario, clientes y operación.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAll()}
          disabled={loading}
          className={styles.primaryAction}
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </header>

      <section className={styles.filtersCard}>
        <div className={styles.filterControls}>
          <div className={styles.filterField}>
            <span className={styles.filterLabel}>Periodo</span>

            <div className={styles.periodButtons}>
              {PERIODS.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => handlePeriodChange(period.id)}
                  className={`${styles.periodBtn} ${
                    periodPreset === period.id ? styles.periodActive : ""
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Desde</span>
            <input
              className={styles.input}
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPeriodPreset("custom");
              }}
            />
          </label>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Hasta</span>
            <input
              className={styles.input}
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPeriodPreset("custom");
              }}
            />
          </label>

          <label className={styles.filterField}>
            <span className={styles.filterLabel}>Agrupar</span>
            <select
              className={styles.select}
              value={groupBy}
              onChange={(event) => setGroupBy(parseGroupBy(event.target.value))}
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </label>
        </div>

        <div className={styles.exportButtons}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => void handleExportPdf()}
            disabled={exporting !== null}
          >
            {exporting === "pdf" ? "Generando PDF..." : "PDF"}
          </button>

          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => void handleExportExcel()}
            disabled={exporting !== null}
          >
            {exporting === "excel" ? "Generando Excel..." : "Excel"}
          </button>
        </div>
      </section>

      {error ? <section className={styles.errorBox}>{error}</section> : null}

      <section className={styles.summaryGrid}>
        <ReporteMetricCard
          title="Ventas totales"
          value={formatMoney(resumen?.ventas_totales)}
          helper="Total vendido en el periodo"
          icon="VT"
        />

        <ReporteMetricCard
          title="Ingresos confirmados"
          value={formatMoney(resumen?.ingresos_confirmados)}
          helper="Pagos confirmados"
          icon="IC"
        />

        <ReporteMetricCard
          title="Ticket promedio"
          value={formatMoney(resumen?.ticket_promedio)}
          helper="Promedio por venta"
          icon="TP"
        />

        <ReporteMetricCard
          title="Productos vendidos"
          value={formatNumber(resumen?.productos_vendidos)}
          helper="Unidades vendidas"
          icon="PV"
        />

        <ReporteMetricCard
          title="Bajo stock"
          value={formatNumber(resumen?.productos_bajo_stock)}
          helper="Productos/variantes críticas"
          icon="BS"
        />

        <ReporteMetricCard
          title="Cuentas por cobrar"
          value={formatMoney(resumen?.saldo_deudor_total)}
          helper="Saldo pendiente de clientes"
          icon="CC"
        />
      </section>

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.tabActive : ""
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.contentCard}>
        <header className={styles.contentHeader}>
          <h2 className={styles.contentTitle}>
            {TABS.find((tab) => tab.id === activeTab)?.label}
          </h2>
        </header>

        <div className={styles.contentBody}>
          {activeTab === "ventas" ? (
            <VentasTab
              data={isVentasTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}

          {activeTab === "productos" ? (
            <ProductosTab
              data={isProductosTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}

          {activeTab === "inventario" ? (
            <InventarioTab
              data={isInventarioTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}

          {activeTab === "clientes" ? (
            <ClientesTab
              data={isClientesTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}

          {activeTab === "credito" ? (
            <CreditoTab
              data={isCreditoTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}

          {activeTab === "apartados" ? (
            <ApartadosTab
              data={isApartadosTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}

          {activeTab === "financiero" ? (
            <FinancieroTab
              data={isFinancieroTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}

          {activeTab === "cortes" ? (
            <CortesTab
              data={isCortesTabData(tabData) ? tabData : null}
              loading={loading}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
