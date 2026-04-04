import { backupsApi, type Backup } from "@shared/api/backups.api";

export const backupsService = {
  async getList(): Promise<Backup[]> {
    const response = await backupsApi.getAll();
    return response.data ?? [];
  },

  async create(): Promise<Backup> {
    const response = await backupsApi.create();
    return response.data;
  },

  async download(backup: Backup): Promise<void> {
    const blob = await backupsApi.download(backup.id);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = backup.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  },

  async remove(id: string): Promise<void> {
    await backupsApi.remove(id);
  },
};
