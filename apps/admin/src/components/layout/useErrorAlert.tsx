import { useState, useCallback } from "react";
import type { ErrorSeverity } from "./ErrorAlert";

interface AlertState {
  open: boolean;
  title?: string;
  message: string;
  severity: ErrorSeverity;
}

export function useErrorAlert() {
  const [state, setState] = useState<AlertState>({
    open: false,
    message: "",
    severity: "error",
  });

  const show = useCallback(
    (message: string, severity: ErrorSeverity = "error", title?: string) => {
      setState({ open: true, message, severity, title });
    },
    []
  );

  const hide = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const showError = useCallback(
    (message: string, title?: string) => show(message, "error", title),
    [show]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => show(message, "warning", title),
    [show]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => show(message, "success", title),
    [show]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => show(message, "info", title),
    [show]
  );

  return { state, hide, show, showError, showWarning, showSuccess, showInfo };
}