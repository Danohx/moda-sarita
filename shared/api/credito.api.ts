import { apiFetch, apiFetchBlob } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type {
  AbonoCreditoPayload,
  AbonoCreditoResult,
  CreditoDetalle,
  CreditoFilters,
  CreditoResumen,
  ProcesamientoVencimientos,
  ReporteCreditoOperativo,
  ReporteFinancieroCredito,
  SimulacionCredito,
  SimulacionCreditoPayload,
  UltimaEjecucionVencimientos,
} from "@admin/types/credito.types";

type ApiOk<T> = { ok: boolean; data: T };

type CreditosListResponse = ApiOk<CreditoResumen[]> & {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const creditoApi = {
  simular: (payload: SimulacionCreditoPayload) =>
    apiFetch<ApiOk<SimulacionCredito>>(API_ENDPOINTS.creditos.simular, {
      method: "POST",
      body: payload,
    }),

  listar: (filters?: CreditoFilters) =>
    apiFetch<CreditosListResponse>(API_ENDPOINTS.creditos.list, {
      method: "GET",
      query: filters,
    }),

  listarPorCliente: (clienteId: string, filters?: CreditoFilters) =>
    apiFetch<CreditosListResponse>(
      API_ENDPOINTS.creditos.byCliente(clienteId),
      {
        method: "GET",
        query: filters,
      },
    ),

  obtener: (creditoId: string) =>
    apiFetch<ApiOk<CreditoDetalle>>(API_ENDPOINTS.creditos.byId(creditoId), {
      method: "GET",
    }),

  abonar: (creditoId: string, payload: AbonoCreditoPayload) =>
    apiFetch<ApiOk<AbonoCreditoResult>>(
      API_ENDPOINTS.creditos.abonos(creditoId),
      {
        method: "POST",
        body: payload,
      },
    ),

  cancelar: (creditoId: string, motivo: string) =>
    apiFetch<ApiOk<CreditoResumen>>(
      API_ENDPOINTS.creditos.cancelar(creditoId),
      {
        method: "POST",
        body: { motivo },
      },
    ),

  procesarVencimientos: (fecha?: string) =>
    apiFetch<ApiOk<ProcesamientoVencimientos>>(
      API_ENDPOINTS.creditos.procesarVencimientos,
      {
        method: "POST",
        body: fecha ? { fecha } : {},
      },
    ),

  getUltimaEjecucionVencimientos: () =>
    apiFetch<ApiOk<UltimaEjecucionVencimientos | null>>(
      API_ENDPOINTS.creditos.ultimaEjecucionVencimientos,
      { method: "GET" },
    ),

  getReporteOperativo: (filters: { from?: string; to?: string; limit?: number }) =>
    apiFetch<ApiOk<ReporteCreditoOperativo>>(
      API_ENDPOINTS.creditos.reporteOperativo,
      { method: "GET", query: filters },
    ),

  getReporteFinanciero: (filters: { from?: string; to?: string }) =>
    apiFetch<ApiOk<ReporteFinancieroCredito>>(
      API_ENDPOINTS.creditos.reporteFinanciero,
      { method: "GET", query: filters },
    ),

  async exportarReporteOperativo(
    format: "pdf" | "excel",
    filters: { from?: string; to?: string; limit?: number },
  ) {
    const endpoint =
      format === "pdf"
        ? API_ENDPOINTS.creditos.reporteOperativoPdf
        : API_ENDPOINTS.creditos.reporteOperativoExcel;
    const blob = await apiFetchBlob(endpoint, { method: "GET", query: filters });
    downloadBlob(blob, `reporte-creditos.${format === "pdf" ? "pdf" : "xlsx"}`);
  },

  async exportarReporteFinanciero(
    format: "pdf" | "excel",
    filters: { from?: string; to?: string },
  ) {
    const endpoint =
      format === "pdf"
        ? API_ENDPOINTS.creditos.reporteFinancieroPdf
        : API_ENDPOINTS.creditos.reporteFinancieroExcel;
    const blob = await apiFetchBlob(endpoint, { method: "GET", query: filters });
    downloadBlob(blob, `reporte-financiero-credito.${format === "pdf" ? "pdf" : "xlsx"}`);
  },

  async descargarComprobante(
    creditoId: string,
    pagoId: string,
    filename = `comprobante-credito-${pagoId}.pdf`,
  ) {
    const blob = await apiFetchBlob(
      API_ENDPOINTS.creditos.comprobante(creditoId, pagoId),
      { method: "GET" },
    );
    downloadBlob(blob, filename);
  },
};
