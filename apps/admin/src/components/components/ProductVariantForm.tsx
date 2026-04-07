
import styles from "../../../styles/ProductForm.module.css";

export type VariantFormState = {
  sku: string;
  codigo_barras: string;
  color_id: string;
  talla_id: string;
  precio_venta: number;
  precio_costo: number;
  stock_fisico: number;
  stock_apartado: number;
  stock_minimo: number;
  activo: boolean;
};

export type VariantOptionItem = {
  id: string | number;
  nombre: string;
};

type ProductVariantFormProps = {
  mode: "create" | "edit";
  form: VariantFormState;
  colors: VariantOptionItem[];
  sizes: VariantOptionItem[];
  saving?: boolean;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  onChange: (next: VariantFormState) => void;
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
};

export const emptyVariantForm: VariantFormState = {
  sku: "",
  codigo_barras: "",
  color_id: "",
  talla_id: "",
  precio_venta: 0,
  precio_costo: 0,
  stock_fisico: 0,
  stock_apartado: 0,
  stock_minimo: 0,
  activo: true,
};

export function buildVariantPayload(form: VariantFormState) {
  return {
    sku: form.sku.trim(),
    codigo_barras: form.codigo_barras.trim() || null,
    color_id: form.color_id || null,
    talla_id: form.talla_id || null,
    precio_venta: Number(form.precio_venta || 0),
    precio_costo: Number(form.precio_costo || 0),
    stock_fisico: Number(form.stock_fisico || 0),
    stock_apartado: Number(form.stock_apartado || 0),
    stock_minimo: Number(form.stock_minimo || 0),
    activo: form.activo,
  };
}

export function mapVariantToForm(variant: {
  sku?: string | null;
  codigo_barras?: string | null;
  color_id?: string | number | null;
  talla_id?: string | number | null;
  precio_venta?: number | string | null;
  precio_costo?: number | string | null;
  stock_fisico?: number | null;
  stock_apartado?: number | null;
  stock_minimo?: number | null;
  activo?: boolean;
}): VariantFormState {
  return {
    sku: variant.sku ?? "",
    codigo_barras: variant.codigo_barras ?? "",
    color_id: variant.color_id ? String(variant.color_id) : "",
    talla_id: variant.talla_id ? String(variant.talla_id) : "",
    precio_venta: Number(variant.precio_venta ?? 0),
    precio_costo: Number(variant.precio_costo ?? 0),
    stock_fisico: Number(variant.stock_fisico ?? 0),
    stock_apartado: Number(variant.stock_apartado ?? 0),
    stock_minimo: Number(variant.stock_minimo ?? 0),
    activo: variant.activo ?? true,
  };
}

export default function ProductVariantForm({
  mode,
  form,
  colors,
  sizes,
  saving = false,
  title,
  subtitle,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: ProductVariantFormProps) {
  const heading = title ?? (mode === "edit" ? "Editar variante" : "Nueva variante");
  const helper =
    subtitle ??
    (mode === "edit"
      ? "Actualiza los datos comerciales y de inventario de esta variante."
      : "Captura los atributos, precios e inventario de la nueva variante.");

  return (
    <form
      className={styles.formPage}
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <section className={styles.card}>
        <div>
          <h2 className={styles.title}>{heading}</h2>
          <p className={styles.subtitle}>{helper}</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="variant-sku">SKU</label>
            <input
              id="variant-sku"
              type="text"
              value={form.sku}
              onChange={(e) => onChange({ ...form, sku: e.target.value })}
              placeholder="SKU de la variante"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="variant-codigo-barras">Código de barras</label>
            <input
              id="variant-codigo-barras"
              type="text"
              value={form.codigo_barras}
              onChange={(e) => onChange({ ...form, codigo_barras: e.target.value })}
              placeholder="Código de barras"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="variant-color">Color</label>
            <select
              id="variant-color"
              value={form.color_id}
              onChange={(e) => onChange({ ...form, color_id: e.target.value })}
            >
              <option value="">Sin color</option>
              {colors.map((color) => (
                <option key={color.id} value={String(color.id)}>
                  {color.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="variant-size">Talla</label>
            <select
              id="variant-size"
              value={form.talla_id}
              onChange={(e) => onChange({ ...form, talla_id: e.target.value })}
            >
              <option value="">Sin talla</option>
              {sizes.map((size) => (
                <option key={size.id} value={String(size.id)}>
                  {size.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="variant-price-sale">Precio venta</label>
            <input
              id="variant-price-sale"
              type="number"
              min="0"
              step="0.01"
              value={form.precio_venta}
              onChange={(e) =>
                onChange({ ...form, precio_venta: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="variant-price-cost">Precio costo</label>
            <input
              id="variant-price-cost"
              type="number"
              min="0"
              step="0.01"
              value={form.precio_costo}
              onChange={(e) =>
                onChange({ ...form, precio_costo: Number(e.target.value) })
              }
            />
          </div>

          {/* <div className={styles.field}>
            <label htmlFor="variant-stock-physical">Stock físico</label>
            <input
              id="variant-stock-physical"
              type="number"
              min="0"
              value={form.stock_fisico}
              onChange={(e) =>
                onChange({ ...form, stock_fisico: Number(e.target.value) })
              }
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="variant-stock-reserved">Stock apartado</label>
            <input
              id="variant-stock-reserved"
              type="number"
              min="0"
              value={form.stock_apartado}
              onChange={(e) =>
                onChange({ ...form, stock_apartado: Number(e.target.value) })
              }
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="variant-stock-minimum">Stock mínimo</label>
            <input
              id="variant-stock-minimum"
              type="number"
              min="0"
              value={form.stock_minimo}
              onChange={(e) =>
                onChange({ ...form, stock_minimo: Number(e.target.value) })
              }
            />
          </div> */}
        </div>

        <div className={styles.switches}>
          <label className={styles.switchItem}>
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => onChange({ ...form, activo: e.target.checked })}
            />
            Variante activa
          </label>
        </div>

        <div className={styles.footer}>
          {onCancel ? (
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancelar
            </button>
          ) : null}

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {submitLabel ?? (mode === "edit" ? "Guardar cambios" : "Crear variante")}
          </button>
        </div>
      </section>
    </form>
  );
}
