import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import styles from '../../styles/AdminLayout.module.css';

interface AdminLayoutProps {
  role: 'admin' | 'empleado';
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ role }) => {
  return (
    <div className={styles.layoutContainer}>
      
      <AdminSidebar role={role} />

      <main className={styles.mainContent}>
        <Outlet /> 
      </main>
      
    </div>
  );
};

export default AdminLayout;