import { clientesApi } from "../../../../shared/api/cliente.api";

type ClienteFilters = Parameters<typeof clientesApi.getAll>[0];
type CreateClientePayload = Parameters<typeof clientesApi.create>[0];
type UpdateClientePayload = Parameters<typeof clientesApi.update>[1];
type UpdateCreditoPayload = Parameters<typeof clientesApi.updateCredito>[1];
type CreateAbonoCreditoPayload = Parameters<
  typeof clientesApi.abonarCredito
>[1];
type CreateDireccionPayload = Parameters<typeof clientesApi.addDireccion>[1];

export const clientesService = {
  async getList(filters?: ClienteFilters) {
    const response = await clientesApi.getAll(filters);
    return response.data ?? [];
  },

  async getById(id: string | number) {
    const response = await clientesApi.getById(id);
    return response.data ?? null;
  },

  async create(payload: CreateClientePayload) {
    const response = await clientesApi.create(payload);
    return response.data;
  },

  async update(id: string | number, payload: UpdateClientePayload) {
    const response = await clientesApi.update(id, payload);
    return response.data;
  },

  async save(
    payload:
      | (CreateClientePayload & { id?: string | number })
      | (UpdateClientePayload & { id: string | number }),
  ) {
    if ("id" in payload && payload.id !== undefined && payload.id !== null) {
      const { id, ...rest } = payload;
      const response = await clientesApi.update(id, rest);
      return response.data;
    }

    const response = await clientesApi.create(payload as CreateClientePayload);
    return response.data;
  },

  async updateCredito(id: string | number, payload: UpdateCreditoPayload) {
    const response = await clientesApi.updateCredito(id, payload);
    return response.data;
  },

  async getMovimientosCredito(id: string | number) {
    const response = await clientesApi.getMovimientosCredito(id);
    return response.data ?? [];
  },

  async abonarCredito(id: string | number, payload: CreateAbonoCreditoPayload) {
    const response = await clientesApi.abonarCredito(id, payload);
    return response.data;
  },

  async addDireccion(id: string | number, payload: CreateDireccionPayload) {
    const response = await clientesApi.addDireccion(id, payload);
    return response.data;
  },

  async setDireccionPrincipal(
    id: string | number,
    direccionId: string | number,
  ) {
    const response = await clientesApi.setDireccionPrincipal(id, direccionId);
    return response.data;
  },

  async deleteDireccion(id: string | number, direccionId: string | number) {
    const response = await clientesApi.deleteDireccion(id, direccionId);
    return response.data;
  },

  async changePuedeApartar(id: string | number, puede_apartar: boolean) {
    const response = await clientesApi.changePuedeApartar(id, puede_apartar);
    return response.data;
  },
};
