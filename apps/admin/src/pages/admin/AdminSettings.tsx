import { useAuth } from "@shared/context/AuthContext";
import { canAccess, getCurrentUserId } from "../../utils/permissions";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Checkbox,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Add,
  Edit,
  Lock,
  LockOpen,
  Settings,
  People,
  Shield,
  CreditCard,
  Store,
  Inventory2,
  LocalShipping,
  History,
} from "@mui/icons-material";
import styles from "../../../styles/AdminSettings.module.css";
import {
  configuracionService,
  type ConfigParametro,
  type MetodoPagoConfig,
} from "@admin/services/configuracion.service";
import {
  securityService,
  type SecurityEmployee,
  type SecurityPermission,
  type SecurityRole,
  type SecuritySession,
  type SecurityStatus,
} from "@admin/services/security.service";
import {
  auditLogsService,
  type AuditLog,
} from "@admin/services/auditLogs.service";

type TabKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type Employee = SecurityEmployee;

type Role = SecurityRole;
type PermissionItem = SecurityPermission;
type SessionItem = SecuritySession;

const SETTINGS_PERMISSIONS = {
  employeesView: ["seguridad.empleados.view"],
  employeesManage: ["seguridad.empleados.manage"],

  rolesView: ["seguridad.roles.view", "seguridad.permisos.view"],
  rolesManage: ["seguridad.roles.manage", "seguridad.permisos.manage"],

  paymentMethodsView: ["configuracion.metodos_pago.view"],
  paymentMethodsManage: ["configuracion.metodos_pago.manage"],

  settingsView: ["configuracion.ajustes.view"],
  settingsManage: ["configuracion.ajustes.manage"],

  securityView: ["seguridad.sesiones.read"],
  securityManage: ["seguridad.sesiones.revoke"],

  auditView: [
    "seguridad.usuarios.manage",
    "seguridad.roles.manage",
    "configuracion.ajustes.manage",
  ],
} as const;

type SettingsTabConfig = {
  index: TabKey;
  label: string;
  icon: React.ReactElement;
  permissions: readonly string[];
  mode?: "any" | "all";
};

