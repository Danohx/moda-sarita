export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    verify2FA: "/auth/2fa-verify",
    magicLink: "/auth/magic-link",
    verifyMagicLink: "/auth/magic-verify",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    refreshToken: "/auth/refresh-token",
    logout: "/auth/logout",
    me: "/auth/me",
    revokeAll: "/auth/revoke-all",
  },

  security: {
    setup2FA: "/security/2fa/setup",
    enable2FA: "/security/2fa/enable",
    roles: "/security/roles",
    permisos: "/security/permisos",
    permisosByRol: (rolId: string | number) => `/security/roles/${rolId}/permisos`,
  },

  categorias: {
    list: "/categorias",
    adminList: "/categorias/admin/list",
    byId: (id: string | number) => `/categorias/${id}`,
    status: (id: string | number) => `/categorias/${id}/status`,
  },

  colores: {
    list: "/colores",
    adminList: "/colores/admin/list",
    byId: (id: string | number) => `/colores/${id}`,
    status: (id: string | number) => `/colores/${id}/status`,
  },

  tallas: {
    list: "/tallas",
    adminList: "/tallas/admin/list",
    byId: (id: string | number) => `/tallas/${id}`,
    status: (id: string | number) => `/tallas/${id}/status`,
  },

  productos: {
    list: "/productos",
    adminList: "/productos/admin/list",
    byId: (id: string | number) => `/productos/${id}`,
    status: (id: string | number) => `/productos/${id}/status`,
    destacado: (id: string | number) => `/productos/${id}/destacado`,
    detalle: (id: string | number) => `/productos/${id}/detalle`,
    detalleAdmin: (id: string | number) => `/productos/${id}/admin`,
    variantes: (id: string | number) => `/productos/${id}/variantes`,
    variantesAdmin: (id: string | number) => `/productos/${id}/variantes/admin`,
    imagenes: (id: string | number) => `/productos/${id}/imagenes`,
    imagenPrincipal: (productoId: string | number, imagenId: string | number) =>
      `/productos/${productoId}/imagenes/${imagenId}/principal`,
    imagenById: (productoId: string | number, imagenId: string | number) =>
      `/productos/${productoId}/imagenes/${imagenId}`,
    imagenReorder: (productoId: string | number) =>
      `/productos/${productoId}/imagenes/reorder`,
  },

  variantes: {
    byId: (id: string | number) => `/variantes/${id}`,
    status: (id: string | number) => `/variantes/${id}/status`,
    stock: (id: string | number) => `/variantes/${id}/stock`,
  },

  inventario: {
    existencias: "/inventario/existencias",
    variantStock: (id: string | number) => `/inventario/variantes/${id}/stock`,
    variantMovements: (id: string | number) => `/inventario/variantes/${id}/movimientos`,
    productMovements: (id: string | number) => `/inventario/productos/${id}/movimientos`,
  },
} as const;