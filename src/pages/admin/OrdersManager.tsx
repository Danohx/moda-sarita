import { useState } from 'react';

export const OrdersManager = () => {
  const [activeTab, setActiveTab] = useState<'web' | 'fisico'>('web');

  return (
    <div>
       <h1 className="account-title">Gestión de Pedidos</h1>
       
       {/* Custom Tabs */}
       <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '2rem' }}>
          <button 
            onClick={() => setActiveTab('web')}
            style={{ 
              background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '1rem',
              color: activeTab === 'web' ? 'var(--color-primary-vibrant)' : 'var(--color-text)',
              borderBottom: activeTab === 'web' ? '2px solid var(--color-primary-vibrant)' : 'none'
            }}
          >
            Pedidos Web
          </button>
          <button 
            onClick={() => setActiveTab('fisico')}
            style={{ 
              background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '1rem',
              color: activeTab === 'fisico' ? 'var(--color-primary-vibrant)' : 'var(--color-text)',
              borderBottom: activeTab === 'fisico' ? '2px solid var(--color-primary-vibrant)' : 'none'
            }}
          >
            Apartados Físicos
          </button>
       </div>

       {/* Contenido: Pedidos Web */}
       {activeTab === 'web' && (
         <div className="checkout-section">
            <div className="orders-list">
              {[1, 2].map(order => (
                <div key={order} className="order-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <div className="order-header" style={{ marginBottom: '0.25rem' }}>
                        <span className="order-id">Orden #{2020 + order}</span>
                        <span style={{ marginLeft: '1rem' }} className="status-enviado order-status">Por Enviar</span>
                      </div>
                      <div className="order-items">Cliente: Juan Pérez • 3 Artículos</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-gray)' }}>Hace 2 horas</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div className="order-total">$1,250.00</div>
                      <button className="button button-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Ver Detalles
                      </button>
                   </div>
                </div>
              ))}
            </div>
         </div>
       )}

       {/* Contenido: Apartados */}
       {activeTab === 'fisico' && (
         <div className="apartados-grid">
            <div className="apartado-card">
               <div className="apartado-header">
                 <h3>María González</h3>
                 <span className="apartado-deadline">Vence: 25 Nov</span>
               </div>
               <div className="apartado-stats">
                 <div><span className="stat-label">Total</span><span className="stat-value">$2,000</span></div>
                 <div><span className="stat-label">Abonado</span><span className="stat-value-highlight text-green">$500</span></div>
                 <div><span className="stat-label">Resta</span><span className="stat-value text-red">$1,500</span></div>
               </div>
               <div className="progress-container">
                  <div className="progress-bar" style={{ width: '25%' }}></div>
               </div>
               <div className="apartado-actions">
                  <button className="btn-secondary">Abonar</button>
                  <button className="btn-secondary" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>Cancelar</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};