import React, { useState } from "react";
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

type Props = {
  searchTerm: string;
  statusFilter: "all" | "active" | "inactive";
  creditFilter: "all" | "with_credit" | "without_credit";
  debtFilter: "all" | "with_debt" | "without_debt";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | "active" | "inactive") => void;
  onCreditChange: (value: "all" | "with_credit" | "without_credit") => void;
  onDebtChange: (value: "all" | "with_debt" | "without_debt") => void;
};

const CustomerFiltersBar: React.FC<Props> = ({
  searchTerm,
  statusFilter,
  creditFilter,
  debtFilter,
  onSearchChange,
  onStatusChange,
  onCreditChange,
  onDebtChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Paper className={styles.filtersPaper}>
      {/* BARRA PRINCIPAL */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, teléfono o correo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth className={styles.select}>
            <InputLabel>Estatus</InputLabel>
            <Select
              value={statusFilter}
              label="Estatus"
              onChange={(e) =>
                onStatusChange(e.target.value as "all" | "active" | "inactive")
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Grid>

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
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              Más filtros
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* SECCIÓN EXPANDIBLE (FILTROS AVANZADOS) */}
      <Collapse in={showAdvanced}>
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
            {/* Filtro de Límite de Crédito */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth className={styles.select} size="small">
                <InputLabel>Tipo de Crédito</InputLabel>
                <Select
                  value={creditFilter}
                  label="Tipo de Crédito"
                  onChange={(e) =>
                    onCreditChange(
                      e.target.value as
                        | "all"
                        | "with_credit"
                        | "without_credit",
                    )
                  }
                >
                  <MenuItem value="all">Cualquiera</MenuItem>
                  <MenuItem value="with_credit">Con crédito asignado</MenuItem>
                  <MenuItem value="without_credit">Sin crédito</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro de Saldos / Deudas */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth className={styles.select} size="small">
                <InputLabel>Estado de Cuenta</InputLabel>
                <Select
                  value={debtFilter}
                  label="Estado de Cuenta"
                  onChange={(e) =>
                    onDebtChange(
                      e.target.value as "all" | "with_debt" | "without_debt",
                    )
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

            {/* Botón para limpiar filtros si hay alguno activo */}
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