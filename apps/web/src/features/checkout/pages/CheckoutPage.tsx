import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, CreditCard, LoaderCircle, MapPin, Store, Truck, WalletCards } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { configuracionApi, type MetodoPagoConfig } from "@shared/api/configuracion.api";
import { toApiError } from "@shared/api/errors";
import { tiendaApi, type TiendaDireccion, type TiendaDireccionPayload, type TiendaPerfil } from "@shared/api/tienda.api";
import { useCart } from "@web/features/cart/context/CartContext";
import { formatMoney } from "@web/lib/formatters";
import styles from "./CheckoutPage.module.css";

const EMPTY_ADDRESS: TiendaDireccionPayload = {
  calle: "",
  numero_exterior: "",
  numero_interior: "",
  colonia: "",
  ciudad: "Huejutla de Reyes",
  estado: "Hidalgo",
  codigo_postal: "43000",
  referencias: "",
  es_principal: true,
};

function isCard(code: string) {
  return ["TARJETA_CREDITO", "TARJETA_DEBITO", "MERCADO_PAGO", "PAYPAL"].includes(code);
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, validateCart } = useCart();
  const [perfil, setPerfil] = useState<TiendaPerfil | null>(null);
  const [direcciones, setDirecciones] = useState<TiendaDireccion[]>([]);
  const [metodos, setMetodos] = useState<MetodoPagoConfig[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState<"RECOGER" | "DOMICILIO">("RECOGER");
  const [direccionId, setDireccionId] = useState("");
  const [metodo, setMetodo] = useState("");
  const [newAddress, setNewAddress] = useState<TiendaDireccionPayload>(EMPTY_ADDRESS);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [referencia, setReferencia] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      tiendaApi.getPerfil(),
      tiendaApi.getDirecciones(),
      configuracionApi.getMetodosPagoWeb(),
    ])
      .then(([profileResponse, addressResponse, paymentResponse]) => {
        if (!active) return;
        setPerfil(profileResponse.data);
        setDirecciones(addressResponse.data);
        const methods = paymentResponse.data.filter((item) => item.activo_web);
        setMetodos(methods);
        const preferredAddress = addressResponse.data.find((item) => item.es_principal) || addressResponse.data[0];
        setDireccionId(preferredAddress?.id || "");
        const preferredMethod = methods.find((item) => item.codigo === "TRANSFERENCIA") || methods[0];
        setMetodo(preferredMethod?.codigo || "");
      })
      .catch((cause) => { if (active) setError(toApiError(cause, "No se pudo preparar el checkout.").message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const selectedMethod = useMemo(() => metodos.find((item) => item.codigo === metodo) || null, [metodo, metodos]);
  const shippingPending = tipoEntrega === "DOMICILIO";
  const totalLabel = shippingPending ? `${formatMoney(subtotal)} + envío` : formatMoney(subtotal);

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAddress(true); setError("");
    try {
      const response = await tiendaApi.createDireccion(newAddress);
      const refreshed = await tiendaApi.getDirecciones();
      setDirecciones(refreshed.data);
      setDireccionId(response.data.id);
      setShowAddressForm(false);
      setNewAddress(EMPTY_ADDRESS);
    } catch (cause) { setError(toApiError(cause, "No se pudo guardar la dirección.").message); }
    finally { setSavingAddress(false); }
  }

  async function handleSubmit() {
    setError("");
    if (!metodo) { setError("Selecciona un método de pago."); return; }
    if (tipoEntrega === "DOMICILIO" && !direccionId) { setError("Selecciona o registra una dirección de entrega."); return; }

    setSubmitting(true);
    try {
      const issues = await validateCart();
      const blocking = issues.some((issue) => issue.type === "OUT_OF_STOCK" || issue.type === "UNAVAILABLE");
      if (blocking) { setError("Algunos productos ya no están disponibles. Revisa tu carrito."); return; }

      const response = await tiendaApi.createPedido({
        tipo_entrega: tipoEntrega,
        direccion_id: tipoEntrega === "DOMICILIO" ? direccionId : null,
        metodo_pago: metodo,
        referencia_externa: referencia.trim() || null,
        observaciones: observaciones.trim() || null,
        items: items.map((item) => ({ variante_id: item.variantId, cantidad: item.quantity })),
      });
      clearCart();
      navigate(`/checkout/confirmacion/${response.data.pedido.id}`, { replace: true });
    } catch (cause) { setError(toApiError(cause, "No se pudo confirmar el pedido.").message); }
    finally { setSubmitting(false); }
  }

  if (loading) return <div className="route-loading"><span className="route-loading__spinner" /><p>Preparando tu compra...</p></div>;
  if (items.length === 0) return <section className={`${styles.empty} container`}><h1>No hay productos para procesar</h1><p>Tu carrito está vacío o el pedido ya fue confirmado.</p><Link className="button button-primary" to="/catalogo">Volver al catálogo</Link></section>;

  return (
    <main className={`${styles.page} container`}>
      <header className={styles.header}>
        <div><p>Último paso</p><h1>Finaliza tu compra</h1></div>
        <Link className={styles.back} to="/carrito"><ArrowLeft size={18} />Volver al carrito</Link>
      </header>

      {error && <div className={styles.error} role="alert">{error}</div>}

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.card}>
            <div className={styles.cardTitle}><span><Store size={20} /></span><h2>Forma de entrega</h2></div>
            <div className={styles.options}>
              <button type="button" className={`${styles.option} ${tipoEntrega === "RECOGER" ? styles.optionActive : ""}`} onClick={() => setTipoEntrega("RECOGER")}>
                <Store size={22} /><span><strong>Recoger en tienda</strong><small>Sin costo en Av. Juárez #14 B, Huejutla.</small></span>
              </button>
              <button type="button" className={`${styles.option} ${tipoEntrega === "DOMICILIO" ? styles.optionActive : ""}`} onClick={() => setTipoEntrega("DOMICILIO")}>
                <Truck size={22} /><span><strong>Entrega a domicilio</strong><small>El costo se confirma según la zona.</small></span>
              </button>
            </div>
          </section>

          {tipoEntrega === "DOMICILIO" && (
            <section className={styles.card}>
              <div className={styles.cardTitle}><span><MapPin size={20} /></span><h2>Dirección de entrega</h2></div>
              <div className={styles.addressList}>
                {direcciones.map((address) => (
                  <label className={styles.address} key={address.id}>
                    <input type="radio" name="address" value={address.id} checked={direccionId === address.id} onChange={() => setDireccionId(address.id)} />
                    <span><strong>{address.es_principal ? "Dirección principal" : `${address.calle} ${address.numero_exterior || ""}`}</strong><p>{address.calle} {address.numero_exterior}{address.numero_interior ? `, Int. ${address.numero_interior}` : ""}, {address.colonia}, {address.ciudad}, {address.estado}, C.P. {address.codigo_postal}</p></span>
                  </label>
                ))}
              </div>
              <button className={styles.inlineButton} type="button" onClick={() => setShowAddressForm((current) => !current)}>{showAddressForm ? "Cancelar captura" : "+ Agregar otra dirección"}</button>
              {showAddressForm && (
                <form className={styles.newAddress} onSubmit={saveAddress}>
                  <div className={styles.grid}>
                    {([['calle','Calle'],['numero_exterior','Número exterior'],['numero_interior','Número interior'],['colonia','Colonia'],['ciudad','Ciudad'],['estado','Estado'],['codigo_postal','Código postal']] as const).map(([key,label]) => (
                      <div className={styles.field} key={key}><label htmlFor={`address-${key}`}>{label}</label><input id={`address-${key}`} value={String(newAddress[key] || "")} onChange={(event) => setNewAddress((current) => ({ ...current, [key]: event.target.value }))} required={!['numero_interior','colonia'].includes(key)} /></div>
                    ))}
                    <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="address-reference">Referencias</label><textarea id="address-reference" value={newAddress.referencias || ""} onChange={(event) => setNewAddress((current) => ({ ...current, referencias: event.target.value }))} /></div>
                  </div>
                  <button className={styles.inlineButton} type="submit" disabled={savingAddress}>{savingAddress ? "Guardando..." : "Guardar dirección"}</button>
                </form>
              )}
            </section>
          )}

          <section className={styles.card}>
            <div className={styles.cardTitle}><span><WalletCards size={20} /></span><h2>Método de pago</h2></div>
            <div className={styles.paymentList}>
              {metodos.map((payment) => (
                <label className={styles.payment} key={payment.codigo}>
                  <input type="radio" name="payment" value={payment.codigo} checked={metodo === payment.codigo} onChange={() => setMetodo(payment.codigo)} />
                  {isCard(payment.codigo) ? <CreditCard size={21} /> : <WalletCards size={21} />}
                  <span><strong>{payment.nombre}</strong><p>{payment.descripcion || payment.instrucciones_web || "Método disponible para la tienda en línea."}</p></span>
                </label>
              ))}
            </div>
            {selectedMethod?.instrucciones_web && <div className={styles.instructions}>{selectedMethod.instrucciones_web}</div>}
            {selectedMethod?.requiere_referencia && <div className={styles.field}><label htmlFor="payment-reference">Referencia o concepto</label><input id="payment-reference" value={referencia} onChange={(event) => setReferencia(event.target.value)} /></div>}
            {selectedMethod && isCard(selectedMethod.codigo) && (
              <div className={styles.warning}><AlertTriangle size={19} /><span>El pedido quedará pendiente hasta completar o confirmar el cobro con la pasarela configurada. Esta entrega no almacena datos de tarjeta.</span></div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}><span><MapPin size={20} /></span><h2>Notas para tu pedido</h2></div>
            <div className={styles.field}><label htmlFor="order-notes">Observaciones opcionales</label><textarea id="order-notes" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} placeholder="Horario preferido, referencias o indicaciones..." /></div>
          </section>
        </div>

        <aside className={styles.summary}>
          <h2>Resumen del pedido</h2>
          <div className={styles.itemList}>{items.map((item) => <div className={styles.item} key={item.variantId}><img src={item.imageUrl || "/images/product-placeholder.svg"} alt="" /><span><strong>{item.productName}</strong><small>{item.quantity} × {formatMoney(item.price)}</small></span><span>{formatMoney(item.quantity * item.price)}</span></div>)}</div>
          <div className={styles.totals}><div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div><div><span>Envío</span><span>{shippingPending ? "Por confirmar" : "Sin costo"}</span></div><div className={styles.total}><strong>Total</strong><strong>{totalLabel}</strong></div></div>
          <button className={styles.confirm} type="button" onClick={handleSubmit} disabled={submitting || !perfil || !metodo || (tipoEntrega === "DOMICILIO" && !direccionId)}>{submitting && <LoaderCircle size={18} className="spin" />}{submitting ? "Confirmando..." : "Confirmar pedido"}</button>
          <p className={styles.legal}>Al confirmar aceptas que la disponibilidad y el costo de entrega a domicilio deben ser validados por Moda Sarita.</p>
        </aside>
      </div>
    </main>
  );
}
