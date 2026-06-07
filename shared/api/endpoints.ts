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
    permisosByRol: (rolId: string | number) =>
      `/security/roles/${rolId}/permisos`,
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
    variantMovements: (id: string | number) =>
      `/inventario/variantes/${id}/movimientos`,
    productMovements: (id: string | number) =>
      `/inventario/productos/${id}/movimientos`,
    movimientos: "/inventario/movimientos",
  },
  monitoring: {
    summary: "/monitoring/summary",
    tables: "/monitoring/tables",
    vacuum: "/monitoring/vacuum",
    connections: "/monitoring/connections",
  },
  backups: {
    list: "/backups",
    create: "/backups",
    delete: "/backups",
    download: "/backups",
  },
  maintenance: {
    list: "/maintenance",
    tables: "/maintenance/tables",
    run: "/maintenance/run",
  },
  auditLogs: {
    list: "/audit-logs",
  },
  clientes: {
    list: "/clientes",
    byId: (id: string | number) => `/clientes/${id}`,
    credito: (id: string | number) => `/clientes/${id}/credito`,
    movimientosCredito: (id: string | number) =>
      `/clientes/${id}/movimientos-credito`,
    abonoCredito: (id: string | number) => `/clientes/${id}/abonos`,
    direcciones: (id: string | number) => `/clientes/${id}/direcciones`,
    direccionPrincipal: (id: string | number, direccionId: string | number) =>
      `/clientes/${id}/direcciones/${direccionId}/principal`,
    direccionById: (id: string | number, direccionId: string | number) =>
      `/clientes/${id}/direcciones/${direccionId}`,
    puedeApartar: (id: string | number) => `/clientes/${id}/puede-apartar`,
  },
  ventas: {
    pos: "/ventas/pos",
    apartados: "/ventas/apartados",
    abonos: (id: string | number) => `/ventas/apartados/${id}/abonos`,
    liquidar: (id: string | number) => `/ventas/apartados/${id}/liquidar`,
    cancelar: (id: string | number) => `/ventas/apartados/${id}/cancelar`,
    abrirCorte: "/ventas/corte/abrir",
    corteActual: "/ventas/corte/actual",
    cerrarCorte: (id: string | number) => `/ventas/corte/${id}/cerrar`,
    historialCortes: "/ventas/corte/historial",
    corteById: (id: string | number) => `/ventas/corte/${id}`,
  },
  pedidos: {
    list: "/pedidos",
    byId: (id: string | number) => `/pedidos/${id}`,
    abonos: (id: string | number) => `/pedidos/${id}/abonos`,
    cancelar: (id: string | number) => `/pedidos/${id}/cancelar`,
    liquidar: (id: string | number) => `/pedidos/${id}/liquidar`,
    ticketPdf: (id: string | number) => `/pedidos/${id}/ticket`,
    pagoTicketPdf: (id: string | number, pagoId: string | number) =>
      `/pedidos/${id}/pagos/${pagoId}/ticket`,
  },
} as const;
