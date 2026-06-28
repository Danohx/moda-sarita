import { reportesApi, type ReporteFiltros } from "@shared/api/reportes.api";

export const reportesService = {
  getResumenGeneral(filters: ReporteFiltros) {
    return reportesApi.getResumen(filters);
  },

  getReporteVentas(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getVentasResumen(filters),
      reportesApi.getVentasTendencia(filters),
      reportesApi.getVentasMetodosPago(filters),
      reportesApi.getVentasEmpleados(filters),
    ]);
  },

  getReporteProductos(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getProductosMasVendidos(filters),
      reportesApi.getProductosMenosVendidos(filters),
      reportesApi.getProductosSinVentas(filters),
    ]);
  },

  getReporteInventario(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getInventarioResumen(filters),
      reportesApi.getInventarioCritico(filters),
      reportesApi.getInventarioMovimientos(filters),
    ]);
  },

  getReporteClientes(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getClientesResumen(filters),
      reportesApi.getClientesTendencia(filters),
      reportesApi.getClientesFrecuentes(filters),
    ]);
  },

  getReporteCredito(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getCreditoResumen(filters),
      reportesApi.getCuentasCobrar(filters),
    ]);
  },

  getReporteApartados(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getApartadosResumen(filters),
      reportesApi.getApartadosDetalle(filters),
    ]);
  },

  getReporteFinanciero(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getFinancieroResumen(filters),
      reportesApi.getFinancieroMetodosPago(filters),
    ]);
  },

  getReporteCortes(filters: ReporteFiltros) {
    return Promise.all([
      reportesApi.getCortesResumen(filters),
      reportesApi.getCortesDetalle(filters),
    ]);
  },
};