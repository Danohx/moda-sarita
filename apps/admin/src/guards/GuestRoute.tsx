import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";

const GuestRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;