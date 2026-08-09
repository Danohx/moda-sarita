import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import styles from "../../../styles/AdminLayout.module.css";
import { useAuth } from "@shared/context/AuthContext";

const AdminContentLoader = () => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Manrope, sans-serif",
          color: "#5c4b57",
        }}
      >
        Cargando módulo...
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const rawRole = String(user?.rol ?? "").toLowerCase();

  const role: "admin" | "empleado" =
    rawRole === "empleado" ? "empleado" : "admin";

  return (
    <div className={styles.layoutContainer}>
      <AdminSidebar role={role} />

      <main className={styles.mainContent}>
        <Suspense fallback={<AdminContentLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
