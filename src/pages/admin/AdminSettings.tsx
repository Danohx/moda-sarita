import { useState } from 'react';
import { Settings, Users, Shield, CreditCard, Plus, Edit, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

// Interfaces TypeScript
interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
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
  type: 'manual' | 'terminal' | 'gateway';
  status: 'active' | 'inactive';
  config: {
    apiKey?: string;
    bank?: string;
    account?: string;
    clabe?: string;
  };
}

interface Permission {
  id: string;
  name: string;
  category: string;
}

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Datos de ejemplo con tipos
  const employees: Employee[] = [
    {
      id: '1',
      name: 'Ana García',
      email: 'ana@modasarita.com',
      role: 'Administrador',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      createdAt: '2023-05-10'
    },
    {
      id: '2',
      name: 'Carlos López',
      email: 'carlos@modasarita.com',
      role: 'Cajero',
      status: 'active',
      lastLogin: '2024-01-14 09:15',
      createdAt: '2023-08-22'
    },
    {
      id: '3',
      name: 'María Rodríguez',
      email: 'maria@modasarita.com',
      role: 'Vendedor',
      status: 'inactive',
      lastLogin: '2024-01-10 16:45',
      createdAt: '2023-11-05'
    }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Administrador',
      permissions: ['all'],
      userCount: 1,
      isSystem: true
    },
    {
      id: '2',
      name: 'Cajero',
      permissions: ['sales.view', 'sales.create', 'customers.view'],
      userCount: 2,
      isSystem: false
    },
    {
      id: '3',
      name: 'Vendedor',
      permissions: ['sales.view', 'customers.view'],
      userCount: 1,
      isSystem: false
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'Efectivo',
      type: 'manual',
      status: 'active',
      config: {}
    },
    {
      id: '2',
      name: 'Tarjeta de Crédito/Débito',
      type: 'terminal',
      status: 'active',
      config: {}
    },
    {
      id: '3',
      name: 'Mercado Pago',
      type: 'gateway',
      status: 'inactive',
      config: { apiKey: 'sk_*************1234' }
    },
    {
      id: '4',
      name: 'Transferencia Bancaria',
      type: 'manual',
      status: 'active',
      config: { 
        bank: 'BBVA', 
        account: '0123456789',
        clabe: '012180001234567890'
      }
    }
  ];

  const allPermissions: Permission[] = [
    { id: 'sales.view', name: 'Ver Ventas', category: 'Ventas' },
    { id: 'sales.create', name: 'Registrar Ventas', category: 'Ventas' },
    { id: 'sales.cancel', name: 'Cancelar Ventas', category: 'Ventas' },
    { id: 'customers.view', name: 'Ver Clientes', category: 'Clientes' },
    { id: 'customers.edit', name: 'Editar Clientes', category: 'Clientes' },
    { id: 'customers.credit', name: 'Gestionar Crédito', category: 'Clientes' },
    { id: 'inventory.view', name: 'Ver Inventario', category: 'Inventario' },
    { id: 'inventory.edit', name: 'Editar Productos', category: 'Inventario' },
    { id: 'reports.view', name: 'Ver Reportes', category: 'Reportes' },
    { id: 'settings.employees', name: 'Gestionar Empleados', category: 'Configuración' },
    { id: 'settings.roles', name: 'Gestionar Roles', category: 'Configuración' }
  ];

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenEmployeeModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setOpenRoleModal(true);
  };

  const handleEditPayment = (_method: PaymentMethod) => {
    setOpenPaymentModal(true);
  };

  const toggleEmployeeStatus = (employee: Employee) => {
    console.log(`${employee.status === 'active' ? 'Desactivando' : 'Activando'} empleado:`, employee.name);
  };

  // Interface para agrupar permisos por categoría
  interface PermissionCategory {
    category: string;
    permissions: Permission[];
  }

  return (
    <div>
      <h1 className="account-title">Configuración del Sistema</h1>

      {/* Navegación por Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-accent)',
        flexWrap: 'wrap'
      }}>
        <button 
          className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <Users size={18} style={{ marginRight: '0.5rem' }} />
          Empleados
        </button>
        <button 
          className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={18} style={{ marginRight: '0.5rem' }} />
          Roles y Permisos
        </button>
        <button 
          className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={18} style={{ marginRight: '0.5rem' }} />
          Métodos de Pago
        </button>
        <button 
          className={`tab-button ${activeTab === 'store' ? 'active' : ''}`}
          onClick={() => setActiveTab('store')}
        >
          <Settings size={18} style={{ marginRight: '0.5rem' }} />
          Datos de la Tienda
        </button>
      </div>

      {/* TAB: EMPLEADOS */}
      {activeTab === 'employees' && (
        <div className="checkout-section">
          <div className="catalog-header">
            <h2 className="checkout-section-title">
              <Users className="section-icon" style={{ marginRight: '0.5rem' }} /> 
              Gestión de Empleados
            </h2>
            <button 
              className="button button-primary" 
              onClick={() => {
                setSelectedEmployee(null);
                setOpenEmployeeModal(true);
              }}
            >
              <Plus size={20} style={{ marginRight: '0.5rem' }} /> Nuevo Empleado
            </button>
          </div>

          <div className="transactions-table-container">
            <table className="transactions-table">
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
                {employees.map(employee => (
                  <tr key={employee.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{employee.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-gray)' }}>
                          {employee.email}
                        </div>
                      </div>
                    </td>
                    <td>{employee.role}</td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {new Date(employee.lastLogin).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>
                        {new Date(employee.lastLogin).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${employee.status}`}>
                        {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                          className="btn-outline-sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit size={14} /> Editar
                        </button>
                        <button 
                          className={`btn-outline-sm ${employee.status === 'active' ? 'danger' : 'success'}`}
                          onClick={() => toggleEmployeeStatus(employee)}
                        >
                          {employee.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                          {employee.status === 'active' ? 'Bloquear' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ROLES Y PERMISOS */}
      {activeTab === 'roles' && (
        <div className="checkout-section">
          <div className="catalog-header">
            <h2 className="checkout-section-title">
              <Shield className="section-icon" style={{ marginRight: '0.5rem' }} /> 
              Roles y Permisos
            </h2>
            <button 
              className="button button-primary" 
              onClick={() => {
                setSelectedRole(null);
                setOpenRoleModal(true);
              }}
            >
              <Plus size={20} style={{ marginRight: '0.5rem' }} /> Nuevo Rol
            </button>
          </div>

          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Nombre del Rol</th>
                  <th>Permisos</th>
                  <th>Usuarios</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}>
                    <td style={{ fontWeight: 'bold' }}>
                      {role.name}
                      {role.isSystem && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          background: 'var(--color-primary)', 
                          color: 'var(--color-text)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '1rem',
                          marginLeft: '0.5rem'
                        }}>
                          Sistema
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-gray)' }}>
                        {role.permissions[0] === 'all' ? 'Todos los permisos' : `${role.permissions.length} permisos`}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 'bold' }}>{role.userCount}</span> usuarios
                    </td>
                    <td>
                      <button 
                        className="btn-outline-sm"
                        onClick={() => handleEditRole(role)}
                        disabled={role.isSystem}
                      >
                        <Edit size={14} /> {role.isSystem ? 'Ver' : 'Editar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MÉTODOS DE PAGO */}
      {activeTab === 'payments' && (
        <div className="checkout-section">
          <h2 className="checkout-section-title">
            <CreditCard className="section-icon" style={{ marginRight: '0.5rem' }} /> 
            Métodos de Pago
          </h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {paymentMethods.map(method => (
              <div key={method.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid var(--color-accent)',
                borderRadius: 'var(--border-radius-small)',
                background: 'var(--color-surface)'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {method.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-gray)' }}>
                    {method.type === 'gateway' ? 'Pasarela de pago' : 
                     method.type === 'terminal' ? 'Terminal punto de venta' : 'Método manual'}
                  </div>
                  {method.config?.bank && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '0.25rem' }}>
                      {method.config.bank} - {method.config.account}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`status-badge ${method.status}`}>
                    {method.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                  <button 
                    className="btn-outline-sm"
                    onClick={() => handleEditPayment(method)}
                  >
                    <Edit size={14} /> Configurar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: DATOS DE LA TIENDA */}
      {activeTab === 'store' && (
        <div className="checkout-section">
          <h2 className="checkout-section-title">
            <Settings className="section-icon" style={{ marginRight: '0.5rem' }} /> 
            Datos de la Tienda
          </h2>
          
          <div className="form-grid">
            <div className="input-container full-width">
              <label className="input-label">Nombre de la Tienda</label>
              <input className="input-field" defaultValue="Moda Sarita" />
            </div>
            
            <div className="input-container full-width">
              <label className="input-label">Dirección Física</label>
              <input className="input-field" defaultValue="Av. Principal #123, Col. Centro, Huejutla" />
            </div>

            <div className="input-container full-width">
              <label className="input-label">Teléfono de Contacto</label>
              <input className="input-field" defaultValue="771 123 4567" />
            </div>

            <div className="input-container full-width">
              <label className="input-label">Correo Electrónico</label>
              <input className="input-field" defaultValue="contacto@modasarita.com" />
            </div>

            <div className="input-container full-width">
              <label className="input-label">Métodos de Pago Aceptados</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <label className="filter-option">
                  <input type="checkbox" defaultChecked className="filter-checkbox" /> Efectivo
                </label>
                <label className="filter-option">
                  <input type="checkbox" defaultChecked className="filter-checkbox" /> Tarjeta
                </label>
                <label className="filter-option">
                  <input type="checkbox" defaultChecked className="filter-checkbox" /> Transferencia
                </label>
              </div>
            </div>

            <div className="full-width">
              <button className="button button-primary">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: EMPLEADO --- */}
      <Modal 
        isOpen={openEmployeeModal} 
        onClose={() => {
          setOpenEmployeeModal(false);
          setSelectedEmployee(null);
        }} 
        title={selectedEmployee ? `Editar Empleado` : 'Nuevo Empleado'} 
        maxWidth="600px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-container">
              <label className="input-label">Nombre completo *</label>
              <input 
                type="text" 
                className="input-field" 
                defaultValue={selectedEmployee?.name || ''}
                placeholder="Ana García"
              />
            </div>
            <div className="input-container">
              <label className="input-label">Correo electrónico *</label>
              <input 
                type="email" 
                className="input-field" 
                defaultValue={selectedEmployee?.email || ''}
                placeholder="empleado@modasarita.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-container">
              <label className="input-label">Rol *</label>
              <select className="input-field" defaultValue={selectedEmployee?.role || ''}>
                <option value="">Seleccionar rol...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="input-container">
              <label className="input-label">Estado</label>
              <select className="input-field" defaultValue={selectedEmployee?.status || 'active'}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          {!selectedEmployee && (
            <div className="input-container">
              <label className="input-label">Contraseña temporal</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Generar automáticamente"
              />
              <div style={{ fontSize: '0.875rem', color: 'var(--color-gray)', marginTop: '0.25rem' }}>
                Se enviará un correo al empleado para que establezca su contraseña
              </div>
            </div>
          )}

          {selectedEmployee && (
            <div style={{ 
              background: 'var(--color-primary)', 
              padding: '1rem', 
              borderRadius: 'var(--border-radius-small)',
              fontSize: '0.875rem'
            }}>
              <div><strong>Fecha de registro:</strong> {new Date(selectedEmployee.createdAt).toLocaleDateString()}</div>
              <div><strong>Último acceso:</strong> {new Date(selectedEmployee.lastLogin).toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="button button-ghost" onClick={() => setOpenEmployeeModal(false)}>Cancelar</button>
          <button className="button button-primary">
            {selectedEmployee ? 'Actualizar Empleado' : 'Crear Empleado'}
          </button>
        </div>
      </Modal>

      {/* --- MODAL: ROLES --- */}
      <Modal 
        isOpen={openRoleModal} 
        onClose={() => {
          setOpenRoleModal(false);
          setSelectedRole(null);
        }} 
        title={selectedRole ? `Editar Rol: ${selectedRole.name}` : 'Nuevo Rol'} 
        maxWidth="700px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-container">
            <label className="input-label">Nombre del Rol *</label>
            <input 
              type="text" 
              className="input-field" 
              defaultValue={selectedRole?.name || ''}
              placeholder="Ej: Cajero, Vendedor, Gerente"
              disabled={selectedRole?.isSystem}
            />
          </div>

          <div>
            <label className="input-label">Permisos *</label>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              border: '1px solid var(--color-accent)',
              borderRadius: 'var(--border-radius-small)',
              padding: '1rem'
            }}>
              {allPermissions.reduce((acc: PermissionCategory[], permission: Permission) => {
                const category = permission.category;
                const existingCategory = acc.find(item => item.category === category);
                
                if (!existingCategory) {
                  acc.push({ category, permissions: [permission] });
                } else {
                  existingCategory.permissions.push(permission);
                }
                return acc;
              }, []).map((categoryGroup: PermissionCategory) => (
                <div key={categoryGroup.category} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ 
                    margin: '0 0 1rem 0', 
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    borderBottom: '1px solid var(--color-accent)',
                    paddingBottom: '0.5rem'
                  }}>
                    {categoryGroup.category}
                  </h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {categoryGroup.permissions.map((permission: Permission) => (
                      <label key={permission.id} className="filter-option" style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="checkbox" 
                          className="filter-checkbox"
                          defaultChecked={
                            selectedRole?.permissions?.includes('all') || 
                            selectedRole?.permissions?.includes(permission.id)
                          }
                          disabled={selectedRole?.isSystem}
                        />
                        <span style={{ marginLeft: '0.5rem' }}>{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedRole?.isSystem && (
            <div style={{ 
              background: 'var(--color-primary)', 
              padding: '1rem', 
              borderRadius: 'var(--border-radius-small)',
              fontSize: '0.875rem',
              color: 'var(--color-text)'
            }}>
              Este es un rol del sistema y no puede ser modificado.
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="button button-ghost" onClick={() => setOpenRoleModal(false)}>Cancelar</button>
          <button className="button button-primary" disabled={selectedRole?.isSystem}>
            {selectedRole ? 'Actualizar Rol' : 'Crear Rol'}
          </button>
        </div>
      </Modal>

      {/* --- MODAL: MÉTODOS DE PAGO --- */}
      <Modal 
        isOpen={openPaymentModal} 
        onClose={() => setOpenPaymentModal(false)} 
        title="Configurar Método de Pago" 
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-container">
            <label className="input-label">Clave Pública de API</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showApiKey ? "text" : "password"}
                className="input-field" 
                placeholder="pk_************"
                defaultValue="pk_************"
              />
              <button 
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-gray)',
                  cursor: 'pointer'
                }}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="input-container">
            <label className="input-label">Clave Secreta de API</label>
            <input 
              type="password"
              className="input-field" 
              placeholder="sk_************"
              defaultValue="sk_************"
            />
          </div>

          <div className="input-container">
            <label className="input-label">Estado</label>
            <select className="input-field" defaultValue="inactive">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div style={{ 
            background: 'var(--color-primary)', 
            padding: '1rem', 
            borderRadius: 'var(--border-radius-small)',
            fontSize: '0.875rem'
          }}>
            <strong>Importante:</strong> Las claves API son información sensible. 
            Se almacenan encriptadas y nunca se muestran completas por seguridad.
          </div>
        </div>

        <div className="modal-actions">
          <button className="button button-ghost" onClick={() => setOpenPaymentModal(false)}>Cancelar</button>
          <button className="button button-primary">Guardar Configuración</button>
        </div>
      </Modal>
    </div>
  );
};