export type EstadoCredito =
  | "ACTIVO"
  | "EN_MORA"
  | "LIQUIDADO"
  | "INCUMPLIDO"
  | "CANCELADO";

export type EstadoCuotaCredito =
  | "PENDIENTE"
  | "PARCIAL"
  | "PAGADA"
  | "VENCIDA"
  | "CONDONADA";

export type FrecuenciaPagoCredito = "SEMANAL" | "QUINCENAL" | "MENSUAL";
export type OrigenCredito = "POS" | "ADMIN" | "MIGRACION_LEGACY";

export type CreditoResumen = {
  credito_id: string;
  cliente_id: string;
  cliente_nombre: string;
  telefono?: string | null;
  email?: string | null;
  pedido_id?: string | null;
  pedido_folio?: string | number | null;
  monto_compra: number;
  enganche: number;
  monto_financiado: number;
  saldo_pendiente: number;
  plazo_meses?: number | null;
  frecuencia_pago?: FrecuenciaPagoCredito | null;
  numero_cuotas?: number | null;
  fecha_otorgamiento: string;
  fecha_primer_vencimiento?: string | null;
  fecha_vencimiento_final?: string | null;
  fecha_liquidacion?: string | null;
  estado: EstadoCredito;
  dias_gracia: number;
  origen: OrigenCredito;
  datos_calendario_completos: boolean;
  proximo_vencimiento?: string | null;
  monto_proxima_cuota?: number | null;
  cuotas_vencidas: number;
  total_vencido: number;
  dias_maximos_atraso: number;
  cuotas_pagadas: number;
  total_cuotas_registradas: number;
  created_at?: string;
  updated_at?: string;
};

export type CreditoCuota = {
  id: string;
  credito_id: string;
  numero_cuota: number;
  fecha_vencimiento: string;
  monto_programado: number;
  monto_pagado: number;
  monto_condonado: number;
  saldo_pendiente: number;
  fecha_pago_completo?: string | null;
  estado: EstadoCuotaCredito;
  created_at?: string;
  updated_at?: string;
};

export type AplicacionPagoCredito = {
  aplicacion_id: string;
  cuota_id: string;
  monto_aplicado: number;
  fecha_aplicacion: string;
};

export type PagoCredito = {
  id: string;
  pedido_id?: string | null;
  credito_id: string;
  monto: number;
  metodo: string;
  referencia_externa?: string | null;
  fecha_pago: string;
  concepto: string;
  estado: string;
  usuario_id?: string | null;
  aplicaciones: AplicacionPagoCredito[];
};

export type MovimientoCreditoDetalle = {
  id: string;
  cliente_id: string;
  usuario_id?: string | null;
  pedido_id?: string | null;
  pago_id?: string | null;
  credito_id?: string | null;
  cuota_id?: string | null;
  fecha: string;
  tipo: string;
  descripcion: string;
  monto: number;
  saldo_anterior: number;
  saldo_resultante: number;
  metodo_pago?: string | null;
  referencia_externa?: string | null;
  observaciones?: string | null;
  created_at?: string;
};

export type CreditoDetalle = {
  credito: CreditoResumen;
  cuotas: CreditoCuota[];
  pagos: PagoCredito[];
  movimientos: MovimientoCreditoDetalle[];
};

export type CalendarioSimulado = {
  numero_cuota: number;
  fecha_vencimiento: string;
  monto_programado: number;
  monto_pagado: number;
  monto_condonado: number;
  saldo_pendiente: number;
  estado: EstadoCuotaCredito;
};

export type ElegibilidadCredito = {
  apto: boolean;
  limite_credito: number;
  saldo_deudor: number;
  credito_disponible: number;
  creditos_activos: number;
  cuotas_vencidas: number;
  creditos_en_mora: number;
  creditos_incumplidos: number;
  validaciones_incumplidas: string[];
};

export type SimulacionCreditoPayload = {
  cliente_id: string;
  total_compra: number;
  enganche: number;
  plazo_meses: number;
  frecuencia_pago: FrecuenciaPagoCredito;
  fecha_primer_vencimiento: string;
};

export type SimulacionCredito = {
  total_compra: number;
  enganche: number;
  monto_financiado: number;
  porcentaje_enganche: number;
  plazo_meses: number;
  frecuencia_pago: FrecuenciaPagoCredito;
  numero_cuotas: number;
  fecha_primer_vencimiento: string;
  fecha_vencimiento_final: string;
  dias_gracia: number;
  calendario: CalendarioSimulado[];
  cliente: {
    cliente_id: string;
    cliente_nombre: string;
    limite_credito: number;
    saldo_deudor: number;
    credito_disponible: number;
  };
  elegibilidad: ElegibilidadCredito;
  validaciones_incumplidas: string[];
};

export type CreditoFilters = {
  cliente_id?: string;
  estado?: EstadoCredito | "";
  fecha_desde?: string;
  fecha_hasta?: string;
  con_cuotas_vencidas?: boolean;
  datos_calendario_completos?: boolean;
  limit?: number;
  offset?: number;
};

export type AbonoCreditoPayload = {
  monto: number;
  metodo_pago: string;
  referencia_externa?: string | null;
  observaciones?: string | null;
};

export type AbonoCreditoResult = {
  pago: PagoCredito;
  aplicaciones: Array<{
    cuotaId: string;
    numeroCuota: number;
    montoAplicado: number;
    saldoCuotaAntes: number;
    aplicacion?: AplicacionPagoCredito;
  }>;
  credito: CreditoResumen;
  saldo_global_cliente: number;
  comprobante_url: string;
};

export type ProcesamientoVencimientos = {
  fecha_proceso?: string;
  cuotas_vencidas?: number;
  creditos_en_mora?: number;
  creditos_incumplidos?: number;
  [key: string]: unknown;
};

export type ReporteCreditoOperativo = {
  resumen: {
    creditos_activos: number;
    creditos_en_mora: number;
    creditos_incumplidos: number;
    creditos_liquidados_periodo: number;
    monto_financiado_periodo: number;
    saldo_pendiente_total: number;
    saldo_vencido_total: number;
    cobranza_periodo: number;
    enganches_periodo: number;
    abonos_periodo: number;
    tasa_recuperacion: number;
  };
  cuentasCobrar: CreditoResumen[];
};

export type ReporteFinancieroCredito = {
  ventas_realizadas: number;
  dinero_cobrado: number;
  monto_financiado: number;
  saldo_pendiente: number;
  saldo_vencido: number;
  cobranza_credito: number;
  enganches_credito: number;
  abonos_credito: number;
};

export type UltimaEjecucionVencimientos = {
  id: number;
  origen: "MANUAL" | "CRON";
  fecha_objetivo: string;
  iniciado_at: string;
  finalizado_at?: string | null;
  exitoso: boolean;
  resultado?: ProcesamientoVencimientos | null;
  error_message?: string | null;
  ejecutado_por?: string | null;
};
