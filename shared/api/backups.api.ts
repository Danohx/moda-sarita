import { apiFetch } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type Backup = {
  id: string;
  filename: string;
  size: number;
  status: "completed" | "failed";
  createdAt: string;
  tables: number;
  records: number;
  createdBy: string;
};

export const backupsApi = {
  getAll: () =>
    apiFetch<{ ok: boolean; data: Backup[] }>(API_ENDPOINTS.backups.list, {
      method: "GET",
      withAuth: true,
    }),

  create: () =>
    apiFetch<{ ok: boolean; data: Backup }>(API_ENDPOINTS.backups.create, {
      method: "POST",
      withAuth: true,
    }),

  remove: (id: string) =>
    apiFetch<{ ok: boolean }>(`${API_ENDPOINTS.backups.delete}/${id}`, {
      method: "DELETE",
      withAuth: true,
    }),

  download: async (id: string) => {
    const response = await fetch(
      `${API_ENDPOINTS.backups.download}/${id}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo descargar el respaldo.");
    }

    return response.blob();
  },
};
