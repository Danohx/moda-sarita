import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@shared/context/AuthContext";

const AdminRoute: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const rol = String(user.rol ?? "").toLowerCase();
  const isAllowed =
    rol === "admin" ||
    rol === "administrador" ||
    rol === "empleado";

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;