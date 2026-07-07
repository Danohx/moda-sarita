import {
  createFaqAdmin,
  createPaginaAdmin,
  fetchFaqsAdmin,
  fetchFaqsPublicas,
  fetchPaginaAdminByClave,
  fetchPaginaPublica,
  fetchPaginaVersionesAdmin,
  reorderFaqsAdmin,
  restaurarPaginaVersionAdmin,
  updateFaqAdmin,
  updateFaqPublicacionAdmin,
  updateFaqStatusAdmin,
  updatePaginaAdmin,
  updatePaginaPublicacionAdmin,
  updatePaginaStatusAdmin,
  type ContenidoFaq,
  type ContenidoFaqPublica,
  type ContenidoPagina,
  type ContenidoPaginaPublica,
  type ContenidoPaginaVersion,
  type CreateFaqPayload,
  type ReorderFaqPayload,
  type UpdateFaqPayload,
  type UpdatePaginaPayload,
} from "@shared/api/contenido.api";

export type {
  ContenidoFaq,
  ContenidoFaqPublica,
  ContenidoPagina,
  ContenidoPaginaPublica,
  ContenidoPaginaVersion,
  CreateFaqPayload,
  UpdateFaqPayload,
  UpdatePaginaPayload,
};

export async function getPoliticaPrivacidadAdmin() {
  const response = await fetchPaginaAdminByClave("PRIVACIDAD");
  return response.data;
}

export async function guardarPoliticaPrivacidad(
  id: string,
  payload: UpdatePaginaPayload,
) {
  const response = await updatePaginaAdmin(id, payload);
  return response.data;
}

export async function cambiarEstadoPolitica(id: string, activo: boolean) {
  const response = await updatePaginaStatusAdmin(id, activo);
  return response.data;
}

export async function cambiarPublicacionPolitica(
  id: string,
  publicado: boolean,
) {
  const response = await updatePaginaPublicacionAdmin(id, publicado);
  return response.data;
}

export async function getVersionesPolitica(id: string) {
  const response = await fetchPaginaVersionesAdmin(id);
  return response.data;
}

export async function restaurarVersionPolitica(id: string, versionId: string) {
  const response = await restaurarPaginaVersionAdmin(id, versionId);
  return response.data;
}

export async function getPoliticaPrivacidadPublica() {
  const response = await fetchPaginaPublica("PRIVACIDAD");
  return response.data;
}

export async function getFaqsAdmin() {
  const response = await fetchFaqsAdmin({ includeInactive: true });
  return response.data;
}

export async function crearFaq(payload: CreateFaqPayload) {
  const response = await createFaqAdmin(payload);
  return response.data;
}

export async function guardarFaq(id: string, payload: UpdateFaqPayload) {
  const response = await updateFaqAdmin(id, payload);
  return response.data;
}

export async function cambiarEstadoFaq(id: string, activo: boolean) {
  const response = await updateFaqStatusAdmin(id, activo);
  return response.data;
}

export async function cambiarPublicacionFaq(id: string, publicado: boolean) {
  const response = await updateFaqPublicacionAdmin(id, publicado);
  return response.data;
}

export async function reordenarFaqs(payload: ReorderFaqPayload) {
  const response = await reorderFaqsAdmin(payload);
  return response.data;
}

export async function getFaqsPublicas() {
  const response = await fetchFaqsPublicas();
  return response.data;
}

export async function crearPaginaContenido(payload: {
  clave: string;
  titulo: string;
  resumen?: string | null;
  contenido_html?: string;
  contenido_texto?: string | null;
}) {
  const response = await createPaginaAdmin(payload);
  return response.data;
}