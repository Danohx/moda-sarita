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

export type ContactoEstado = "NUEVO" | "LEIDO" | "RESPONDIDO" | "ARCHIVADO";

export type ContactoMensaje = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  asunto: string;
  mensaje: string;
  estado: ContactoEstado;

  captcha_ok: boolean;
  captcha_provider?: string | null;
  captcha_score?: string | number | null;
  honeypot_detected: boolean;

  notificado_admin: boolean;
  notificado_admin_en?: string | null;
  notificacion_error?: string | null;

  leido_en?: string | null;
  respondido_en?: string | null;
  archivado_en?: string | null;

  notas_admin?: string | null;
  respuesta_admin?: string | null;

  actualizado_por_email?: string | null;
  respondido_por_email?: string | null;

  created_at: string;
  updated_at: string;
};

export type ContactoListParams = {
  estado?: ContactoEstado | "";
  q?: string;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
};

export type CrearMensajeContactoPayload = {
  nombre: string;
  email: string;
  telefono?: string | null;
  asunto: string;
  mensaje: string;
  captchaToken?: string | null;

  // honeypot
  website?: string;
};

export type ContactoResumen = {
  nuevos: number;
  leidos: number;
  respondidos: number;
  archivados: number;
  total: number;
};

function buildQuery(params?: ContactoListParams) {
  const search = new URLSearchParams();

  if (params?.estado) search.set("estado", params.estado);
  if (params?.q) search.set("q", params.q);
  if (params?.includeArchived !== undefined) {
    search.set("includeArchived", String(params.includeArchived));
  }
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));

  return search.toString();
}

export async function fetchMensajesContactoAdmin(params?: ContactoListParams) {
  const query = buildQuery(params);

  return apiFetch<ApiResponse<ContactoMensaje[]>>(
    `${API_ENDPOINTS.contacto.mensajesAdmin}${query ? `?${query}` : ""}`,
  );
}

export async function fetchMensajeContactoById(id: string) {
  return apiFetch<ApiResponse<ContactoMensaje>>(
    API_ENDPOINTS.contacto.mensajeById(id),
  );
}

export async function updateMensajeContactoStatus(
  id: string,
  estado: ContactoEstado,
) {
  return apiFetch<ApiResponse<ContactoMensaje>>(
    API_ENDPOINTS.contacto.mensajeStatus(id),
    {
      method: "PATCH",
      body: { estado },
    },
  );
}

export async function updateMensajeContactoNotas(
  id: string,
  notas_admin: string | null,
) {
  return apiFetch<ApiResponse<ContactoMensaje>>(
    API_ENDPOINTS.contacto.mensajeNotas(id),
    {
      method: "PATCH",
      body: { notas_admin },
    },
  );
}

export async function responderMensajeContacto(
  id: string,
  respuesta_admin: string,
) {
  return apiFetch<ApiResponse<ContactoMensaje>>(
    API_ENDPOINTS.contacto.mensajeResponder(id),
    {
      method: "POST",
      body: { respuesta_admin },
    },
  );
}

export async function crearMensajeContactoPublico(
  payload: CrearMensajeContactoPayload,
) {
  return apiFetch<ApiResponse<{ id: string }>>(
    API_ENDPOINTS.contacto.mensajePublico,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function fetchResumenMensajesContactoAdmin() {
  return apiFetch<ApiResponse<ContactoResumen>>(
    API_ENDPOINTS.contacto.mensajesResumen,
  );
}