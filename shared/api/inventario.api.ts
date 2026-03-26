import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ExistenciaItem = {
  variante_id?: string | number;
  producto_id?: string | number;
  producto?: string;
  sku?: string | null;
  stock?: number;
};

export type MovimientoInventario = {
  id: string | number;
  tipo?: string;
  cantidad?: number;
  motivo?: string;
  fecha?: string;
};

type ExistenciasResponse = {
  ok: boolean;
  data: ExistenciaItem[];
};

type MovimientosResponse = {
  ok: boolean;
  data: MovimientoInventario[];
};

export const inventarioApi = {
  getExistencias: () =>
    apiFetch<ExistenciasResponse>(API_ENDPOINTS.inventario.existencias, {
      method: "GET",
    }),

  getVariantStock: (id: string | number) =>
    apiFetch<{ ok: boolean; data: { stock: number } }>(
      API_ENDPOINTS.inventario.variantStock(id),
      {
        method: "GET",
      }
    ),

  getVariantMovements: (id: string | number) =>
    apiFetch<MovimientosResponse>(API_ENDPOINTS.inventario.variantMovements(id), {
      method: "GET",
    }),

  getProductMovements: (id: string | number) =>
    apiFetch<MovimientosResponse>(API_ENDPOINTS.inventario.productMovements(id), {
      method: "GET",
    }),
};