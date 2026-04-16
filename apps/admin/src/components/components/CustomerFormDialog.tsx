import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import styles from "../../../styles/AdminCustomers.module.css";
import type { Cliente } from "@admin/pages/admin/AdminCustomers";
import { clientesService } from "@admin/services/clientes.service";

interface DireccionBackend {
  id?: string | number;
  calle?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  es_principal?: boolean;
}

interface ClienteBackend {
  id?: string | number;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email?: string;
  telefono?: string;
  limite_credito?: string | number;
  saldo_actual?: string | number;
  saldo_deudor?: string | number;
  activo?: boolean;
  fecha_registro?: string;
  total_compras?: string | number;
  total_apartados?: string | number;
  total_gastado?: string | number;
  direcciones?: DireccionBackend[];
}

type Props = {
  open: boolean;
  customer: Cliente | null;
  isEditMode: boolean;
  formatMoneda: (valor: number) => string;
  onClose: () => void;
  onSuccess: () => void;
};

const CustomerFormDialog: React.FC<Props> = ({
  open,
  customer,
  isEditMode,
  formatMoneda,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const title = customer
    ? isEditMode
      ? "Editar cliente"
      : "Detalle del cliente"
    : "Nuevo cliente";
  const readOnly = customer ? !isEditMode : false;

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    calle: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
  });

  const [customerStats, setCustomerStats] = useState({
    compras: 0,
    apartados: 0,
    gastado: 0,
    limiteCredito: 0,
    saldo: 0,
  });

  useEffect(() => {
    if (!open) return;

    if (customer) {
      const nameParts = customer.name.trim().split(" ");
      setFormData({
        nombres: nameParts[0] || "",
        apellido_paterno: nameParts[1] || "",
        apellido_materno:
          nameParts.length > 2 ? nameParts.slice(2).join(" ") : "",
        email: customer.email,
        telefono: customer.phone,
        calle: customer.address ?? "",
        ciudad: "",
        estado: "",
        codigo_postal: "",
      });

      setCustomerStats({
        compras: customer.totalPurchases ?? 0,
        apartados: customer.totalLayaways ?? 0,
        gastado: customer.totalSpent ?? 0,
        limiteCredito: customer.creditLimit ?? 0,
        saldo: customer.currentBalance ?? 0,
      });

      const fetchDetallesCompletos = async () => {
        try {
          const dataBD = (await clientesService.getById(
            customer.id,
          )) as ClienteBackend;

          if (dataBD) {
            const dirs = dataBD.direcciones || [];
            const dirPrincipal =
              dirs.find((d) => d.es_principal) || dirs[0] || {};

            setFormData((prev) => ({
              ...prev,
              nombres: dataBD.nombres || prev.nombres,
              apellido_paterno:
                dataBD.apellido_paterno || prev.apellido_paterno,
              apellido_materno:
                dataBD.apellido_materno || prev.apellido_materno,
              calle: dirPrincipal.calle || prev.calle,
              ciudad: dirPrincipal.ciudad || "",
              estado: dirPrincipal.estado || "",
              codigo_postal: dirPrincipal.codigo_postal || "",
            }));

            setCustomerStats({
              compras: Number(
                dataBD.total_compras ?? customer.totalPurchases ?? 0,
              ),
              apartados: Number(
                dataBD.total_apartados ?? customer.totalLayaways ?? 0,
              ),
              gastado: Number(dataBD.total_gastado ?? customer.totalSpent ?? 0),
              limiteCredito: Number(
                dataBD.limite_credito ?? customer.creditLimit ?? 0,
              ),
              saldo: Number(
                dataBD.saldo_deudor ??
                  dataBD.saldo_actual ??
                  customer.currentBalance ??
                  0,
              ),
            });
          }
        } catch (error) {
          console.error(error);
        }
      };

      void fetchDetallesCompletos();
    } else {
      setFormData({
        nombres: "",
        apellido_paterno: "",
        apellido_materno: "",
        email: "",
        telefono: "",
        calle: "",
        ciudad: "",
        estado: "",
        codigo_postal: "",
      });
      setCustomerStats({
        compras: 0,
        apartados: 0,
        gastado: 0,
        limiteCredito: 0,
        saldo: 0,
      });
    }
  }, [customer, open]);

  const handleSave = async () => {
    try {
      setSaving(true);
      let clienteId = customer?.id;

      if (clienteId) {
        const updatePayload: Parameters<typeof clientesService.update>[1] & {
          id: string | number;
        } = {
          id: clienteId,
          nombres: formData.nombres,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno || undefined,
          email: formData.email,
          telefono: formData.telefono,
        };
        await clientesService.save(updatePayload);
      } else {
        const createPayload: Parameters<typeof clientesService.create>[0] = {
          nombres: formData.nombres,
          apellido_paterno: formData.apellido_paterno,
          apellido_materno: formData.apellido_materno || undefined,
          email: formData.email,
          telefono: formData.telefono,
        };

        const res = await clientesService.save(createPayload);
        clienteId = (res as { id: string | number }).id;
      }

      if (clienteId && formData.calle.trim() !== "") {
        const dirPayload: Parameters<typeof clientesService.addDireccion>[1] = {
          calle: formData.calle,
          ciudad: formData.ciudad || "Sin especificar",
          estado: formData.estado || "Sin especificar",
          codigo_postal: formData.codigo_postal || "00000",
        };

        const nuevaDir = await clientesService.addDireccion(
          clienteId,
          dirPayload,
        );
        const nuevaDirId = (nuevaDir as { id?: string | number })?.id;

        if (nuevaDirId) {
          await clientesService.setDireccionPrincipal(clienteId, nuevaDirId);
        }
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      alert(
        "Hubo un error al guardar los datos del cliente. Revisa la consola.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!saving ? onClose : undefined}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={styles.dialogTitle}>{title}</DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography className={styles.sectionTitle}>
              Datos generales
            </Typography>
            <div className={styles.formCol}>
              <TextField
                label="Nombre(s)"
                value={formData.nombres}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nombres: e.target.value }))
                }
                fullWidth
                InputProps={{ readOnly }}
              />
              <div style={{ display: "flex", gap: "16px" }}>
                <TextField
                  label="Apellido paterno"
                  value={formData.apellido_paterno}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      apellido_paterno: e.target.value,
                    }))
                  }
                  fullWidth
                  InputProps={{ readOnly }}
                />
                <TextField
                  label="Apellido materno"
                  value={formData.apellido_materno}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      apellido_materno: e.target.value,
                    }))
                  }
                  fullWidth
                  InputProps={{ readOnly }}
                />
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <TextField
                  label="Correo electrónico"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  fullWidth
                  InputProps={{ readOnly }}
                />
                <TextField
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, telefono: e.target.value }))
                  }
                  fullWidth
                  InputProps={{ readOnly }}
                />
              </div>

              <Typography className={styles.sectionTitle} sx={{ mt: 2 }}>
                Dirección principal
              </Typography>
              <TextField
                label="Calle y Número"
                value={formData.calle}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, calle: e.target.value }))
                }
                fullWidth
                InputProps={{ readOnly }}
              />
              <div style={{ display: "flex", gap: "16px" }}>
                <TextField
                  label="Ciudad"
                  value={formData.ciudad}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ciudad: e.target.value }))
                  }
                  fullWidth
                  InputProps={{ readOnly }}
                />
                <TextField
                  label="Estado"
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, estado: e.target.value }))
                  }
                  fullWidth
                  InputProps={{ readOnly }}
                />
                <TextField
                  label="C.P."
                  value={formData.codigo_postal}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      codigo_postal: e.target.value,
                    }))
                  }
                  fullWidth
                  InputProps={{ readOnly }}
                  sx={{ width: "40%" }}
                />
              </div>
            </div>
          </Grid>

          {customer && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Card className={styles.activityCard}>
                <CardContent>
                  <Typography className={styles.activityTitle}>
                    Resumen del cliente
                  </Typography>
                  <Grid container spacing={2} className={styles.activityGrid}>
                    <Grid size={4} className={styles.center}>
                      <Typography className={styles.muted}>Compras</Typography>
                      <Typography className={styles.activityValue}>
                        {customerStats.compras}
                      </Typography>
                    </Grid>
                    <Grid size={4} className={styles.center}>
                      <Typography className={styles.muted}>
                        Apartados
                      </Typography>
                      <Typography className={styles.activityValue}>
                        {customerStats.apartados}
                      </Typography>
                    </Grid>
                    <Grid size={4} className={styles.center}>
                      <Typography className={styles.muted}>Gastado</Typography>
                      <Typography className={styles.activityValue}>
                        {formatMoneda(customerStats.gastado)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card className={styles.creditCard}>
                <CardContent>
                  <div className={styles.creditHeader}>
                    <Typography className={styles.creditTitle}>
                      Crédito
                    </Typography>
                    <span
                      className={
                        customerStats.limiteCredito > 0
                          ? styles.creditActive
                          : styles.creditInactive
                      }
                    >
                      {customerStats.limiteCredito > 0 ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className={styles.creditRow}>
                    <span>Límite</span>
                    <span className={styles.bold}>
                      {formatMoneda(customerStats.limiteCredito)}
                    </span>
                  </div>
                  <div className={styles.creditRow}>
                    <span>Saldo</span>
                    <span className={styles.bold}>
                      {formatMoneda(customerStats.saldo)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {customer && (
          <>
            <Typography className={styles.quickTitle}>
              Acciones rápidas
            </Typography>
            <div className={styles.quickActions}>
              <Button
                variant="outlined"
                className={styles.quickBtn}
                onClick={() => navigate(`/orders?cliente_id=${customer.id}`)}
              >
                Ver historial
              </Button>
              <Button
                variant="outlined"
                className={styles.quickBtn}
                onClick={() =>
                  navigate(`/orders?cliente_id=${customer.id}&tipo=APARTADO`)
                }
              >
                Ver apartados
              </Button>
            </div>
          </>
        )}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          className={styles.cancelBtn}
          onClick={onClose}
          disabled={saving}
        >
          Cancelar
        </Button>
        {isEditMode && (
          <Button
            variant="contained"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomerFormDialog;