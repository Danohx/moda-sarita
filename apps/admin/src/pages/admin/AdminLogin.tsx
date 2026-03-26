import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  AdminPanelSettings,
  Security,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import { authApi } from "@shared/api/auth.api";

type LoginStep = "credentials" | "2fa";

const AdminLogin: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempToken, setTempToken] = useState("");

  const maskedEmail = useMemo(() => {
    const email = credentials.email.trim();
    if (!email.includes("@")) return email;

    const [name, domain] = email.split("@");
    if (!name || !domain) return email;

    if (name.length <= 2) {
      return `${name[0] ?? "*"}*@${domain}`;
    }

    return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
  }, [credentials.email]);

  const handleCredentialChange =
    (field: "email" | "password") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleTwoFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTwoFactorCode(onlyDigits);
  };

  const validateUserRole = async () => {
    const user = await authApi.me();
    const rol = String(user?.rol ?? "").toLowerCase();

    const allowedRoles = ["admin", "administrador", "empleado"];
    const hasAccess = allowedRoles.includes(rol);

    if (!hasAccess) {
      await authApi.logout();
      throw new Error(
        "Tu usuario no tiene permisos para entrar al panel administrativo.",
      );
    }

    setUser(user);
    return user;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const email = credentials.email.trim();
    const password = credentials.password.trim();

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const loginResponse = await authApi.login({
        correo: email,
        contrasena: password,
      });

      if (loginResponse.requires2FA) {
        if (!loginResponse.tempToken) {
          setError("No se recibió el token temporal para verificar 2FA.");
          return;
        }

        setTempToken(loginResponse.tempToken);
        setTwoFactorCode("");
        setStep("2fa");
        return;
      }

      await validateUserRole();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar sesión";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tempToken) {
      setError("La sesión temporal expiró. Vuelve a iniciar sesión.");
      setStep("credentials");
      return;
    }

    if (twoFactorCode.trim().length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }

    try {
      setLoading(true);

      await authApi.verify2FA({
        tempToken,
        otpCode: twoFactorCode.trim(),
      });

      await validateUserRole();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo verificar el código 2FA";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    if (loading) return;

    setStep("credentials");
    setTwoFactorCode("");
    setTempToken("");
    setError("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #E91E8C 0%, #fffcef 100%)",
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E91E8C 0%, #C2185B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2,
                boxShadow: "0 4px 12px rgba(233, 30, 140, 0.3)",
              }}
            >
              {step === "credentials" ? (
                <AdminPanelSettings sx={{ fontSize: 40, color: "white" }} />
              ) : (
                <Security sx={{ fontSize: 40, color: "white" }} />
              )}
            </Box>

            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "#333", mb: 1 }}
            >
              {step === "credentials"
                ? "Panel Administrativo"
                : "Verificación 2FA"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {step === "credentials"
                ? "Moda Sarita - Sistema de Gestión"
                : `Ingresa el código de autenticación para ${maskedEmail || "tu cuenta"}`}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit}>
              <TextField
                fullWidth
                type="email"
                label="Correo"
                placeholder="admin@modasarita.com"
                value={credentials.email}
                onChange={handleCredentialChange("email")}
                autoComplete="email"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#E91E8C" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#E91E8C" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#E91E8C" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleCredentialChange("password")}
                autoComplete="current-password"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#E91E8C" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#E91E8C" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#E91E8C" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        aria-label="Mostrar u ocultar contraseña"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: "#E91E8C",
                  "&:hover": { bgcolor: "#C2185B" },
                  borderRadius: "25px",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(233, 30, 140, 0.3)",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Ingresar al Panel"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleTwoFactorSubmit}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Introduce el código generado por tu aplicación de autenticación.
              </Alert>

              <TextField
                fullWidth
                label="Código 2FA"
                placeholder="123456"
                value={twoFactorCode}
                onChange={handleTwoFactorChange}
                autoComplete="one-time-code"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 6,
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#E91E8C" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#E91E8C" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security sx={{ color: "#E91E8C" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  bgcolor: "#E91E8C",
                  "&:hover": { bgcolor: "#C2185B" },
                  borderRadius: "25px",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(233, 30, 140, 0.3)",
                  mb: 2,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Verificar código"
                )}
              </Button>

              <Button
                fullWidth
                type="button"
                variant="text"
                disabled={loading}
                onClick={handleBackToCredentials}
                sx={{
                  textTransform: "none",
                  color: "#E91E8C",
                  fontWeight: "bold",
                }}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          )}

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              ¿Olvidaste tu acceso?{" "}
              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: "#E91E8C",
                  cursor: "pointer",
                  fontWeight: "bold",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Contacta al Administrador
              </Typography>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "#999" }}>
              Sistema v1.0.0 • Moda Sarita © 2026
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogin;