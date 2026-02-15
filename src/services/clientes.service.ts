// src/services/clientes.service.ts

import api from './api';

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  limite_credito: number;
  saldo_deudor: number;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface CreateClienteData {
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  limite_credito?: number;
}

export interface UpdateClienteData {
  nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
}

export interface MovimientoCredito {
  id: number;
  tipo: 'compra' | 'abono';
  monto: number;
  saldo_anterior: number;
  saldo_nuevo: number;
  referencia?: string;
  metodo_pago?: string;
  usuario_nombre?: string;
  creado_en: string;
}

export interface ClienteDetalle extends Cliente {
  historial_compras?: any[];
  historial_apartados?: any[];
  movimientos_credito?: MovimientoCredito[];
}

class ClientesService {
  async getAllClientes(buscar?: string, activo?: boolean): Promise<Cliente[]> {
    const params = new URLSearchParams();
    if (buscar) params.append('buscar', buscar);
    if (activo !== undefined) params.append('activo', String(activo));

    const response = await api.get(`/clientes?${params.toString()}`);
    return response.data.data;
  }

  async getClienteById(id: number): Promise<ClienteDetalle> {
    const response = await api.get(`/clientes/${id}`);
    return response.data.data;
  }

  async createCliente(data: CreateClienteData): Promise<Cliente> {
    const response = await api.post('/clientes', data);
    return response.data.data;
  }

  async updateCliente(id: number, data: UpdateClienteData): Promise<Cliente> {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data.data;
  }

  async asignarCredito(id: number, limite_credito: number): Promise<Cliente> {
    const response = await api.put(`/clientes/${id}/credito`, { limite_credito });
    return response.data.data;
  }

  async registrarAbono(
    id: number,
    monto: number,
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia'
  ): Promise<any> {
    const response = await api.post(`/clientes/${id}/abono`, {
      monto,
      metodo_pago
    });
    return response.data.data;
  }

  async getEstadisticas(): Promise<any> {
    const response = await api.get('/clientes/estadisticas');
    return response.data.data;
  }
}

export default new ClientesService();