import { useLocation } from "react-router-dom";

export interface BreadcrumbContext {
  from?: string;
  [key: string]: string | undefined;
}

export function useBreadcrumbContext(): BreadcrumbContext {
  const location = useLocation();
  return (location.state as BreadcrumbContext) ?? {};
}
