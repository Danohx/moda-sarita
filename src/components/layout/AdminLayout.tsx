import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Package, Users, 
  Settings, LogOut, Truck, BarChart3 
} from 'lucide-react';

// Interface para TypeScript
interface AdminLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'empleado';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, role }) => {
  const location = useLocation();
  
  // Función para resaltar el link activo
  const isActive = (path: string) => 
    location.pathname === path ? { backgroundColor: '#fce7f3', color: '#be185d', fontWeight: 'bold' } : {};

  const iconStyle = { marginRight: '0.75rem' };

  return (
    <div style={{ 
      display: 'flex', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'fixed', 
      top: 0,
      left: 0,
      backgroundColor: '#f3f4f6' 
    }}>
      
      {/* SIDEBAR LATERAL */}
      <aside style={{ 
        width: '260px', 
        minWidth: '260px', 
        height: '100vh', 
        backgroundColor: 'white', 
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        {/* Perfil de Usuario en Sidebar */}
        <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#db2777', 
            color: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {role === 'admin' ? 'AD' : 'EM'}
          </div>
          <div style={{ fontWeight: 'bold', color: '#111827' }}>
            {role === 'admin' ? 'Administrador' : 'Empleado'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Panel de Control</div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', marginBottom: '4px', ...isActive('/admin/dashboard') }}>
            <LayoutDashboard size={20} style={iconStyle} /> Inicio
          </Link>
          
          <Link to="/admin/pos" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', marginBottom: '4px', ...isActive('/admin/pos') }}>
            <Store size={20} style={iconStyle} /> Punto de Venta
          </Link>

          <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', marginBottom: '4px', ...isActive('/admin/orders') }}>
            <Truck size={20} style={iconStyle} /> Pedidos
          </Link>

          <Link to="/admin/inventory" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', marginBottom: '4px', ...isActive('/admin/inventory') }}>
            <Package size={20} style={iconStyle} /> Inventario
          </Link>

          {/* Corregido: Usando icono Users para clientes */}
          <Link to="/admin/customers" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', marginBottom: '4px', ...isActive('/admin/customers') }}>
            <Users size={20} style={iconStyle} /> Gestión de Clientes
          </Link>

          {role === 'admin' && (
            <>
              <div style={{ padding: '20px 10px 5px', fontSize: '0.7rem', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Administración
              </div>
              <Link to="/admin/reports" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', marginBottom: '4px', ...isActive('/admin/reports') }}>
                <BarChart3 size={20} style={iconStyle} /> Reportes
              </Link>
              <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', marginBottom: '4px', ...isActive('/admin/settings') }}>
                <Settings size={20} style={iconStyle} /> Ajustes
              </Link>
              <Link to="/admin/panel" style={{ display: 'flex', alignItems: 'center', padding: '12px', textDecoration: 'none', color: '#374151', borderRadius: '8px', ...isActive('/admin/panel') }}>
                <Package size={20} style={iconStyle} /> Panel
              </Link>
            </>
          )}
        </nav>

        {/* Botón Cerrar Sesión */}
        <button style={{ 
          margin: '20px', 
          padding: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          border: 'none', 
          background: '#fee2e2', 
          color: '#b91c1c', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          transition: 'background 0.2s'
        }}>
          <LogOut size={20} style={iconStyle} /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL (Donde se renderizan las páginas) */}
      <main style={{ 
        flex: 1, 
        height: '100vh', 
        overflowY: 'auto', 
        backgroundColor: '#f9fafb',
        padding: '2rem'
      }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;