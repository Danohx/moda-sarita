import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type DashboardRangeKey = "today" | "7d" | "30d" | "month" | "custom";

export type DashboardRange = {
  key: DashboardRangeKey;
  from: string;
  to: string;
};

export type DashboardResumen = {
  ingresosHoy: number;
  ventasHoy: number;
  ticketPromedioHoy: number;

  ingresosPeriodo?: number;
  ventasPeriodo?: number;
  ticketPromedioPeriodo?: number;
  pagosPeriodo?: number;

  apartadosActivos: number;
  apartadosPorVencer: number;
  apartadosVencidos: number;

  productosBajoStock: number;
  variantesBajoStock: number;
  variantesSinStock: number;

  productosActivos: number;
  clientesTotales: number;

  cajasAbiertas: number;
  ultimoCorteAt: string | null;
};

export type DashboardCajaActual = {
  abierta: boolean;
  corteId: number | string | null;
  usuarioId: string | null;
  usuarioNombre: string | null;
  inicioTurno: string | null;
  fondoInicial: number;
  totalSistema: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  ventasTurno: number;
  ultimoMovimientoAt: string | null;
};

export type DashboardVentaDia = {
  fecha: string;
  totalIngresos: number;
  pedidosPagados: number;
};

export type DashboardTopProducto = {
  productoId: string;
  nombre: string;
  imagenPrincipal: string | null;
  unidadesVendidas: number;
  totalVendido: number;
};

export type DashboardActividad = {
  tipo: "PEDIDO" | "PAGO" | "INVENTARIO" | "CLIENTE" | "CORTE_CAJA" | string;
  titulo: string;
  detalle: string;
  referenciaId: string;
  fecha: string;
};

export type DashboardAlerta = {
  tipo: "BAJO_STOCK" | "APARTADO_POR_VENCER" | "APARTADO_VENCIDO" | string;
  severidad: "alta" | "media" | "baja" | string;
  titulo: string;
  detalle: string;
  referenciaId: string;
  fecha: string;
};

export type DashboardProductoCritico = {
  tipo: "SIN_STOCK" | "BAJO_STOCK" | "SIN_IMAGEN" | "SIN_CATEGORIA" | string;
  severidad: "alta" | "media" | "baja" | string;
  productoId: string;
  varianteId: string | null;
  nombre: string;
  detalle: string;
  stockDisponible: number | null;
  fecha: string | null;
  prioridad: number;
};

export type DashboardData = {
  range: DashboardRange;
  resumen: DashboardResumen;
  cajaActual: DashboardCajaActual;
  ventasUltimos7Dias: DashboardVentaDia[];
  topProductos: DashboardTopProducto[];
  actividadReciente: DashboardActividad[];
  alertasOperativas: DashboardAlerta[];
  productosCriticos: DashboardProductoCritico[];
};

export type DashboardQuery = {
  range?: DashboardRangeKey;
  from?: string;
  to?: string;
  topLimit?: number;
  actividadLimit?: number;
  alertasLimit?: number;
  productosCriticosLimit?: number;
};

type DashboardResponse = {
  ok: boolean;
  data: DashboardData;
};

export const dashboardApi = {
  getData: (query?: DashboardQuery) =>
    apiFetch<DashboardResponse>(API_ENDPOINTS.dashboard.data, {
      method: "GET",
      query,
    }),
};