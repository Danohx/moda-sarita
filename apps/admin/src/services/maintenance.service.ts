import {
  maintenanceApi,
  type MaintenanceJob,
} from "@shared/api/maintenance.api";

export const maintenanceService = {
  async getList(): Promise<MaintenanceJob[]> {
    const response = await maintenanceApi.getAll();
    return response.data ?? [];
  },

  async getTables(): Promise<string[]> {
    const response = await maintenanceApi.getTables();
    return response.data ?? []
  },

  async run(payload?: { tables?: string[] }): Promise<void> {
    await maintenanceApi.run(payload);
  },
};
