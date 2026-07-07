import {
  createCuponMarketing,
  createPlantillaMarketing,
  createSegmentoMarketing,
  createSuscripcionMarketing,
  fetchCuponesMarketing,
  fetchPlantillasMarketing,
  fetchSegmentosMarketing,
  fetchSuscripcionesMarketing,
  sendPlantillaTestMarketing,
  updateCuponMarketing,
  updateCuponStatusMarketing,
  updatePlantillaMarketing,
  updateSegmentoMarketing,
  updateSuscripcionMarketing,
  updateSuscripcionStatusMarketing,
  type AplicaCupon,
  type CanalCupon,
  type CuponMarketing,
  type EstadoSuscripcion,
  type PlantillaEmailMarketing,
  type SegmentoMarketing,
  type SuscripcionMarketing,
  type TipoPlantilla,
} from "@shared/api/marketing.api";

export type {
  AplicaCupon,
  CanalCupon,
  CuponMarketing,
  EstadoSuscripcion,
  PlantillaEmailMarketing,
  SegmentoMarketing,
  SuscripcionMarketing,
  TipoPlantilla,
};

export async function getSuscripcionesMarketing(params?: {
  estado?: EstadoSuscripcion | "";
  q?: string;
}) {
  const response = await fetchSuscripcionesMarketing({
    ...params,
    limit: 100,
    offset: 0,
  });

  return response.data;
}

export async function guardarSuscripcionMarketing(
  payload: Parameters<typeof createSuscripcionMarketing>[0],
) {
  const response = await createSuscripcionMarketing(payload);
  return response.data;
}

export async function editarSuscripcionMarketing(
  id: string,
  payload: Parameters<typeof updateSuscripcionMarketing>[1],
) {
  const response = await updateSuscripcionMarketing(id, payload);
  return response.data;
}

export async function cambiarEstadoSuscripcionMarketing(
  id: string,
  estado: EstadoSuscripcion,
  motivo?: string | null,
) {
  const response = await updateSuscripcionStatusMarketing(id, estado, motivo);
  return response.data;
}

export async function getCuponesMarketing(params?: {
  estado?: string;
  canal?: CanalCupon | "";
  q?: string;
}) {
  const response = await fetchCuponesMarketing({
    ...params,
    limit: 100,
    offset: 0,
  });

  return response.data;
}

export async function guardarCuponMarketing(
  payload: Parameters<typeof createCuponMarketing>[0],
) {
  const response = await createCuponMarketing(payload);
  return response.data;
}

export async function editarCuponMarketing(
  id: string,
  payload: Parameters<typeof updateCuponMarketing>[1],
) {
  const response = await updateCuponMarketing(id, payload);
  return response.data;
}

export async function cambiarEstadoCuponMarketing(id: string, activo: boolean) {
  const response = await updateCuponStatusMarketing(id, activo);
  return response.data;
}

export async function getSegmentosMarketing(params?: {
  activo?: boolean | "";
  q?: string;
}) {
  const response = await fetchSegmentosMarketing({
    ...params,
    limit: 100,
    offset: 0,
  });

  return response.data;
}

export async function guardarSegmentoMarketing(
  payload: Parameters<typeof createSegmentoMarketing>[0],
) {
  const response = await createSegmentoMarketing(payload);
  return response.data;
}

export async function editarSegmentoMarketing(
  id: string,
  payload: Parameters<typeof updateSegmentoMarketing>[1],
) {
  const response = await updateSegmentoMarketing(id, payload);
  return response.data;
}

export async function getPlantillasMarketing(params?: {
  tipo?: TipoPlantilla | "";
  activo?: boolean | "";
  q?: string;
}) {
  const response = await fetchPlantillasMarketing({
    ...params,
    limit: 100,
    offset: 0,
  });

  return response.data;
}

export async function guardarPlantillaMarketing(
  payload: Parameters<typeof createPlantillaMarketing>[0],
) {
  const response = await createPlantillaMarketing(payload);
  return response.data;
}

export async function editarPlantillaMarketing(
  id: string,
  payload: Parameters<typeof updatePlantillaMarketing>[1],
) {
  const response = await updatePlantillaMarketing(id, payload);
  return response.data;
}

export async function enviarPruebaPlantillaMarketing(
  id: string,
  emailDestino: string,
) {
  const response = await sendPlantillaTestMarketing(id, emailDestino);
  return response.data;
}
