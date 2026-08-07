import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type EvaluacionCreditoData = {
  cliente: {
    id: string;
    nombre: string;
    credito_actual: boolean;
  };
  fecha_evaluacion: string;
  resultado: "RECOMENDADO" | "NO_RECOMENDADO";
  clase: number;
  probabilidad: number;
  modelo: string;
  caracteristicas_utilizadas: string[];
  resumen: {
    total_compras_historicas: number;
    gasto_total_historico: number;
    ticket_promedio_historico: number;
    meses_con_compra_historicos: number;
    porcentaje_meses_activos: number;
    dias_desde_ultima_compra: number;
  };
};

export type PrediccionVentasData = {
  producto: {
    id: string;
    nombre: string;
    categoria: string;
  };
  fecha_corte: string;
  mes_objetivo: string;
  monto_mes_actual: number;
  cambio_estimado: number;
  monto_estimado: number;
  modelo: string;
  r2_modelo: number;
  r2_baseline: number;
};

type EvaluacionCreditoResponse = {
  ok: boolean;
  data: EvaluacionCreditoData;
};

type PrediccionVentasResponse = {
  ok: boolean;
  data: PrediccionVentasData;
};

type HealthResponse = {
  ok: boolean;
  data: {
    status: string;
    modelos: {
      clasificacion: string;
      regresion: string;
    };
  };
};

export const analiticaApi = {
  health: () =>
    apiFetch<HealthResponse>(
      API_ENDPOINTS.analitica.health,
      {
        method: "GET",
      },
    ),

  evaluarCredito: (
    clienteId: string | number,
  ) =>
    apiFetch<EvaluacionCreditoResponse>(
      API_ENDPOINTS.analitica.creditoCliente(
        clienteId,
      ),
      {
        method: "POST",
      },
    ),

  predecirVentas: (
    productoId: string | number,
  ) =>
    apiFetch<PrediccionVentasResponse>(
      API_ENDPOINTS.analitica.ventasProducto(
        productoId,
      ),
      {
        method: "POST",
      },
    ),
};
