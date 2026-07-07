import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ApiResponse<T> = {
  ok: boolean;
  msg?: string;
  data: T;
};

export type ContenidoPagina = {
  id: string;
  clave: string;
  titulo: string;
  resumen?: string | null;
  contenido_html: string;
  contenido_texto?: string | null;
  activo: boolean;
  publicado: boolean;
  version_actual: number;
  publicado_en?: string | null;
  despublicado_en?: string | null;
  creado_por?: string | null;
  actualizado_por?: string | null;
  created_at: string;
  updated_at: string;
};

export type ContenidoPaginaPublica = {
  id: string;
  clave: string;
  titulo: string;
  resumen?: string | null;
  contenido_html: string;
  contenido_texto?: string | null;
  version_actual: number;
  publicado_en?: string | null;
  updated_at: string;
};

export type ContenidoPaginaVersion = {
  id: string;
  pagina_id: string;
  numero_version: number;
  titulo: string;
  resumen?: string | null;
  contenido_html: string;
  contenido_texto?: string | null;
  activo: boolean;
  publicado: boolean;
  accion: "BORRADOR" | "PUBLICACION" | "DESPUBLICACION" | "RESTAURACION";
  creado_por?: string | null;
  created_at: string;
};

export type ContenidoFaq = {
  id: string;
  pregunta: string;
  respuesta_html: string;
  respuesta_texto?: string | null;
  orden: number;
  activo: boolean;
  publicado: boolean;
  creado_por?: string | null;
  actualizado_por?: string | null;
  created_at: string;
  updated_at: string;
};

export type ContenidoFaqPublica = {
  id: string;
  pregunta: string;
  respuesta_html: string;
  respuesta_texto?: string | null;
  orden: number;
  updated_at: string;
};

export type CreatePaginaPayload = {
  clave: string;
  titulo: string;
  resumen?: string | null;
  contenido_html?: string;
  contenido_texto?: string | null;
};

export type UpdatePaginaPayload = {
  titulo?: string;
  resumen?: string | null;
  contenido_html?: string;
  contenido_texto?: string | null;
};

export type CreateFaqPayload = {
  pregunta: string;
  respuesta_html?: string;
  respuesta_texto?: string | null;
  orden?: number | null;
};

export type UpdateFaqPayload = {
  pregunta?: string;
  respuesta_html?: string;
  respuesta_texto?: string | null;
  orden?: number;
};

export type ReorderFaqPayload = {
  items: Array<{
    id: string;
    orden: number;
  }>;
};

export async function fetchPaginasAdmin(params?: {
  q?: string;
  includeInactive?: boolean;
}) {
  const search = new URLSearchParams();

  if (params?.q) search.set("q", params.q);
  if (params?.includeInactive !== undefined) {
    search.set("includeInactive", String(params.includeInactive));
  }

  const url = `${API_ENDPOINTS.contenido.paginasAdmin}${
    search.toString() ? `?${search.toString()}` : ""
  }`;

  return apiFetch<ApiResponse<ContenidoPagina[]>>(url);
}

export async function fetchPaginaAdminByClave(clave: string) {
  return apiFetch<ApiResponse<ContenidoPagina>>(
    API_ENDPOINTS.contenido.paginaAdminByClave(clave),
  );
}

export async function fetchPaginaAdminById(id: string) {
  return apiFetch<ApiResponse<ContenidoPagina>>(
    API_ENDPOINTS.contenido.paginaAdminById(id),
  );
}

export async function createPaginaAdmin(payload: CreatePaginaPayload) {
  return apiFetch<ApiResponse<ContenidoPagina>>(
    API_ENDPOINTS.contenido.paginasAdmin,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updatePaginaAdmin(
  id: string,
  payload: UpdatePaginaPayload,
) {
  return apiFetch<ApiResponse<ContenidoPagina>>(
    API_ENDPOINTS.contenido.paginaById(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function updatePaginaStatusAdmin(id: string, activo: boolean) {
  return apiFetch<ApiResponse<ContenidoPagina>>(
    API_ENDPOINTS.contenido.paginaStatus(id),
    {
      method: "PATCH",
      body: { activo },
    },
  );
}

export async function updatePaginaPublicacionAdmin(
  id: string,
  publicado: boolean,
) {
  return apiFetch<ApiResponse<ContenidoPagina>>(
    API_ENDPOINTS.contenido.paginaPublicacion(id),
    {
      method: "PATCH",
      body: { publicado },
    },
  );
}

export async function fetchPaginaVersionesAdmin(id: string) {
  return apiFetch<ApiResponse<ContenidoPaginaVersion[]>>(
    API_ENDPOINTS.contenido.paginaVersiones(id),
  );
}

export async function restaurarPaginaVersionAdmin(
  id: string,
  versionId: string,
) {
  return apiFetch<ApiResponse<ContenidoPagina>>(
    API_ENDPOINTS.contenido.restaurarPaginaVersion(id, versionId),
    {
      method: "POST",
    },
  );
}

export async function fetchPaginaPublica(clave: string) {
  return apiFetch<ApiResponse<ContenidoPaginaPublica>>(
    API_ENDPOINTS.contenido.paginaPublica(clave),
  );
}

export async function fetchFaqsAdmin(params?: {
  q?: string;
  includeInactive?: boolean;
}) {
  const search = new URLSearchParams();

  if (params?.q) search.set("q", params.q);
  if (params?.includeInactive !== undefined) {
    search.set("includeInactive", String(params.includeInactive));
  }

  const url = `${API_ENDPOINTS.contenido.faqsAdmin}${
    search.toString() ? `?${search.toString()}` : ""
  }`;

  return apiFetch<ApiResponse<ContenidoFaq[]>>(url);
}

export async function createFaqAdmin(payload: CreateFaqPayload) {
  return apiFetch<ApiResponse<ContenidoFaq>>(
    API_ENDPOINTS.contenido.faqsAdmin,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateFaqAdmin(id: string, payload: UpdateFaqPayload) {
  return apiFetch<ApiResponse<ContenidoFaq>>(
    API_ENDPOINTS.contenido.faqById(id),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function updateFaqStatusAdmin(id: string, activo: boolean) {
  return apiFetch<ApiResponse<ContenidoFaq>>(
    API_ENDPOINTS.contenido.faqStatus(id),
    {
      method: "PATCH",
      body: { activo },
    },
  );
}

export async function updateFaqPublicacionAdmin(
  id: string,
  publicado: boolean,
) {
  return apiFetch<ApiResponse<ContenidoFaq>>(
    API_ENDPOINTS.contenido.faqPublicacion(id),
    {
      method: "PATCH",
      body: { publicado },
    },
  );
}

export async function reorderFaqsAdmin(payload: ReorderFaqPayload) {
  return apiFetch<ApiResponse<ContenidoFaq[]>>(
    API_ENDPOINTS.contenido.faqsReorder,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function fetchFaqsPublicas() {
  return apiFetch<ApiResponse<ContenidoFaqPublica[]>>(
    API_ENDPOINTS.contenido.faqsPublicas,
  );
}
