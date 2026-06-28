import {
  auditLogsApi,
  type AuditLogApi,
} from "../../../../shared/api/auditLogs.api";

export type AuditLog = {
  id: string;
  title: string;
  area: string;
  summary: string;
  responsible: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  technical: boolean;
};

function humanize(value?: string | null) {
  if (!value) return "Sistema";

  return value
    .split(".")
    .at(-1)!
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeMetadata(metadata: AuditLogApi["metadata"]) {
  if (!metadata) return null;

  if (typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }

  return { value: metadata };
}

function isBusinessLog(log: AuditLogApi) {
  return String(log.descripcion || "").startsWith("Se ");
}

function getArea(log: AuditLogApi) {
  const metadata = normalizeMetadata(log.metadata);

  if (log.modulo === "seguridad.empleados") return "Empleados";
  if (log.modulo === "seguridad.sesiones") return "Seguridad";

  if (log.modulo === "ventas.pos") return "Ventas";
  if (log.modulo === "ventas.corte_caja") return "Corte de caja";
  if (log.modulo === "ventas.apartados") return "Apartados";
  if (log.modulo === "ventas.pagos") return "Pagos";

  const nuevo = metadata?.nuevo as Record<string, unknown> | undefined;

  if (log.modulo === "configuracion.parametros" && nuevo?.modulo) {
    return humanize(String(nuevo.modulo));
  }

  return humanize(log.modulo);
}

function getTitle(log: AuditLogApi) {
  if (log.descripcion?.startsWith("Se ")) {
    return log.descripcion.replace(/^Se\s+/i, "").replace(/\.$/, "");
  }

  if (log.accion === "insert" || log.accion === "create") {
    return `${getArea(log)} creado`;
  }

  if (log.accion === "update") {
    return `${getArea(log)} actualizado`;
  }

  if (log.accion === "delete") {
    return `${getArea(log)} eliminado`;
  }

  return humanize(log.accion);
}

function getSummary(log: AuditLogApi) {
  const metadata = normalizeMetadata(log.metadata);

  if (log.modulo === "seguridad.empleados") {
    const email = String(metadata?.email || "un empleado");
    const role = metadata?.rol_nombre ? ` con rol ${metadata.rol_nombre}` : "";

    if (log.accion === "create") {
      return `Se registró la cuenta ${email}${role}.`;
    }

    if (log.accion === "activate") {
      return `Se reactivó el acceso de ${email}.`;
    }

    if (log.accion === "deactivate") {
      return `Se cerró el acceso de ${email}.`;
    }

    if (log.accion === "update") {
      return `Se actualizaron datos de ${email}.`;
    }
  }

  if (log.modulo === "seguridad.sesiones") {
    const count = Number(metadata?.sesiones_revocadas || 0);

    if (log.accion === "revoke_others") {
      return `Se cerraron ${count} sesiones abiertas en otros dispositivos.`;
    }

    return "Se cerró una sesión activa.";
  }

  return log.descripcion || "Se registró una actividad en el sistema.";
}

function mapAuditLog(log: AuditLogApi): AuditLog {
  const technical = !isBusinessLog(log);

  return {
    id: String(log.id),
    title: getTitle(log),
    area: getArea(log),
    summary: getSummary(log),
    responsible: log.usuario_email || "Sistema",
    createdAt: log.created_at,
    metadata: normalizeMetadata(log.metadata),
    technical,
  };
}

export const auditLogsService = {
  async getAll(options?: { includeTechnical?: boolean }): Promise<AuditLog[]> {
    const response = await auditLogsApi.getAll();

    return response.data
      .map(mapAuditLog)
      .filter((log) => options?.includeTechnical || !log.technical);
  },
};