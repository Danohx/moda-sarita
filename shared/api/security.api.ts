import { apiFetch } from './client'
import { API_ENDPOINTS } from './endpoints'

export type Setup2FAResponse = {
  otpauth_url: string
  mensaje?: string
}

export type Enable2FAResponse = {
  mensaje: string
}

export const securityApi = {
  setup2FA: () =>
    apiFetch<Setup2FAResponse>(API_ENDPOINTS.security.setup2FA, {
      method: 'POST',
    }),

  enable2FA: (otpCode: string) =>
    apiFetch<Enable2FAResponse>(API_ENDPOINTS.security.enable2FA, {
      method: 'POST',
      body: { token: otpCode },
    }),
}