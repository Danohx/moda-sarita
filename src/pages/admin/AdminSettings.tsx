// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  CreditCard,
  Store,
  Plus,
  Edit,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/AdminSettings.module.css';

type EmployeeStatus = 'active' | 'inactive';
type PaymentStatus = 'active' | 'inactive';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: EmployeeStatus;
  lastLogin?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  status: PaymentStatus;
  description: string;
}

interface StoreData {
  name: string;
  phone: string;
  email: string;
  address: string;
  rfc: string;
  taxRegime: string;
}

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [_showRoleModal, setShowRoleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Datos de ejemplo
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Ana García',
      email: 'ana@modasarita.com',
      role: 'Administrador',
      status: 'active',
      lastLogin: '2025-03-07'
    },
    {
      id: '2',
      name: 'Carlos Pérez',
      email: 'carlos@modasarita.com',
      role: 'Vendedor',
      status: 'active',
      lastLogin: '2025-03-06'
    }
  ]);

  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrador',
      permissions: ['all'],
      userCount: 2,
      isSystem: true
    },
    {
      id: '2',
      name: 'Vendedor',
      permissions: ['pos', 'customers', 'inventory'],
      userCount: 5,
      isSystem: false
    },
    {
      id: '3',
      name: 'Cajero',
      permissions: ['pos', 'cash'],
      userCount: 3,
      isSystem: false
    }
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      name: 'Efectivo',
      type: 'manual',
      status: 'active',
      description: 'Método manual'
    },
    {
      id: '2',
      name: 'Tarjeta (Terminal)',
      type: 'terminal',
      status: 'active',
      description: 'Terminal punto de venta'
    },
    {
      id: '3',
      name: 'Transferencia',
      type: 'manual',
      status: 'active',
      description: 'Transferencia bancaria'
    }
  ]);

  const [storeData, setStoreData] = useState<StoreData>({
    name: 'Moda Sarita',
    phone: '771-123-4567',
    email: 'contacto@modasarita.com',
    address: 'Calle Principal #123, Huejutla de Reyes, Hidalgo',
    rfc: 'XAXX010101000',
    taxRegime: '605 - Sueldos y Salarios'
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const tabs = [
    { icon: Users, label: 'Empleados' },
    { icon: Shield, label: 'Roles y Permisos' },
    { icon: CreditCard, label: 'Métodos de Pago' },
    { icon: Store, label: 'Datos de la Tienda' }
  ];

  return (
    <AdminLayout role="admin">
      <div className={styles.settings}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Configuración del Sistema</h1>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`${styles.tab} ${activeTab === index ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(index)}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Tab 0: Empleados */}
          {activeTab === 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Gestión de Empleados</h2>
                <button className={styles.addBtn} onClick={() => setShowEmployeeModal(true)}>
                  <Plus size={20} />
                  Nuevo Empleado
                </button>
              </div>

              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Rol</th>
                      <th>Último Acceso</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <tr key={i}>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                          <td><div className={styles.skeleton}></div></td>
                        </tr>
                      ))
                    ) : (
                      employees.map(emp => (
                        <tr key={emp.id}>
                          <td>
                            <div className={styles.employeeCell}>
                              <div className={styles.employeeAvatar}>
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <div className={styles.employeeName}>{emp.name}</div>
                                <div className={styles.employeeEmail}>{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{emp.role}</td>
                          <td>
                            {emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString('es-MX') : '—'}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${emp.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                              {emp.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button className={styles.actionBtn}>
                                <Edit size={16} />
                              </button>
                              <button className={`${styles.actionBtn} ${emp.status === 'active' ? styles.actionDanger : styles.actionSuccess}`}>
                                {emp.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 1: Roles y Permisos */}
          {activeTab === 1 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Roles y Permisos</h2>
                <button className={styles.addBtn} onClick={() => setShowRoleModal(true)}>
                  <Plus size={20} />
                  Nuevo Rol
                </button>
              </div>

              <div className={styles.rolesGrid}>
                {roles.map(role => (
                  <div key={role.id} className={styles.roleCard}>
                    <div className={styles.roleHeader}>
                      <h3 className={styles.roleName}>{role.name}</h3>
                      {role.isSystem && (
                        <span className={styles.systemBadge}>Sistema</span>
                      )}
                    </div>
                    <div className={styles.roleBody}>
                      <div className={styles.roleInfo}>
                        <span className={styles.roleLabel}>Permisos</span>
                        <span className={styles.roleValue}>
                          {role.permissions[0] === 'all' ? 'Todos los permisos' : `${role.permissions.length} permisos`}
                        </span>
                      </div>
                      <div className={styles.roleInfo}>
                        <span className={styles.roleLabel}>Usuarios</span>
                        <span className={styles.roleValue}>{role.userCount}</span>
                      </div>
                    </div>
                    <button
                      className={styles.roleEditBtn}
                      disabled={role.isSystem}
                    >
                      <Edit size={16} />
                      {role.isSystem ? 'Ver' : 'Editar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Métodos de Pago */}
          {activeTab === 2 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Métodos de Pago</h2>

              <div className={styles.paymentGrid}>
                {paymentMethods.map(method => (
                  <div key={method.id} className={styles.paymentCard}>
                    <div className={styles.paymentHeader}>
                      <div>
                        <h3 className={styles.paymentName}>{method.name}</h3>
                        <p className={styles.paymentDesc}>{method.description}</p>
                      </div>
                      <div className={styles.paymentActions}>
                        <span className={`${styles.statusBadge} ${method.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                          {method.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                        <button
                          className={styles.configBtn}
                          onClick={() => setShowPaymentModal(true)}
                        >
                          <SettingsIcon size={16} />
                          Configurar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Datos de la Tienda */}
          {activeTab === 3 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Datos de la Tienda</h2>

              <div className={styles.storeForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Nombre de la Tienda</label>
                    <input
                      type="text"
                      value={storeData.name}
                      onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={storeData.phone}
                      onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={storeData.email}
                      onChange={(e) => setStoreData({...storeData, email: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>RFC</label>
                    <input
                      type="text"
                      value={storeData.rfc}
                      onChange={(e) => setStoreData({...storeData, rfc: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label>Dirección</label>
                    <textarea
                      value={storeData.address}
                      onChange={(e) => setStoreData({...storeData, address: e.target.value})}
                      className={styles.textarea}
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroupFull}>
                    <label>Régimen Fiscal</label>
                    <select
                      value={storeData.taxRegime}
                      onChange={(e) => setStoreData({...storeData, taxRegime: e.target.value})}
                      className={styles.select}
                    >
                      <option value="605">605 - Sueldos y Salarios</option>
                      <option value="606">606 - Arrendamiento</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button className={styles.saveBtn}>
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Modal */}
        {showEmployeeModal && (
          <div className={styles.modalOverlay} onClick={() => setShowEmployeeModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Nuevo Empleado</h2>
                <button className={styles.closeBtn} onClick={() => setShowEmployeeModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nombre completo</label>
                  <input type="text" className={styles.input} placeholder="Ana García" />
                </div>
                <div className={styles.formGroup}>
                  <label>Correo electrónico</label>
                  <input type="email" className={styles.input} placeholder="empleado@modasarita.com" />
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Rol</label>
                    <select className={styles.select}>
                      <option value="">Seleccionar rol</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Estado</label>
                    <select className={styles.select}>
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Contraseña temporal</label>
                  <input type="password" className={styles.input} placeholder="(Opcional) o generar automáticamente" />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowEmployeeModal(false)}>
                  Cancelar
                </button>
                <button className={styles.saveBtn}>
                  Crear Empleado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Configurar Método de Pago</h2>
                <button className={styles.closeBtn} onClick={() => setShowPaymentModal(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Clave Pública de API</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="pk_live_..."
                    />
                    <button
                      className={styles.toggleBtn}
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Clave Secreta de API</label>
                  <input type="password" className={styles.input} placeholder="sk_live_..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Estado</label>
                  <select className={styles.select}>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <div className={styles.warningBox}>
                  <strong>Importante:</strong> Las claves API son información sensible. Se almacenan encriptadas.
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </button>
                <button className={styles.saveBtn}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;