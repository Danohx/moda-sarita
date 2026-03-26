import { categoriasApi } from "../../../../shared/api/categorias.api";
import { coloresApi } from "../../../../shared/api/colores.api";
import { tallasApi } from "../../../../shared/api/tallas.api";

type CreateCategoriaPayload = Parameters<typeof categoriasApi.create>[0];
type UpdateCategoriaPayload = Parameters<typeof categoriasApi.update>[1];

type CreateColorPayload = Parameters<typeof coloresApi.create>[0];
type UpdateColorPayload = Parameters<typeof coloresApi.update>[1];

type CreateTallaPayload = Parameters<typeof tallasApi.create>[0];
type UpdateTallaPayload = Parameters<typeof tallasApi.update>[1];

export const categoriaService = {
  async getCategorias() {
    const response = await categoriasApi.getAll();
    return response.data ?? [];
  },

  async createCategoria(payload: CreateCategoriaPayload) {
    const response = await categoriasApi.create(payload);
    return response.data;
  },

  async updateCategoria(id: string | number, payload: UpdateCategoriaPayload) {
    const response = await categoriasApi.update(id, payload);
    return response.data;
  },

  async changeCategoriaStatus(id: string | number, activo: boolean) {
    const response = await categoriasApi.changeStatus(id, activo);
    return response.data;
  },

  async getColores() {
    const response = await coloresApi.getAll();
    return response.data ?? [];
  },

  async createColor(payload: CreateColorPayload) {
    const response = await coloresApi.create(payload);
    return response.data;
  },

  async updateColor(id: string | number, payload: UpdateColorPayload) {
    const response = await coloresApi.update(id, payload);
    return response.data;
  },

  async changeColorStatus(id: string | number, activo: boolean) {
    const response = await coloresApi.changeStatus(id, activo);
    return response.data;
  },

  async getTallas() {
    const response = await tallasApi.getAll();
    return response.data ?? [];
  },

  async createTalla(payload: CreateTallaPayload) {
    const response = await tallasApi.create(payload);
    return response.data;
  },

  async updateTalla(id: string | number, payload: UpdateTallaPayload) {
    const response = await tallasApi.update(id, payload);
    return response.data;
  },

  async changeTallaStatus(id: string | number, activo: boolean) {
    const response = await tallasApi.changeStatus(id, activo);
    return response.data;
  },

  async getAllCatalogos() {
    const [categorias, colores, tallas] = await Promise.all([
      this.getCategorias(),
      this.getColores(),
      this.getTallas(),
    ]);

    return {
      categorias,
      colores,
      tallas,
    };
  },
};