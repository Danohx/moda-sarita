import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Package2,
  Boxes,
  AlertTriangle,
  ClipboardEdit,
  Save,
} from "lucide-react";
import styles from "../../../styles/InventoryMovementModal.module.css";
import { inventarioService } from "@admin/services/inventario.service";

type MovementType = "ENTRADA" | "SALIDA" | "AJUSTE" | "SET_STOCK";
type CreateMovementType = Parameters<
  typeof inventarioService.createMovement
>[0];

interface VariantOption {
  id: string;
  producto: string;
  variante: string;
  sku: string;
  stockFisico: number;
  stockApartado: number;
  stockDisponible: number;
  stockMinimo: number;
}

export interface InventoryMovementModalProps {
  isOpen?: boolean;
  title?: string;
  subtitle?: string;
  producto?: string;
  variante?: string;
  sku?: string;
  variante_id?: string | number;
  stockFisico?: string | number;
  stockApartado?: string | number;
  stockDisponible?: string | number;
  stockMinimo?: string | number;
  variantOptions?: VariantOption[];
  onClose?: () => void;
}

export interface FormData {
  variante_id: string;
  movementType: MovementType;
  cantidad: string;
  stockFinal: string;
  motivo: string;
}

const noop = () => {};

const initialForm: FormData = {
  variante_id: "",
  movementType: "ENTRADA",
  cantidad: "",
  stockFinal: "",
  motivo: "",
};

const InventoryMovementModal: React.FC<InventoryMovementModalProps> = ({
  isOpen = true,
  title = "Registrar movimiento",
  subtitle = "Realiza un movimiento rápido sobre la variante seleccionada.",
  producto = "",
  variante = "",
  sku = "",
  variante_id = "",
  stockFisico = "",
  stockApartado = "",
  stockDisponible = "",
  stockMinimo = "",
  variantOptions = [],
  onClose = noop,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);

  const isContextual = Boolean(String(variante_id ?? "").trim());

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setForm({
      variante_id: String(variante_id ?? ""),
      movementType: "ENTRADA",
      cantidad: "",
      stockFinal: "",
      motivo: "",
    });
  }, [variante_id, isOpen]);

  const selectedVariant = useMemo(() => {
    if (isContextual) {
      return {
        id: String(variante_id ?? ""),
        producto,
        variante,
        sku,
        stockFisico: Number(stockFisico ?? 0),
        stockApartado: Number(stockApartado ?? 0),
        stockDisponible: Number(stockDisponible ?? 0),
        stockMinimo: Number(stockMinimo ?? 0),
      };
    }

    return (
      variantOptions.find(
        (item) => item.id === String(form.variante_id ?? ""),
      ) ?? null
    );
  }, [
    form.variante_id,
    isContextual,
    producto,
    variante,
    sku,
    stockFisico,
    stockApartado,
    stockDisponible,
    stockMinimo,
    variantOptions,
    variante_id,
  ]);

  const buildCreatePayload = (): CreateMovementType => {
    if (form.movementType === "SET_STOCK") {
      return {
        variante_id: form.variante_id,
        accion: form.movementType,
        stock_fisico: Number(form.stockFinal),
        motivo: form.motivo.trim(),
      };
    }

    return {
      variante_id: form.variante_id,
      accion: form.movementType,
      cantidad: Number(form.cantidad),
      motivo: form.motivo.trim(),
    };
  };

  const handleChange =
    (field: keyof FormData) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

      if (error) setError(null);
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.variante_id.trim()) {
      setError("Debes seleccionar una variante.");
      return;
    }

    if (form.movementType === "SET_STOCK") {
      if (form.stockFinal.trim() === "") {
        setError("Debes indicar el stock final.");
        return;
      }
    } else if (form.cantidad.trim() === "") {
      setError("Debes indicar la cantidad.");
      return;
    }

    if (!form.motivo.trim()) {
      setError("Debes indicar el motivo del movimiento.");
      return;
    }

    try {
      setSaving(true);
      await inventarioService.createMovement(buildCreatePayload());
      onClose();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(`No se pudo crear el movimiento. ${message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const showCantidad = form.movementType !== "SET_STOCK";
  const showStockFinal = form.movementType === "SET_STOCK";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-movement-modal-title"
    >
      <div className={styles.modal}>
        <header className={styles.header}>
          <div>
            <h2 id="inventory-movement-modal-title" className={styles.title}>
              {title}
            </h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </header>

        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <Package2 size={18} />
            </div>
            <div>
              <span className={styles.summaryLabel}>Producto</span>
              <strong className={styles.summaryValue}>
                {selectedVariant?.producto || "Selecciona una variante"}
              </strong>
            </div>
          </article>
          <article className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <Boxes size={18} />
            </div>
            <div>
              <span className={styles.summaryLabel}>Variante</span>
              <strong className={styles.summaryValue}>
                {selectedVariant?.variante || "—"}
              </strong>
            </div>
          </article>
          <article className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <ClipboardEdit size={18} />
            </div>
            <div>
              <span className={styles.summaryLabel}>SKU</span>
              <strong className={styles.summaryValue}>
                {selectedVariant?.sku || "—"}
              </strong>
            </div>
          </article>
          <article className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <span className={styles.summaryLabel}>Stock disponible</span>
              <strong className={styles.summaryValue}>
                {selectedVariant?.stockDisponible ?? "0"}
              </strong>
            </div>
          </article>
        </section>

        <section className={styles.stockPanel}>
          <div className={styles.stockItem}>
            <span>Stock físico</span>
            <strong>{selectedVariant?.stockFisico ?? 0}</strong>
          </div>
          <div className={styles.stockItem}>
            <span>Stock apartado</span>
            <strong>{selectedVariant?.stockApartado ?? 0}</strong>
          </div>
          <div className={styles.stockItem}>
            <span>Stock mínimo</span>
            <strong>{selectedVariant?.stockMinimo ?? 0}</strong>
          </div>
        </section>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            {!isContextual && (
              <div className={`${styles.field} ${styles.full}`}>
                <label htmlFor="variante_id">Variante</label>
                <select
                  id="variante_id"
                  value={form.variante_id}
                  onChange={handleChange("variante_id")}
                >
                  <option value="">Selecciona una variante</option>
                  {variantOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.producto} · {option.variante}
                      {option.sku ? ` · ${option.sku}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="movementType">Tipo de movimiento</label>
              <select
                id="movementType"
                value={form.movementType}
                onChange={handleChange("movementType")}
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
                <option value="AJUSTE">Ajuste manual</option>
                <option value="SET_STOCK">Corregir stock final</option>
              </select>
            </div>

            {showCantidad && (
              <div className={styles.field}>
                <label htmlFor="cantidad">Cantidad</label>
                <input
                  id="cantidad"
                  type="number"
                  value={form.cantidad}
                  onChange={handleChange("cantidad")}
                  placeholder="Ej. 5"
                />
              </div>
            )}

            {showStockFinal && (
              <div className={styles.field}>
                <label htmlFor="stockFinal">Stock final</label>
                <input
                  id="stockFinal"
                  type="number"
                  min="0"
                  value={form.stockFinal}
                  onChange={handleChange("stockFinal")}
                  placeholder="Ej. 12"
                />
              </div>
            )}

            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="motivo">Motivo</label>
              <input
                id="motivo"
                type="text"
                value={form.motivo}
                onChange={handleChange("motivo")}
                placeholder="Motivo del movimiento"
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(220, 38, 38, 0.08)",
                color: "#b91c1c",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Guardando..." : "Guardar movimiento"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default InventoryMovementModal;