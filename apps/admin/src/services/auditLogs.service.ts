import { auditLogsApi, type AuditLog } from "@shared/api/auditLogs.api";

export const auditLogsService = {
  async getList(): Promise<AuditLog[]> {
    const response = await auditLogsApi.getAll();
    return response.data ?? [];
  },
};
