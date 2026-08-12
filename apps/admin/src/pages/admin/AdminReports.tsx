import { useCallback, useEffect, useMemo, useState } from "react";
import { reportesApi } from "@shared/api/reportes.api";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";
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

type PeriodPreset = "today" | "7d" | "15d" | "30d" | "month" | "year" | "custom";

const REPORT_PERMISSIONS = {
  resumen: ["reportes.resumen.view"],
  ventas: ["reportes.ventas.view"],
  productos: ["reportes.productos.view"],
  inventario: ["reportes.inventario.view"],
  clientes: ["reportes.clientes.view"],
  credito: ["reportes.credito.view"],
  apartados: ["reportes.apartados.view"],
  financiero: ["reportes.financiero.view"],
  cortes: ["reportes.cortes.view"],
  export: ["reportes.export"],
} as const;

type ReportTabConfig = {
  id: ActiveTab;
  label: string;
  permissions: readonly string[];
};

const TABS: ReportTabConfig[] = [
  { id: "ventas", label: "Ventas", permissions: REPORT_PERMISSIONS.ventas },
  {
    id: "productos",
    label: "Productos",
    permissions: REPORT_PERMISSIONS.productos,
  },
  {
    id: "inventario",
    label: "Inventario",
    permissions: REPORT_PERMISSIONS.inventario,
  },
  {
    id: "clientes",
    label: "Clientes",
    permissions: REPORT_PERMISSIONS.clientes,
  },
  { id: "credito", label: "Crédito", permissions: REPORT_PERMISSIONS.credito },
  {
    id: "apartados",
    label: "Apartados",
    permissions: REPORT_PERMISSIONS.apartados,
  },
  {
    id: "financiero",
    label: "Financiero",
    permissions: REPORT_PERMISSIONS.financiero,
  },
  { id: "cortes", label: "Cortes", permissions: REPORT_PERMISSIONS.cortes },
];

