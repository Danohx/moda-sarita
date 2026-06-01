import { productosApi } from "../../../../shared/api/productos.api";
import { productoDetalleApi } from "@shared/api/productoDetalle.api";
import { temporadasApi } from "../../../../shared/api/temporadas.api";
import type { VarianteProducto } from "../../../../shared/api/productos.api";

type ProductoFilters = {
  q?: string;
  categoriaId?: string | number;
  destacado?: boolean;
  activo?: boolean;
  temporadaId?: string | number;
};

type CreateProductoPayload = Parameters<typeof productosApi.create>[0];
type UpdateProductoPayload = Parameters<typeof productosApi.update>[1];

type SaveProductoTemporadasPayload = {
  temporada_ids: Array<string | number>;
};

export const productosService = {
  async getList(filters?: ProductoFilters) {
    const response = await productosApi.getAll(filters);
    return response.data ?? [];
  },

  async getPublicList(filters?: Omit<ProductoFilters, "activo">) {
    const response = await productosApi.getAllPublic(filters);
    return response.data ?? [];
  },

  async getById(id: string | number) {
    const response = await productosApi.getById(id);
    return response.data;
  },

  async getDetalle(id: string | number) {
    const response = await productoDetalleApi.getByProductoIdPublic(id);
    return response.data;
  },

  async getDetalleAdmin(id: string | number) {
    const response = await productoDetalleApi.getByProductoIdAdmin(id);
    return response.data;
  },

  async getVariantesAdmin(id: string | number): Promise<VarianteProducto[]> {
    const response = await productosApi.getVariantesAdmin(id);
    return response.data ?? [];
  },

  async create(payload: CreateProductoPayload) {
    const response = await productosApi.create(payload);
    return response.data;
  },

  async update(id: string | number, payload: UpdateProductoPayload) {
    const response = await productosApi.update(id, payload);
    return response.data;
  },

  async changeStatus(id: string | number, activo: boolean) {
    const response = await productosApi.changeStatus(id, activo);
    return response.data;
  },

  async changeFeatured(id: string | number, destacado: boolean) {
    const response = await productosApi.changeFeatured(id, destacado);
    return response.data;
  },

  async getTemporadasCatalog() {
    const response = await temporadasApi.getAll();
    return response.data ?? [];
  },

  async getProductoTemporadas(id: string | number) {
    const response = await productosApi.getTemporadas(id);
    return response.data ?? [];
  },

  async saveProductoTemporadas(id: string | number, payload: SaveProductoTemporadasPayload) {
    const response = await productosApi.saveTemporadas(id, payload);
    return response.data ?? [];
  },

  async removeProductoTemporada(productoId: string | number, temporadaId: string | number) {
    return productosApi.removeTemporada(productoId, temporadaId);
  },

  async save(payload: CreateProductoPayload | (UpdateProductoPayload & { id: string | number })) {
    if ("id" in payload) {
      const { id, ...rest } = payload;
      return this.update(id, rest);
    }

    return this.create(payload);
  },
};
