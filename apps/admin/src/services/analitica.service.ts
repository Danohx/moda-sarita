import {
  analiticaApi,
} from "@shared/api/analitica.api";

export const analiticaService = {
  async health() {
    const response =
      await analiticaApi.health();

    return response.data;
  },

  async evaluarCredito(
    clienteId: string | number,
  ) {
    const response =
      await analiticaApi.evaluarCredito(
        clienteId,
      );

    return response.data;
  },

  async predecirVentas(
    productoId: string | number,
  ) {
    const response =
      await analiticaApi.predecirVentas(
        productoId,
      );

    return response.data;
  },
};
