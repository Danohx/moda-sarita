import {
  dashboardApi,
  type DashboardData,
  type DashboardQuery,
} from "../../../../shared/api/dashboard.api";

const emptyDashboardData: DashboardData = {
  range: {
    key: "7d",
    from: "",
    to: "",
  },
  resumen: {
    ingresosHoy: 0,
    ventasHoy: 0,
    ticketPromedioHoy: 0,

    ingresosPeriodo: 0,
    ventasPeriodo: 0,
    ticketPromedioPeriodo: 0,
    pagosPeriodo: 0,

    apartadosActivos: 0,
    apartadosPorVencer: 0,
    apartadosVencidos: 0,

    productosBajoStock: 0,
    variantesBajoStock: 0,
    variantesSinStock: 0,

    productosActivos: 0,
    clientesTotales: 0,

    cajasAbiertas: 0,
    ultimoCorteAt: null,
  },
  cajaActual: {
    abierta: false,
    corteId: null,
    usuarioId: null,
    usuarioNombre: null,
    inicioTurno: null,
    fondoInicial: 0,
    totalSistema: 0,
    totalEfectivo: 0,
    totalTarjeta: 0,
    totalTransferencia: 0,
    ventasTurno: 0,
    ultimoMovimientoAt: null,
  },
  ventasUltimos7Dias: [],
  topProductos: [],
  actividadReciente: [],
  alertasOperativas: [],
  productosCriticos: [],
};

export const dashboardService = {
  async getData(query?: DashboardQuery) {
    const response = await dashboardApi.getData(query);
    return response.data ?? emptyDashboardData;
  },
};