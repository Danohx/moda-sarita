export type ReporteGroupBy = "day" | "week" | "month";

export type ReporteValor = string | number | null;

export type ReporteFiltros = {
  from: string;
  to: string;
  groupBy: ReporteGroupBy;
  limit?: number;
  offset?: number;
  vendedorId?: string;
  tipo?: string;
  estado?: string;
  metodo?: string;
  categoriaId?: number;
  proveedorId?: number;
};

export type ApiOk<T> = {
  ok: boolean;
  data: T;
  message?: string;
  msg?: string;
};

export type ReporteVentasResumen = {
  ventas_totales?: ReporteValor;
  ingresos_confirmados?: ReporteValor;
  transacciones?: ReporteValor;
  ticket_promedio?: ReporteValor;
  productos_vendidos?: ReporteValor;
  descuentos_totales?: ReporteValor;
  costo_envio_total?: ReporteValor;
};

export type ReporteInventarioResumen = {
  productos_activos?: ReporteValor;
  variantes_activas?: ReporteValor;
  stock_fisico_total?: ReporteValor;
  stock_apartado_total?: ReporteValor;
  stock_disponible_total?: ReporteValor;
  valor_inventario?: ReporteValor;
  productos_bajo_stock?: ReporteValor;
  productos_sin_stock?: ReporteValor;
};

export type ReporteClientesResumen = {
  total_clientes?: ReporteValor;
  clientes_activos?: ReporteValor;
  clientes_nuevos?: ReporteValor;
  clientes_con_credito?: ReporteValor;
  clientes_con_saldo_deudor?: ReporteValor;
  saldo_deudor_total?: ReporteValor;
  credito_total_autorizado?: ReporteValor;
  clientes_pueden_apartar?: ReporteValor;
  clientes_con_compras_periodo?: ReporteValor;
  clientes_con_apartados_activos?: ReporteValor;
};

export type ReporteFinancieroResumen = {
  ingresos_confirmados?: ReporteValor;
  pagos_confirmados?: ReporteValor;
  efectivo?: ReporteValor;
  tarjeta?: ReporteValor;
  transferencia?: ReporteValor;
  credito_tienda?: ReporteValor;
  otros?: ReporteValor;
  cuentas_por_cobrar?: ReporteValor;
  cortes_cerrados?: ReporteValor;
  diferencia_cortes_total?: ReporteValor;
};

export type ReporteResumenGeneral = {
  ventas_totales?: ReporteValor;
  ingresos_confirmados?: ReporteValor;
  transacciones?: ReporteValor;
  ticket_promedio?: ReporteValor;
  productos_vendidos?: ReporteValor;
  clientes_nuevos?: ReporteValor;
  saldo_deudor_total?: ReporteValor;
  apartados_activos?: ReporteValor;
  apartados_vencidos?: ReporteValor;
  productos_bajo_stock?: ReporteValor;
  productos_sin_stock?: ReporteValor;
  valor_inventario?: ReporteValor;
  diferencia_cortes_total?: ReporteValor;
};

export type ReporteTendenciaVenta = {
  periodo: string;
  ventas_totales: ReporteValor;
  transacciones: ReporteValor;
  productos_vendidos: ReporteValor;
};

export type ReporteMetodoPago = {
  metodo: string;
  total: ReporteValor;
  transacciones?: ReporteValor;
  pagos?: ReporteValor;
};

export type ReporteVentasEmpleado = {
  vendedor_id: string | null;
  vendedor: string;
  ventas: ReporteValor;
  productos_vendidos: ReporteValor;
  total_vendido: ReporteValor;
  ticket_promedio: ReporteValor;
};

export type ReporteProducto = {
  producto_id: string;
  producto: string;
  sku: string | null;
  unidades_vendidas: ReporteValor;
  ingresos: ReporteValor;
  imagen_principal?: string | null;
};

export type ReporteProductoSinVenta = {
  producto_id: string;
  producto: string;
  sku: string | null;
  stock_disponible?: ReporteValor;
  precio_venta?: ReporteValor;
  imagen_principal?: string | null;
};

