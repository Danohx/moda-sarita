import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  FilterList,
  Search,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import styles from "../../../styles/AdminCustomers.module.css";

type CustomerStatusFilter = "all" | "active" | "inactive";
type CreditFilter = "all" | "with_credit" | "without_credit";
type DebtFilter = "all" | "with_debt" | "without_debt";

type Props = {
  searchTerm: string;
  statusFilter: CustomerStatusFilter;
  creditFilter: CreditFilter;
  debtFilter: DebtFilter;
  canViewFinancialFilters?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CustomerStatusFilter) => void;
  onCreditChange: (value: CreditFilter) => void;
  onDebtChange: (value: DebtFilter) => void;
};

const CustomerFiltersBar: React.FC<Props> = ({
  searchTerm,
  statusFilter,
  creditFilter,
  debtFilter,
  canViewFinancialFilters = false,
  onSearchChange,
  onStatusChange,
  onCreditChange,
  onDebtChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (canViewFinancialFilters) return;

    if (creditFilter !== "all") {
      onCreditChange("all");
    }

    if (debtFilter !== "all") {
      onDebtChange("all");
    }
  }, [
    canViewFinancialFilters,
    creditFilter,
    debtFilter,
    onCreditChange,
    onDebtChange,
  ]);

  return (
    <Paper className={styles.filtersPaper}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: canViewFinancialFilters ? 7 : 8 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, teléfono o correo..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className={styles.searchIcon} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: canViewFinancialFilters ? 3 : 4 }}>
          <FormControl fullWidth className={styles.select}>
            <InputLabel>Estatus</InputLabel>
            <Select
              value={statusFilter}
              label="Estatus"
              onChange={(event) =>
                onStatusChange(event.target.value as CustomerStatusFilter)
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {canViewFinancialFilters && (
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant={showAdvanced ? "contained" : "outlined"}
                startIcon={<FilterList />}
                endIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
                className={
                  showAdvanced ? styles.primaryButton : styles.moreFiltersBtn
                }
                fullWidth
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                Más filtros
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      <Collapse in={canViewFinancialFilters && showAdvanced}>
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              color: "var(--color-text)",
              opacity: 0.6,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Filtros financieros
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth className={styles.select} size="small">
                <InputLabel>Tipo de Crédito</InputLabel>
                <Select
                  value={creditFilter}
                  label="Tipo de Crédito"
                  onChange={(event) =>
                    onCreditChange(event.target.value as CreditFilter)
                  }
                >
                  <MenuItem value="all">Cualquiera</MenuItem>
                  <MenuItem value="with_credit">Con crédito asignado</MenuItem>
                  <MenuItem value="without_credit">Sin crédito</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth className={styles.select} size="small">
                <InputLabel>Estado de Cuenta</InputLabel>
                <Select
                  value={debtFilter}
                  label="Estado de Cuenta"
                  onChange={(event) =>
                    onDebtChange(event.target.value as DebtFilter)
                  }
                >
                  <MenuItem value="all">Cualquiera</MenuItem>
                  <MenuItem value="with_debt">Con saldo deudor</MenuItem>
                  <MenuItem value="without_debt">
                    Sin adeudo (En ceros)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(creditFilter !== "all" || debtFilter !== "all") && (
              <Grid
                size={{ xs: 12, sm: 12, md: 4 }}
                display="flex"
                alignItems="center"
              >
                <Button
                  color="error"
                  size="small"
                  onClick={() => {
                    onCreditChange("all");
                    onDebtChange("all");
                  }}
                >
                  Limpiar filtros financieros
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CustomerFiltersBar;