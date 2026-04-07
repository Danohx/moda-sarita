import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const GuestRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

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

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
