import { ventasApi } from "../../../../shared/api/ventas.api";

type CreateVentaPOS = Parameters<typeof ventasApi.crearVentaPOS>[0];
type CreateApartado = Parameters<typeof ventasApi.crearApartado>[0];
type CreateAbono = Parameters<typeof ventasApi.abonarApartado>[1];
type CreateLiquidar = Parameters<typeof ventasApi.liquidarApartado>[1];
type CreateCancelar = Parameters<typeof ventasApi.cancelarApartado>[1];
type CreateCerrarCorte = Parameters<typeof ventasApi.cerrarCorte>[1];
type CreateAbrirCorte = Parameters<typeof ventasApi.abrirCorte>[0];

export const ventasService = {
  async crearVentaPOS(payload: CreateVentaPOS) {
    const response = await ventasApi.crearVentaPOS(payload);
    return response.data;
  },

  async crearApartado(payload: CreateApartado) {
    const response = await ventasApi.crearApartado(payload);
    return response.data;
  },

  async abonarApartado(id: string | number, payload: CreateAbono) {
    const response = await ventasApi.abonarApartado(id, payload);
    return response.data;
  },

  async liquidarApartado(id: string | number, payload: CreateLiquidar) {
    const response = await ventasApi.liquidarApartado(id, payload);
    return response.data;
  },

  async cancelarApartado(id: string | number, payload: CreateCancelar) {
    const response = await ventasApi.cancelarApartado(id, payload);
    return response.data;
  },

  async abrirCorte(payload: CreateAbrirCorte) {
    const response = await ventasApi.abrirCorte(payload);
    return response.data;
  },

  async getCorteActual() {
    const response = await ventasApi.getCorteActual();
    return response.data;
  },

  async cerrarCorte(id: string | number, payload: CreateCerrarCorte) {
    const response = await ventasApi.cerrarCorte(id, payload);
    return response.data;
  },

  async getHistorialCortes() {
    const response = await ventasApi.getHistorialCortes();
    return response.data;
  },

  async getCorteById(id: string | number) {
    const response = await ventasApi.getCorteById(id);
    return response.data;
  }
};