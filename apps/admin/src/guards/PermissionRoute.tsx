import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../utils/permissions";

type PermissionRouteProps = {
  permissions?: string | string[];
  mode?: "any" | "all";
};

const PermissionRoute: React.FC<PermissionRouteProps> = ({
  permissions,
  mode = "any",
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const allowed = canAccess(user, {
    permissions,
    mode,
  });

  if (!allowed) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          denied: true,
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default PermissionRoute;
