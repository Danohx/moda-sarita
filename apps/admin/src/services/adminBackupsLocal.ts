export interface Backup {
  id: string;
  filename: string;
  format: 'gz';
  size: number;
  tables: number;
  records: number;
  createdAt: string;
  createdBy: string;
  status: 'completed' | 'in_progress' | 'failed';
  database?: 'interna' | 'publica';
}

export interface BackupConfig {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  compression: boolean;
}

const BASE_URL = 'http://127.0.0.1:4310/local-backups';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Ocurrió un error en el servicio local de respaldos.';
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Ignorar
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function getBackups(): Promise<Backup[]> {
  const response = await fetch(BASE_URL);
  return parseResponse<Backup[]>(response);
}

export async function createAndDownloadBackup(): Promise<void> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ format: 'gz' }),
  });

  if (!response.ok) {
    throw new Error('Error al generar y descargar el respaldo');
  }

  const contentDisposition = response.headers.get('Content-Disposition');
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  let filename = `moda-sarita_${timestamp}.backup.gz`;
  
  if (contentDisposition && contentDisposition.includes('filename=')) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch.length === 2) {
      filename = filenameMatch[1];
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}

export async function downloadBackupFile(backup: Backup): Promise<void> {
  const downloadUrl = `${BASE_URL}/${backup.id}/download`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', backup.filename); 
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}

export async function removeBackup(backupId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${backupId}`, {
    method: 'DELETE',
  });
  await parseResponse<{ ok: boolean }>(response);
}

export async function getBackupConfig(): Promise<BackupConfig> {
  const response = await fetch(`${BASE_URL}/config`);
  return parseResponse<BackupConfig>(response);
}

export async function updateBackupConfig(config: BackupConfig): Promise<BackupConfig> {
  const response = await fetch(`${BASE_URL}/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  return parseResponse<BackupConfig>(response);
}