async function runIf<T>(
  allowed: boolean,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!allowed) return fallback;
  return fn();
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export default function AdminSettings() {
  const { user } = useAuth();
  const currentUserId = getCurrentUserId(user);

  const [tabValue, setTabValue] = useState<TabKey>(0);

  // Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<MetodoPagoConfig[]>([]);
  const [ticketParams, setTicketParams] = useState<ConfigParametro[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [securitySessions, setSecuritySessions] = useState<SessionItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [checkoutParams, setCheckoutParams] = useState<ConfigParametro[]>([]);
  const [savingCheckout, setSavingCheckout] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingTicket, setSavingTicket] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingAuditLogs, setSavingAuditLogs] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditAreaFilter, setAuditAreaFilter] = useState("TODAS");

  // Modals
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openAuditLogModal, setOpenAuditLogModal] = useState(false);

  // Selected
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<MetodoPagoConfig | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
    null,
  );

  const [inventoryParams, setInventoryParams] = useState<ConfigParametro[]>([]);
  const [savingInventory, setSavingInventory] = useState(false);

  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(
    null,
  );
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false);
  const [twoFaUrl, setTwoFaUrl] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [settingUp2FA, setSettingUp2FA] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);

  const canViewCheckoutSettings = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.settingsView,
  });

  const canManageCheckoutSettings = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.settingsManage,
  });
  // Forms
  const start2FASetup = async () => {
    setSettingUp2FA(true);
    setError(null);

    try {
      const response = await securityService.setup2FA();

      if (!response.otpauth_url) {
        throw new Error("No se recibió la URL de configuración 2FA.");
      }

      setTwoFaUrl(response.otpauth_url);
      setTwoFaCode("");
      setTwoFaModalOpen(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar la configuración 2FA.",
      );
    } finally {
      setSettingUp2FA(false);
    }
  };

  const confirmEnable2FA = async () => {
    const code = twoFaCode.trim();

    if (!code) {
      setError("Ingresa el código de 6 dígitos de tu app autenticadora.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("El código 2FA debe tener 6 dígitos.");
      return;
    }

    setEnabling2FA(true);
    setError(null);

    try {
      await securityService.enable2FA(code);

      setTwoFaModalOpen(false);
      setTwoFaUrl(null);
      setTwoFaCode("");

      await reloadSecuritySessions();

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo activar el 2FA.",
      );
    } finally {
      setEnabling2FA(false);
    }
  };

  const [employeeForm, setEmployeeForm] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    rolId: "",
    tempPassword: "",
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    permissions: [] as string[],
  });

  const [paymentForm, setPaymentForm] = useState({
    nombre: "",
    descripcion: "",
    activo_pos: false,
    activo_web: false,
    activo_admin: true,
    requiere_referencia: false,
    permite_cambio: false,
    requiere_confirmacion_manual: false,
    es_credito: false,
    orden: 0,
    instrucciones_pos: "",
    instrucciones_web: "",
  });

  const canViewEmployees = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.employeesView,
  });

  const canManageEmployees = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.employeesManage,
  });

  const canViewRoles = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.rolesView,
    mode: "all",
  });

  const canManageRoles = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.rolesManage,
    mode: "all",
  });

  const canViewPaymentMethods = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.paymentMethodsView,
  });

  const canManagePaymentMethods = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.paymentMethodsManage,
  });

  const canViewStoreSettings = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.settingsView,
  });

  const canManageStoreSettings = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.settingsManage,
  });

  const canViewInventorySettings = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.settingsView,
  });

  const canManageInventorySettings = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.settingsManage,
  });

  const canViewSecurity = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.securityView,
  });

  const canManageSecurity = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.securityManage,
  });

  const canViewAudit = canAccess(user, {
    permissions: SETTINGS_PERMISSIONS.auditView,
  });

  const isCurrentEmployee = (employeeId: string | number) => {
    return String(employeeId) === currentUserId;
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const shouldLoadBaseSettings =
        canViewPaymentMethods || canViewStoreSettings;

      const [
        data,
        inventarioParams,
        rolesData,
        permisosData,
        empleadosData,
        sesionesData,
        securityStatusData,
        auditLogsData,
        checkoutParamsData,
      ] = await Promise.all([
        runIf(
          shouldLoadBaseSettings,
          () => configuracionService.getSettingsBase(),
          {
            metodosPago: [],
            ticketParams: [],
          },
        ),

        runIf(
          canViewInventorySettings,
          () => configuracionService.getInventoryParams(),
          [],
        ),

        runIf(canViewRoles, () => securityService.getRolesWithPermisos(), []),

        runIf(canViewRoles, () => securityService.getPermisos(), []),

        runIf(
          canViewEmployees,
          () => securityService.getEmployees({ includeInactive: true }),
          [],
        ),

        runIf(canViewSecurity, () => securityService.getSessions(), []),

        runIf(canViewSecurity, () => securityService.getSecurityStatus(), null),

        runIf(canViewAudit, () => auditLogsService.getAll(), []),

        runIf(
          canViewCheckoutSettings,
          () => configuracionService.getCheckoutParams(),
          [],
        ),
      ]);

      setPaymentMethods(canViewPaymentMethods ? data.metodosPago : []);
      setTicketParams(canViewStoreSettings ? data.ticketParams : []);
      setInventoryParams(canViewInventorySettings ? inventarioParams : []);
      setRoles(canViewRoles ? rolesData : []);
      setAllPermissions(canViewRoles ? permisosData : []);
      setEmployees(canViewEmployees ? empleadosData : []);
      setSecuritySessions(canViewSecurity ? sesionesData : []);
      setSecurityStatus(canViewSecurity ? securityStatusData : null);
      setAuditLogs(canViewAudit ? auditLogsData : []);
      setCheckoutParams(canViewCheckoutSettings ? checkoutParamsData : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la configuración.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    canViewAudit,
    canViewCheckoutSettings,
    canViewEmployees,
    canViewInventorySettings,
    canViewPaymentMethods,
    canViewRoles,
    canViewSecurity,
    canViewStoreSettings,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs = useMemo<SettingsTabConfig[]>(
    () => [
      {
        index: 0,
        label: "Empleados",
        icon: <People />,
        permissions: SETTINGS_PERMISSIONS.employeesView,
      },
      {
        index: 1,
        label: "Roles y Permisos",
        icon: <Shield />,
        permissions: SETTINGS_PERMISSIONS.rolesView,
        mode: "all",
      },
      {
        index: 2,
        label: "Métodos de Pago",
        icon: <CreditCard />,
        permissions: SETTINGS_PERMISSIONS.paymentMethodsView,
      },
      {
        index: 3,
        label: "Datos de la Tienda",
        icon: <Store />,
        permissions: SETTINGS_PERMISSIONS.settingsView,
      },
      {
        index: 4,
        label: "Inventario",
        icon: <Inventory2 />,
        permissions: SETTINGS_PERMISSIONS.settingsView,
      },
      {
        index: 5,
        label: "Seguridad",
        icon: <Lock />,
        permissions: SETTINGS_PERMISSIONS.securityView,
      },
      {
        index: 6,
        label: "Bitácora",
        icon: <History />,
        permissions: SETTINGS_PERMISSIONS.auditView,
      },
      {
        index: 7,
        label: "Checkout",
        icon: <LocalShipping />,
        permissions: SETTINGS_PERMISSIONS.settingsView,
      },
    ],
    [],
  );

  const visibleTabs = useMemo(() => {
    return tabs.filter((tab) =>
      canAccess(user, {
        permissions: tab.permissions,
        mode: tab.mode ?? "any",
      }),
    );
  }, [tabs, user]);

  useEffect(() => {
    if (visibleTabs.length === 0) return;

    const activeTabIsVisible = visibleTabs.some(
      (tab) => tab.index === tabValue,
    );

    if (!activeTabIsVisible) {
      setTabValue(visibleTabs[0].index);
    }
  }, [tabValue, visibleTabs]);

  const activeRoles = useMemo(
    () => roles.filter((role) => role.activo),
    [roles],
  );

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";

    try {
      return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return "—";
    }
  };

  const generateTempPassword = () => {
    const random = Math.random().toString(36).slice(2, 8);
    return `Moda#${random}1A`;
  };

  // --- Ticket helpers
  const updateTicketLocal = (
    clave: Parameters<typeof configuracionService.updateLocalParam>[1],
    valor: unknown,
  ) => {
    setTicketParams((prev) =>
      configuracionService.updateLocalParam(prev, clave, valor),
    );
  };

  const saveTicketParams = async () => {
    if (!canManageStoreSettings) {
      setError("No tienes permiso para modificar los datos de la tienda.");
      return;
    }

    setSavingTicket(true);
    setError(null);

    try {
      await configuracionService.saveTicketParams(ticketParams);
      const freshParams = await configuracionService.getTicketParams();
      setTicketParams(freshParams);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los datos de la tienda.",
      );
    } finally {
      setSavingTicket(false);
    }
  };

  // --- Checkout helpers
  const updateCheckoutLocal = (
    clave: Parameters<typeof configuracionService.updateLocalParam>[1],
    valor: unknown,
  ) => {
    setCheckoutParams((prev) =>
      configuracionService.updateLocalParam(prev, clave, valor),
    );
  };

  const getCheckoutBool = (
    clave: Parameters<typeof configuracionService.getParamBool>[1],
    fallback = false,
  ) => configuracionService.getParamBool(checkoutParams, clave, fallback);

  const getCheckoutNumber = (
    clave: Parameters<typeof configuracionService.getParamNumber>[1],
    fallback = 0,
  ) => configuracionService.getParamNumber(checkoutParams, clave, fallback);

  const saveCheckoutParams = async () => {
    if (!canManageCheckoutSettings) {
      setError("No tienes permiso para modificar los ajustes del checkout.");
      return;
    }

    setSavingCheckout(true);
    setError(null);

    try {
      await configuracionService.saveCheckoutParams(checkoutParams);

      const freshParams = await configuracionService.getCheckoutParams();

      setCheckoutParams(freshParams);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los ajustes del checkout.",
      );
    } finally {
      setSavingCheckout(false);
    }
  };

  const getTicketValue = (
    clave: Parameters<typeof configuracionService.getParamText>[1],
    fallback = "",
  ) => configuracionService.getParamText(ticketParams, clave, fallback);

  const getTicketBool = (
    clave: Parameters<typeof configuracionService.getParamBool>[1],
    fallback = false,
  ) => configuracionService.getParamBool(ticketParams, clave, fallback);

  const getTicketNumber = (
    clave: Parameters<typeof configuracionService.getParamNumber>[1],
    fallback = 0,
  ) => configuracionService.getParamNumber(ticketParams, clave, fallback);

  const updateInventoryLocal = (
    clave: Parameters<typeof configuracionService.updateLocalParam>[1],
    valor: unknown,
  ) => {
    setInventoryParams((prev) =>
      configuracionService.updateLocalParam(prev, clave, valor),
    );
  };

  const saveInventoryParams = async () => {
    if (!canManageInventorySettings) {
      setError("No tienes permiso para modificar los ajustes de inventario.");
      return;
    }

    setSavingInventory(true);
    setError(null);

    try {
      await configuracionService.saveInventoryParams(inventoryParams);
      const freshParams = await configuracionService.getInventoryParams();
      setInventoryParams(freshParams);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los ajustes de inventario.",
      );
    } finally {
      setSavingInventory(false);
    }
  };

  const getInventoryBool = (
    clave: Parameters<typeof configuracionService.getParamBool>[1],
    fallback = false,
  ) => configuracionService.getParamBool(inventoryParams, clave, fallback);

  const getInventoryNumber = (
    clave: Parameters<typeof configuracionService.getParamNumber>[1],
    fallback = 0,
  ) => configuracionService.getParamNumber(inventoryParams, clave, fallback);

  // --- Modal open helpers
  const openNewEmployee = () => {
    if (!canManageEmployees) {
      setError("No tienes permiso para crear empleados.");
      return;
    }

    setSelectedEmployee(null);
    setEmployeeForm({
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      email: "",
      rolId: "",
      tempPassword: generateTempPassword(),
    });
    setOpenEmployeeModal(true);
  };

  const openEditEmployee = (emp: Employee) => {
    if (!canManageEmployees) {
      setError("No tienes permiso para editar empleados.");
      return;
    }

    setSelectedEmployee(emp);
    setEmployeeForm({
      nombres: emp.nombres ?? "",
      apellidoPaterno: emp.apellidoPaterno ?? "",
      apellidoMaterno: emp.apellidoMaterno ?? "",
      email: emp.email ?? "",
      rolId: emp.rolId ?? "",
      tempPassword: "",
    });
    setOpenEmployeeModal(true);
  };

  const openNewRole = () => {
    if (!canManageRoles) {
      setError("No tienes permiso para crear roles.");
      return;
    }

    setSelectedRole(null);
    setRoleForm({ name: "", permissions: [] });
    setOpenRoleModal(true);
  };

  const openEditRole = (r: Role) => {
    setSelectedRole(r);
    setRoleForm({ name: r.name ?? "", permissions: r.permissions ?? [] });
    setOpenRoleModal(true);
  };

  const openConfigurePayment = (m: MetodoPagoConfig) => {
    setSelectedPayment(m);

    setPaymentForm({
      nombre: m.nombre ?? "",
      descripcion: m.descripcion ?? "",
      activo_pos: !!m.activo_pos,
      activo_web: !!m.activo_web,
      activo_admin: !!m.activo_admin,
      requiere_referencia: !!m.requiere_referencia,
      permite_cambio: !!m.permite_cambio,
      requiere_confirmacion_manual: !!m.requiere_confirmacion_manual,
      es_credito: !!m.es_credito,
      orden: Number(m.orden ?? 0),
      instrucciones_pos: m.instrucciones_pos ?? "",
      instrucciones_web: m.instrucciones_web ?? "",
    });

    setOpenPaymentModal(true);
  };

  // --- Submit placeholders / actions
  const submitEmployee = async () => {
    if (!canManageEmployees) {
      setError("No tienes permiso para guardar empleados.");
      return;
    }

    const nombres = employeeForm.nombres.trim();
    const apellidoPaterno = employeeForm.apellidoPaterno.trim();
    const apellidoMaterno = employeeForm.apellidoMaterno.trim();
    const email = employeeForm.email.trim();
    const rolId = employeeForm.rolId;
    const tempPassword = employeeForm.tempPassword.trim();

    if (!nombres) {
      setError("El nombre del empleado es requerido.");
      return;
    }

    if (!apellidoPaterno) {
      setError("El apellido paterno del empleado es requerido.");
      return;
    }

    if (!email) {
      setError("El correo del empleado es requerido.");
      return;
    }

    if (!rolId) {
      setError("Selecciona un rol para el empleado.");
      return;
    }

    if (!selectedEmployee && !tempPassword) {
      setError("La contraseña temporal es requerida.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedEmployee) {
        await securityService.updateEmployee(selectedEmployee.id, {
          nombres,
          apellidoPaterno,
          apellidoMaterno: apellidoMaterno || null,
          email,
          rolId,
        });
      } else {
        await securityService.createEmployee({
          nombres,
          apellidoPaterno,
          apellidoMaterno: apellidoMaterno || null,
          email,
          rolId,
          passwordTemporal: tempPassword,
        });
      }

      setOpenEmployeeModal(false);
      setSelectedEmployee(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el empleado.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeStatus = async (employee: Employee) => {
    if (!canManageEmployees) {
      setError("No tienes permiso para cambiar el estado de empleados.");
      return;
    }

    if (employee.activo && isCurrentEmployee(employee.id)) {
      setError("No puedes desactivar tu propia cuenta.");
      return;
    }

    const nextStatus = !employee.activo;

    const confirmMessage = nextStatus
      ? `¿Activar a ${employee.fullName}?`
      : `¿Desactivar a ${employee.fullName}? Se cerrarán sus sesiones activas.`;

    if (!window.confirm(confirmMessage)) return;

    const previousEmployees = employees;

    // Actualización optimista: refleja el cambio al instante en la tabla.
    setEmployees((prev) =>
      prev.map((item) =>
        item.id === employee.id ? { ...item, activo: nextStatus } : item,
      ),
    );

    setLoading(true);
    setError(null);

    try {
      const response = await securityService.updateEmployeeStatus(
        employee.id,
        nextStatus,
      );

      // Si el backend devuelve el empleado actualizado, sincronizamos esa fila.
      if (response?.data) {
        setEmployees((prev) =>
          prev.map((item) =>
            item.id === employee.id
              ? {
                  ...item,
                  activo: response.data.activo ?? nextStatus,
                }
              : item,
          ),
        );
      }

      // Recarga final para mantener la tabla consistente con BD.
      await load();
    } catch (err) {
      // Si falló, regresamos la tabla a como estaba antes del click.
      setEmployees(previousEmployees);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado del empleado.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitRole = async () => {
    if (!canManageRoles) {
      setError("No tienes permiso para guardar roles o permisos.");
      return;
    }

    const name = roleForm.name.trim();

    if (!name) {
      setError("El nombre del rol es requerido.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedRole) {
        await securityService.updateRole(selectedRole.id, {
          name,
          descripcion: selectedRole.descripcion ?? null,
        });

        await securityService.setRolePermissions(
          selectedRole.id,
          roleForm.permissions,
        );
      } else {
        await securityService.createRole({
          name,
          descripcion: null,
          permissions: roleForm.permissions,
        });
      }

      setOpenRoleModal(false);
      setSelectedRole(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el rol.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleRoleStatus = async (role: Role) => {
    if (!canManageRoles) {
      setError("No tienes permiso para activar o desactivar roles.");
      return;
    }

    if (role.isSystem) return;

    setLoading(true);
    setError(null);

    try {
      await securityService.updateRoleStatus(role.id, !role.activo);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado del rol.",
      );
    } finally {
      setLoading(false);
    }
  };

  const activeSessionsCount = useMemo(
    () =>
      securitySessions.filter((session) => session.status === "ACTIVA").length,
    [securitySessions],
  );

  const reloadSecuritySessions = async () => {
    if (!canViewSecurity) {
      setError("No tienes permiso para consultar sesiones.");
      return;
    }

    setSavingSecurity(true);
    setError(null);

    try {
      const [sessions, status] = await Promise.all([
        securityService.getSessions(),
        securityService.getSecurityStatus(),
      ]);

      setSecuritySessions(sessions);
      setSecurityStatus(status);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la información de seguridad.",
      );
    } finally {
      setSavingSecurity(false);
    }
  };

  const revokeSession = async (session: SessionItem) => {
    if (!canManageSecurity) {
      setError("No tienes permiso para revocar sesiones.");
      return;
    }

    if (session.isCurrent) {
      setError("No puedes revocar tu sesión actual desde esta acción.");
      return;
    }

    if (!window.confirm("¿Revocar esta sesión?")) return;

    setSavingSecurity(true);
    setError(null);

    try {
      await securityService.revokeSession(session.id);
      await reloadSecuritySessions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo revocar la sesión.",
      );
    } finally {
      setSavingSecurity(false);
    }
  };

  const revokeOtherSessions = async () => {
    if (!canManageSecurity) {
      setError("No tienes permiso para revocar sesiones.");
      return;
    }

    if (
      !window.confirm(
        "¿Cerrar todas las demás sesiones activas? Tu sesión actual permanecerá abierta.",
      )
    ) {
      return;
    }

    setSavingSecurity(true);
    setError(null);

    try {
      await securityService.revokeOtherSessions();
      await reloadSecuritySessions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron revocar las sesiones.",
      );
    } finally {
      setSavingSecurity(false);
    }
  };

  const submitPayment = async () => {
    if (!canManagePaymentMethods) {
      setError("No tienes permiso para modificar métodos de pago.");
      return;
    }

    if (!selectedPayment) return;

    setSavingPayment(true);
    setError(null);

    try {
      await configuracionService.updateMetodoPago(selectedPayment.codigo, {
        nombre: paymentForm.nombre.trim(),
        descripcion: paymentForm.descripcion.trim() || null,
        activo_pos: paymentForm.activo_pos,
        activo_web: paymentForm.activo_web,
        activo_admin: paymentForm.activo_admin,
        requiere_referencia: paymentForm.requiere_referencia,
        permite_cambio: paymentForm.permite_cambio,
        requiere_confirmacion_manual: paymentForm.requiere_confirmacion_manual,
        es_credito: paymentForm.es_credito,
        orden: Number(paymentForm.orden || 0),
        instrucciones_pos: paymentForm.instrucciones_pos.trim() || null,
        instrucciones_web: paymentForm.instrucciones_web.trim() || null,
      });

      setOpenPaymentModal(false);
      setSelectedPayment(null);

      const freshMethods = await configuracionService.getMetodosPago();
      setPaymentMethods(freshMethods);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el método de pago.",
      );
    } finally {
      setSavingPayment(false);
    }
  };

  // Permissions helpers
  const togglePermission = (permId: string) => {
    setRoleForm((prev) => {
      const has = prev.permissions.includes(permId);
      const next = has
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: next };
    });
  };

  const permissionsByCategory = useMemo(() => {
    return allPermissions.reduce<Record<string, PermissionItem[]>>(
      (acc, permission) => {
        const category = permission.category || "General";

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push(permission);
        return acc;
      },
      {},
    );
  }, [allPermissions]);

  const auditAreas = useMemo(() => {
    return Array.from(new Set(auditLogs.map((log) => log.area))).sort();
  }, [auditLogs]);

  const filteredAuditLogs = useMemo(() => {
    const search = auditSearch.trim().toLowerCase();

    return auditLogs.filter((log) => {
      const matchesArea =
        auditAreaFilter === "TODAS" || log.area === auditAreaFilter;

      const searchText = [log.responsible, log.title, log.area, log.summary]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchText.includes(search);

      return matchesArea && matchesSearch;
    });
  }, [auditAreaFilter, auditLogs, auditSearch]);

  const reloadAuditLogs = async () => {
    if (!canViewAudit) {
      setError("No tienes permiso para consultar la bitácora.");
      return;
    }

    setSavingAuditLogs(true);
    setError(null);

    try {
      const data = await auditLogsService.getAll();
      setAuditLogs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar la bitácora.",
      );
    } finally {
      setSavingAuditLogs(false);
    }
  };

  const openAuditDetail = (log: AuditLog) => {
    setSelectedAuditLog(log);
    setOpenAuditLogModal(true);
  };

  if (visibleTabs.length === 0) {
    return (
      <Box className={styles.root}>
        <Typography variant="h4" className={styles.title}>
          Configuración del Sistema
        </Typography>

        <Alert severity="warning" className={styles.alert}>
          No tienes permisos para consultar la configuración del sistema.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={styles.root}>
      <Typography variant="h4" className={styles.title}>
        Configuración del Sistema
      </Typography>

      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      {loading && (
        <Alert severity="info" className={styles.alert}>
          Cargando configuración…
        </Alert>
      )}

      {/* Tabs */}
      <Paper className={styles.tabsPaper}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v as TabKey)}
          className={styles.tabs}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {visibleTabs.map((t) => (
            <Tab
              key={t.index}
              value={t.index}
              id={`settings-tab-${t.index}`}
              aria-controls={`settings-tabpanel-${t.index}`}
              icon={t.icon}
              iconPosition="start"
              label={t.label}
            />
          ))}
        </Tabs>
      </Paper>

      {/* TAB 1: EMPLEADOS */}
      {canViewEmployees && (
        <TabPanel value={tabValue} index={0}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Gestión de Empleados
            </Typography>

            {canManageEmployees && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openNewEmployee}
                className={styles.primaryBtn}
              >
                Nuevo Empleado
              </Button>
            )}
          </Box>

          {employees.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin empleados registrados.
            </Alert>
          ) : (
            <Paper className={styles.paper}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell className={styles.th}>Empleado</TableCell>
                      <TableCell className={styles.th}>Rol</TableCell>
                      <TableCell className={styles.th}>Último Acceso</TableCell>
                      <TableCell className={styles.th} align="center">
                        Estado
                      </TableCell>
                      <TableCell className={styles.th} align="center">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow
                        key={employee.id}
                        hover
                        className={styles.tableRowHover}
                      >
                        <TableCell>
                          <Box>
                            <Typography fontWeight="bold">
                              {employee.fullName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {employee.email}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>{employee.rolName}</TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(employee.lastSession)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.tfaEnabled
                              ? "2FA activo"
                              : "2FA no activo"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={employee.activo ? "Activo" : "Inactivo"}
                            size="small"
                            className={
                              employee.activo ? styles.chipOk : styles.chipBad
                            }
                          />
                        </TableCell>

                        <TableCell align="center">
                          {canManageEmployees ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => openEditEmployee(employee)}
                                className={styles.iconPink}
                                title="Editar empleado"
                              >
                                <Edit />
                              </IconButton>

                              <IconButton
                                size="small"
                                className={
                                  employee.activo
                                    ? styles.iconRed
                                    : styles.iconGreen
                                }
                                onClick={() => toggleEmployeeStatus(employee)}
                                disabled={
                                  loading ||
                                  (employee.activo &&
                                    isCurrentEmployee(employee.id))
                                }
                                title={
                                  employee.activo &&
                                  isCurrentEmployee(employee.id)
                                    ? "No puedes desactivar tu propia cuenta"
                                    : employee.activo
                                      ? "Desactivar empleado"
                                      : "Activar empleado"
                                }
                              >
                                {employee.activo ? <Lock /> : <LockOpen />}
                              </IconButton>
                            </>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Solo lectura
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </TabPanel>
      )}

      {/* TAB 2: ROLES Y PERMISOS */}
      {canViewRoles && (
        <TabPanel value={tabValue} index={1}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Roles y Permisos
            </Typography>

            {canManageRoles && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openNewRole}
                className={styles.primaryBtn}
              >
                Nuevo Rol
              </Button>
            )}
          </Box>

          {roles.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin roles aún. Esta parte queda pendiente para conectar al módulo
              de seguridad.
            </Alert>
          ) : (
            <Paper className={styles.paper}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell className={styles.th}>
                        Nombre del Rol
                      </TableCell>
                      <TableCell className={styles.th}>Permisos</TableCell>
                      <TableCell className={styles.th}>Usuarios</TableCell>
                      <TableCell className={styles.th} align="center">
                        Estado
                      </TableCell>
                      <TableCell className={styles.th} align="center">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {roles.map((role) => (
                      <TableRow
                        key={role.id}
                        hover
                        className={styles.tableRowHover}
                      >
                        <TableCell>
                          <Box className={styles.rowFlex}>
                            <Typography fontWeight="bold">
                              {role.name}
                            </Typography>

                            {role.isSystem && (
                              <Chip
                                label="Sistema"
                                size="small"
                                className={styles.chipSystem}
                              />
                            )}
                          </Box>

                          {role.descripcion && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {role.descripcion}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {role.permissions?.[0] === "all"
                              ? "Todos los permisos"
                              : `${role.permissions?.length ?? 0} permisos`}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography fontWeight="bold" component="span">
                            {role.userCount ?? 0}
                          </Typography>{" "}
                          usuarios
                        </TableCell>

                        <TableCell align="center">
                          {role.isSystem ? (
                            <Chip
                              label="Protegido"
                              size="small"
                              className={styles.chipSystem}
                            />
                          ) : (
                            <Chip
                              label={role.activo ? "Activo" : "Inactivo"}
                              size="small"
                              className={
                                role.activo ? styles.chipOk : styles.chipBad
                              }
                            />
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Edit />}
                              onClick={() => openEditRole(role)}
                              className={styles.outlinedPinkBtn}
                            >
                              {canManageRoles && !role.isSystem
                                ? "Editar"
                                : "Ver"}
                            </Button>

                            {canManageRoles && !role.isSystem && (
                              <IconButton
                                size="small"
                                className={
                                  role.activo
                                    ? styles.iconRed
                                    : styles.iconGreen
                                }
                                onClick={() => toggleRoleStatus(role)}
                                disabled={loading}
                                title={
                                  role.activo ? "Desactivar rol" : "Activar rol"
                                }
                              >
                                {role.activo ? <Lock /> : <LockOpen />}
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </TabPanel>
      )}

      {/* TAB 3: MÉTODOS DE PAGO */}
      {canViewPaymentMethods && (
        <TabPanel value={tabValue} index={2}>
          <Box className={styles.sectionHeader}>
            <Box>
              <Typography variant="h6" className={styles.sectionTitle}>
                Métodos de Pago
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Controla qué métodos aparecen en POS, tienda web y
                administración.
              </Typography>
            </Box>
          </Box>

          {paymentMethods.length === 0 ? (
            <Alert severity="info" className={styles.alert}>
              Sin métodos de pago registrados.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {paymentMethods.map((method) => (
                <Grid key={method.codigo} size={{ xs: 12, md: 6 }}>
                  <Card className={styles.card}>
                    <CardContent>
                      <Box className={styles.cardHeader}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {method.nombre}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {method.codigo}
                          </Typography>

                          {method.descripcion && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {method.descripcion}
                            </Typography>
                          )}
                        </Box>

                        <Box className={styles.cardActions}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Settings />}
                            onClick={() => openConfigurePayment(method)}
                            className={styles.outlinedPinkBtn}
                          >
                            {canManagePaymentMethods ? "Configurar" : "Ver"}
                          </Button>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 2,
                        }}
                      >
                        <Chip
                          label={
                            method.activo_pos ? "POS activo" : "POS inactivo"
                          }
                          className={
                            method.activo_pos ? styles.chipOk : styles.chipBad
                          }
                          size="small"
                        />
                        <Chip
                          label={
                            method.activo_web ? "Web activo" : "Web inactivo"
                          }
                          className={
                            method.activo_web ? styles.chipOk : styles.chipBad
                          }
                          size="small"
                        />
                        <Chip
                          label={
                            method.activo_admin
                              ? "Admin activo"
                              : "Admin inactivo"
                          }
                          className={
                            method.activo_admin ? styles.chipOk : styles.chipBad
                          }
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      )}

      {/* TAB 4: DATOS DE LA TIENDA */}
      {canViewStoreSettings && (
        <TabPanel value={tabValue} index={3}>
          <Paper className={styles.paperPadded}>
            <Box className={styles.sectionHeader}>
              <Box>
                <Typography variant="h6" className={styles.paperTitlePink}>
                  Datos de la Tienda
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estos datos se usan en los tickets PDF y en la configuración
                  pública de la tienda.
                </Typography>
              </Box>

              {canManageStoreSettings && (
                <Button
                  variant="contained"
                  className={styles.primaryBtn}
                  onClick={saveTicketParams}
                  disabled={savingTicket || loading}
                >
                  {savingTicket ? "Guardando..." : "Guardar cambios"}
                </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre de la tienda"
                  value={getTicketValue("ticket.nombre_tienda", "Moda Sarita")}
                  disabled={!canManageStoreSettings}
                  onChange={(e) =>
                    updateTicketLocal("ticket.nombre_tienda", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={getTicketValue("ticket.telefono", "")}
                  disabled={!canManageStoreSettings}
                  onChange={(e) =>
                    updateTicketLocal("ticket.telefono", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Dirección"
                  value={getTicketValue("ticket.direccion", "")}
                  disabled={!canManageStoreSettings}
                  onChange={(e) =>
                    updateTicketLocal("ticket.direccion", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Mensaje final del ticket"
                  value={getTicketValue(
                    "ticket.mensaje_final",
                    "Gracias por su compra",
                  )}
                  disabled={!canManageStoreSettings}
                  onChange={(e) =>
                    updateTicketLocal("ticket.mensaje_final", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Política de cambios"
                  value={getTicketValue("ticket.politica_cambios", "")}
                  disabled={!canManageStoreSettings}
                  onChange={(e) =>
                    updateTicketLocal("ticket.politica_cambios", e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Política de apartado"
                  value={getTicketValue("ticket.politica_apartado", "")}
                  disabled={!canManageStoreSettings}
                  onChange={(e) =>
                    updateTicketLocal(
                      "ticket.politica_apartado",
                      e.target.value,
                    )
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Ancho del ticket (mm)"
                  value={getTicketNumber("ticket.ancho_mm", 80)}
                  disabled={!canManageStoreSettings}
                  onChange={(e) =>
                    updateTicketLocal(
                      "ticket.ancho_mm",
                      Number(e.target.value || 80),
                    )
                  }
                  inputProps={{ min: 58, max: 80 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={getTicketBool("ticket.mostrar_logo", true)}
                        disabled={!canManageStoreSettings}
                        onChange={(e) =>
                          updateTicketLocal(
                            "ticket.mostrar_logo",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Mostrar logo"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={getTicketBool("ticket.mostrar_cliente", true)}
                        disabled={!canManageStoreSettings}
                        onChange={(e) =>
                          updateTicketLocal(
                            "ticket.mostrar_cliente",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Mostrar cliente"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={getTicketBool("ticket.mostrar_vendedor", true)}
                        disabled={!canManageStoreSettings}
                        onChange={(e) =>
                          updateTicketLocal(
                            "ticket.mostrar_vendedor",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Mostrar vendedor"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      )}

      {/* TAB 5: INVENTARIO */}
      {canViewInventorySettings && (
        <TabPanel value={tabValue} index={4}>
          <Paper className={styles.paperPadded}>
            <Box className={styles.sectionHeader}>
              <Box>
                <Typography variant="h6" className={styles.paperTitlePink}>
                  Inventario
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configura reglas generales para stock mínimo y alertas de
                  inventario.
                </Typography>
              </Box>

              {canManageInventorySettings && (
                <Button
                  variant="contained"
                  className={styles.primaryBtn}
                  onClick={saveInventoryParams}
                  disabled={savingInventory || loading}
                >
                  {savingInventory ? "Guardando..." : "Guardar cambios"}
                </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock mínimo general"
                  value={getInventoryNumber(
                    "inventario.stock_minimo_general",
                    5,
                  )}
                  disabled={!canManageInventorySettings}
                  onChange={(e) =>
                    updateInventoryLocal(
                      "inventario.stock_minimo_general",
                      Number(e.target.value || 0),
                    )
                  }
                  inputProps={{ min: 0 }}
                  helperText="Se usará como valor sugerido al crear nuevas variantes."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={getInventoryBool(
                          "inventario.mostrar_alertas_bajo_stock",
                          true,
                        )}
                        disabled={!canManageInventorySettings}
                        onChange={(e) =>
                          updateInventoryLocal(
                            "inventario.mostrar_alertas_bajo_stock",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Mostrar alertas de bajo stock"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={getInventoryBool(
                          "inventario.alertar_productos_sin_imagen",
                          true,
                        )}
                        disabled={!canManageInventorySettings}
                        onChange={(e) =>
                          updateInventoryLocal(
                            "inventario.alertar_productos_sin_imagen",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Alertar productos sin imagen"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={getInventoryBool(
                          "inventario.alertar_productos_sin_categoria",
                          true,
                        )}
                        disabled={!canManageInventorySettings}
                        onChange={(e) =>
                          updateInventoryLocal(
                            "inventario.alertar_productos_sin_categoria",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Alertar productos sin categoría"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      )}

      {/* TAB 6: SEGURIDAD */}
      {canViewSecurity && (
        <TabPanel value={tabValue} index={5}>
          <Paper className={styles.paperPadded}>
            <Box className={styles.sectionHeader}>
              <Box>
                <Typography variant="h6" className={styles.paperTitlePink}>
                  Seguridad
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revisa sesiones activas y cierra accesos que ya no deben
                  seguir vigentes.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  className={styles.outlinedPinkBtn}
                  onClick={reloadSecuritySessions}
                  disabled={savingSecurity || loading}
                >
                  Recargar
                </Button>

                <Button
                  variant="contained"
                  className={styles.primaryBtn}
                  onClick={revokeOtherSessions}
                  disabled={
                    !canManageSecurity ||
                    savingSecurity ||
                    loading ||
                    activeSessionsCount <= 1
                  }
                >
                  Cerrar otras sesiones
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card className={styles.card} sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Sesiones activas
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {activeSessionsCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sesiones abiertas actualmente en tu cuenta.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Card className={styles.card} sx={{ height: "100%" }}>
                  <CardContent>
                    <Box
                      className={styles.cardHeader}
                      sx={{ alignItems: "center", gap: 2 }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          2FA
                        </Typography>

                        <Typography variant="h6" fontWeight="bold">
                          {securityStatus?.tfaEnabled ? "Activo" : "Disponible"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {securityStatus?.tfaEnabled
                            ? "Tu cuenta ya solicita código de autenticación al iniciar sesión."
                            : "Protege tu cuenta usando una app como Google Authenticator, Microsoft Authenticator o Authy."}
                        </Typography>
                      </Box>

                      {securityStatus?.tfaEnabled ? (
                        <Chip label="Protegido" color="success" size="small" />
                      ) : (
                        <Button
                          variant="outlined"
                          className={styles.outlinedPinkBtn}
                          onClick={start2FASetup}
                          disabled={settingUp2FA}
                        >
                          {settingUp2FA ? "Generando..." : "Activar 2FA"}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {securitySessions.length === 0 ? (
              <Alert severity="info" className={styles.alert}>
                No hay sesiones registradas para este usuario.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell className={styles.th}>Dispositivo</TableCell>
                      <TableCell className={styles.th}>IP</TableCell>
                      <TableCell className={styles.th}>Creada</TableCell>
                      <TableCell className={styles.th}>Expira</TableCell>
                      <TableCell className={styles.th} align="center">
                        Estado
                      </TableCell>
                      <TableCell className={styles.th} align="center">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {securitySessions.map((session) => (
                      <TableRow
                        key={session.id}
                        hover
                        className={styles.tableRowHover}
                      >
                        <TableCell>
                          <Typography fontWeight="bold">
                            {session.isCurrent
                              ? "Sesión actual"
                              : "Otra sesión"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", maxWidth: 420 }}
                          >
                            {session.userAgent || "Sin user agent"}
                          </Typography>
                        </TableCell>

                        <TableCell>{session.ipAddress || "—"}</TableCell>
                        <TableCell>
                          {formatDateTime(session.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(session.expiresAt)}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={
                              session.isCurrent
                                ? "Actual"
                                : session.status === "ACTIVA"
                                  ? "Activa"
                                  : session.status === "REVOCADA"
                                    ? "Revocada"
                                    : "Expirada"
                            }
                            size="small"
                            className={
                              session.status === "ACTIVA"
                                ? styles.chipOk
                                : styles.chipBad
                            }
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            className={styles.outlinedPinkBtn}
                            disabled={
                              !canManageSecurity ||
                              savingSecurity ||
                              session.isCurrent ||
                              session.status !== "ACTIVA"
                            }
                            onClick={() => revokeSession(session)}
                          >
                            Revocar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>
      )}

      {/* TAB 7: BITÁCORA */}
      {canViewAudit && (
        <TabPanel value={tabValue} index={6}>
          <Paper className={styles.paperPadded}>
            <Box className={styles.sectionHeader}>
              <Box>
                <Typography variant="h6" className={styles.paperTitlePink}>
                  Bitácora de actividades
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revisa qué cambios importantes se han realizado en la tienda,
                  quién los hizo y cuándo ocurrieron.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                className={styles.outlinedPinkBtn}
                onClick={() => reloadAuditLogs()}
                disabled={savingAuditLogs || loading}
              >
                {savingAuditLogs ? "Recargando..." : "Recargar"}
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Buscar actividad"
                  value={auditSearch}
                  onChange={(event) => setAuditSearch(event.target.value)}
                  placeholder="Buscar por responsable, actividad, área o detalle"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Área</InputLabel>
                  <Select
                    value={auditAreaFilter}
                    label="Área"
                    onChange={(event) =>
                      setAuditAreaFilter(String(event.target.value))
                    }
                  >
                    <MenuItem value="TODAS">Todas las áreas</MenuItem>
                    {auditAreas.map((area) => (
                      <MenuItem key={area} value={area}>
                        {area}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {filteredAuditLogs.length === 0 ? (
              <Alert severity="info" className={styles.alert}>
                No hay actividades para mostrar con los filtros actuales.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell className={styles.th}>Fecha</TableCell>
                      <TableCell className={styles.th}>Responsable</TableCell>
                      <TableCell className={styles.th}>Actividad</TableCell>
                      <TableCell className={styles.th}>Área</TableCell>
                      <TableCell className={styles.th}>Resumen</TableCell>
                      <TableCell className={styles.th} align="center">
                        Detalle
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredAuditLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        hover
                        className={styles.tableRowHover}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(log.createdAt)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {log.responsible}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {log.title.charAt(0).toUpperCase() +
                              log.title.slice(1)}
                          </Typography>
                          {log.technical && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Registro técnico
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={log.area}
                            size="small"
                            className={styles.chipSystem}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">{log.summary}</Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            className={styles.outlinedPinkBtn}
                            onClick={() => openAuditDetail(log)}
                          >
                            Ver detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </TabPanel>
      )}

      {/* TAB: CHECKOUT */}
      {canViewCheckoutSettings && (
        <TabPanel value={tabValue} index={7}>
          <Paper className={styles.paperPadded}>
            <Box className={styles.sectionHeader}>
              <Box>
                <Typography variant="h6" className={styles.paperTitlePink}>
                  Checkout
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Configura la disponibilidad del checkout y las reglas de
                  entrega de la tienda en línea.
                </Typography>
              </Box>

              {canManageCheckoutSettings && (
                <Button
                  variant="contained"
                  className={styles.primaryBtn}
                  onClick={saveCheckoutParams}
                  disabled={savingCheckout || loading}
                >
                  {savingCheckout ? "Guardando..." : "Guardar cambios"}
                </Button>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                  Disponibilidad
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={getCheckoutBool("checkout.habilitado", false)}
                        disabled={!canManageCheckoutSettings}
                        onChange={(e) =>
                          updateCheckoutLocal(
                            "checkout.habilitado",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Checkout web habilitado"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={getCheckoutBool(
                          "checkout.permitir_recoleccion_tienda",
                          true,
                        )}
                        disabled={!canManageCheckoutSettings}
                        onChange={(e) =>
                          updateCheckoutLocal(
                            "checkout.permitir_recoleccion_tienda",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Permitir recoger en tienda"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={getCheckoutBool(
                          "checkout.permitir_envio_domicilio",
                          false,
                        )}
                        disabled={!canManageCheckoutSettings}
                        onChange={(e) =>
                          updateCheckoutLocal(
                            "checkout.permitir_envio_domicilio",
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label="Permitir envío a domicilio"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" fontWeight={800}>
                  Costos de envío
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Costo de envío a domicilio"
                  value={getCheckoutNumber("checkout.costo_envio_domicilio", 0)}
                  disabled={
                    !canManageCheckoutSettings ||
                    !getCheckoutBool("checkout.permitir_envio_domicilio", false)
                  }
                  onChange={(e) =>
                    updateCheckoutLocal(
                      "checkout.costo_envio_domicilio",
                      Number(e.target.value || 0),
                    )
                  }
                  inputProps={{
                    min: 0,
                    step: 0.01,
                  }}
                  helperText="Tarifa aplicada a pedidos con entrega a domicilio."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={getCheckoutBool(
                        "checkout.envio_gratis_habilitado",
                        false,
                      )}
                      disabled={
                        !canManageCheckoutSettings ||
                        !getCheckoutBool(
                          "checkout.permitir_envio_domicilio",
                          false,
                        )
                      }
                      onChange={(e) =>
                        updateCheckoutLocal(
                          "checkout.envio_gratis_habilitado",
                          e.target.checked,
                        )
                      }
                    />
                  }
                  label="Ofrecer envío gratis"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Envío gratis desde"
                  value={getCheckoutNumber("checkout.envio_gratis_desde", 0)}
                  disabled={
                    !canManageCheckoutSettings ||
                    !getCheckoutBool(
                      "checkout.permitir_envio_domicilio",
                      false,
                    ) ||
                    !getCheckoutBool("checkout.envio_gratis_habilitado", false)
                  }
                  onChange={(e) =>
                    updateCheckoutLocal(
                      "checkout.envio_gratis_desde",
                      Number(e.target.value || 0),
                    )
                  }
                  inputProps={{
                    min: 0,
                    step: 0.01,
                  }}
                  helperText="Se calcula después de aplicar descuentos."
                />
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      )}

      {/* MODAL: DETALLE BITÁCORA */}
      <Dialog
        open={openAuditLogModal}
        onClose={() => {
          setOpenAuditLogModal(false);
          setSelectedAuditLog(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          Detalle de actividad
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {selectedAuditLog && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Actividad
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedAuditLog.title.charAt(0).toUpperCase() +
                      selectedAuditLog.title.slice(1)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Responsable
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedAuditLog.responsible}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatDateTime(selectedAuditLog.createdAt)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Área afectada
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedAuditLog.area}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Qué pasó
                  </Typography>
                  <Typography variant="body2">
                    {selectedAuditLog.summary}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Información adicional
              </Typography>

              {selectedAuditLog.metadata ? (
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: "#fafafa",
                    border: "1px solid #eee",
                    borderRadius: 2,
                    overflow: "auto",
                    maxHeight: 320,
                    fontSize: 13,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(selectedAuditLog.metadata, null, 2)}
                </Box>
              ) : (
                <Alert severity="info" className={styles.alert}>
                  Esta actividad no tiene información adicional para mostrar.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            className={styles.btnGhost}
            onClick={() => {
              setOpenAuditLogModal(false);
              setSelectedAuditLog(null);
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: ACTIVAR 2FA */}
      <Dialog
        open={twoFaModalOpen}
        onClose={() => {
          if (enabling2FA) return;
          setTwoFaModalOpen(false);
          setTwoFaUrl(null);
          setTwoFaCode("");
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          Activar autenticación 2FA
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Escanea el código QR con Google Authenticator, Microsoft
            Authenticator o Authy. Después ingresa el código de 6 dígitos para
            confirmar.
          </Typography>

          {twoFaUrl && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 2,
                }}
              >
                <QRCodeSVG value={twoFaUrl} size={190} />
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="Código 2FA"
            value={twoFaCode}
            onChange={(event) =>
              setTwoFaCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="123456"
            inputProps={{
              inputMode: "numeric",
              maxLength: 6,
            }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setTwoFaModalOpen(false);
              setTwoFaUrl(null);
              setTwoFaCode("");
            }}
            className={styles.btnGhost}
            disabled={enabling2FA}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            className={styles.primaryBtn}
            onClick={confirmEnable2FA}
            disabled={enabling2FA || twoFaCode.length !== 6}
          >
            {enabling2FA ? "Validando..." : "Confirmar y activar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: EMPLEADO */}
      <Dialog
        open={openEmployeeModal}
        onClose={() => {
          setOpenEmployeeModal(false);
          setSelectedEmployee(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          {selectedEmployee ? "Editar Empleado" : "Nuevo Empleado"}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={employeeForm.nombres}
                onChange={(e) =>
                  setEmployeeForm((p) => ({ ...p, nombres: e.target.value }))
                }
                placeholder="Ana"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Apellido paterno"
                value={employeeForm.apellidoPaterno}
                onChange={(e) =>
                  setEmployeeForm((p) => ({
                    ...p,
                    apellidoPaterno: e.target.value,
                  }))
                }
                placeholder="García"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Apellido materno"
                value={employeeForm.apellidoMaterno}
                onChange={(e) =>
                  setEmployeeForm((p) => ({
                    ...p,
                    apellidoMaterno: e.target.value,
                  }))
                }
                placeholder="López"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Correo electrónico"
                type="email"
                value={employeeForm.email}
                onChange={(e) =>
                  setEmployeeForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="empleado@modasarita.com"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={employeeForm.rolId}
                  label="Rol"
                  onChange={(e) =>
                    setEmployeeForm((p) => ({
                      ...p,
                      rolId: String(e.target.value),
                    }))
                  }
                >
                  {activeRoles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!selectedEmployee && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Contraseña temporal"
                  value={employeeForm.tempPassword}
                  onChange={(e) =>
                    setEmployeeForm((p) => ({
                      ...p,
                      tempPassword: e.target.value,
                    }))
                  }
                  helperText="Debe cumplir la regla del backend: mayúscula, minúscula, número y carácter especial."
                />

                <Button
                  type="button"
                  size="small"
                  onClick={() =>
                    setEmployeeForm((p) => ({
                      ...p,
                      tempPassword: generateTempPassword(),
                    }))
                  }
                  sx={{ mt: 1 }}
                >
                  Generar contraseña
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenEmployeeModal(false);
              setSelectedEmployee(null);
            }}
            className={styles.btnGhost}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={submitEmployee}
            variant="contained"
            className={styles.primaryBtn}
            disabled={loading}
          >
            {selectedEmployee ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: ROLES */}
      <Dialog
        open={openRoleModal}
        onClose={() => {
          setOpenRoleModal(false);
          setSelectedRole(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: styles.roleDialogPaper,
        }}
      >
        <DialogTitle className={styles.dialogTitle}>
          {selectedRole ? `Editar Rol: ${selectedRole.name}` : "Nuevo Rol"}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nombre del Rol"
            value={roleForm.name}
            onChange={(e) =>
              setRoleForm((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Ej: Cajero, Vendedor"
            disabled={(selectedRole?.isSystem ?? false) || !canManageRoles}
            sx={{ mb: 3 }}
          />

          <Box className={styles.permissionsHeader}>
            <Typography variant="subtitle2" className={styles.permissionsTitle}>
              Permisos
            </Typography>

            <Typography variant="caption" className={styles.permissionsCounter}>
              {roleForm.permissions.length} de {allPermissions.length}{" "}
              seleccionados
            </Typography>
          </Box>

          <Box className={styles.permsBox}>
            {allPermissions.length === 0 ? (
              <Alert severity="info" className={styles.alert}>
                Sin catálogo de permisos.
              </Alert>
            ) : (
              Object.entries(permissionsByCategory).map(
                ([category, permissions]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, mb: 1, color: "#ec1380" }}
                    >
                      {category}
                    </Typography>

                    <div className={styles.permissionsGrid}>
                      {permissions.map((permission) => {
                        const disabled =
                          (selectedRole?.isSystem ?? false) || !canManageRoles;

                        const checked = roleForm.permissions.includes(
                          permission.id,
                        );

                        return (
                          <label
                            key={permission.id}
                            className={`${styles.permissionItem} ${
                              checked ? styles.permissionItemChecked : ""
                            } ${disabled ? styles.permissionItemDisabled : ""}`}
                          >
                            <Checkbox
                              checked={checked}
                              onChange={() => togglePermission(permission.id)}
                              disabled={disabled}
                              size="small"
                              className={styles.permissionCheckbox}
                            />

                            <span className={styles.permissionText}>
                              <span className={styles.permissionName}>
                                {permission.name}
                              </span>

                              <span className={styles.permissionSlug}>
                                {permission.id}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </Box>
                ),
              )
            )}
          </Box>

          {selectedRole?.isSystem && (
            <Box className={styles.systemNote}>
              <Typography variant="body2">
                Este es un rol del sistema y no puede ser modificado.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenRoleModal(false);
              setSelectedRole(null);
            }}
            className={styles.btnGhost}
          >
            Cancelar
          </Button>
          {canManageRoles && (
            <Button
              onClick={submitRole}
              variant="contained"
              disabled={selectedRole?.isSystem ?? false}
              className={styles.primaryBtn}
            >
              {selectedRole ? "Actualizar" : "Crear"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* MODAL: MÉTODOS DE PAGO */}
      <Dialog
        open={openPaymentModal}
        onClose={() => {
          setOpenPaymentModal(false);
          setSelectedPayment(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          Configurar Método de Pago
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={paymentForm.nombre}
                disabled={!canManagePaymentMethods}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, nombre: e.target.value }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción"
                value={paymentForm.descripcion}
                disabled={!canManagePaymentMethods}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, descripcion: e.target.value }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentForm.activo_pos}
                    disabled={!canManagePaymentMethods}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        activo_pos: e.target.checked,
                      }))
                    }
                  />
                }
                label="POS"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentForm.activo_web}
                    disabled={!canManagePaymentMethods}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        activo_web: e.target.checked,
                      }))
                    }
                  />
                }
                label="Web"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentForm.activo_admin}
                    disabled={!canManagePaymentMethods}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        activo_admin: e.target.checked,
                      }))
                    }
                  />
                }
                label="Admin"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentForm.requiere_referencia}
                    disabled={!canManagePaymentMethods}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        requiere_referencia: e.target.checked,
                      }))
                    }
                  />
                }
                label="Requiere referencia"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentForm.permite_cambio}
                    disabled={!canManagePaymentMethods}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        permite_cambio: e.target.checked,
                      }))
                    }
                  />
                }
                label="Permite cambio"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentForm.requiere_confirmacion_manual}
                    disabled={!canManagePaymentMethods}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        requiere_confirmacion_manual: e.target.checked,
                      }))
                    }
                  />
                }
                label="Confirmación manual"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={paymentForm.es_credito}
                    disabled={!canManagePaymentMethods}
                    onChange={(e) =>
                      setPaymentForm((p) => ({
                        ...p,
                        es_credito: e.target.checked,
                      }))
                    }
                  />
                }
                label="Es crédito"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="number"
                label="Orden"
                value={paymentForm.orden}
                disabled={!canManagePaymentMethods}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    orden: Number(e.target.value),
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Instrucciones POS"
                value={paymentForm.instrucciones_pos}
                disabled={!canManagePaymentMethods}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    instrucciones_pos: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Instrucciones Web"
                value={paymentForm.instrucciones_web}
                disabled={!canManagePaymentMethods}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    instrucciones_web: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenPaymentModal(false);
              setSelectedPayment(null);
            }}
            className={styles.btnGhost}
          >
            Cancelar
          </Button>

          {canManagePaymentMethods && (
            <Button
              onClick={submitPayment}
              variant="contained"
              className={styles.primaryBtn}
              disabled={savingPayment}
            >
              {savingPayment ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
