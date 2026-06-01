import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type PrediccionPeriodoEstado = "FUTURA" | "EN_CURSO" | "FINALIZADA";
export type PrediccionModoTemporada = "DIRIGIDA" | "AUTOMATICA_ETIQUETA_PRODUCTO";
export type PrediccionInterpretacion = "CRECIMIENTO" | "DECRECIMIENTO" | "ESTABLE";

export type PrediccionFilters = {
  temporada_id?: string | number;
  variante_id?: string | number;
  anio_objetivo?: number;
  from_year?: number;
  history_years?: number;
  margen_seguridad?: number;
};

export type PrediccionProducto = {
  id: string;
  nombre: string;
  categoria_id: number | null;
  categoria_nombre: string | null;
};

export type PrediccionVariante = {
  id: string;
  sku: string | null;
  talla_id: number | null;
  talla_nombre: string | null;
  color_id: number | null;
  color_nombre: string | null;
};

export type PrediccionTemporada = {
  id: number;
  nombre: string;
  modo: PrediccionModoTemporada;
  periodo_objetivo?: {
    anio: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: PrediccionPeriodoEstado;
    fuente: string;
  };
};

export type PrediccionParametros = {
  anio_objetivo: number;
  from_year: number | null;
  history_years: number;
  fuente_periodos: string;
  margen_seguridad: number;
  estados_venta_considerados?: string[];
};

export type PrediccionHistorialItem = {
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  ventas: number;
};

export type PrediccionHistorialCalculadoItem = PrediccionHistorialItem & {
  t_relativo: number;
};

export type PrediccionModelo = {
  nombre: string;
  ecuacion_base: string;
  ecuacion_final: string;
  ecuacion_aplicada: string;
  V0: number;
  Vf: number;
  anio_inicial: number;
  anio_final_historico: number;
  t: number;
  t_objetivo: number;
  k: number;
  interpretacion: PrediccionInterpretacion;
};

export type PrediccionResultado = {
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado_temporada: PrediccionPeriodoEstado;
  demanda_estimada: number;
  demanda_estimada_redondeada: number;
  ventas_reales_objetivo: number;
  demanda_restante_estimada: number;
  error_absoluto: number | null;
  error_porcentual: number | null;
};

export type PrediccionInventario = {
  stock_fisico: number;
  stock_apartado: number;
  stock_disponible: number;
  margen_seguridad: number;
  stock_necesario_con_margen: number;
  unidades_a_preparar: number;
  recomendacion: string;
};

export type PrediccionData = {
  producto: PrediccionProducto;
  variante: PrediccionVariante | null;
  temporada: PrediccionTemporada;
  parametros: PrediccionParametros;
  historial: PrediccionHistorialItem[];
  proyecciones_intermedias?: PrediccionProyeccionIntermedia[];
  historial_calculado?: PrediccionHistorialCalculadoItem[];
  modelo: PrediccionModelo | null;
  prediccion: PrediccionResultado | null;
  inventario: PrediccionInventario | null;
  message: string | null;
};

export type PrediccionProyeccionIntermedia = {
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  t_relativo: number;
  demanda_estimada: number;
  demanda_estimada_redondeada: number;
  tipo: "INTERMEDIA";
};

type PrediccionResponse = {
  ok: boolean;
  data: PrediccionData | null;
  msg?: string;
  detail?: string;
};

export const prediccionesApi = {
  getByProducto: (productoId: string | number, filters?: PrediccionFilters) =>
    apiFetch<PrediccionResponse>(API_ENDPOINTS.predicciones.producto(productoId), {
      method: "GET",
      query: filters,
    }),
};
