import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Package, Users, 
  Settings, LogOut, Truck, BarChart3 
} from 'lucide-react';
import styles from '../../styles/AdminSidebar.module.css'; // Importamos el módulo CSS

interface AdminSidebarProps {
  role: 'admin' | 'empleado';
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ role }) => {
  const location = useLocation();
  
  // Función para determinar si el link está activo y asignar las clases correspondientes
  const getLinkClass = (path: string) => {
    return location.pathname === path 
      ? `${styles.navLink} ${styles.navLinkActive}` 
      : styles.navLink;
  };

  return (
    <aside className={styles.sidebar}>
      {/* Perfil de Usuario en Sidebar */}
      <div className={styles.profileSection}>
        <div className={styles.avatar}>
          {role === 'admin' ? 'AD' : 'EM'}
        </div>
        <div className={styles.userName}>
          {role === 'admin' ? 'Administrador' : 'Empleado'}
        </div>
        <div className={styles.userRole}>Panel de Control</div>
      </div>

      {/* Navegación */}
      <nav className={styles.navigation}>
        <Link to="/admin/dashboard" className={getLinkClass('/admin/dashboard')}>
          <LayoutDashboard size={20} className={styles.icon} /> Inicio
        </Link>
        
        <Link to="/admin/pos" className={getLinkClass('/admin/pos')}>
          <Store size={20} className={styles.icon} /> Punto de Venta
        </Link>

        <Link to="/admin/orders" className={getLinkClass('/admin/orders')}>
          <Truck size={20} className={styles.icon} /> Pedidos
        </Link>

        <Link to="/admin/inventory" className={getLinkClass('/admin/inventory')}>
          <Package size={20} className={styles.icon} /> Inventario
        </Link>

        <Link to="/admin/customers" className={getLinkClass('/admin/customers')}>
          <Users size={20} className={styles.icon} /> Gestión de Clientes
        </Link>

        {role === 'admin' && (
          <>
            <div className={styles.adminSectionTitle}>
              Administración
            </div>
            <Link to="/admin/reports" className={getLinkClass('/admin/reports')}>
              <BarChart3 size={20} className={styles.icon} /> Reportes
            </Link>
            <Link to="/admin/settings" className={getLinkClass('/admin/settings')}>
              <Settings size={20} className={styles.icon} /> Ajustes
            </Link>
            {/* <Link to="/admin/panel" className={getLinkClass('/admin/panel')}>
              <Package size={20} className={styles.icon} /> Panel
            </Link> */}
          </>
        )}
      </nav>

      {/* Botón Cerrar Sesión */}
      <button className={styles.logoutButton}>
        <LogOut size={20} className={styles.icon} /> Cerrar Sesión
      </button>
    </aside>
  );
};

export default AdminSidebar;