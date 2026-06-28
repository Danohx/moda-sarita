import { apiFetch, apiFetchBlob } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  ApiOk,
  ApartadosTabData,
  ClientesTabData,
  CortesTabData,
  CreditoTabData,
  FinancieroTabData,
  InventarioTabData,
  ProductosTabData,
  ReporteApartadoDetalle,
  ReporteApartadosResumen,
  ReporteClienteFrecuente,
  ReporteClienteTendencia,
  ReporteClientesResumen,
  ReporteCorteDetalle,
  ReporteCortesResumen,
  ReporteCuentaCobrar,
  ReporteFiltros,
  ReporteFinancieroResumen,
  ReporteInventarioCritico,
  ReporteInventarioResumen,
  ReporteMetodoPago,
  ReporteMovimientosInventario,
  ReporteProducto,
  ReporteProductoSinVenta,
  ReporteResumenGeneral,
  ReporteTendenciaVenta,
  ReporteVentasEmpleado,
  ReporteVentasResumen,
  VentasTabData,
  ReporteExportable,
} from "@admin/types/reportes.types";

function buildQuery(filters: ReporteFiltros) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildExportQuery(reporte: ReporteExportable, filters: ReporteFiltros) {
  const params = new URLSearchParams();

  params.set("reporte", reporte);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return `?${params.toString()}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}

function buildExportFilename(
  reporte: ReporteExportable,
  formato: "pdf" | "xlsx",
  filters: ReporteFiltros,
) {
  return `reporte-${reporte}-${filters.from}-${filters.to}.${formato}`;
}

function buildPdfFilename(reporte: ReporteExportable, filters: ReporteFiltros) {
  return `reporte-${reporte}-${filters.from}-${filters.to}.pdf`;
}

async function getReporte<T>(
  endpoint: string,
  filters: ReporteFiltros,
): Promise<T> {
  const response = await apiFetch<ApiOk<T>>(
    `${endpoint}${buildQuery(filters)}`,
  );
  return response.data;
}

export const reportesApi = {
  getResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteResumenGeneral>(API_ENDPOINTS.reportes.resumen, filters),

  getVentasResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteVentasResumen>(
      API_ENDPOINTS.reportes.ventas.resumen,
      filters,
    ),

  getVentasTendencia: (filters: ReporteFiltros) =>
    getReporte<ReporteTendenciaVenta[]>(
      API_ENDPOINTS.reportes.ventas.tendencia,
      filters,
    ),

  getVentasMetodosPago: (filters: ReporteFiltros) =>
    getReporte<ReporteMetodoPago[]>(
      API_ENDPOINTS.reportes.ventas.metodosPago,
      filters,
    ),

  getVentasEmpleados: (filters: ReporteFiltros) =>
    getReporte<ReporteVentasEmpleado[]>(
      API_ENDPOINTS.reportes.ventas.empleados,
      filters,
    ),

  getProductosMasVendidos: (filters: ReporteFiltros) =>
    getReporte<ReporteProducto[]>(
      API_ENDPOINTS.reportes.productos.masVendidos,
      filters,
    ),

  getProductosMenosVendidos: (filters: ReporteFiltros) =>
    getReporte<ReporteProducto[]>(
      API_ENDPOINTS.reportes.productos.menosVendidos,
      filters,
    ),

  getProductosSinVentas: (filters: ReporteFiltros) =>
    getReporte<ReporteProductoSinVenta[]>(
      API_ENDPOINTS.reportes.productos.sinVentas,
      filters,
    ),

  getInventarioResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteInventarioResumen>(
      API_ENDPOINTS.reportes.inventario.resumen,
      filters,
    ),

  getInventarioCritico: (filters: ReporteFiltros) =>
    getReporte<ReporteInventarioCritico[]>(
      API_ENDPOINTS.reportes.inventario.critico,
      filters,
    ),

  getInventarioMovimientos: (filters: ReporteFiltros) =>
    getReporte<ReporteMovimientosInventario>(
      API_ENDPOINTS.reportes.inventario.movimientos,
      filters,
    ),

  getClientesResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteClientesResumen>(
      API_ENDPOINTS.reportes.clientes.resumen,
      filters,
    ),

  getClientesTendencia: (filters: ReporteFiltros) =>
    getReporte<ReporteClienteTendencia[]>(
      API_ENDPOINTS.reportes.clientes.tendencia,
      filters,
    ),

  getClientesFrecuentes: (filters: ReporteFiltros) =>
    getReporte<ReporteClienteFrecuente[]>(
      API_ENDPOINTS.reportes.clientes.frecuentes,
      filters,
    ),

  getCreditoResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteFinancieroResumen>(
      API_ENDPOINTS.reportes.credito.resumen,
      filters,
    ),

  getCuentasCobrar: (filters: ReporteFiltros) =>
    getReporte<ReporteCuentaCobrar[]>(
      API_ENDPOINTS.reportes.credito.cuentasCobrar,
      filters,
    ),

  getApartadosResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteApartadosResumen>(
      API_ENDPOINTS.reportes.apartados.resumen,
      filters,
    ),

  getApartadosDetalle: (filters: ReporteFiltros) =>
    getReporte<ReporteApartadoDetalle[]>(
      API_ENDPOINTS.reportes.apartados.detalle,
      filters,
    ),

  getFinancieroResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteFinancieroResumen>(
      API_ENDPOINTS.reportes.financiero.resumen,
      filters,
    ),

  getFinancieroMetodosPago: (filters: ReporteFiltros) =>
    getReporte<ReporteMetodoPago[]>(
      API_ENDPOINTS.reportes.financiero.metodosPago,
      filters,
    ),

  getCortesResumen: (filters: ReporteFiltros) =>
    getReporte<ReporteCortesResumen>(
      API_ENDPOINTS.reportes.cortes.resumen,
      filters,
    ),

  getCortesDetalle: (filters: ReporteFiltros) =>
    getReporte<ReporteCorteDetalle[]>(
      API_ENDPOINTS.reportes.cortes.detalle,
      filters,
    ),

  getVentasTab: async (filters: ReporteFiltros): Promise<VentasTabData> => {
    const [resumen, tendencia, metodosPago, empleados] = await Promise.all([
      reportesApi.getVentasResumen(filters),
      reportesApi.getVentasTendencia(filters),
      reportesApi.getVentasMetodosPago(filters),
      reportesApi.getVentasEmpleados(filters),
    ]);

    return { resumen, tendencia, metodosPago, empleados };
  },

  getProductosTab: async (
    filters: ReporteFiltros,
  ): Promise<ProductosTabData> => {
    const [masVendidos, menosVendidos, sinVentas] = await Promise.all([
      reportesApi.getProductosMasVendidos(filters),
      reportesApi.getProductosMenosVendidos(filters),
      reportesApi.getProductosSinVentas(filters),
    ]);

    return { masVendidos, menosVendidos, sinVentas };
  },

  getInventarioTab: async (
    filters: ReporteFiltros,
  ): Promise<InventarioTabData> => {
    const [resumen, critico, movimientos] = await Promise.all([
      reportesApi.getInventarioResumen(filters),
      reportesApi.getInventarioCritico(filters),
      reportesApi.getInventarioMovimientos(filters),
    ]);

    return { resumen, critico, movimientos };
  },

  getClientesTab: async (filters: ReporteFiltros): Promise<ClientesTabData> => {
    const [resumen, tendencia, frecuentes] = await Promise.all([
      reportesApi.getClientesResumen(filters),
      reportesApi.getClientesTendencia(filters),
      reportesApi.getClientesFrecuentes(filters),
    ]);

    return { resumen, tendencia, frecuentes };
  },

  getCreditoTab: async (filters: ReporteFiltros): Promise<CreditoTabData> => {
    const [resumen, cuentasCobrar] = await Promise.all([
      reportesApi.getCreditoResumen(filters),
      reportesApi.getCuentasCobrar(filters),
    ]);

    return { resumen, cuentasCobrar };
  },

  getApartadosTab: async (
    filters: ReporteFiltros,
  ): Promise<ApartadosTabData> => {
    const [resumen, detalle] = await Promise.all([
      reportesApi.getApartadosResumen(filters),
      reportesApi.getApartadosDetalle(filters),
    ]);

    return { resumen, detalle };
  },

  getFinancieroTab: async (
    filters: ReporteFiltros,
  ): Promise<FinancieroTabData> => {
    const [resumen, metodosPago] = await Promise.all([
      reportesApi.getFinancieroResumen(filters),
      reportesApi.getFinancieroMetodosPago(filters),
    ]);

    return { resumen, metodosPago };
  },

  getCortesTab: async (filters: ReporteFiltros): Promise<CortesTabData> => {
    const [resumen, detalle] = await Promise.all([
      reportesApi.getCortesResumen(filters),
      reportesApi.getCortesDetalle(filters),
    ]);

    return { resumen, detalle };
  },

  exportPdf: async (reporte: ReporteExportable, filters: ReporteFiltros) => {
    const blob = await apiFetchBlob(
      `${API_ENDPOINTS.reportes.export.pdf}${buildExportQuery(reporte, filters)}`,
    );

    downloadBlob(blob, buildPdfFilename(reporte, filters));
  },

  exportExcel: async (reporte: ReporteExportable, filters: ReporteFiltros) => {
    const blob = await apiFetchBlob(
      `${API_ENDPOINTS.reportes.export.excel}${buildExportQuery(reporte, filters)}`,
    );

    downloadBlob(blob, buildExportFilename(reporte, "xlsx", filters));
  },
};
