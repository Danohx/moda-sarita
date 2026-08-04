import { creditoApi } from "@shared/api/credito.api";
import type {
  AbonoCreditoPayload,
  CreditoFilters,
  SimulacionCreditoPayload,
} from "@admin/types/credito.types";

export const creditoService = {
  async simular(payload: SimulacionCreditoPayload) {
    const response = await creditoApi.simular(payload);
    return response.data;
  },

  async listar(filters?: CreditoFilters) {
    const response = await creditoApi.listar(filters);
    return {
      data: response.data,
      pagination: response.pagination,
    };
  },

  async listarPorCliente(clienteId: string, filters?: CreditoFilters) {
    const response = await creditoApi.listarPorCliente(clienteId, filters);
    return {
      data: response.data,
      pagination: response.pagination,
    };
  },

  async obtener(creditoId: string) {
    const response = await creditoApi.obtener(creditoId);
    return response.data;
  },

  async abonar(creditoId: string, payload: AbonoCreditoPayload) {
    const response = await creditoApi.abonar(creditoId, payload);
    return response.data;
  },

  async cancelar(creditoId: string, motivo: string) {
    const response = await creditoApi.cancelar(creditoId, motivo);
    return response.data;
  },

  async procesarVencimientos(fecha?: string) {
    const response = await creditoApi.procesarVencimientos(fecha);
    return response.data;
  },

  async getUltimaEjecucionVencimientos() {
    const response = await creditoApi.getUltimaEjecucionVencimientos();
    return response.data;
  },

  descargarComprobante: creditoApi.descargarComprobante,
  exportarReporteOperativo: creditoApi.exportarReporteOperativo,
  exportarReporteFinanciero: creditoApi.exportarReporteFinanciero,
  getReporteOperativo: async (filters: { from?: string; to?: string; limit?: number }) =>
    (await creditoApi.getReporteOperativo(filters)).data,
  getReporteFinanciero: async (filters: { from?: string; to?: string }) =>
    (await creditoApi.getReporteFinanciero(filters)).data,
};
