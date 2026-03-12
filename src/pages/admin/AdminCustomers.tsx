// src/pages/admin/AdminCustomers.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit,
  CreditCard,
  User,
  ShoppingBag,
  DollarSign,
  Filter,
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import styles from '../../styles/AdminCustomers.module.css';

type CustomerStatus = 'active' | 'inactive';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  status: CustomerStatus;
  lastPurchase: string;
  totalPurchases: number;
  totalSpent: number;
  address?: string;
}

export const AdminCustomers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  // Datos de ejemplo (luego vienen del backend)
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'María González',
      email: 'maria@email.com',
      phone: '771-123-4567',
      creditLimit: 5000,
      currentBalance: 1200,
      status: 'active',
      lastPurchase: 'Hace 2 días',
      totalPurchases: 15,
      totalSpent: 12500,
      address: 'Calle Principal #123, Huejutla'
    },
    {
      id: '2',
      name: 'Ana Martínez',
      email: 'ana@email.com',
      phone: '771-234-5678',
      creditLimit: 3000,
      currentBalance: 0,
      status: 'active',
      lastPurchase: 'Hace 1 semana',
      totalPurchases: 8,
      totalSpent: 8200,
      address: 'Av. Juárez #456'
    },
    {
      id: '3',
      name: 'Carmen López',
      email: 'carmen@email.com',
      phone: '771-345-6789',
      creditLimit: 0,
      currentBalance: 0,
      status: 'active',
      lastPurchase: 'Hace 3 días',
      totalPurchases: 12,
      totalSpent: 9800
    }
  ]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return customers.filter(c => {
      const matchSearch = !q || 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      withCredit: customers.filter(c => c.creditLimit > 0).length,
      totalBalance: customers.reduce((sum, c) => sum + c.currentBalance, 0)
    };
  }, [customers]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const openDetailsModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const openCreditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCreditModal(true);
  };

  return (
    <AdminLayout role="admin">
      <div className={styles.customers}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gestión de Clientes</h1>
          <button className={styles.addBtn}>
            <Plus size={20} />
            Nuevo Cliente
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statPink}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Clientes</p>
              <h3 className={styles.statValue}>{stats.total}</h3>
            </div>
            <div className={styles.statIcon}>
              <User size={48} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statHotPink}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Activos</p>
              <h3 className={styles.statValue}>{stats.active}</h3>
            </div>
            <div className={styles.statIcon}>
              <ShoppingBag size={48} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statSoftPink}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Con Crédito</p>
              <h3 className={styles.statValue}>{stats.withCredit}</h3>
            </div>
            <div className={styles.statIcon}>
              <CreditCard size={48} />
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statLight}`}>
            <div className={styles.statContent}>
              <p className={styles.statLabelDark}>Saldo Total</p>
              <h3 className={styles.statValuePink}>{formatMoney(stats.totalBalance)}</h3>
            </div>
            <div className={styles.statIconPink}>
              <DollarSign size={48} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | CustomerStatus)}
              className={styles.select}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <button className={styles.moreFiltersBtn}>
            <Filter size={18} />
            Más Filtros
          </button>
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
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
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className={styles.skeleton}></div></td>
                      <td><div className={styles.skeleton}></div></td>
                      <td><div className={styles.skeleton}></div></td>
                      <td><div className={styles.skeleton}></div></td>
                      <td><div className={styles.skeleton}></div></td>
                      <td><div className={styles.skeleton}></div></td>
                    </tr>
                  ))
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.avatar}>
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className={styles.customerName}>{customer.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.contactCell}>
                          <span className={styles.phone}>{customer.phone}</span>
                          <span className={styles.email}>{customer.email}</span>
                        </div>
                      </td>
                      <td>
                        {customer.creditLimit > 0 ? (
                          <span className={styles.creditOk}>{formatMoney(customer.creditLimit)}</span>
                        ) : (
                          <span className={styles.noCredit}>Sin crédito</span>
                        )}
                      </td>
                      <td>
                        {customer.creditLimit > 0 ? (
                          <span className={customer.currentBalance > 0 ? styles.balanceBad : styles.balanceGood}>
                            {formatMoney(customer.currentBalance)}
                          </span>
                        ) : (
                          <span className={styles.noCredit}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${customer.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                          {customer.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => openDetailsModal(customer)}
                          >
                            <Eye size={16} />
                          </button>
                          <button className={styles.actionBtn}>
                            <Edit size={16} />
                          </button>
                          {customer.creditLimit > 0 && (
                            <button
                              className={styles.actionBtn}
                              onClick={() => openCreditModal(customer)}
                            >
                              <CreditCard size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      <User size={20} />
                      <span>No se encontraron clientes</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedCustomer && (
          <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Detalles de {selectedCustomer.name}</h2>
                <button className={styles.closeBtn} onClick={() => setShowDetailsModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalGrid}>
                  {/* Left Column */}
                  <div className={styles.modalColumn}>
                    <h3 className={styles.sectionTitle}>Información Personal</h3>
                    
                    <div className={styles.infoGroup}>
                      <div className={styles.infoItem}>
                        <User size={18} />
                        <div>
                          <span className={styles.infoLabel}>Nombre completo</span>
                          <span className={styles.infoValue}>{selectedCustomer.name}</span>
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <Phone size={18} />
                        <div>
                          <span className={styles.infoLabel}>Teléfono</span>
                          <span className={styles.infoValue}>{selectedCustomer.phone}</span>
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <Mail size={18} />
                        <div>
                          <span className={styles.infoLabel}>Email</span>
                          <span className={styles.infoValue}>{selectedCustomer.email}</span>
                        </div>
                      </div>

                      {selectedCustomer.address && (
                        <div className={styles.infoItem}>
                          <MapPin size={18} />
                          <div>
                            <span className={styles.infoLabel}>Dirección</span>
                            <span className={styles.infoValue}>{selectedCustomer.address}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className={styles.modalColumn}>
                    <h3 className={styles.sectionTitle}>Información de Crédito</h3>
                    
                    <div className={styles.creditInfo}>
                      <div className={styles.creditRow}>
                        <span>Límite de crédito</span>
                        <span className={styles.creditValue}>{formatMoney(selectedCustomer.creditLimit)}</span>
                      </div>
                      <div className={styles.creditRow}>
                        <span>Saldo actual</span>
                        <span className={selectedCustomer.currentBalance > 0 ? styles.balanceBad : styles.balanceGood}>
                          {formatMoney(selectedCustomer.currentBalance)}
                        </span>
                      </div>
                      <div className={styles.creditRow}>
                        <span>Crédito disponible</span>
                        <span className={styles.balanceGood}>
                          {formatMoney(selectedCustomer.creditLimit - selectedCustomer.currentBalance)}
                        </span>
                      </div>

                      {selectedCustomer.creditLimit > 0 && (
                        <div className={styles.progressSection}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{
                                width: `${(selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className={styles.progressLabel}>
                            {((selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100).toFixed(0)}% utilizado
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className={styles.sectionTitle}>Resumen de Actividad</h3>
                    <div className={styles.activityStats}>
                      <div className={styles.activityItem}>
                        <span className={styles.activityValue}>{selectedCustomer.totalPurchases}</span>
                        <span className={styles.activityLabel}>Compras</span>
                      </div>
                      <div className={styles.activityItem}>
                        <span className={styles.activityValue}>{formatMoney(selectedCustomer.totalSpent)}</span>
                        <span className={styles.activityLabel}>Total</span>
                      </div>
                      <div className={styles.activityItem}>
                        <span className={styles.activityValue}>{selectedCustomer.lastPurchase}</span>
                        <span className={styles.activityLabel}>Última compra</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowDetailsModal(false)}>
                  Cerrar
                </button>
                <button className={styles.saveBtn}>
                  <Edit size={18} />
                  Editar Cliente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credit Modal */}
        {showCreditModal && selectedCustomer && (
          <div className={styles.modalOverlay} onClick={() => setShowCreditModal(false)}>
            <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Gestión de Crédito</h2>
                <button className={styles.closeBtn} onClick={() => setShowCreditModal(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.creditBanner}>
                  <h3>Estado Actual del Crédito</h3>
                  <div className={styles.bannerStats}>
                    <div className={styles.bannerRow}>
                      <span>Límite actual:</span>
                      <span className={styles.bannerValue}>{formatMoney(selectedCustomer.creditLimit)}</span>
                    </div>
                    <div className={styles.bannerRow}>
                      <span>Saldo utilizado:</span>
                      <span className={styles.bannerValue}>{formatMoney(selectedCustomer.currentBalance)}</span>
                    </div>
                    <div className={styles.bannerRow}>
                      <span>Crédito disponible:</span>
                      <span className={styles.bannerValue}>
                        {formatMoney(selectedCustomer.creditLimit - selectedCustomer.currentBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Nuevo Límite de Crédito</label>
                  <input
                    type="number"
                    defaultValue={selectedCustomer.creditLimit}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Registrar Abono</label>
                  <div className={styles.inputGroup}>
                    <input
                      type="number"
                      placeholder="0.00"
                      className={styles.input}
                    />
                    <button className={styles.payBtn}>
                      <DollarSign size={18} />
                      Abonar
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={() => setShowCreditModal(false)}>
                  Cancelar
                </button>
                <button className={styles.saveBtn}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default AdminCustomers;