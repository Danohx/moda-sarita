import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ApiResponse<T> = {
  ok: boolean;
  msg?: string;
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type EstadoSuscripcion = "ACTIVO" | "BAJA" | "BLOQUEADO";
export type CanalCupon = "POS" | "WEB" | "AMBOS";
export type AplicaCupon = "PEDIDO" | "PRODUCTO" | "CATEGORIA";
export type TipoPlantilla = "MARKETING" | "TRANSACCIONAL";

export type SuscripcionMarketing = {
  id: string;
  email: string;
  nombre?: string | null;
  telefono?: string | null;
  origen: string;
  estado: EstadoSuscripcion;
  acepta_marketing: boolean;
  fecha_registro?: string | null;
  fecha_baja?: string | null;
  motivo_baja?: string | null;
  notas_admin?: string | null;
  created_at: string;
  updated_at: string;
};

export type CuponMarketing = {
  id: string;
  codigo: string;
  nombre?: string | null;
  descripcion?: string | null;
  tipo_descuento: string;
  valor: string | number;
  monto_minimo_compra: string | number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  canal: CanalCupon;
  aplica_a: AplicaCupon;
  uso_maximo?: number | null;
  usos_actuales: number;
  uso_maximo_por_cliente?: number | null;
  acumulable: boolean;
  solo_clientes_registrados: boolean;
  estado_calculado: string;
  created_at: string;
  updated_at: string;
};

export type SegmentoMarketing = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  criterios: Record<string, unknown>;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type PlantillaEmailMarketing = {
  id: string;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  tipo: TipoPlantilla;
  asunto: string;
  preheader?: string | null;
  cuerpo_html: string;
  cuerpo_texto?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

function buildQuery(
  params?: Record<string, string | number | boolean | null | undefined>,
) {
  const search = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

// ============================================================
// SUSCRIPTORES
// ============================================================

export async function fetchSuscripcionesMarketing(params?: {
  estado?: EstadoSuscripcion | "";
  q?: string;
  limit?: number;
  offset?: number;
}) {
  return apiFetch<ApiResponse<SuscripcionMarketing[]>>(
    `${API_ENDPOINTS.marketing.suscripciones}${buildQuery(params)}`,
  );
}

export async function createSuscripcionMarketing(payload: {
  email: string;
  nombre?: string | null;
  telefono?: string | null;
  origen?: string;
  estado?: EstadoSuscripcion;
  acepta_marketing?: boolean;
  notas_admin?: string | null;
}) {
  return apiFetch<ApiResponse<SuscripcionMarketing>>(
    API_ENDPOINTS.marketing.suscripciones,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateSuscripcionMarketing(
  id: string,
  payload: {
    nombre?: string | null;
    telefono?: string | null;
    acepta_marketing?: boolean;
    notas_admin?: string | null;
  },
) {
  return apiFetch<ApiResponse<SuscripcionMarketing>>(
    API_ENDPOINTS.marketing.suscripcionById(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function updateSuscripcionStatusMarketing(
  id: string,
  estado: EstadoSuscripcion,
  motivo_baja?: string | null,
) {
  return apiFetch<ApiResponse<SuscripcionMarketing>>(
    API_ENDPOINTS.marketing.suscripcionStatus(id),
    {
      method: "PATCH",
      body: { estado, motivo_baja },
    },
  );
}

// ============================================================
// CUPONES
// ============================================================

export async function fetchCuponesMarketing(params?: {
  estado?: string;
  canal?: CanalCupon | "";
  q?: string;
  limit?: number;
  offset?: number;
}) {
  return apiFetch<ApiResponse<CuponMarketing[]>>(
    `${API_ENDPOINTS.marketing.cupones}${buildQuery(params)}`,
  );
}

export async function createCuponMarketing(payload: {
  codigo: string;
  nombre?: string | null;
  descripcion?: string | null;
  tipo_descuento: string;
  valor: number;
  monto_minimo_compra?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo?: boolean;
  canal?: CanalCupon;
  aplica_a?: AplicaCupon;
  uso_maximo?: number | null;
  uso_maximo_por_cliente?: number | null;
  acumulable?: boolean;
  solo_clientes_registrados?: boolean;
}) {
  return apiFetch<ApiResponse<CuponMarketing>>(
    API_ENDPOINTS.marketing.cupones,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateCuponMarketing(
  id: string,
  payload: Partial<{
    nombre: string | null;
    descripcion: string | null;
    tipo_descuento: string;
    valor: number;
    monto_minimo_compra: number;
    fecha_inicio: string;
    fecha_fin: string;
    canal: CanalCupon;
    aplica_a: AplicaCupon;
    uso_maximo: number | null;
    uso_maximo_por_cliente: number | null;
    acumulable: boolean;
    solo_clientes_registrados: boolean;
  }>,
) {
  return apiFetch<ApiResponse<CuponMarketing>>(
    API_ENDPOINTS.marketing.cuponById(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function updateCuponStatusMarketing(id: string, activo: boolean) {
  return apiFetch<ApiResponse<CuponMarketing>>(
    API_ENDPOINTS.marketing.cuponStatus(id),
    {
      method: "PATCH",
      body: { activo },
    },
  );
}

// ============================================================
// SEGMENTOS
// ============================================================

export async function fetchSegmentosMarketing(params?: {
  activo?: boolean | "";
  q?: string;
  limit?: number;
  offset?: number;
}) {
  return apiFetch<ApiResponse<SegmentoMarketing[]>>(
    `${API_ENDPOINTS.marketing.segmentos}${buildQuery(params)}`,
  );
}

export async function createSegmentoMarketing(payload: {
  nombre: string;
  descripcion?: string | null;
  criterios?: Record<string, unknown>;
  activo?: boolean;
}) {
  return apiFetch<ApiResponse<SegmentoMarketing>>(
    API_ENDPOINTS.marketing.segmentos,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateSegmentoMarketing(
  id: string,
  payload: Partial<{
    nombre: string;
    descripcion: string | null;
    criterios: Record<string, unknown>;
    activo: boolean;
  }>,
) {
  return apiFetch<ApiResponse<SegmentoMarketing>>(
    API_ENDPOINTS.marketing.segmentoById(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

// ============================================================
// PLANTILLAS
// ============================================================

export async function fetchPlantillasMarketing(params?: {
  tipo?: TipoPlantilla | "";
  activo?: boolean | "";
  q?: string;
  limit?: number;
  offset?: number;
}) {
  return apiFetch<ApiResponse<PlantillaEmailMarketing[]>>(
    `${API_ENDPOINTS.marketing.plantillas}${buildQuery(params)}`,
  );
}

export async function createPlantillaMarketing(payload: {
  clave: string;
  nombre: string;
  descripcion?: string | null;
  tipo?: TipoPlantilla;
  asunto: string;
  preheader?: string | null;
  cuerpo_html?: string;
  cuerpo_texto?: string | null;
  activo?: boolean;
}) {
  return apiFetch<ApiResponse<PlantillaEmailMarketing>>(
    API_ENDPOINTS.marketing.plantillas,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updatePlantillaMarketing(
  id: string,
  payload: Partial<{
    nombre: string;
    descripcion: string | null;
    tipo: TipoPlantilla;
    asunto: string;
    preheader: string | null;
    cuerpo_html: string;
    cuerpo_texto: string | null;
    activo: boolean;
  }>,
) {
  return apiFetch<ApiResponse<PlantillaEmailMarketing>>(
    API_ENDPOINTS.marketing.plantillaById(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function sendPlantillaTestMarketing(
  id: string,
  email_destino: string,
) {
  return apiFetch<ApiResponse<unknown>>(
    API_ENDPOINTS.marketing.plantillaTestSend(id),
    {
      method: "POST",
      body: { email_destino },
    },
  );
}