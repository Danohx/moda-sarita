import { useState } from 'react';
import { Plus, Edit, Eye, CreditCard, Search, Filter, DollarSign, ShoppingBag, Package } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export const AdminCustomers = () => {
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openCreditModal, setOpenCreditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Datos de ejemplo
  const customers = [
    {
      id: '1',
      name: 'María González',
      email: 'maria@email.com',
      phone: '771 123 4567',
      creditLimit: 5000,
      currentBalance: 1250,
      status: 'active',
      lastPurchase: '2024-01-15',
      joinDate: '2023-05-15'
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      phone: '771 987 6543',
      creditLimit: 3000,
      currentBalance: 0,
      status: 'active',
      lastPurchase: '2024-01-10',
      joinDate: '2023-06-20'
    },
    {
      id: '3',
      name: 'Ana Martínez',
      email: 'ana@email.com',
      phone: '771 555 7890',
      creditLimit: 0,
      currentBalance: 0,
      status: 'active',
      lastPurchase: '2024-01-08',
      joinDate: '2023-07-12'
    }
  ];

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setOpenCustomerModal(true);
  };

  const handleEditCredit = (customer: any) => {
    setSelectedCustomer(customer);
    setOpenCreditModal(true);
  };

  return (
    <div>
      <div className="catalog-header">
        <h1 className="account-title">Gestión de Clientes</h1>
        <button className="button button-primary" onClick={() => setOpenCustomerModal(true)}>
          <Plus size={20} style={{ marginRight: '0.5rem' }} /> Nuevo Cliente
        </button>
      </div>

      <div className="checkout-section">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar por nombre o teléfono..." 
              style={{ paddingLeft: '40px', width: '100%' }} 
            />
          </div>
          <select className="input-field" style={{ width: 'auto' }}>
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
          <button className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} /> Filtros
          </button>
        </div>

        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Límite Crédito</th>
                <th>Saldo Actual</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 'bold' }}>{customer.name}</td>
                  <td>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-gray)' }}>
                      <div>{customer.phone}</div>
                      <div>{customer.email}</div>
                    </div>
                  </td>
                  <td>
                    {customer.creditLimit > 0 ? (
                      <span className="text-green">${customer.creditLimit.toLocaleString()}</span>
                    ) : (
                      <span style={{ color: 'var(--color-gray)' }}>Sin crédito</span>
                    )}
                  </td>
                  <td>
                    {customer.creditLimit > 0 && (
                      <span className={customer.currentBalance > 0 ? 'text-red' : 'text-green'}>
                        ${customer.currentBalance.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${customer.status}`}>
                      {customer.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-outline-sm" 
                        onClick={() => handleViewCustomer(customer)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Eye size={14} /> Ver
                      </button>
                      <button 
                        className="btn-outline-sm" 
                        onClick={() => handleViewCustomer(customer)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Edit size={14} /> Editar
                      </button>
                      {customer.creditLimit > 0 && (
                        <button 
                          className="btn-outline-sm" 
                          onClick={() => handleEditCredit(customer)}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <CreditCard size={14} /> Crédito
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: DETALLES/EDICIÓN CLIENTE --- */}
      <Modal 
        isOpen={openCustomerModal} 
        onClose={() => {
          setOpenCustomerModal(false);
          setSelectedCustomer(null);
        }} 
        title={selectedCustomer ? `Detalles de ${selectedCustomer.name}` : 'Nuevo Cliente'} 
        maxWidth="800px"
      >
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Columna Izquierda - Información Básica */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)', fontSize: '1.125rem' }}>Información Personal</h3>
            
            <div className="input-container">
              <label className="input-label">Nombre completo *</label>
              <input 
                type="text" 
                className="input-field" 
                defaultValue={selectedCustomer?.name || ''}
                placeholder="María González"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-container">
                <label className="input-label">Teléfono *</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  defaultValue={selectedCustomer?.phone || ''}
                  placeholder="771 123 4567"
                />
              </div>
              <div className="input-container">
                <label className="input-label">Correo electrónico *</label>
                <input 
                  type="email" 
                  className="input-field" 
                  defaultValue={selectedCustomer?.email || ''}
                  placeholder="cliente@email.com"
                />
              </div>
            </div>

            <div className="input-container">
              <label className="input-label">Dirección</label>
              <textarea 
                className="input-field" 
                rows={3}
                defaultValue={selectedCustomer?.address || ''}
                placeholder="Av. Principal #123, Col. Centro"
              ></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-container">
                <label className="input-label">Fecha de registro</label>
                <input 
                  type="date" 
                  className="input-field" 
                  defaultValue={selectedCustomer?.joinDate || ''}
                  disabled={!!selectedCustomer}
                />
              </div>
              <div className="input-container">
                <label className="input-label">Estado</label>
                <select className="input-field" defaultValue={selectedCustomer?.status || 'active'}>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Historial e Información Adicional */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-text)', fontSize: '1.125rem' }}>Información Adicional</h3>
            
            {/* Línea de Crédito */}
            <div style={{ 
              background: 'var(--color-primary)', 
              padding: '1rem', 
              borderRadius: 'var(--border-radius-small)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>Línea de Crédito</span>
                <span className={`status-badge ${selectedCustomer?.creditLimit > 0 ? 'active' : 'inactive'}`}>
                  {selectedCustomer?.creditLimit > 0 ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              
              {selectedCustomer?.creditLimit > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Límite:</span>
                    <span style={{ fontWeight: 'bold' }}>${selectedCustomer.creditLimit.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Saldo actual:</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: selectedCustomer.currentBalance > 0 ? 'var(--color-error)' : 'var(--color-success)' 
                    }}>
                      ${selectedCustomer.currentBalance.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Disponible:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                      ${(selectedCustomer.creditLimit - selectedCustomer.currentBalance).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: 'var(--color-gray)' }}>Este cliente no tiene línea de crédito activa.</p>
              )}
            </div>

            {/* Resumen de Actividad */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Resumen de Actividad</h4>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-primary-vibrant)' }}>3</div>
                  <div style={{ color: 'var(--color-gray)' }}>Compras</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-primary-vibrant)' }}>2</div>
                  <div style={{ color: 'var(--color-gray)' }}>Apartados</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-primary-vibrant)' }}>$2,500</div>
                  <div style={{ color: 'var(--color-gray)' }}>Total gastado</div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Acciones Rápidas</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="button button-outline" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                  <ShoppingBag size={14} /> Historial
                </button>
                <button className="button button-outline" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                  <Package size={14} /> Apartados
                </button>
                <button className="button button-outline" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                  <DollarSign size={14} /> Abonar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="button button-ghost" onClick={() => setOpenCustomerModal(false)}>Cancelar</button>
          <button className="button button-primary">
            {selectedCustomer ? 'Actualizar Cliente' : 'Guardar Cliente'}
          </button>
        </div>
      </Modal>

      {/* --- MODAL: GESTIÓN DE CRÉDITO --- */}
      <Modal 
        isOpen={openCreditModal} 
        onClose={() => {
          setOpenCreditModal(false);
          setSelectedCustomer(null);
        }} 
        title={`Gestión de Crédito - ${selectedCustomer?.name}`} 
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Estado Actual */}
          <div style={{ 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            padding: '1.5rem',
            borderRadius: 'var(--border-radius-small)',
            color: 'var(--color-text)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Estado Actual del Crédito</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Límite actual:</span>
                <span style={{ fontWeight: 'bold' }}>${selectedCustomer?.creditLimit.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Saldo utilizado:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-error)' }}>
                  ${selectedCustomer?.currentBalance.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Crédito disponible:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                  ${((selectedCustomer?.creditLimit || 0) - (selectedCustomer?.currentBalance || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Configuración de Crédito */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Configuración de Crédito</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-container">
                <label className="input-label">Nuevo Límite de Crédito</label>
                <input 
                  type="number" 
                  className="input-field" 
                  defaultValue={selectedCustomer?.creditLimit || 0}
                  min="0"
                  step="100"
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="enableCredit" defaultChecked={selectedCustomer?.creditLimit > 0} />
                <label htmlFor="enableCredit" style={{ fontSize: '0.875rem' }}>
                  Habilitar línea de crédito para este cliente
                </label>
              </div>
            </div>
          </div>

          {/* Registrar Abono */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Registrar Abono</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="input-container">
                <label className="input-label">Monto a abonar</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="0.00"
                  max={selectedCustomer?.currentBalance || 0}
                />
              </div>
              <button className="button button-outline" style={{ whiteSpace: 'nowrap' }}>
                <DollarSign size={16} /> Abonar
              </button>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="button button-ghost" onClick={() => setOpenCreditModal(false)}>Cancelar</button>
          <button className="button button-primary">Guardar Cambios</button>
        </div>
      </Modal>
    </div>
  );
};

