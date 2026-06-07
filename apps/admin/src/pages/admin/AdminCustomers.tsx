import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import styles from "../../../styles/AdminCustomers.module.css";
import CustomerStatsSection from "@admin/components/components/CustomerStatsSection";
import CustomerFiltersBar from "@admin/components/components/CustomerFiltersBar";
import CustomersTableSection from "@admin/components/components/CustomersTableSection";
import CustomerFormDialog from "@admin/components/components/CustomerFormDialog";
import { clientesService } from "@admin/services/clientes.service";
import { useErrorAlert } from "@admin/components/layout/useErrorAlert";
import ErrorAlert from "@admin/components/layout/ErrorAlert";

export type CustomerStatus = "active" | "inactive";

export type Cliente = {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  status: CustomerStatus;
  joinDate: string;
  address?: string;
  totalPurchases?: number;
  totalLayaways?: number;
  totalSpent?: number;
};

function formatMoneda(valor: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(valor);
}

const AdminCustomers: React.FC = () => {
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CustomerStatus>(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Cliente[]>([]);
  const [creditFilter, setCreditFilter] = useState<
    "all" | "with_credit" | "without_credit"
  >("all");
  const [debtFilter, setDebtFilter] = useState<
    "all" | "with_debt" | "without_debt"
  >("all");

  const { state: alertState, hide: hideAlert, showError, showSuccess } = useErrorAlert();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientesService.getList();

      const normalized: Cliente[] = data.map((c: unknown) => {
        const item = c as Record<string, unknown>;
        return {
          id: String(item.id || ""),
          name: String(
            item.nombre_completo || item.nombres || item.name || "Sin nombre",
          ),
          email: String(item.email || item.correo || ""),
          phone: String(item.phone || item.telefono || ""),
          creditLimit: Number(item.limite_credito ?? item.creditLimit ?? 0),
          currentBalance: Number(item.saldo_deudor ?? item.currentBalance ?? 0),
          status:
            item.activo || item.status === "active" ? "active" : "inactive",
          lastPurchase: String(
            item.ultima_compra || item.lastPurchase || "---",
          ),
          joinDate: String(item.fecha_registro || item.joinDate || "---"),
          address: String(item.direccion || item.address || ""),
          totalPurchases: Number(
            item.total_compras ?? item.totalPurchases ?? 0,
          ),
          totalLayaways: Number(
            item.total_apartados ?? item.totalLayaways ?? 0,
          ),
          totalSpent: Number(item.total_gastado ?? item.totalSpent ?? 0),
        };
      });

      setCustomers(normalized);
    } catch (error: unknown) {
      console.error(error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const customersFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return customers.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ? true : c.status === statusFilter;

      const matchCredit =
        creditFilter === "all"
          ? true
          : creditFilter === "with_credit"
            ? c.creditLimit > 0
            : c.creditLimit === 0;
      const matchDebt =
        debtFilter === "all"
          ? true
          : debtFilter === "with_debt"
            ? c.currentBalance > 0
            : c.currentBalance === 0;

      return matchQ && matchStatus && matchCredit && matchDebt;
    });
  }, [customers, searchTerm, statusFilter, creditFilter, debtFilter]);

  const estadisticas = useMemo(() => {
    const totalClientes = customers.length;
    const clientesActivos = customers.filter(
      (c) => c.status === "active",
    ).length;
    const clientesConCredito = customers.filter(
      (c) => c.creditLimit > 0,
    ).length;
    const saldoTotal = customers.reduce((sum, c) => sum + c.currentBalance, 0);

    return { totalClientes, clientesActivos, clientesConCredito, saldoTotal };
  }, [customers]);

  const handleViewCustomer = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setIsEditMode(false);
    setOpenCustomerModal(true);
  };

  const handleEditCustomer = (customer: Cliente) => {
    setSelectedCustomer(customer);
    setIsEditMode(true);
    setOpenCustomerModal(true);
  };

  const handleNuevoCliente = () => {
    setSelectedCustomer(null);
    setIsEditMode(true);
    setOpenCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setOpenCustomerModal(false);
    setSelectedCustomer(null);
    setIsEditMode(false);
  };

  return (
    <Box className={styles.root}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          Gestión de Clientes
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          className={styles.primaryButton}
          onClick={handleNuevoCliente}
        >
          Nuevo cliente
        </Button>
      </Box>

      <CustomerStatsSection
        loading={loading}
        totalClientes={estadisticas.totalClientes}
        clientesActivos={estadisticas.clientesActivos}
        clientesConCredito={estadisticas.clientesConCredito}
        saldoTotal={estadisticas.saldoTotal}
        formatMoneda={formatMoneda}
      />

      <CustomerFiltersBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        creditFilter={creditFilter}
        debtFilter={debtFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onCreditChange={setCreditFilter}
        onDebtChange={setDebtFilter}
      />

      <CustomersTableSection
        customers={customersFiltrados}
        loading={loading}
        formatMoneda={formatMoneda}
        onView={handleViewCustomer}
        onEdit={handleEditCustomer}
      />

      <CustomerFormDialog
        open={openCustomerModal}
        customer={selectedCustomer}
        isEditMode={isEditMode}
        formatMoneda={formatMoneda}
        onClose={handleCloseCustomerModal}
        onSuccess={(mensaje) => {
          void load();
          showSuccess(mensaje);
        }}
        onError={(mensaje, titulo) => {
          showError(mensaje, titulo);
        }}
      />

      <ErrorAlert
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        severity={alertState.severity}
        onClose={hideAlert}
        autoCloseDuration={5000}
      />
    </Box>
  );
};

export default AdminCustomers;
