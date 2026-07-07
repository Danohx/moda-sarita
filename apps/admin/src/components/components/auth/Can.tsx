import type { ReactNode } from "react";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../../utils/permissions";

type CanProps = {
  permissions?: string | string[];
  roles?: string | string[];
  mode?: "any" | "all";
  fallback?: ReactNode;
  children: ReactNode;
};

export function Can({
  permissions,
  mode = "any",
  fallback = null,
  children,
}: CanProps) {
  const { user } = useAuth();

  const allowed = canAccess(user, {
    permissions,
    mode,
  });

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}