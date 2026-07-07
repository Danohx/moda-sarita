import {
  crearMensajeContactoPublico,
  fetchMensajeContactoById,
  fetchMensajesContactoAdmin,
  responderMensajeContacto,
  updateMensajeContactoNotas,
  updateMensajeContactoStatus,
  fetchResumenMensajesContactoAdmin,
  type ContactoEstado,
  type ContactoListParams,
  type ContactoMensaje,
  type CrearMensajeContactoPayload,
  type ContactoResumen,
} from "@shared/api/contacto.api";

export type {
  ContactoEstado,
  ContactoListParams,
  ContactoMensaje,
  ContactoResumen,
  CrearMensajeContactoPayload,
};

export async function getMensajesContacto(params?: ContactoListParams) {
  const response = await fetchMensajesContactoAdmin(params);

  return {
    data: response.data,
    pagination: response.pagination,
  };
}

export async function getMensajeContacto(id: string) {
  const response = await fetchMensajeContactoById(id);
  return response.data;
}

export async function cambiarEstadoMensajeContacto(
  id: string,
  estado: ContactoEstado,
) {
  const response = await updateMensajeContactoStatus(id, estado);
  return response.data;
}

export async function guardarNotasMensajeContacto(
  id: string,
  notas: string | null,
) {
  const response = await updateMensajeContactoNotas(id, notas);
  return response.data;
}

export async function enviarRespuestaMensajeContacto(
  id: string,
  respuesta: string,
) {
  const response = await responderMensajeContacto(id, respuesta);
  return response.data;
}

export async function enviarMensajeContactoPublico(
  payload: CrearMensajeContactoPayload,
) {
  const response = await crearMensajeContactoPublico(payload);
  return response.data;
}

export async function getResumenMensajesContacto() {
  const response = await fetchResumenMensajesContactoAdmin();
  return response.data;
}