import {
  prediccionesApi,
  type PrediccionFilters,
  type PrediccionData,
} from "../../../../shared/api/predicciones.api";

export const prediccionesService = {
  async getByProducto(
    productoId: string | number,
    filters?: PrediccionFilters,
  ): Promise<PrediccionData | null> {
    const response = await prediccionesApi.getByProducto(productoId, filters);
    return response.data ?? null;
  },
};