const PERIODS: { id: PeriodPreset; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "7d", label: "7 días" },
  { id: "15d", label: "15 días" },
  { id: "30d", label: "30 días" },
  { id: "month", label: "Mes actual" },
  { id: "year", label: "Año actual" },
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
  if (preset === "today") {
    setFrom(todayYmd());
    setTo(todayYmd());
    return;
  }

  if (preset === "7d") {
    setFrom(addDaysYmd(-6));
    setTo(todayYmd());
    return;
  }

  if (preset === "15d") {
    setFrom(addDaysYmd(-14));
    setTo(todayYmd());
    return;
  }

  if (preset === "30d") {
    setFrom(addDaysYmd(-29));
    setTo(todayYmd());
    return;
  }

  if (preset === "month") {
    setFrom(firstDayOfMonthYmd());
    setTo(todayYmd());
    return;
  }

  if (preset === "year") {
    const currentYear = new Date().getFullYear();
    setFrom(`${currentYear}-01-01`);
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
  const { user } = useAuth();

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

  const canViewResumen = canAccess(user, {
    permissions: REPORT_PERMISSIONS.resumen,
  });

  const canExportReports = canAccess(user, {
    permissions: REPORT_PERMISSIONS.export,
  });

  const visibleTabs = useMemo(() => {
    return TABS.filter((tab) =>
      canAccess(user, { permissions: tab.permissions }),
    );
  }, [user]);

  const effectiveActiveTab = useMemo<ActiveTab | null>(() => {
    if (visibleTabs.some((tab) => tab.id === activeTab)) {
      return activeTab;
    }

    return visibleTabs[0]?.id ?? null;
  }, [activeTab, visibleTabs]);

  const activeTabLabel =
    visibleTabs.find((tab) => tab.id === effectiveActiveTab)?.label ??
    "Sin acceso";

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

  const loadAll = useCallback(async () => {
    if (from > to) {
      setError("La fecha inicial no puede ser posterior a la fecha final.");
      setResumen(null);
      setTabData(null);
      return;
    }

    if (!canViewResumen && !effectiveActiveTab) {
      setResumen(null);
      setTabData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [resumenResponse, tabResponse] = await Promise.all([
        canViewResumen
          ? reportesApi.getResumen(filters)
          : Promise.resolve(null),
        effectiveActiveTab
          ? getTabData(effectiveActiveTab, filters)
          : Promise.resolve(null),
      ]);

      setResumen(resumenResponse);
      setTabData(tabResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando reportes");
      setResumen(null);
      setTabData(null);
    } finally {
      setLoading(false);
    }
  }, [canViewResumen, effectiveActiveTab, filters, from, to]);

  function handlePeriodChange(preset: PeriodPreset) {
    setPeriodPreset(preset);

    if (preset !== "custom") {
      applyPeriodPreset(preset, setFrom, setTo);
    }
  }

  async function handleExportPdf() {
    if (from > to) {
      setError("Corrige el rango de fechas antes de exportar.");
      return;
    }

    if (!canExportReports || !effectiveActiveTab) {
      setError("No tienes permiso para exportar reportes.");
      return;
    }

    try {
      setExporting("pdf");
      await reportesApi.exportPdf(
        getReporteExportable(effectiveActiveTab),
        filters,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exportando PDF");
    } finally {
      setExporting(null);
    }
  }

  async function handleExportExcel() {
    if (from > to) {
      setError("Corrige el rango de fechas antes de exportar.");
      return;
    }

    if (!canExportReports || !effectiveActiveTab) {
      setError("No tienes permiso para exportar reportes.");
      return;
    }

    try {
      setExporting("excel");
      await reportesApi.exportExcel(
        getReporteExportable(effectiveActiveTab),
        filters,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error exportando Excel");
    } finally {
      setExporting(null);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const summaryCards = useMemo(
    () =>
      [
        {
          title: "Ventas totales",
          value: formatMoney(resumen?.ventas_totales),
          helper: "Total vendido en el periodo",
          icon: "VT",
          permissions: REPORT_PERMISSIONS.ventas,
        },
        {
          title: "Ingresos confirmados",
          value: formatMoney(resumen?.ingresos_confirmados),
          helper: "Pagos confirmados",
          icon: "IC",
          permissions: REPORT_PERMISSIONS.financiero,
        },
        {
          title: "Ticket promedio",
          value: formatMoney(resumen?.ticket_promedio),
          helper: "Promedio por venta",
          icon: "TP",
          permissions: REPORT_PERMISSIONS.ventas,
        },
        {
          title: "Productos vendidos",
          value: formatNumber(resumen?.productos_vendidos),
          helper: "Unidades vendidas",
          icon: "PV",
          permissions: REPORT_PERMISSIONS.productos,
        },
        {
          title: "Bajo stock",
          value: formatNumber(resumen?.productos_bajo_stock),
          helper: "Productos/variantes críticas",
          icon: "BS",
          permissions: REPORT_PERMISSIONS.inventario,
        },
        {
          title: "Cuentas por cobrar",
          value: formatMoney(resumen?.saldo_deudor_total),
          helper: "Saldo pendiente de clientes",
          icon: "CC",
          permissions: REPORT_PERMISSIONS.credito,
        },
      ].filter((card) => canAccess(user, { permissions: card.permissions })),
    [resumen, user],
  );

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

        {canExportReports && effectiveActiveTab ? (
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
        ) : null}
      </section>

      {error ? <section className={styles.errorBox}>{error}</section> : null}

      {canViewResumen && summaryCards.length > 0 ? (
        <section className={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <ReporteMetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              helper={card.helper}
              icon={card.icon}
            />
          ))}
        </section>
      ) : null}

      {visibleTabs.length > 0 ? (
        <nav className={styles.tabs}>
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${
                effectiveActiveTab === tab.id ? styles.tabActive : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : null}

      {visibleTabs.length === 0 ? (
        <section className={styles.errorBox}>
          No tienes permisos para consultar reportes específicos.
        </section>
      ) : null}

      {effectiveActiveTab ? (
        <section className={styles.contentCard}>
          <header className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>{activeTabLabel}</h2>
          </header>

          <div className={styles.contentBody}>
            {effectiveActiveTab === "ventas" ? (
              <VentasTab
                data={isVentasTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}

            {effectiveActiveTab === "productos" ? (
              <ProductosTab
                data={isProductosTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}

            {effectiveActiveTab === "inventario" ? (
              <InventarioTab
                data={isInventarioTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}

            {effectiveActiveTab === "clientes" ? (
              <ClientesTab
                data={isClientesTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}

            {effectiveActiveTab === "credito" ? (
              <CreditoTab
                data={isCreditoTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}

            {effectiveActiveTab === "apartados" ? (
              <ApartadosTab
                data={isApartadosTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}

            {effectiveActiveTab === "financiero" ? (
              <FinancieroTab
                data={isFinancieroTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}

            {effectiveActiveTab === "cortes" ? (
              <CortesTab
                data={isCortesTabData(tabData) ? tabData : null}
                loading={loading}
              />
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}