export type ReporteInventarioCritico = {
  producto_id: string;
  variante_id: string;
  producto: string;
  sku: string | null;
  categoria: string | null;
  stock_fisico: ReporteValor;
  stock_apartado: ReporteValor;
  stock_disponible: ReporteValor;
  stock_minimo: ReporteValor;
  bajo_stock: boolean;
  precio_costo?: ReporteValor;
  precio_venta?: ReporteValor;
  valor_costo?: ReporteValor;
  imagen_principal?: string | null;
};

export type ReporteMovimientosInventario = {
  movimientos?: ReporteValor;
  entradas_unidades?: ReporteValor;
  salidas_unidades?: ReporteValor;
  ajustes?: ReporteValor;
};

export type ReporteClienteFrecuente = {
  cliente_id: string;
  cliente: string;
  compras: ReporteValor;
  total_comprado: ReporteValor;
  ultima_compra: string | null;
};

export type ReporteClienteTendencia = {
  periodo: string;
  clientes_nuevos: ReporteValor;
};

export type ReporteCuentaCobrar = {
  cliente_id: string;
  cliente: string;
  telefono: string | null;
  email: string | null;
  limite_credito: ReporteValor;
  saldo_deudor: ReporteValor;
  credito_disponible?: ReporteValor;
};

export type ReporteApartadosResumen = {
  apartados_activos?: ReporteValor;
  apartados_liquidados?: ReporteValor;
  apartados_cancelados?: ReporteValor;
  apartados_vencidos?: ReporteValor;
  total_apartado?: ReporteValor;
  total_pagado?: ReporteValor;
  saldo_pendiente?: ReporteValor;
};

export type ReporteApartadoDetalle = {
  pedido_id: string;
  folio: ReporteValor;
  cliente_id: string | null;
  cliente: string | null;
  telefono?: string | null;
  estado: string;
  total: ReporteValor;
  total_pagado: ReporteValor;
  saldo_pendiente: ReporteValor;
  fecha_limite_apartado: string | null;
  fecha_creacion: string;
};

export type ReporteCortesResumen = {
  cortes_cerrados?: ReporteValor;
  total_sistema?: ReporteValor;
  total_real?: ReporteValor;
  diferencia_total?: ReporteValor;
  sobrantes?: ReporteValor;
  faltantes?: ReporteValor;
};

export type ReporteCorteDetalle = {
  corte_id: number;
  usuario_id: string | null;
  responsable: string;
  inicio_turno: string;
  fin_turno: string | null;
  total_sistema: ReporteValor;
  total_real: ReporteValor;
  diferencia: ReporteValor;
  fondo_inicial: ReporteValor;
  observaciones: string | null;
};

export type VentasTabData = {
  resumen: ReporteVentasResumen;
  tendencia: ReporteTendenciaVenta[];
  metodosPago: ReporteMetodoPago[];
  empleados: ReporteVentasEmpleado[];
};

export type ProductosTabData = {
  masVendidos: ReporteProducto[];
  menosVendidos: ReporteProducto[];
  sinVentas: ReporteProductoSinVenta[];
};

export type InventarioTabData = {
  resumen: ReporteInventarioResumen;
  critico: ReporteInventarioCritico[];
  movimientos: ReporteMovimientosInventario;
};

export type ClientesTabData = {
  resumen: ReporteClientesResumen;
  tendencia: ReporteClienteTendencia[];
  frecuentes: ReporteClienteFrecuente[];
};

export type CreditoTabData = {
  resumen: ReporteFinancieroResumen;
  cuentasCobrar: ReporteCuentaCobrar[];
};

export type ApartadosTabData = {
  resumen: ReporteApartadosResumen;
  detalle: ReporteApartadoDetalle[];
};

export type FinancieroTabData = {
  resumen: ReporteFinancieroResumen;
  metodosPago: ReporteMetodoPago[];
};

export type CortesTabData = {
  resumen: ReporteCortesResumen;
  detalle: ReporteCorteDetalle[];
};

export type ReporteTabData =
  | VentasTabData
  | ProductosTabData
  | InventarioTabData
  | ClientesTabData
  | CreditoTabData
  | ApartadosTabData
  | FinancieroTabData
  | CortesTabData;

export type ReporteExportable =
  | "ventas"
  | "productos"
  | "inventario"
  | "clientes"
  | "credito"
  | "apartados"
  | "financiero"
  | "cortes";

export type ReporteExportFormato = "pdf" | "excel";