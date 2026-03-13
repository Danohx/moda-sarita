import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import styles from '../../styles/AdminLayout.module.css';

interface AdminLayoutProps {
  role: 'admin' | 'empleado';
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ role, children }) => {
  return (
    <div className={styles.layoutContainer}>
      
      <AdminSidebar role={role} />

      <main className={styles.mainContent}>
        {children || <Outlet />} 
      </main>
      
    </div>
  );
};

export default AdminLayout;