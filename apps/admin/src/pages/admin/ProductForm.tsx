import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import styles from "../../../styles/ProductForm.module.css";
import { productosService } from "../../services/productos.service";
import { categoriaService } from "../../services/categorias.service";
import { useBreadcrumbContext } from "@shared/hooks/useBreadcrumbContext";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";
import type { BreadcrumbItem } from "@admin/components/layout/AdminBreadcrumbs";
import { configuracionService } from "@admin/services/configuracion.service";

type CategoriaItem = {
  id: string | number;
  nombre: string;
};

type CreateProductoPayload = Parameters<typeof productosService.create>[0];
type UpdateProductoPayload = Parameters<typeof productosService.update>[1];
type ProductoResponse = Awaited<ReturnType<typeof productosService.getById>>;
type VarianteBasePayload = CreateProductoPayload["variante_base"];

type ProductFormState = {
  nombre: string;
  descripcion: string;
  categoria_id: string | number | "";
  proveedor_id: string | number | "";
  slug: string;
  activo: boolean;
  destacado: boolean;
  maneja_variantes: boolean;
  variante_base: VarianteBasePayload;
};

const initialForm: ProductFormState = {
  nombre: "",
  descripcion: "",
  categoria_id: "",
  proveedor_id: "",
  slug: "",
  activo: true,
  destacado: false,
  maneja_variantes: true,
  variante_base: {
    sku: "",
    codigo_barras: "",
    precio_costo: 0,
    precio_venta: 0,
    stock_fisico: 0,
    stock_apartado: 0,
    stock_minimo: 5,
    talla_id: null,
    color_id: null,
    activo: true,
  },
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function generateSkuFromName(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toUpperCase();

  return base ? `${base}-001` : "";
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const ctx = useBreadcrumbContext();
  const isEdit = Boolean(id);
  const breadcrumbItems: BreadcrumbItem[] =
    ctx.from === "detail"
      ? [
          { label: "Productos", to: "/products" },
          { label: "Detalles del producto", to: `/products/${id}` },
          { label: isEdit ? "Editar producto" : "Nuevo producto" },
        ]
      : isEdit
        ? [
            { label: "Productos", to: "/products" },
            { label: "Editar producto" },
          ]
        : [
            { label: "Productos", to: "/products" },
            { label: "Nuevo producto" },
          ];

  const [categories, setCategories] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [skuTouched, setSkuTouched] = useState(false);
  const [form, setForm] = useState<ProductFormState>(initialForm);

  const pageTitle = useMemo(
    () => (isEdit ? "Editar producto" : "Nuevo producto"),
    [isEdit],
  );

  const pageSubtitle = useMemo(
    () =>
      isEdit
        ? "Actualiza la información general del producto. Los precios, stock y atributos se administran desde variantes."
        : "Captura la información general del producto y su configuración comercial inicial.",
    [isEdit],
  );

  useEffect(() => {
    if (!form.nombre.trim()) {
      if (!slugTouched) {
        setForm((prev) => ({ ...prev, slug: "" }));
      }
      if (!isEdit && !skuTouched) {
        setForm((prev) => ({
          ...prev,
          variante_base: { ...prev.variante_base, sku: "" },
        }));
      }
      return;
    }

    if (!slugTouched) {
      setForm((prev) => ({ ...prev, slug: slugify(form.nombre) }));
    }

    if (!isEdit && !skuTouched) {
      setForm((prev) => ({
        ...prev,
        variante_base: {
          ...prev.variante_base,
          sku: generateSkuFromName(form.nombre),
        },
      }));
    }
  }, [form.nombre, isEdit, slugTouched, skuTouched]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categorias, inventoryParams] = await Promise.all([
          categoriaService.getCategorias(),
          isEdit
            ? Promise.resolve([])
            : configuracionService.getInventoryParams(),
        ]);

        if (!cancelled) {
          setCategories(
            (categorias ?? []).map((categoria) => ({
              id: categoria.id,
              nombre: categoria.nombre,
            })),
          );
        }

        if (!cancelled && !isEdit) {
          const stockMinimoGeneral = configuracionService.getParamNumber(
            inventoryParams,
            "inventario.stock_minimo_general",
            5,
          );

          setForm((prev) => ({
            ...prev,
            variante_base: {
              ...prev.variante_base,
              stock_minimo: stockMinimoGeneral,
            },
          }));
        }

        if (isEdit && id) {
          const product = (await productosService.getById(
            id,
          )) as ProductoResponse;

          if (!cancelled && product) {
            setForm((prev) => ({
              ...prev,
              nombre: product.nombre ?? "",
              descripcion: product.descripcion ?? "",
              categoria_id: product.categoria_id ?? "",
              proveedor_id: product.proveedor_id ?? "",
              slug: product.slug ?? "",
              activo: product.activo ?? true,
              destacado: product.destacado ?? false,
              maneja_variantes: product.maneja_variantes ?? true,
            }));
            setSlugTouched(Boolean(product.slug));
            setSkuTouched(true);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("No se pudo cargar la información del producto.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleChange = <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = <K extends keyof VarianteBasePayload>(
    field: K,
    value: VarianteBasePayload[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      variante_base: {
        ...prev.variante_base,
        [field]: value,
      },
    }));
  };

  const validateCreate = () => {
    if (!form.nombre.trim() || form.nombre.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres.";
    }

    if (!form.variante_base.sku.trim()) {
      return "El SKU inicial es requerido.";
    }

    if (Number(form.variante_base.precio_venta ?? 0) < 0) {
      return "El precio de venta debe ser mayor o igual a 0.";
    }

    if (Number(form.variante_base.precio_costo ?? 0) < 0) {
      return "El precio de costo debe ser mayor o igual a 0.";
    }

    if (Number(form.variante_base.stock_fisico ?? 0) < 0) {
      return "El stock físico debe ser mayor o igual a 0.";
    }

    if (Number(form.variante_base.stock_apartado ?? 0) < 0) {
      return "El stock apartado debe ser mayor o igual a 0.";
    }

    if (Number(form.variante_base.stock_minimo ?? 0) < 0) {
      return "El stock mínimo debe ser mayor o igual a 0.";
    }

    return null;
  };

  const validateUpdate = () => {
    if (!form.nombre.trim() || form.nombre.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres.";
    }

    return null;
  };

  const buildCreatePayload = (): CreateProductoPayload => ({
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    categoria_id: form.categoria_id || null,
    proveedor_id: form.proveedor_id || null,
    destacado: form.destacado,
    slug: form.slug.trim() || slugify(form.nombre),
    maneja_variantes: form.maneja_variantes,
    variante_base: {
      sku: form.variante_base.sku.trim(),
      codigo_barras: form.variante_base.codigo_barras?.trim() || null,
      precio_costo: Number(form.variante_base.precio_costo ?? 0),
      precio_venta: Number(form.variante_base.precio_venta ?? 0),
      stock_fisico: Number(form.variante_base.stock_fisico ?? 0),
      stock_apartado: Number(form.variante_base.stock_apartado ?? 0),
      stock_minimo: Number(form.variante_base.stock_minimo ?? 0),
      talla_id: form.variante_base.talla_id || null,
      color_id: form.variante_base.color_id || null,
      activo: true,
    },
  });

  const buildUpdatePayload = (): UpdateProductoPayload => ({
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    categoria_id: form.categoria_id || null,
    proveedor_id: form.proveedor_id || null,
    slug: form.slug.trim() || slugify(form.nombre),
    maneja_variantes: form.maneja_variantes,
    activo: form.activo,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const validationError = isEdit ? validateUpdate() : validateCreate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      if (isEdit && id) {
        await productosService.update(id, buildUpdatePayload());
        await Promise.all([
          productosService.changeStatus(id, form.activo),
          productosService.changeFeatured(id, form.destacado),
        ]);
      } else {
        await productosService.create(buildCreatePayload());
      }

      navigate("/products");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.stateBox}>
        <Loader2 size={20} className={styles.spinning} />
      </section>
    );
  }

  return (
    <section className={styles.formPage}>
      <header className={styles.header}>
        <div>
          <AdminBreadcrumbs items={breadcrumbItems} />
          <h1 className={styles.title}>{pageTitle}</h1>
          <p className={styles.subtitle}>{pageSubtitle}</p>
        </div>
      </header>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <form className={styles.formPage} onSubmit={handleSubmit}>
        <section className={styles.card}>
          <h2
            className={styles.title}
            style={{ fontSize: "1.2rem", margin: 0 }}
          >
            Datos generales
          </h2>
          <p className={styles.subtitle} style={{ marginTop: "-12px" }}>
            Define la identidad del producto dentro del catálogo.
          </p>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="categoria_id">Categoría</label>
              <select
                id="categoria_id"
                value={String(form.categoria_id ?? "")}
                onChange={(e) => handleChange("categoria_id", e.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  handleChange("slug", e.target.value);
                }}
              />
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                rows={5}
                value={form.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2
            className={styles.title}
            style={{ fontSize: "1.2rem", margin: 0 }}
          >
            Configuración del producto
          </h2>
          <p className={styles.subtitle} style={{ marginTop: "-12px" }}>
            Controla su visibilidad y disponibilidad dentro del sistema.
          </p>

          <div className={styles.switches}>
            <label className={styles.switchItem}>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => handleChange("activo", e.target.checked)}
              />
              Producto activo
            </label>

            <label className={styles.switchItem}>
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => handleChange("destacado", e.target.checked)}
              />
              Mostrar como destacado
            </label>
          </div>
        </section>

        {!isEdit ? (
          <section className={styles.card}>
            <h2
              className={styles.title}
              style={{ fontSize: "1.2rem", margin: 0 }}
            >
              Información comercial inicial
            </h2>
            <p className={styles.subtitle} style={{ marginTop: "-12px" }}>
              Registra la variante base con sus datos esenciales para venta y
              control.
            </p>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="sku">SKU</label>
                <input
                  id="sku"
                  value={form.variante_base.sku}
                  onChange={(e) => {
                    setSkuTouched(true);
                    handleVariantChange("sku", e.target.value.toUpperCase());
                  }}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="codigo_barras">Código de barras</label>
                <input
                  id="codigo_barras"
                  value={form.variante_base.codigo_barras ?? ""}
                  onChange={(e) =>
                    handleVariantChange("codigo_barras", e.target.value)
                  }
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="precio_costo">Precio costo</label>
                <input
                  id="precio_costo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.variante_base.precio_costo ?? 0}
                  onChange={(e) =>
                    handleVariantChange("precio_costo", Number(e.target.value))
                  }
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="precio_venta">Precio venta</label>
                <input
                  id="precio_venta"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.variante_base.precio_venta}
                  onChange={(e) =>
                    handleVariantChange("precio_venta", Number(e.target.value))
                  }
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="stock_minimo">Stock mínimo</label>
                <input
                  id="stock_minimo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.variante_base.stock_minimo}
                  onChange={(e) =>
                    handleVariantChange("stock_minimo", Number(e.target.value))
                  }
                  required
                />
              </div>
            </div>
          </section>
        ) : (
          <section className={styles.card}>
            <div className={styles.stateBox} style={{ minHeight: 0 }}>
              Los precios, SKU, stock y atributos se administran desde el módulo
              de variantes.
            </div>
          </section>
        )}

        <div className={styles.footer}>
          {isEdit && id ? (
            <Link to={`/products/${id}/variants`} className={styles.cancelBtn}>
              Administrar variantes
            </Link>
          ) : null}
          <Link to="/products" className={styles.cancelBtn}>
            Cancelar
          </Link>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? (
              <Loader2 size={18} className={styles.spinning} />
            ) : (
              <Save size={18} />
            )}
            {saving
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Guardar producto"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProductForm;
