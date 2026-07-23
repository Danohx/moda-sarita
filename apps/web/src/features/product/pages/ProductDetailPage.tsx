import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  PackageX,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  productoDetalleApi,
  type ProductoDetalleResponseData,
} from "@shared/api/productoDetalle.api";
import type { Variante } from "@shared/api/variantes.api";
import { useCart } from "@web/features/cart/context/CartContext";
import { formatMoney } from "@web/lib/formatters";
import styles from "./ProductDetailPage.module.css";

function sameId(left: unknown, right: unknown) {
  return String(left ?? "") === String(right ?? "");
}

function variantStock(variant: Variante) {
  return Math.max(
    Number(variant.stock_fisico ?? 0) - Number(variant.stock_apartado ?? 0),
    0,
  );
}

function priceLabel(detail: ProductoDetalleResponseData, variant: Variante | null) {
  if (variant?.precio_venta !== null && variant?.precio_venta !== undefined) {
    return formatMoney(variant.precio_venta);
  }

  const from = Number(detail.producto.precio_desde ?? 0);
  const to = Number(detail.producto.precio_hasta ?? from);
  return from !== to
    ? `${formatMoney(from)} – ${formatMoney(to)}`
    : formatMoney(from);
}

export function ProductDetailPage() {
  const { productId = "" } = useParams();
  const { addItem } = useCart();
  const [detail, setDetail] = useState<ProductoDetalleResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    productoDetalleApi
      .getByProductoIdPublic(productId)
      .then((response) => {
        if (!active) return;

        const data = response.data;
        setDetail(data);
        setSelectedImage(0);

        const firstVariant =
          data.variantes.find(
            (variant) => variant.activo !== false && variantStock(variant) > 0,
          ) ?? data.variantes.find((variant) => variant.activo !== false);

        setSelectedSizeId(
          firstVariant?.talla_id !== null && firstVariant?.talla_id !== undefined
            ? String(firstVariant.talla_id)
            : "",
        );
        setSelectedColorId(
          firstVariant?.color_id !== null && firstVariant?.color_id !== undefined
            ? String(firstVariant.color_id)
            : "",
        );
      })
      .catch((requestError: unknown) => {
        console.error(requestError);
        if (active) {
          setError("No se pudo cargar este producto o ya no está disponible.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (detail) {
      document.title = `${detail.producto.nombre} | Moda Sarita`;
    }
  }, [detail]);

  const activeVariants = useMemo(
    () => detail?.variantes.filter((variant) => variant.activo !== false) ?? [],
    [detail],
  );

  const selectedVariant = useMemo(() => {
    if (!detail) return null;

    return (
      activeVariants.find((variant) => {
        const sizeMatches = selectedSizeId
          ? sameId(variant.talla_id, selectedSizeId)
          : variant.talla_id === null || variant.talla_id === undefined;
        const colorMatches = selectedColorId
          ? sameId(variant.color_id, selectedColorId)
          : variant.color_id === null || variant.color_id === undefined;
        return sizeMatches && colorMatches;
      }) ??
      (detail.options.tallas.length === 0 && detail.options.colores.length === 0
        ? activeVariants[0] ?? null
        : null)
    );
  }, [activeVariants, detail, selectedColorId, selectedSizeId]);

  const stockAvailable = selectedVariant ? variantStock(selectedVariant) : 0;

  useEffect(() => {
    setQuantity((current) => Math.max(1, Math.min(current, Math.max(stockAvailable, 1))));
    setFeedback(null);
  }, [selectedVariant?.id, stockAvailable]);

  const images = useMemo(() => {
    if (!detail) return [];
    const sorted = [...detail.imagenes].sort(
      (left, right) => Number(left.orden ?? 0) - Number(right.orden ?? 0),
    );

    if (sorted.length > 0) return sorted;
    return [
      {
        id: "placeholder",
        url: "/images/product-placeholder.svg",
        orden: 0,
        es_principal: true,
      },
    ];
  }, [detail]);

  function selectSize(sizeId: string) {
    if (!detail) return;

    const candidate =
      activeVariants.find(
        (variant) =>
          sameId(variant.talla_id, sizeId) &&
          sameId(variant.color_id, selectedColorId) &&
          variantStock(variant) > 0,
      ) ??
      activeVariants.find(
        (variant) => sameId(variant.talla_id, sizeId) && variantStock(variant) > 0,
      ) ??
      activeVariants.find((variant) => sameId(variant.talla_id, sizeId));

    setSelectedSizeId(sizeId);
    if (candidate?.color_id !== null && candidate?.color_id !== undefined) {
      setSelectedColorId(String(candidate.color_id));
    }
  }

  function selectColor(colorId: string) {
    if (!detail) return;

    const candidate =
      activeVariants.find(
        (variant) =>
          sameId(variant.color_id, colorId) &&
          sameId(variant.talla_id, selectedSizeId) &&
          variantStock(variant) > 0,
      ) ??
      activeVariants.find(
        (variant) => sameId(variant.color_id, colorId) && variantStock(variant) > 0,
      ) ??
      activeVariants.find((variant) => sameId(variant.color_id, colorId));

    setSelectedColorId(colorId);
    if (candidate?.talla_id !== null && candidate?.talla_id !== undefined) {
      setSelectedSizeId(String(candidate.talla_id));
    }
  }

  function optionHasStock(type: "size" | "color", id: string) {
    return activeVariants.some((variant) => {
      const matches =
        type === "size"
          ? sameId(variant.talla_id, id)
          : sameId(variant.color_id, id);
      return matches && variantStock(variant) > 0;
    });
  }

  function handleAddToCart() {
    if (!detail || !selectedVariant) {
      setFeedback({
        type: "error",
        message: "Selecciona una combinación disponible de talla y color.",
      });
      return;
    }

    const size = detail.options.tallas.find((option) =>
      sameId(option.id, selectedVariant.talla_id),
    );
    const color = detail.options.colores.find((option) =>
      sameId(option.id, selectedVariant.color_id),
    );

    const result = addItem({
      variantId: String(selectedVariant.id),
      productId: String(detail.producto.id),
      productName: detail.producto.nombre,
      productSlug: detail.producto.slug,
      imageUrl: images[selectedImage]?.url ?? images[0]?.url ?? null,
      price: Number(selectedVariant.precio_venta ?? detail.producto.precio_desde ?? 0),
      stockAvailable,
      sku: selectedVariant.sku,
      sizeId:
        selectedVariant.talla_id !== null && selectedVariant.talla_id !== undefined
          ? String(selectedVariant.talla_id)
          : null,
      sizeName: size?.nombre ?? null,
      colorId:
        selectedVariant.color_id !== null && selectedVariant.color_id !== undefined
          ? String(selectedVariant.color_id)
          : null,
      colorName: color?.nombre ?? null,
      colorHex: color?.hex ?? null,
      quantity,
    });

    setFeedback({
      type: result.ok ? "success" : "error",
      message: result.message,
    });
  }

  if (loading) {
    return (
      <section className={`${styles.page} container`}>
        <div className={styles.loadingGrid} aria-label="Cargando producto">
          <div className={styles.loadingImage} />
          <div className={styles.loadingInfo} />
        </div>
      </section>
    );
  }

  if (error || !detail) {
    return (
      <section className={`${styles.page} container`}>
        <div className={styles.errorCard}>
          <PackageX size={42} />
          <h1>Producto no disponible</h1>
          <p>{error || "No encontramos el producto solicitado."}</p>
          <Link className="button button-primary" to="/catalogo">
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }

  const soldOut =
    activeVariants.length === 0 || activeVariants.every((variant) => variantStock(variant) <= 0);

  return (
    <section className={`${styles.page} container`}>
      <nav className={styles.breadcrumbs} aria-label="Migas de pan">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo">Catálogo</Link>
        <span>/</span>
        <span>{detail.producto.nombre}</span>
      </nav>

      <Link className={styles.backLink} to="/catalogo">
        <ArrowLeft size={18} />
        Volver al catálogo
      </Link>

      <div className={styles.productGrid}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img
              src={images[selectedImage]?.url ?? "/images/product-placeholder.svg"}
              alt={detail.producto.nombre}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/images/product-placeholder.svg";
              }}
            />
            {soldOut && <span className={styles.soldOut}>Agotado</span>}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={index === selectedImage ? styles.thumbnailActive : ""}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <img src={image.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <article className={styles.info}>
          <p className={styles.category}>
            {detail.producto.categoria_nombre || "Moda Sarita"}
          </p>
          <h1>{detail.producto.nombre}</h1>
          <p className={styles.price}>{priceLabel(detail, selectedVariant)}</p>
          <p className={styles.description}>
            {detail.producto.descripcion ||
              "Una pieza seleccionada para complementar tu estilo con la calidad de Moda Sarita."}
          </p>

          {detail.options.tallas.length > 0 && (
            <fieldset className={styles.optionGroup}>
              <legend>Talla</legend>
              <div className={styles.sizeOptions}>
                {detail.options.tallas.map((size) => {
                  const active = selectedSizeId === String(size.id);
                  const available = optionHasStock("size", String(size.id));
                  return (
                    <button
                      key={size.id}
                      type="button"
                      className={active ? styles.optionActive : ""}
                      onClick={() => selectSize(String(size.id))}
                      disabled={!available}
                      aria-pressed={active}
                    >
                      {size.nombre}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {detail.options.colores.length > 0 && (
            <fieldset className={styles.optionGroup}>
              <legend>
                Color
                {selectedColorId && (
                  <span>
                    {detail.options.colores.find((color) => String(color.id) === selectedColorId)?.nombre}
                  </span>
                )}
              </legend>
              <div className={styles.colorOptions}>
                {detail.options.colores.map((color) => {
                  const active = selectedColorId === String(color.id);
                  const available = optionHasStock("color", String(color.id));
                  return (
                    <button
                      key={color.id}
                      type="button"
                      className={active ? styles.colorActive : ""}
                      onClick={() => selectColor(String(color.id))}
                      disabled={!available}
                      aria-label={`${color.nombre}${available ? "" : ", agotado"}`}
                      aria-pressed={active}
                    >
                      <span style={{ backgroundColor: color.hex || "#ddd" }} />
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className={styles.stockRow}>
            {selectedVariant ? (
              stockAvailable > 0 ? (
                <span className={styles.inStock}>
                  <Check size={16} />
                  {stockAvailable} {stockAvailable === 1 ? "pieza disponible" : "piezas disponibles"}
                </span>
              ) : (
                <span className={styles.outOfStock}>Esta combinación está agotada</span>
              )
            ) : (
              <span className={styles.outOfStock}>
                Selecciona talla y color para consultar existencias
              </span>
            )}
            {selectedVariant?.sku && <small>SKU: {selectedVariant.sku}</small>}
          </div>

          <div className={styles.purchaseRow}>
            <div className={styles.quantityControl}>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                aria-label="Restar una unidad"
              >
                <Minus size={18} />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(stockAvailable, current + 1))
                }
                disabled={stockAvailable <= 0 || quantity >= stockAvailable}
                aria-label="Agregar una unidad"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              className={`${styles.addButton} button button-primary`}
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant || stockAvailable <= 0}
            >
              <ShoppingBag size={19} />
              Añadir al carrito
            </button>
          </div>

          {feedback && (
            <div
              className={`${styles.feedback} ${styles[feedback.type]}`}
              role="status"
              aria-live="polite"
            >
              {feedback.message}
              {feedback.type === "success" && <Link to="/carrito">Ver carrito</Link>}
            </div>
          )}

          <div className={styles.benefits}>
            <div>
              <Store size={20} />
              <span>
                <strong>Recoge en tienda</strong>
                Sin costo en Av. Juárez #14 B.
              </span>
            </div>
            <div>
              <Truck size={20} />
              <span>
                <strong>Entrega local</strong>
                El costo se confirma según tu zona.
              </span>
            </div>
            <div>
              <ShieldCheck size={20} />
              <span>
                <strong>Stock sincronizado</strong>
                Existencias consultadas desde inventario.
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
