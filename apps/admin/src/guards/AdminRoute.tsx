import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../utils/permissions";

const AdminRoute: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "Manrope, sans-serif",
          color: "#ec1380",
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const canEnterPanel = canAccess(user, {
    permissions: "panel.admin.access",
  });

  if (!canEnterPanel) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
