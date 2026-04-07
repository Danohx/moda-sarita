import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Image as ImageIcon,
  Layers3,
  Pencil,
  Tag,
  Package,
  Boxes,
} from "lucide-react";
import styles from "../../../styles/ProductDetailAdmin.module.css";
import { productosService } from "@admin/services/productos.service";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";
import { useBreadcrumbContext } from "@shared/hooks/useBreadcrumbContext";
import type { BreadcrumbItem } from "@admin/components/layout/AdminBreadcrumbs";

type ProductViewModel = {
  id: string | number;
  nombre: string;
  descripcion: string;
  sku: string;
  codigo_barras: string;
  precio_costo: number;
  precio_venta: number;
  activo: boolean;
  destacado: boolean;
  categoria: { id: string | number | null; nombre: string } | null;
  imagenes: Array<{ id: string | number; url: string; principal?: boolean }>;
  variantes: Array<{
    id: string | number;
    sku?: string;
    stock?: number;
    activo?: boolean;
    color?: { nombre: string } | null;
    talla?: { nombre: string } | null;
  }>;
  stock_fisico_total: number;
  stock_apartado_total: number;
  stock_disponible_total: number;
  variantes_activas: number;
};

type ProductDetailAdminData = {
  producto: {
    id: string | number;
    nombre: string;
    descripcion?: string | null;
    slug?: string | null;
    categoria_id?: string | number | null;
    categoria_nombre?: string | null;
    proveedor_id?: string | number | null;
    activo?: boolean;
    destacado?: boolean;
    maneja_variantes?: boolean;
    precio_desde?: number | string | null;
    precio_hasta?: number | string | null;
    stock_fisico_total?: number | string | null;
    stock_apartado_total?: number | string | null;
    stock_disponible_total?: number | string | null;
    variantes_activas?: number | string | null;
  } | null;
  variante_base?: {
    id: string | number;
    sku?: string | null;
    codigo_barras?: string | null;
    precio_costo?: number | string | null;
    precio_venta?: number | string | null;
    stock_fisico?: number | null;
    stock_apartado?: number | null;
    stock_minimo?: number | null;
    activo?: boolean;
  } | null;
  imagenes?: Array<{
    id: string | number;
    url: string;
    orden?: number | null;
    es_principal?: boolean;
  }>;
  variantes?: Array<{
    id: string | number;
    sku?: string | null;
    stock_fisico?: number | null;
    stock_apartado?: number | null;
    activo?: boolean;
    color_id?: string | number | null;
    color_nombre?: string | null;
    talla_id?: string | number | null;
    talla_nombre?: string | null;
  }>;
};

function currency(value?: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value ?? 0));
}

function mapDetailToViewModel(
  detail: ProductDetailAdminData,
  productId: string | number,
): ProductViewModel {
  const producto = detail?.producto ?? null;
  const varianteBase = detail?.variante_base ?? null;
  const variantes = Array.isArray(detail?.variantes) ? detail.variantes : [];
  const imagenes = Array.isArray(detail?.imagenes)
    ? detail.imagenes.map((image) => ({
        id: image.id,
        url: image.url,
        principal: image.es_principal,
      }))
    : [];

  return {
    id: producto?.id ?? productId,
    nombre: producto?.nombre ?? "Producto",
    descripcion: producto?.descripcion ?? "",
    sku: varianteBase?.sku ?? "SKU-PENDIENTE",
    codigo_barras: varianteBase?.codigo_barras ?? "",
    precio_costo: Number(varianteBase?.precio_costo ?? 0),
    precio_venta: Number(
      varianteBase?.precio_venta ?? producto?.precio_desde ?? 0,
    ),
    activo: Boolean(producto?.activo),
    destacado: Boolean(producto?.destacado),
    categoria: producto?.categoria_nombre
      ? {
          id: producto.categoria_id ?? null,
          nombre: producto.categoria_nombre,
        }
      : null,
    imagenes,
    variantes: variantes.map((variant) => ({
      id: variant.id,
      sku: variant.sku ?? undefined,
      stock: Math.max(
        Number(variant.stock_fisico ?? 0) - Number(variant.stock_apartado ?? 0),
        0,
      ),
      activo: variant.activo,
      color: variant.color_nombre ? { nombre: variant.color_nombre } : null,
      talla: variant.talla_nombre ? { nombre: variant.talla_nombre } : null,
    })),
    stock_fisico_total: Number(producto?.stock_fisico_total ?? 0),
    stock_apartado_total: Number(producto?.stock_apartado_total ?? 0),
    stock_disponible_total: Number(producto?.stock_disponible_total ?? 0),
    variantes_activas: Number(producto?.variantes_activas ?? 0),
  };
}

