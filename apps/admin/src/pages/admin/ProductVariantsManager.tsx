import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCw, X } from "lucide-react";
import styles from "../../../styles/ProductVariantsManager.module.css";
import {
  variantesService,
  type CreateVariantePayload,
} from "@admin/services/variantes.service";
import { categoriaService } from "@admin/services/categorias.service";
import ProductVariantForm, {
  buildVariantPayload,
  emptyVariantForm,
  mapVariantToForm,
  type VariantFormState,
} from "@admin/components/components/ProductVariantForm";

interface OptionItem {
  id: string | number;
  nombre: string;
}

interface VarianteItem {
  id: string | number;
  producto_id?: string | number;
  sku?: string;
  codigo_barras?: string;
  precio_venta?: number;
  precio_costo?: number;
  stock_fisico?: number;
  stock_apartado?: number;
  stock_minimo?: number;
  stock_disponible?: number;
  activo?: boolean;
  color_id?: string | number | null;
  talla_id?: string | number | null;
  color?: { nombre: string; hex?: string | null } | null;
  talla?: { nombre: string; tipo?: string | null } | null;
  created_at?: string;
  updated_at?: string;
}

type VarianteRaw = {
  id: string | number;
  producto_id?: string | number;
  talla_id?: string | number | null;
  talla_nombre?: string | null;
  talla_tipo?: string | null;
  color_id?: string | number | null;
  color_nombre?: string | null;
  color_hex?: string | null;
  sku?: string | null;
  codigo_barras?: string | null;
  precio_venta?: number | string | null;
  precio_costo?: number | string | null;
  stock_fisico?: number | null;
  stock_apartado?: number | null;
  stock_minimo?: number | null;
  stock_disponible?: number | null;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
};

function getVariantLabel(variant: VarianteItem) {
  const color = variant.color?.nombre?.trim();
  const talla = variant.talla?.nombre?.trim();

  if (color && talla) return `${color} / ${talla}`;
  if (color) return color;
  if (talla) return talla;
  return "Variante base";
}

function mapVarianteToItem(variant: VarianteRaw): VarianteItem {
  return {
    id: variant.id,
    producto_id: variant.producto_id,
    sku: variant.sku ?? undefined,
    codigo_barras: variant.codigo_barras ?? undefined,
    precio_venta: Number(variant.precio_venta ?? 0),
    precio_costo: Number(variant.precio_costo ?? 0),
    stock_fisico: Number(variant.stock_fisico ?? 0),
    stock_apartado: Number(variant.stock_apartado ?? 0),
    stock_minimo: Number(variant.stock_minimo ?? 0),
    stock_disponible: Number(
      variant.stock_disponible ??
        Math.max(
          Number(variant.stock_fisico ?? 0) -
            Number(variant.stock_apartado ?? 0),
          0,
        ),
    ),
    activo: variant.activo,
    color_id: variant.color_id ?? null,
    talla_id: variant.talla_id ?? null,
    color: variant.color_nombre
      ? {
          nombre: variant.color_nombre,
          hex: variant.color_hex ?? null,
        }
      : null,
    talla: variant.talla_nombre
      ? {
          nombre: variant.talla_nombre,
          tipo: variant.talla_tipo ?? null,
        }
      : null,
    created_at: variant.created_at,
    updated_at: variant.updated_at,
  };
}

