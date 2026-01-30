import api from './api';

export interface LoginResponse {
  requires2FA: boolean;
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
  mensaje: string;
  user?: { nombre: string; correo: string };
}

export interface RegisterData {
  nombre: string;
  apellidoPaterno: string;
  telefono?: string;
  edad?: number;
  correo: string;
  contrasena: string;
}

export const authService = {
  login: async (correo: string, contrasena: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { correo, contrasena });
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verify2FA: async (tempToken: string, otpCode: string) => {
    const response = await api.post('/auth/2fa-verify', { tempToken, otpCode });
    return response.data;
  }
};