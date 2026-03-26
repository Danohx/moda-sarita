import { productoImagenesApi } from "../../../../shared/api/productoImagenes.api";

type UploadPayload = Parameters<typeof productoImagenesApi.upload>[1];
type ReorderPayload = Parameters<typeof productoImagenesApi.reorder>[1];

export const productoImagenesService = {
  async getByProductoId(productoId: string | number) {
    const response = await productoImagenesApi.getByProductoId(productoId);
    return response.data ?? [];
  },

  async upload(productoId: string | number, payload: UploadPayload) {
    const response = await productoImagenesApi.upload(productoId, payload);
    return response.data;
  },

  async remove(productoId: string | number, imagenId: string | number) {
    const response = await productoImagenesApi.remove(productoId, imagenId);
    return response.data;
  },

  async setPrincipal(productoId: string | number, imagenId: string | number) {
    const response = await productoImagenesApi.setPrincipal(productoId, imagenId);
    return response.data;
  },

  async reorder(productoId: string | number, payload: ReorderPayload) {
    const response = await productoImagenesApi.reorder(productoId, payload);
    return response.data ?? [];
  },
};