const ProductVariantsManager: React.FC = () => {
  const { id = "" } = useParams();

  const [variants, setVariants] = useState<VarianteItem[]>([]);
  const [colors, setColors] = useState<OptionItem[]>([]);
  const [sizes, setSizes] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | number | null
  >(null);
  const [variantForm, setVariantForm] =
    useState<VariantFormState>(emptyVariantForm);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeCount = useMemo(
    () => variants.filter((variant) => variant.activo).length,
    [variants],
  );

  const loadItems = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setVariants([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        setError(null);

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const data = await variantesService.getByProductoIdAdmin(id);
        const mapped = ((data ?? []) as VarianteRaw[]).map(mapVarianteToItem);

        setVariants(mapped);
        setStockDrafts((prev) => {
          const next: Record<string, number> = { ...prev };

          mapped.forEach((variant) => {
            next[String(variant.id)] = variant.stock_fisico ?? 0;
          });

          return next;
        });
      } catch (err) {
        console.error(err);
        setVariants([]);
        setError("No se pudieron cargar las variantes.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  const loadCatalogs = useCallback(async () => {
    try {
      const [colorsData, sizesData] = await Promise.all([
        categoriaService.getColores(),
        categoriaService.getTallas(),
      ]);

      setColors(
        (colorsData ?? []).map((item) => ({
          id: item.id,
          nombre: item.nombre,
        })),
      );

      setSizes(
        (sizesData ?? []).map((item) => ({
          id: item.id,
          nombre: item.nombre,
        })),
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar colores y tallas.");
    }
  }, []);

  useEffect(() => {
    void loadItems();
    void loadCatalogs();
  }, [loadItems, loadCatalogs]);

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setFormMode("create");
    setSelectedVariantId(null);
    setVariantForm(emptyVariantForm);
  };

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedVariantId(null);
    setVariantForm(emptyVariantForm);
    setIsModalOpen(true);
  };

  const handleEditVariant = (variant: VarianteItem) => {
    setFormMode("edit");
    setSelectedVariantId(variant.id);
    setVariantForm(
      mapVariantToForm({
        sku: variant.sku ?? "",
        codigo_barras: variant.codigo_barras ?? "",
        color_id: variant.color_id ?? null,
        talla_id: variant.talla_id ?? null,
        precio_venta: variant.precio_venta ?? 0,
        precio_costo: variant.precio_costo ?? 0,
        stock_fisico: variant.stock_fisico ?? 0,
        stock_apartado: variant.stock_apartado ?? 0,
        stock_minimo: variant.stock_minimo ?? 0,
        activo: variant.activo ?? true,
      }),
    );
    setIsModalOpen(true);
  };

  const handleSubmitVariantForm = async () => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      const payload = buildVariantPayload(variantForm);

      if (formMode === "edit" && selectedVariantId) {
        await variantesService.update(selectedVariantId, {
          talla_id: payload.talla_id,
          color_id: payload.color_id,
          sku: payload.sku,
          codigo_barras: payload.codigo_barras,
          precio_venta: payload.precio_venta,
          precio_costo: payload.precio_costo,
          stock_minimo: payload.stock_minimo,
        });

        const currentStock =
          variants.find((item) => item.id === selectedVariantId)
            ?.stock_fisico ?? 0;
        const nextStock = payload.stock_fisico ?? 0;
        const diff = nextStock - currentStock;

        if (diff !== 0) {
          await variantesService.changeStock(selectedVariantId, {
            cantidad: diff,
            motivo: "Ajuste desde formulario de variante",
          });
        }
      } else {
        await variantesService.create(id, payload as CreateVariantePayload);
      }

      await loadItems(true);
      closeModal();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la variante.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (
    varianteId: string | number,
    activo: boolean,
  ) => {
    try {
      setError(null);
      await variantesService.changeStatus(varianteId, activo);
      await loadItems(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado de la variante.");
    }
  };

  const handleSaveStock = async (variant: VarianteItem) => {
    const current = Number(variant.stock_fisico ?? 0);
    const next = Number(stockDrafts[String(variant.id)] ?? current);
    const diff = next - current;

    if (diff === 0) return;

    try {
      setSaving(true);
      setError(null);

      await variantesService.changeStock(variant.id, {
        cantidad: diff,
        motivo: "Ajuste manual desde administrador de variantes",
      });

      await loadItems(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className={styles.page}>
        <header className={styles.header}>
          <div>
            <Link to={`/products/${id}`} className={styles.backLink}>
              <ArrowLeft size={18} />
              Volver al detalle
            </Link>

            <h1 className={styles.title}>Variantes del producto</h1>
            <p className={styles.subtitle}>
              Crea nuevas combinaciones, edita sus precios y ajusta el stock sin
              salir de esta pantalla.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={openCreateModal}
              disabled={saving}
            >
              Crear variante
            </button>

            <button
              type="button"
              className={styles.refreshBtn}
              onClick={() => void loadItems(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={18}
                className={refreshing ? styles.spinning : ""}
              />
              {refreshing ? "Recargando..." : "Recargar"}
            </button>
          </div>
        </header>

        {error ? <div className={styles.errorBox}>{error}</div> : null}

        <section className={styles.listCard}>
          <div className={styles.listHeader}>
            <h2 className={styles.sectionTitle}>
              Listado de variantes
              <span className={styles.sectionMeta}>
                {variants.length} total · {activeCount} activas
              </span>
            </h2>
          </div>

          {loading ? (
            <div className={styles.centerState}>
              <Loader2 size={18} className={styles.spinning} />
              <span className={styles.loadingText}>Cargando variantes...</span>
            </div>
          ) : variants.length === 0 ? (
            <div className={styles.centerState}>
              Este producto todavía no tiene variantes registradas.
            </div>
          ) : (
            <div className={styles.list}>
              {variants.map((variant) => (
                <article className={styles.variantCard} key={variant.id}>
                  <div>
                    <h3 className={styles.variantTitle}>
                      {getVariantLabel(variant)}
                    </h3>
                    <p className={styles.variantMeta}>
                      {variant.sku || `Variante #${variant.id}`}
                    </p>
                    <p className={styles.variantMeta}>
                      Precio venta: $
                      {Number(variant.precio_venta ?? 0).toFixed(2)}
                    </p>
                    <p className={styles.variantMeta}>
                      Stock actual: {variant.stock_disponible ?? 0}
                    </p>
                  </div>

                  <div className={styles.variantTools}>
                    <label className={styles.stockControl}>
                      <span>Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={
                          stockDrafts[String(variant.id)] ??
                          variant.stock_fisico ??
                          0
                        }
                        onChange={(e) =>
                          setStockDrafts((prev) => ({
                            ...prev,
                            [String(variant.id)]: Number(e.target.value),
                          }))
                        }
                        onBlur={() => void handleSaveStock(variant)}
                        aria-label={`Stock de ${getVariantLabel(variant)}`}
                      />
                    </label>

                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={() => handleEditVariant(variant)}
                      disabled={saving}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className={
                        variant.activo ? styles.statusOn : styles.statusOff
                      }
                      onClick={() =>
                        void handleToggleStatus(variant.id, !variant.activo)
                      }
                      disabled={saving}
                    >
                      {variant.activo ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {isModalOpen ? (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={closeModal}
              aria-label="Cerrar"
              disabled={saving}
            >
              <X size={18} />
            </button>
            <ProductVariantForm
              mode={formMode}
              form={variantForm}
              colors={colors}
              sizes={sizes}
              saving={saving}
              title={formMode === "edit" ? "Editar variante" : "Nueva variante"}
              subtitle={
                formMode === "edit"
                  ? "Actualiza los datos comerciales y de inventario de esta variante."
                  : "Captura los atributos, precios e inventario de la nueva variante."
              }
              submitLabel={
                formMode === "edit" ? "Guardar cambios" : "Crear variante"
              }
              onChange={setVariantForm}
              onSubmit={handleSubmitVariantForm}
              onCancel={closeModal}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProductVariantsManager;
