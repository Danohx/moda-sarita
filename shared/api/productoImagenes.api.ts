import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ProductoImagen = {
  id: string | number;
  producto_id?: string | number;
  url: string;
  public_id?: string;
  orden?: number;
  es_principal?: boolean;
};

type ProductoImagenesResponse = {
  ok: boolean;
  data: ProductoImagen[];
};

type ProductoImagenResponse = {
  ok: boolean;
  data: ProductoImagen;
};

export const productoImagenesApi = {
  getByProductoId: (productoId: string | number) =>
    apiFetch<ProductoImagenesResponse>(
      API_ENDPOINTS.productos.imagenes(productoId),
      {
        method: "GET",
      },
    ),

  upload: (productoId: string | number, formData: FormData) =>
    apiFetch<ProductoImagenResponse>(
      API_ENDPOINTS.productos.imagenes(productoId),
      {
        method: "POST",
        body: formData,
        isFormData: true,
      },
    ),

  setPrincipal: (productoId: string | number, imagenId: string | number) =>
    apiFetch<ProductoImagenResponse>(
      API_ENDPOINTS.productos.imagenPrincipal(productoId, imagenId),
      {
        method: "PATCH",
      },
    ),

  remove: (productoId: string | number, imagenId: string | number) =>
    apiFetch<{ ok: boolean; msg?: string; data?: ProductoImagen }>(
      API_ENDPOINTS.productos.imagenById(productoId, imagenId),
      {
        method: "DELETE",
      },
    ),

  reorder: (
    productoId: string | number,
    items: Array<{
      id: string | number;
      orden?: number;
      es_principal?: boolean;
    }>,
  ) =>
    apiFetch<{ ok: boolean; data: ProductoImagen[] }>(
      API_ENDPOINTS.productos.imagenReorder(productoId),
      {
        method: "PATCH",
        body: { items },
      },
    ),
};
