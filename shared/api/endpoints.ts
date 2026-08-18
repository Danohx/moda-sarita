const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl || typeof rawApiUrl !== "string") {
  throw new Error("No se definiÃ³ VITE_API_URL");
}

export const API_CONFIG = {
  baseUrl: rawApiUrl.replace(/\/+$/, ""),
  timeoutMs: 15000,
  withCredentials: true,
  authHeaderName: "Authorization",
  bearerPrefix: "Bearer",
} as const;

export const API_BASE_URL = API_CONFIG.baseUrl;

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
    empleados: "/security/empleados",
    empleadoById: (usuarioId: string | number) =>
      `/security/empleados/${usuarioId}`,
    empleadoStatus: (usuarioId: string | number) =>
      `/security/empleados/${usuarioId}/status`,
    sessions: "/security/sessions",
    sessionRevoke: (sessionId: string | number) =>
      `/security/sessions/${sessionId}/revoke`,
    revokeOtherSessions: "/security/sessions/revoke-others",
    status: "/security/status",
    roles: "/security/roles",
    roleById: (rolId: string | number) => `/security/roles/${rolId}`,
    roleStatus: (rolId: string | number) => `/security/roles/${rolId}/status`,
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
    alertas: "/inventario/alertas",
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
  creditos: {
    list: "/creditos",
    simular: "/creditos/simular",
    byId: (id: string | number) => `/creditos/${id}`,
    byCliente: (id: string | number) => `/clientes/${id}/creditos`,
    abonos: (id: string | number) => `/creditos/${id}/abonos`,
    cancelar: (id: string | number) => `/creditos/${id}/cancelar`,
    comprobante: (creditoId: string | number, pagoId: string | number) =>
      `/creditos/${creditoId}/pagos/${pagoId}/comprobante`,
    confirmarTransferencia: (
      creditoId: string | number,
      pagoId: string | number,
    ) => `/creditos/${creditoId}/pagos/${pagoId}/confirmar-transferencia`,
    rechazarTransferencia: (
      creditoId: string | number,
      pagoId: string | number,
    ) => `/creditos/${creditoId}/pagos/${pagoId}/rechazar-transferencia`,
    procesarVencimientos: "/creditos/procesar-vencimientos",
    ultimaEjecucionVencimientos: "/creditos/vencimientos/ultima-ejecucion",
    reporteOperativo: "/creditos/reportes/operativo",
    reporteFinanciero: "/creditos/reportes/financiero",
    reporteOperativoPdf: "/creditos/reportes/operativo/export/pdf",
    reporteOperativoExcel: "/creditos/reportes/operativo/export/excel",
    reporteFinancieroPdf: "/creditos/reportes/financiero/export/pdf",
    reporteFinancieroExcel: "/creditos/reportes/financiero/export/excel",
  },
  ventas: {
    pos: "/ventas/pos",
    historial: "/ventas/historial",
    historialById: (id: string | number) => `/ventas/historial/${id}`,
    apartados: "/ventas/apartados",
    abonos: (id: string | number) => `/ventas/apartados/${id}/abonos`,
    liquidar: (id: string | number) => `/ventas/apartados/${id}/liquidar`,
    cancelar: (id: string | number) => `/ventas/apartados/${id}/cancelar`,
    abrirCorte: "/ventas/corte/abrir",
    corteActual: "/ventas/corte/actual",
    cerrarCorte: (id: string | number) => `/ventas/corte/${id}/cerrar`,
    historialCortes: "/ventas/corte/historial",
    corteById: (id: string | number) => `/ventas/corte/${id}`,
    ventaTicketPdf: (id: string | number) => `/ventas/pos/${id}/ticket`,
    cancelarPos: (id: string | number) => `/ventas/pos/${id}/cancelar`,
  },
  pedidos: {
    list: "/pedidos",
    byId: (id: string | number) => `/pedidos/${id}`,
    abonos: (id: string | number) => `/pedidos/${id}/abonos`,
    cancelar: (id: string | number) => `/pedidos/${id}/cancelar`,
    liquidar: (id: string | number) => `/pedidos/${id}/liquidar`,
    estadoWeb: (id: string | number) => `/pedidos/${id}/estado-web`,
    ticketPdf: (id: string | number) => `/pedidos/${id}/ticket`,
    pagoTicketPdf: (id: string | number, pagoId: string | number) =>
      `/pedidos/${id}/pagos/${pagoId}/ticket`,
  },
  checkout: {
    pedidos: "/checkout/pedidos",
    confirmarPedidoWeb: (id: string | number) =>
      `/checkout/pedidos/${id}/confirmar`,
    cancelarPedidoWeb: (id: string | number) =>
      `/checkout/pedidos/${id}/cancelar`,
  },
  dashboard: {
    data: "/dashboard",
  },
  configuracion: {
    tiendaParametros: "/configuracion/tienda/parametros",
    tiendaMetodosPagoWeb: "/configuracion/tienda/metodos-pago/web",
    posMetodosPago: "/configuracion/pos/metodos-pago",
    adminParametros: "/configuracion/admin/parametros",
    adminParametrosAgrupados: "/configuracion/admin/parametros/agrupados",
    adminParametrosModulo: (modulo: string) =>
      `/configuracion/admin/parametros/modulo/${modulo}`,
    adminParametroByClave: (clave: string) =>
      `/configuracion/admin/parametros/${encodeURIComponent(clave)}`,
    adminMetodosPago: "/configuracion/admin/metodos-pago",
    adminMetodoPagoByCodigo: (codigo: string) =>
      `/configuracion/admin/metodos-pago/${encodeURIComponent(codigo)}`,
  },
  reportes: {
    resumen: "/reportes/resumen",

    ventas: {
      resumen: "/reportes/ventas/resumen",
      tendencia: "/reportes/ventas/tendencia",
      metodosPago: "/reportes/ventas/metodos-pago",
      empleados: "/reportes/ventas/empleados",
    },

    productos: {
      masVendidos: "/reportes/productos/mas-vendidos",
      menosVendidos: "/reportes/productos/menos-vendidos",
      sinVentas: "/reportes/productos/sin-ventas",
    },

    inventario: {
      resumen: "/reportes/inventario/resumen",
      critico: "/reportes/inventario/critico",
      movimientos: "/reportes/inventario/movimientos",
    },

    clientes: {
      resumen: "/reportes/clientes/resumen",
      tendencia: "/reportes/clientes/tendencia",
      frecuentes: "/reportes/clientes/frecuentes",
    },

    credito: {
      resumen: "/reportes/credito/resumen",
      cuentasCobrar: "/reportes/credito/cuentas-cobrar",
    },

    apartados: {
      resumen: "/reportes/apartados/resumen",
      detalle: "/reportes/apartados/detalle",
    },

    financiero: {
      resumen: "/reportes/financiero/resumen",
      metodosPago: "/reportes/financiero/metodos-pago",
    },

    cortes: {
      resumen: "/reportes/cortes/resumen",
      detalle: "/reportes/cortes/detalle",
    },

    exportaciones: "/reportes/exportaciones",

    export: {
      pdf: "/reportes/export/pdf",
      excel: "/reportes/export/excel",
    },
  },
  analitica: {
    health: "/analitica/health",
    creditoCliente: (id: string | number) =>
      `/analitica/clientes/${id}/credito`,
    ventasProducto: (id: string | number) =>
      `/analitica/productos/${id}/ventas`,
  },

  contenido: {
    paginasAdmin: "/contenido/admin/paginas",
    paginaById: (id: string) => `/contenido/admin/paginas/${id}`,
    paginaAdminById: (id: string) => `/contenido/admin/paginas/by-id/${id}`,
    paginaAdminByClave: (clave: string) =>
      `/contenido/admin/paginas/by-clave/${clave}`,

    paginaStatus: (id: string) => `/contenido/admin/paginas/${id}/status`,
    paginaPublicacion: (id: string) =>
      `/contenido/admin/paginas/${id}/publicacion`,
    paginaVersiones: (id: string) => `/contenido/admin/paginas/${id}/versiones`,
    restaurarPaginaVersion: (id: string, versionId: string) =>
      `/contenido/admin/paginas/${id}/versiones/${versionId}/restaurar`,

    paginaPublica: (clave: string) => `/contenido/public/paginas/${clave}`,

    faqsAdmin: "/contenido/admin/faqs",
    faqById: (id: string) => `/contenido/admin/faqs/${id}`,
    faqStatus: (id: string) => `/contenido/admin/faqs/${id}/status`,
    faqPublicacion: (id: string) => `/contenido/admin/faqs/${id}/publicacion`,
    faqsReorder: "/contenido/admin/faqs/reorder",

    faqsPublicas: "/contenido/public/faqs",
  },
  contacto: {
    mensajesAdmin: "/contacto/admin/mensajes",
    mensajesResumen: "/contacto/admin/mensajes/resumen",
    mensajeById: (id: string) => `/contacto/admin/mensajes/${id}`,
    mensajeStatus: (id: string) => `/contacto/admin/mensajes/${id}/status`,
    mensajeNotas: (id: string) => `/contacto/admin/mensajes/${id}/notas`,
    mensajeResponder: (id: string) =>
      `/contacto/admin/mensajes/${id}/responder`,

    mensajePublico: "/contacto/public/mensajes",
  },
  marketing: {
    suscripciones: "/marketing/admin/suscripciones",
    suscripcionById: (id: string) => `/marketing/admin/suscripciones/${id}`,
    suscripcionStatus: (id: string) =>
      `/marketing/admin/suscripciones/${id}/status`,

    cupones: "/marketing/admin/cupones",
    cuponById: (id: string) => `/marketing/admin/cupones/${id}`,
    cuponStatus: (id: string) => `/marketing/admin/cupones/${id}/status`,

    segmentos: "/marketing/admin/segmentos",
    segmentoById: (id: string) => `/marketing/admin/segmentos/${id}`,

    plantillas: "/marketing/admin/plantillas",
    plantillaById: (id: string) => `/marketing/admin/plantillas/${id}`,
    plantillaTestSend: (id: string) =>
      `/marketing/admin/plantillas/${id}/test-send`,
  },
} as const;
