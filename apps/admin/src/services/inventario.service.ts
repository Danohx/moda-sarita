import {
  inventarioApi,
  type MovimientoInventario,
  type ExistenciasParams,
} from "../../../../shared/api/inventario.api";

type CreateMovementPayload = Parameters<typeof inventarioApi.createMovement>[0];

export const inventarioService = {
  async getExistencias(params?: ExistenciasParams) {
    const response = await inventarioApi.getExistencias(params);
    return {
      items: response.data ?? [],
      pagination: response.pagination,
    };
  },

  async getAlertas(limit = 20) {
    const response = await inventarioApi.getAlertas(limit);
    return response.data;
  },

  async getVariantStock(id: string | number) {
    const response = await inventarioApi.getVariantStock(id);
    return response.data;
  },

  async getVariantMovements(id: string | number) {
    const response = await inventarioApi.getVariantMovements(id);
    return response.data ?? [];
  },

  async getProductMovements(
    id: string | number,
  ): Promise<MovimientoInventario[]> {
    const response = await inventarioApi.getProductMovements(id);
    return response.data ?? [];
  },

  async createMovement(payload: CreateMovementPayload) {
    const response = await inventarioApi.createMovement(payload);
    return response.data;
  },
};
