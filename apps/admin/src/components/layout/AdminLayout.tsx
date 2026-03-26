import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import styles from "../../../styles/AdminLayout.module.css";
import { useAuth } from "@shared/context/AuthContext";

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const rawRole = String(user?.rol ?? "").toLowerCase();

  const role: "admin" | "empleado" =
    rawRole === "empleado" ? "empleado" : "admin";

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