const ProductDetailAdmin: React.FC = () => {
  const { id = "" } = useParams();
  const [product, setProduct] = useState<ProductViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ctx = useBreadcrumbContext();
  const breadcrumbItems: BreadcrumbItem[] = ctx.from === "list"
  ? [
      { label: "Productos", to: "/products" },
      { label: "Detalles del producto" },
    ]
  : [
      { label: "Productos", to: "/products" },
      { label: "Detalles del producto" },
    ];

  useEffect(() => {
    let mounted = true;

    async function loadProductDetail() {
      if (!id) {
        if (mounted) {
          setError("No se recibió un identificador de producto.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const detail = await productosService.getDetalleAdmin(id);
        console.log("DETALLE ADMIN RAW:", detail);

        if (!mounted) return;

        if (!detail?.producto) {
          setError("No se encontró la información del producto.");
          setProduct(null);
          return;
        }

        setProduct(mapDetailToViewModel(detail, id));
      } catch (err) {
        console.error(
          "Error cargando detalle administrativo del producto:",
          err,
        );
        if (mounted) {
          setError("No fue posible cargar el detalle del producto.");
          setProduct(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProductDetail();

    return () => {
      mounted = false;
    };
  }, [id]);

  const principalImage = useMemo(
    () =>
      product?.imagenes.find((image) => image.principal) ??
      product?.imagenes[0] ??
      null,
    [product],
  );

  if (loading) {
    return (
      <section className={styles.detailPage}>
        <div className={styles.stateBox}>Cargando detalle del producto...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.detailPage}>
        <div className={styles.errorBox}>{error}</div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className={styles.detailPage}>
        <div className={styles.stateBox}>No hay datos para mostrar.</div>
      </section>
    );
  }

  return (
    <section className={styles.detailPage}>
      <header className={styles.header}>
        <div>
          <AdminBreadcrumbs
            items={breadcrumbItems}
          />
          <h1 className={styles.title}>{product.nombre}</h1>
          <p className={styles.subtitle}>
            Vista administrativa del producto y accesos a gestión avanzada.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link
            to={`/products/${product.id}/edit`}
            state={{ from: "detail", productoNombre: product.nombre }}
            className={styles.secondaryBtn}
          >
            <Pencil size={18} />
            Editar
          </Link>
          <Link
            to={`/products/${product.id}/variants`}
            state={{ from: "detail" }}
            className={styles.primaryBtn}
          >
            <Layers3 size={18} />
            Variantes
          </Link>
        </div>
      </header>

      <div className={styles.topGrid}>
        <article className={styles.imageCard}>
          {principalImage ? (
            <img
              src={principalImage.url}
              alt={product.nombre}
              className={styles.mainImage}
            />
          ) : (
            <div className={styles.imagePlaceholder}>Sin imagen</div>
          )}
        </article>

        <article className={styles.infoCard}>
          <div className={styles.infoGrid}>
            <div>
              <span>SKU</span>
              <strong>{product.sku}</strong>
            </div>
            <div>
              <span>Código de barras</span>
              <strong>{product.codigo_barras || "—"}</strong>
            </div>
            <div>
              <span>Categoría</span>
              <strong>{product.categoria?.nombre || "Sin categoría"}</strong>
            </div>
            <div>
              <span>Precio venta</span>
              <strong>{currency(product.precio_venta)}</strong>
            </div>
            <div>
              <span>Precio costo</span>
              <strong>{currency(product.precio_costo)}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>{product.activo ? "Activo" : "Inactivo"}</strong>
            </div>
          </div>

          <div className={styles.badges}>
            <span
              className={
                product.activo ? styles.activeBadge : styles.inactiveBadge
              }
            >
              {product.activo ? "Activo" : "Inactivo"}
            </span>
            {product.destacado ? (
              <span className={styles.featuredBadge}>Destacado</span>
            ) : null}
          </div>

          <div className={styles.descriptionBox}>
            <h3>Descripción</h3>
            <p>{product.descripcion || "Sin descripción registrada."}</p>
          </div>
        </article>
      </div>

      <div className={styles.bottomGrid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>
              <Layers3 size={18} /> Variantes
            </h2>
            <Link
              to={`/products/${product.id}/variants`}
              className={styles.inlineLink}
            >
              Administrar
            </Link>
          </div>

          {product.variantes.length ? (
            <div className={styles.list}>
              {product.variantes.slice(0, 5).map((variant) => (
                <div key={variant.id} className={styles.listItem}>
                  <div>
                    <strong>
                      {(() => {
                        const colorName = variant.color?.nombre?.trim();
                        const tallaName = variant.talla?.nombre?.trim();

                        if (colorName && tallaName)
                          return `${colorName} / ${tallaName}`;
                        if (colorName) return colorName;
                        if (tallaName) return tallaName;
                        return "Variante base";
                      })()}
                    </strong>
                    <span>{variant.sku || `Variante #${variant.id}`}</span>
                  </div>
                  <div className={styles.trailingInfo}>
                    Stock: {variant.stock ?? 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No hay variantes registradas.</div>
          )}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>
              <ImageIcon size={18} /> Imágenes
            </h2>
            <Link
              to={`/products/${product.id}/images`}
              state={{ from: "detail"}}
              className={styles.inlineLink}
            >
              Administrar
            </Link>
          </div>

          {product.imagenes.length ? (
            <div className={styles.thumbnailGrid}>
              {product.imagenes.slice(0, 6).map((image) => (
                <div key={image.id} className={styles.thumbWrap}>
                  <img
                    src={image.url}
                    alt={product.nombre}
                    className={styles.thumb}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No hay imágenes cargadas.</div>
          )}
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>
              <Tag size={18} /> Resumen de inventario
            </h2>
          </div>

          <div className={styles.list}>
            <div className={styles.listItem}>
              <div>
                <strong>
                  <Package size={16} /> Stock físico
                </strong>
                <span>Unidades registradas físicamente</span>
              </div>
              <div className={styles.trailingInfo}>
                {product.stock_fisico_total}
              </div>
            </div>
            <div className={styles.listItem}>
              <div>
                <strong>
                  <Boxes size={16} /> Stock apartado
                </strong>
                <span>Unidades comprometidas o reservadas</span>
              </div>
              <div className={styles.trailingInfo}>
                {product.stock_apartado_total}
              </div>
            </div>
            <div className={styles.listItem}>
              <div>
                <strong>
                  <Layers3 size={16} /> Stock disponible
                </strong>
                <span>Disponible para venta inmediata</span>
              </div>
              <div className={styles.trailingInfo}>
                {product.stock_disponible_total}
              </div>
            </div>
            <div className={styles.listItem}>
              <div>
                <strong>
                  <Tag size={16} /> Variantes activas
                </strong>
                <span>Variantes habilitadas para operación</span>
              </div>
              <div className={styles.trailingInfo}>
                {product.variantes_activas}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default ProductDetailAdmin;
