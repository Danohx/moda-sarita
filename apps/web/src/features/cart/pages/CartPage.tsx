import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import { useCart } from "@web/features/cart/context/CartContext";
import type { CartValidationIssue } from "@web/features/cart/types";
import { formatMoney } from "@web/lib/formatters";
import styles from "./CartPage.module.css";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    items,
    subtotal,
    totalItems,
    isValidating,
    updateQuantity,
    removeItem,
    clearCart,
    validateCart,
  } = useCart();
  const [issues, setIssues] = useState<CartValidationIssue[]>([]);
  const [validationComplete, setValidationComplete] = useState(false);

  useEffect(() => {
    document.title = "Carrito | Moda Sarita";
  }, []);

  useEffect(() => {
    let active = true;

    validateCart()
      .then((result) => {
        if (active) setIssues(result);
      })
      .finally(() => {
        if (active) setValidationComplete(true);
      });

    return () => {
      active = false;
    };
  }, [validateCart]);

  async function handleValidate() {
    const result = await validateCart();
    setIssues(result);
    setValidationComplete(true);
    return result;
  }

  async function handleCheckout() {
    const result = await handleValidate();
    const hasBlockingIssue = result.some(
      (issue) => issue.type === "OUT_OF_STOCK" || issue.type === "UNAVAILABLE",
    );

    if (hasBlockingIssue) return;

    navigate(isAuthenticated ? "/checkout" : "/login?returnTo=%2Fcheckout");
  }

  function handleClearCart() {
    const confirmed = window.confirm("¿Deseas vaciar todo el carrito?");
    if (confirmed) {
      clearCart();
      setIssues([]);
    }
  }

  if (items.length === 0) {
    return (
      <section className={`${styles.page} container`}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <ShoppingBag size={42} />
          </span>
          <p>Tu selección</p>
          <h1>El carrito está vacío</h1>
          <span>
            Explora el catálogo y agrega las prendas o accesorios que más te
            gusten.
          </span>
          <Link className="button button-primary" to="/catalogo">
            Explorar catálogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.page} container`}>
      <div className={styles.pageHeader}>
        <div>
          <p>Tu selección</p>
          <h1>Carrito de compras</h1>
          <span>
            {totalItems} {totalItems === 1 ? "pieza" : "piezas"} en tu carrito
          </span>
        </div>

        <Link className={styles.continueLink} to="/catalogo">
          <ArrowLeft size={18} />
          Continuar comprando
        </Link>
      </div>

      {validationComplete && issues.length > 0 && (
        <div className={styles.issues} role="alert">
          <div className={styles.issueTitle}>
            <AlertTriangle size={20} />
            <strong>Actualizamos tu carrito</strong>
          </div>
          <ul>
            {issues.map((issue, index) => (
              <li key={`${issue.variantId}-${issue.type}-${index}`}>
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.itemsPanel}>
          <div className={styles.panelHeader}>
            <h2>Productos</h2>
            <div>
              <button type="button" onClick={handleValidate} disabled={isValidating}>
                <RefreshCw size={16} className={isValidating ? styles.spinning : ""} />
                {isValidating ? "Validando..." : "Actualizar stock"}
              </button>
              <button type="button" onClick={handleClearCart}>
                <Trash2 size={16} />
                Vaciar
              </button>
            </div>
          </div>

          <div className={styles.itemList}>
            {items.map((item) => {
              const unavailable = item.stockAvailable <= 0;
              const variantLabel = [item.sizeName, item.colorName]
                .filter(Boolean)
                .join(" · ");

              return (
                <article
                  key={item.variantId}
                  className={`${styles.item} ${unavailable ? styles.itemUnavailable : ""}`}
                >
                  <Link className={styles.image} to={`/producto/${item.productId}`}>
                    <img
                      src={item.imageUrl || "/product-placeholder.svg"}
                      alt={item.productName}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/product-placeholder.svg";
                      }}
                    />
                  </Link>

                  <div className={styles.itemInfo}>
                    <Link to={`/producto/${item.productId}`}>{item.productName}</Link>
                    {variantLabel && <span>{variantLabel}</span>}
                    {item.sku && <small>SKU: {item.sku}</small>}
                    {unavailable && (
                      <strong className={styles.unavailableText}>
                        Este producto ya no está disponible
                      </strong>
                    )}
                  </div>

                  <div className={styles.unitPrice}>
                    <span>Precio</span>
                    <strong>{formatMoney(item.price)}</strong>
                  </div>

                  <div className={styles.quantityControl}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || unavailable}
                      aria-label={`Restar una unidad de ${item.productName}`}
                    >
                      <Minus size={17} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={unavailable || item.quantity >= item.stockAvailable}
                      aria-label={`Agregar una unidad de ${item.productName}`}
                    >
                      <Plus size={17} />
                    </button>
                  </div>

                  <div className={styles.lineTotal}>
                    <span>Total</span>
                    <strong>{formatMoney(item.price * item.quantity)}</strong>
                  </div>

                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Eliminar ${item.productName}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <aside className={styles.summary}>
          <p className={styles.summaryEyebrow}>Resumen</p>
          <h2>Tu compra</h2>

          <div className={styles.summaryRows}>
            <div>
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            <div>
              <span>Envío</span>
              <span>Se define en checkout</span>
            </div>
          </div>

          <div className={styles.totalRow}>
            <span>Total estimado</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>

          <p className={styles.shippingNote}>
            La recolección en tienda no tiene costo. Para entrega a domicilio,
            Moda Sarita confirmará el precio según la zona.
          </p>

          <button
            className={`${styles.checkoutButton} button button-primary`}
            type="button"
            onClick={handleCheckout}
            disabled={isValidating}
          >
            <ShieldCheck size={19} />
            {isValidating ? "Validando carrito..." : "Finalizar compra"}
          </button>

          {!isAuthenticated && (
            <p className={styles.loginNote}>
              Iniciarás sesión antes de elegir entrega y método de pago.
            </p>
          )}

          <div className={styles.fulfillmentCards}>
            <div>
              <Store size={18} />
              <span>
                <strong>Recoger en tienda</strong>
                Av. Juárez #14 B, Huejutla.
              </span>
            </div>
            <div>
              <Truck size={18} />
              <span>
                <strong>Entrega local</strong>
                Costo sujeto a la zona.
              </span>
            </div>
          </div>

          <div className={styles.couponNote}>
            Los cupones disponibles se validarán en el proceso de pago.
          </div>
        </aside>
      </div>
    </section>
  );
}
