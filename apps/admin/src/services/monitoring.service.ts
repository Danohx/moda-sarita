import { monitoringApi } from "../../../../shared/api/monitoring.api";

export const monitoringService = {
  async getSummary() {
    const res = await monitoringApi.getSummary();
    return res.data;
  },

  async getTables() {
    const res = await monitoringApi.getTables();
    return res.data;
  },

  async getVacuum() {
    const res = await monitoringApi.getVacuum();
    return res.data;
  },

  async getConnections() {
    const res = await monitoringApi.getConnections();
    return res.data;
  },
};