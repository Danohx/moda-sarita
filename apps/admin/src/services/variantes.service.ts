import { variantesApi } from "../../../../shared/api/variantes.api";

export type CreateVariantePayload = Parameters<typeof variantesApi.create>[1];
export type UpdateVariantePayload = Parameters<typeof variantesApi.update>[1];
export type ChangeStockPayload = Parameters<typeof variantesApi.changeStock>[1];

export const variantesService = {
  async getById(id: string | number) {
    const response = await variantesApi.getById(id);
    return response.data;
  },

  async getByProductoId(productoId: string | number) {
    const response = await variantesApi.getByProductoId(productoId);
    return response.data ?? [];
  },
  
  async getByProductoIdAdmin(productoId: string | number) {
    const response = await variantesApi.getByProductoIdAdmin(productoId);
    return response.data ?? [];
  },

  async create(productoId: string | number, payload: CreateVariantePayload) {
    const response = await variantesApi.create(productoId, payload);
    return response.data ?? [];
  },

  async update(id: string | number, payload: UpdateVariantePayload) {
    const response = await variantesApi.update(id, payload);
    return response.data;
  },

  async changeStatus(id: string | number, activo: boolean) {
    const response = await variantesApi.changeStatus(id, activo);
    return response.data;
  },

  async changeStock(id: string | number, payload: ChangeStockPayload) {
    const response = await variantesApi.changeStock(id, payload);
    return response.data;
  },
};