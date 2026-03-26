import { coloresApi } from "../../../../shared/api/colores.api";

type CreateColorPayload = Parameters<typeof coloresApi.create>[0];
type UpdateColorPayload = Parameters<typeof coloresApi.update>[1];

export const coloresService = {
  async getList() {
    const response = await coloresApi.getAll();
    return response.data ?? [];
  },
  
  async getListPublic() {
    const response = await coloresApi.getAllPublic();
    return response.data ?? [];
  },

  async create(payload: CreateColorPayload) {
    const response = await coloresApi.create(payload);
    return response.data;
  },

  async update(id: string | number, payload: UpdateColorPayload) {
    const response = await coloresApi.update(id, payload);
    return response.data;
  },

  async changeStatus(id: string | number, activo: boolean) {
    const response = await coloresApi.changeStatus(id, activo);
    return response.data;
  },

  async save(
    payload: (CreateColorPayload & { id?: string | number }) | (UpdateColorPayload & { id: string | number })
  ) {
    if ("id" in payload && payload.id !== undefined && payload.id !== null) {
      const { id, ...rest } = payload;
      const response = await coloresApi.update(id, rest);
      return response.data;
    }

    const response = await coloresApi.create(payload);
    return response.data;
  },
};