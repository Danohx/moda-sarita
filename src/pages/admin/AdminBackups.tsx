// src/pages/admin/AdminBackups.tsx
import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileArchive,
  FileText,
  Trash2,
  RefreshCw,
  Settings
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/AdminBackups.module.css';

interface Backup {
  id: string;
  filename: string;
  type: 'full' | 'incremental';
  format: 'gz' | 'csv';
  size: number;
  tables: number;
  records: number;
  createdAt: string;
  createdBy: string;
  status: 'completed' | 'in_progress' | 'failed';
}

interface BackupConfig {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // días
  compression: boolean;
  tables: string[];
}

export const AdminBackups: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'gz' | 'csv'>('gz');
  const [selectedType, setSelectedType] = useState<'full' | 'incremental'>('full');
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackup: true,
    frequency: 'daily',
    retention: 30,
    compression: true,
    tables: []
  });

  // Datos de ejemplo
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    // TODO: Llamar API GET /api/admin/backups
    setTimeout(() => {
      setBackups([
        {
          id: '1',
          filename: 'moda_sarita_backup_2026-03-10_14-30.sql.gz',
          type: 'full',
          format: 'gz',
          size: 2457600, // bytes
          tables: 18,
          records: 15420,
          createdAt: '2026-03-10T14:30:00',
          createdBy: 'Admin',
          status: 'completed'
        },
        {
          id: '2',
          filename: 'moda_sarita_backup_2026-03-09_09-00.sql.gz',
          type: 'full',
          format: 'gz',
          size: 2234880,
          tables: 18,
          records: 14890,
          createdAt: '2026-03-09T09:00:00',
          createdBy: 'Sistema (Auto)',
          status: 'completed'
        },
        {
          id: '3',
          filename: 'productos_export_2026-03-08.csv',
          type: 'incremental',
          format: 'csv',
          size: 524288,
          tables: 1,
          records: 1250,
          createdAt: '2026-03-08T16:45:00',
          createdBy: 'Admin',
          status: 'completed'
        }
      ]);
      setLoading(false);
    }, 800);
  };

  const createBackup = async () => {
    setCreating(true);
    
    // TODO: Llamar API POST /api/admin/backups
    const data = {
      type: selectedType,
      format: selectedFormat,
      tables: selectedType === 'incremental' ? ['productos', 'inventario'] : 'all'
    };

    console.log('Creating backup:', data);

    setTimeout(() => {
      // Simular creación exitosa
      const newBackup: Backup = {
        id: Date.now().toString(),
        filename: `moda_sarita_backup_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().slice(0, 5).replace(':', '-')}.${selectedFormat === 'gz' ? 'sql.gz' : 'csv'}`,
        type: selectedType,
        format: selectedFormat,
        size: Math.random() * 3000000,
        tables: selectedType === 'full' ? 18 : 2,
        records: Math.floor(Math.random() * 20000),
        createdAt: new Date().toISOString(),
        createdBy: 'Admin',
        status: 'completed'
      };

      setBackups([newBackup, ...backups]);
      setCreating(false);
    }, 3000);
  };

  const downloadBackup = async (backup: Backup) => {
    // TODO: Llamar API GET /api/admin/backups/:id/download
    console.log('Downloading:', backup.filename);
    
    // Simular descarga
    const link = document.createElement('a');
    link.href = '#'; // En producción: URL del archivo
    link.download = backup.filename;
    link.click();
  };

  const deleteBackup = async (backupId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este respaldo?')) return;
    
    // TODO: Llamar API DELETE /api/admin/backups/:id
    setBackups(backups.filter(b => b.id !== backupId));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalBackupsSize = backups.reduce((sum, b) => sum + b.size, 0);
  const lastBackup = backups.length > 0 ? backups[0] : null;

  return (
      <div className={styles.backups}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Respaldos de Base de Datos</h1>
            <p className={styles.subtitle}>Gestiona y descarga copias de seguridad</p>
          </div>
          <button 
            className={styles.configBtn}
            onClick={() => setShowConfig(true)}
          >
            <Settings size={20} />
            Configuración
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statPrimary}`}>
            <div className={styles.statIcon}>
              <Database size={32} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total de Respaldos</span>
              <span className={styles.statValue}>{backups.length}</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statSuccess}`}>
            <div className={styles.statIcon}>
              <HardDrive size={32} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Espacio Utilizado</span>
              <span className={styles.statValue}>{formatBytes(totalBackupsSize)}</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statInfo}`}>
            <div className={styles.statIcon}>
              <Clock size={32} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Último Respaldo</span>
              <span className={styles.statValue}>
                {lastBackup ? formatDate(lastBackup.createdAt) : 'N/A'}
              </span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statWarning}`}>
            <div className={styles.statIcon}>
              <Calendar size={32} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Retención</span>
              <span className={styles.statValue}>{config.retention} días</span>
            </div>
          </div>
        </div>

        {/* Create Backup Section */}
        <div className={styles.createSection}>
          <h2 className={styles.sectionTitle}>Crear Nuevo Respaldo</h2>
          
          <div className={styles.createForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tipo de Respaldo</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="type"
                      value="full"
                      checked={selectedType === 'full'}
                      onChange={(e) => setSelectedType(e.target.value as 'full')}
                    />
                    <div className={styles.radioLabel}>
                      <Database size={20} />
                      <div>
                        <strong>Completo</strong>
                        <span>Todas las tablas (18)</span>
                      </div>
                    </div>
                  </label>

                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="type"
                      value="incremental"
                      checked={selectedType === 'incremental'}
                      onChange={(e) => setSelectedType(e.target.value as 'incremental')}
                    />
                    <div className={styles.radioLabel}>
                      <FileText size={20} />
                      <div>
                        <strong>Incremental</strong>
                        <span>Solo tablas seleccionadas</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Formato de Exportación</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="format"
                      value="gz"
                      checked={selectedFormat === 'gz'}
                      onChange={(e) => setSelectedFormat(e.target.value as 'gz')}
                    />
                    <div className={styles.radioLabel}>
                      <FileArchive size={20} />
                      <div>
                        <strong>SQL comprimido (.gz)</strong>
                        <span>Restauración completa</span>
                      </div>
                    </div>
                  </label>

                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={selectedFormat === 'csv'}
                      onChange={(e) => setSelectedFormat(e.target.value as 'csv')}
                    />
                    <div className={styles.radioLabel}>
                      <FileText size={20} />
                      <div>
                        <strong>CSV (.csv)</strong>
                        <span>Exportación de datos</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {selectedType === 'incremental' && (
              <div className={styles.tablesSelection}>
                <label>Tablas a Respaldar</label>
                <div className={styles.checkboxGrid}>
                  {['productos', 'clientes', 'ventas', 'inventario', 'usuarios'].map(table => (
                    <label key={table} className={styles.checkboxLabel}>
                      <input type="checkbox" />
                      <span>{table}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              className={styles.createBtn}
              onClick={createBackup}
              disabled={creating}
            >
              {creating ? (
                <>
                  <RefreshCw size={20} className={styles.spinning} />
                  Creando Respaldo...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Crear Respaldo Ahora
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backups List */}
        <div className={styles.listSection}>
          <div className={styles.listHeader}>
            <h2 className={styles.sectionTitle}>Historial de Respaldos</h2>
            <button className={styles.refreshBtn} onClick={loadBackups}>
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <RefreshCw size={32} className={styles.spinning} />
              <p>Cargando respaldos...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className={styles.empty}>
              <Database size={48} />
              <p>No hay respaldos disponibles</p>
              <span>Crea tu primer respaldo usando el formulario de arriba</span>
            </div>
          ) : (
            <div className={styles.backupsList}>
              {backups.map(backup => (
                <div key={backup.id} className={styles.backupCard}>
                  <div className={styles.backupIcon}>
                    {backup.format === 'gz' ? (
                      <FileArchive size={32} />
                    ) : (
                      <FileText size={32} />
                    )}
                  </div>

                  <div className={styles.backupInfo}>
                    <div className={styles.backupHeader}>
                      <h3 className={styles.backupFilename}>{backup.filename}</h3>
                      <div className={styles.backupBadges}>
                        <span className={`${styles.badge} ${backup.type === 'full' ? styles.badgeFull : styles.badgeIncremental}`}>
                          {backup.type === 'full' ? 'Completo' : 'Incremental'}
                        </span>
                        <span className={`${styles.badge} ${backup.status === 'completed' ? styles.badgeSuccess : styles.badgeDanger}`}>
                          {backup.status === 'completed' ? (
                            <>
                              <CheckCircle size={14} />
                              Completado
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} />
                              Fallido
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className={styles.backupMeta}>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{formatDate(backup.createdAt)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <HardDrive size={16} />
                        <span>{formatBytes(backup.size)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Database size={16} />
                        <span>{backup.tables} tablas • {backup.records.toLocaleString()} registros</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span>Por: {backup.createdBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.backupActions}>
                    <button
                      className={styles.downloadBtn}
                      onClick={() => downloadBackup(backup)}
                      title="Descargar"
                    >
                      <Download size={18} />
                      Descargar
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteBackup(backup.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Modal */}
        {showConfig && (
          <div className={styles.modalOverlay} onClick={() => setShowConfig(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Configuración de Respaldos Automáticos</h2>
                <button className={styles.closeBtn} onClick={() => setShowConfig(false)}>
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.configGroup}>
                  <label className={styles.switchLabel}>
                    <input
                      type="checkbox"
                      checked={config.autoBackup}
                      onChange={(e) => setConfig({...config, autoBackup: e.target.checked})}
                    />
                    <span>Habilitar respaldos automáticos</span>
                  </label>
                </div>

                {config.autoBackup && (
                  <>
                    <div className={styles.configGroup}>
                      <label>Frecuencia</label>
                      <select
                        value={config.frequency}
                        onChange={(e) => setConfig({...config, frequency: e.target.value as any})}
                        className={styles.select}
                      >
                        <option value="daily">Diario (3:00 AM)</option>
                        <option value="weekly">Semanal (Domingo 3:00 AM)</option>
                        <option value="monthly">Mensual (Día 1, 3:00 AM)</option>
                      </select>
                    </div>

                    <div className={styles.configGroup}>
                      <label>Retención de Respaldos</label>
                      <select
                        value={config.retention}
                        onChange={(e) => setConfig({...config, retention: parseInt(e.target.value)})}
                        className={styles.select}
                      >
                        <option value="7">7 días</option>
                        <option value="15">15 días</option>
                        <option value="30">30 días</option>
                        <option value="60">60 días</option>
                        <option value="90">90 días</option>
                      </select>
                    </div>

                    <div className={styles.configGroup}>
                      <label className={styles.switchLabel}>
                        <input
                          type="checkbox"
                          checked={config.compression}
                          onChange={(e) => setConfig({...config, compression: e.target.checked})}
                        />
                        <span>Comprimir respaldos (.gz)</span>
                      </label>
                    </div>
                  </>
                )}

                <div className={styles.infoBox}>
                  <AlertCircle size={20} />
                  <div>
                    <strong>Importante:</strong> Los respaldos automáticos se ejecutarán según la frecuencia configurada. 
                    Los archivos antiguos se eliminarán automáticamente después del período de retención.
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowConfig(false)}>
                  Cancelar
                </button>
                <button className={styles.saveBtn} onClick={() => setShowConfig(false)}>
                  Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};
export default AdminBackups;