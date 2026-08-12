import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CreditCard,
  LoaderCircle,
  MapPin,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  configuracionApi,
  type MetodoPagoConfig,
} from "@shared/api/configuracion.api";
import { toApiError } from "@shared/api/errors";
import { checkoutApi, type CheckoutCreditoOpciones } from "@shared/api/checkout.api";
import {
  tiendaApi,
  type TiendaDireccion,
  type TiendaDireccionPayload,
  type TiendaPerfil,
} from "@shared/api/tienda.api";
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
  return [
    "TARJETA_CREDITO",
    "TARJETA_DEBITO",
    "MERCADO_PAGO",
    "PAYPAL",
  ].includes(code);
}

function getCreditoUnavailableMessage(
  options: CheckoutCreditoOpciones | null,
  total: number,
) {
  if (!options) return "Validando disponibilidad de tu crédito...";
  if (options.elegible) return "Disponible para esta compra.";
  if (options.mensaje) return options.mensaje;

  const disponible = Number(options.credito_disponible || 0);
  const faltante = Math.max(Number(total || 0) - disponible, 0);

  switch (options.motivo) {
    case "CREDITO_DISPONIBLE_INSUFICIENTE":
      return `Crédito insuficiente. Disponible: ${formatMoney(disponible)}. Te faltan ${formatMoney(faltante)} para cubrir esta compra.`;
    case "YA_TIENE_CREDITO_ACTIVO":
      return "Tu línea está activa, pero la configuración no permite abrir otro financiamiento mientras exista uno activo.";
    case "MAXIMO_CREDITOS_ACTIVOS_ALCANZADO":
      return "Ya alcanzaste el máximo de financiamientos activos permitidos.";
    case "CUOTAS_VENCIDAS":
      return "Tu línea está activa, pero tienes cuotas vencidas. Regularízalas para volver a financiar compras.";
    case "CREDITO_EN_MORA":
      return "Tu línea está activa, pero existe un crédito en mora.";
    case "CREDITO_INCUMPLIDO":
      return "Tu línea está activa, pero existe un crédito marcado como incumplido.";
    case "ENGANCHE_WEB_REQUERIDO":
      return "Tu crédito está activo, pero esta compra requiere enganche y todavía no se procesa el enganche desde la tienda web.";
    default:
      return "Tu crédito está activo, pero no está disponible para esta compra.";
  }
}

const CHECKOUT_ATTEMPT_KEY = "moda-sarita-checkout-attempt";

type CheckoutAttempt = {
  fingerprint: string;
  idempotencyKey: string;
};

type CheckoutConfig = {
  habilitado: boolean;
  permitirRecoleccionTienda: boolean;
  permitirEnvioDomicilio: boolean;
  costoEnvioDomicilio: number;
  envioGratisHabilitado: boolean;
  envioGratisDesde: number;
};

type CuponAplicado = {
  codigo: string;
  subtotal: number;
  descuento: number;
  total: number;
  uso_maximo: number | null;
  uso_maximo_por_cliente: number | null;
  usos_globales_restantes: number | null;
  usos_cliente_restantes: number | null;
};

function createCheckoutIdempotencyKey() {
  return crypto.randomUUID();
}

function getCheckoutAttempt(fingerprint: string): string {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_ATTEMPT_KEY);

    if (raw) {
      const saved = JSON.parse(raw) as CheckoutAttempt;

      if (saved.fingerprint === fingerprint && saved.idempotencyKey) {
        return saved.idempotencyKey;
      }
    }
  } catch {
    // Si el storage está corrupto, simplemente generamos otra key.
  }

  const idempotencyKey = createCheckoutIdempotencyKey();

  sessionStorage.setItem(
    CHECKOUT_ATTEMPT_KEY,
    JSON.stringify({
      fingerprint,
      idempotencyKey,
    }),
  );

  return idempotencyKey;
}

function clearCheckoutAttempt() {
  sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig | null>(
    null,
  );
  const { items, subtotal, clearCart, validateCart } = useCart();
  const [perfil, setPerfil] = useState<TiendaPerfil | null>(null);
  const [direcciones, setDirecciones] = useState<TiendaDireccion[]>([]);
  const [metodos, setMetodos] = useState<MetodoPagoConfig[]>([]);
  const [creditoOpciones, setCreditoOpciones] = useState<CheckoutCreditoOpciones | null>(null);
  const [creditoPlazo, setCreditoPlazo] = useState<number | null>(null);
  const [creditoFrecuencia, setCreditoFrecuencia] = useState<"SEMANAL" | "QUINCENAL" | "MENSUAL" | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<"RECOGER" | "DOMICILIO">(
    "RECOGER",
  );
  const [direccionId, setDireccionId] = useState("");
  const [metodo, setMetodo] = useState("");
  const [newAddress, setNewAddress] =
    useState<TiendaDireccionPayload>(EMPTY_ADDRESS);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [referencia, setReferencia] = useState("");
  const [cuponCodigo, setCuponCodigo] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cuponAplicado, setCuponAplicado] = useState<CuponAplicado | null>(
    null,
  );
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [errorCupon, setErrorCupon] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      tiendaApi.getPerfil(),
      tiendaApi.getDirecciones(),
      configuracionApi.getMetodosPagoWeb(),
      configuracionApi.getParametrosTienda(),
    ])
      .then(
        ([
          profileResponse,
          addressResponse,
          paymentResponse,
          paramsResponse,
        ]) => {
          if (!active) return;

          // ========================================
          // PERFIL
          // ========================================

          setPerfil(profileResponse.data);

          // ========================================
          // DIRECCIONES
          // ========================================

          setDirecciones(addressResponse.data);

          const preferredAddress =
            addressResponse.data.find((item) => item.es_principal) ||
            addressResponse.data[0];

          setDireccionId(preferredAddress?.id || "");

          // ========================================
          // MÉTODOS DE PAGO
          // ========================================

          const methods = paymentResponse.data ?? [];

          setMetodos(methods);

          const preferredMethod =
            methods.find((item) => item.codigo === "TRANSFERENCIA") ||
            methods.find((item) => item.codigo !== "CREDITO_TIENDA");

          setMetodo(preferredMethod?.codigo || "");

          // ========================================
          // CONFIGURACIÓN CHECKOUT
          // ========================================

          const params = paramsResponse.data ?? [];

          const getParam = (clave: string) =>
            params.find((param) => param.clave === clave)?.valor;

          const getBool = (clave: string, fallback = false) => {
            const value = getParam(clave);

            if (typeof value === "boolean") {
              return value;
            }

            if (typeof value === "string") {
              if (value === "true") return true;
              if (value === "false") return false;
            }

            return fallback;
          };

          const getNumber = (clave: string, fallback = 0) => {
            const value = Number(getParam(clave));

            return Number.isFinite(value) ? value : fallback;
          };

          const nextCheckoutConfig: CheckoutConfig = {
            habilitado: getBool("checkout.habilitado", false),
            permitirRecoleccionTienda: getBool(
              "checkout.permitir_recoleccion_tienda",
              true,
            ),
            permitirEnvioDomicilio: getBool(
              "checkout.permitir_envio_domicilio",
              false,
            ),
            costoEnvioDomicilio: getNumber("checkout.costo_envio_domicilio", 0),
            envioGratisHabilitado: getBool(
              "checkout.envio_gratis_habilitado",
              false,
            ),
            envioGratisDesde: getNumber("checkout.envio_gratis_desde", 0),
          };

          setCheckoutConfig(nextCheckoutConfig);

          if (
            !nextCheckoutConfig.permitirRecoleccionTienda &&
            nextCheckoutConfig.permitirEnvioDomicilio
          ) {
            setTipoEntrega("DOMICILIO");
          } else if (
            nextCheckoutConfig.permitirRecoleccionTienda &&
            !nextCheckoutConfig.permitirEnvioDomicilio
          ) {
            setTipoEntrega("RECOGER");
          }
        },
      )
      .catch((cause) => {
        if (active) {
          setError(
            toApiError(cause, "No se pudo preparar el checkout.").message,
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const couponBasis = useMemo(
    () =>
      JSON.stringify(
        items
          .map((item) => ({
            variante_id: item.variantId,
            cantidad: item.quantity,
            precio: item.price,
          }))
          .sort((left, right) => left.variante_id.localeCompare(right.variante_id)),
      ),
    [items],
  );

  useEffect(() => {
    setCuponAplicado(null);
    setErrorCupon("");
  }, [couponBasis]);

  const selectedMethod = useMemo(
    () => metodos.find((item) => item.codigo === metodo) || null,
    [metodo, metodos],
  );
  const descuentoCupon = cuponAplicado?.descuento ?? 0;
  const subtotalNeto = Math.max(subtotal - descuentoCupon, 0);

  const alcanzaEnvioGratis =
    tipoEntrega === "DOMICILIO" &&
    checkoutConfig?.envioGratisHabilitado === true &&
    subtotalNeto >= (checkoutConfig?.envioGratisDesde ?? Infinity);

  const costoEnvio =
    tipoEntrega === "RECOGER"
      ? 0
      : alcanzaEnvioGratis
        ? 0
        : (checkoutConfig?.costoEnvioDomicilio ?? 0);

  const totalEstimado = subtotalNeto + costoEnvio;

  const visibleMetodos = useMemo(
    () => metodos.filter((item) => item.codigo !== "CREDITO_TIENDA" || creditoOpciones?.mostrar === true),
    [metodos, creditoOpciones?.mostrar],
  );

  useEffect(() => {
    if (!perfil || totalEstimado <= 0) {
      setCreditoOpciones(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      checkoutApi.getCreditoOpciones(totalEstimado, controller.signal)
        .then((response) => {
          const options = response.data;
          setCreditoOpciones(options);
          if (options.mostrar && options.elegible) {
            setCreditoPlazo((current) => current && options.plazos?.includes(current) ? current : options.plazos?.[0] ?? null);
            setCreditoFrecuencia((current) => current && options.frecuencias?.includes(current) ? current : options.frecuencias?.[0] ?? null);
          } else {
            setCreditoPlazo(null);
            setCreditoFrecuencia(null);
          }

          if ((!options.mostrar || !options.elegible) && metodo === "CREDITO_TIENDA") {
            const fallback = metodos.find((item) => item.codigo !== "CREDITO_TIENDA");
            setMetodo(fallback?.codigo || "");
          }
        })
        .catch((cause) => {
          if (controller.signal.aborted) return;
          setCreditoOpciones(null);
          if (metodo === "CREDITO_TIENDA") setError(toApiError(cause, "No se pudo validar tu crédito.").message);
        });
    }, 250);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [perfil, totalEstimado, metodo, metodos]);

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAddress(true);
    setError("");
    try {
      const response = await tiendaApi.createDireccion(newAddress);
      const refreshed = await tiendaApi.getDirecciones();
      setDirecciones(refreshed.data);
      setDireccionId(response.data.id);
      setShowAddressForm(false);
      setNewAddress(EMPTY_ADDRESS);
    } catch (cause) {
      setError(toApiError(cause, "No se pudo guardar la dirección.").message);
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleValidarCupon() {
    const codigo = cuponCodigo.trim().toUpperCase();

    if (!codigo) {
      setErrorCupon("Escribe un código de cupón.");
      return;
    }

    setValidandoCupon(true);
    setErrorCupon("");
    setCuponAplicado(null);

    try {
      const response = await checkoutApi.validarCupon({
        codigo,

        items: items.map((item) => ({
          variante_id: item.variantId,
          cantidad: item.quantity,
        })),
      });

      setCuponAplicado(response.data);

      setCuponCodigo(response.data.codigo);
    } catch (cause) {
      const apiError = toApiError(cause, "El cupón no es válido.");

      setErrorCupon(apiError.message);
    } finally {
      setValidandoCupon(false);
    }
  }

  const checkoutFingerprint = useMemo(() => {
    const normalizedItems = [...items]
      .map((item) => ({
        variante_id: item.variantId,
        cantidad: item.quantity,
      }))
      .sort((a, b) => a.variante_id.localeCompare(b.variante_id));

    return JSON.stringify({
      items: normalizedItems,
      tipo_entrega: tipoEntrega,
      direccion_id: tipoEntrega === "DOMICILIO" ? direccionId : null,
      metodo_pago: metodo,
      referencia_externa: referencia.trim() || null,
      cupon_codigo: cuponAplicado?.codigo || null,
      observaciones: observaciones.trim() || null,
      credito: metodo === "CREDITO_TIENDA" ? {
        plazo_meses: creditoPlazo,
        frecuencia_pago: creditoFrecuencia,
      } : null,
    });
  }, [items, tipoEntrega, direccionId, metodo, referencia, cuponAplicado?.codigo, observaciones, creditoPlazo, creditoFrecuencia]);

  async function handleSubmit() {
    if (submitting) return;

    setError("");

    if (!checkoutConfig?.habilitado) {
      setError("El checkout se encuentra temporalmente deshabilitado.");
      return;
    }

    if (tipoEntrega === "RECOGER" && !checkoutConfig.permitirRecoleccionTienda) {
      setError("La recolección en tienda no está disponible en este momento.");
      return;
    }

    if (tipoEntrega === "DOMICILIO" && !checkoutConfig.permitirEnvioDomicilio) {
      setError("La entrega a domicilio no está disponible en este momento.");
      return;
    }

    if (!metodo) {
      setError("Selecciona un método de pago.");
      return;
    }

    if (tipoEntrega === "DOMICILIO" && !direccionId) {
      setError("Selecciona o registra una dirección de entrega.");
      return;
    }

    if (selectedMethod?.requiere_referencia && !referencia.trim()) {
      setError("El método de pago seleccionado requiere una referencia.");
      return;
    }

    if (
      metodo === "CREDITO_TIENDA" &&
      (!creditoOpciones?.mostrar ||
        creditoOpciones.elegible !== true ||
        !creditoPlazo ||
        !creditoFrecuencia)
    ) {
      setError(
        getCreditoUnavailableMessage(creditoOpciones, totalEstimado),
      );
      return;
    }

    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    if (cuponCodigo.trim() && !cuponAplicado) {
      setError("Valida el cupón o elimínalo antes de confirmar el pedido.");
      return;
    }

    setSubmitting(true);

    try {
      const issues = await validateCart();

      const blocking = issues.some(
        (issue) =>
          issue.type === "OUT_OF_STOCK" || issue.type === "UNAVAILABLE",
      );

      if (blocking) {
        setError(
          "Algunos productos ya no están disponibles. Revisa tu carrito.",
        );
        return;
      }

      const idempotencyKey = getCheckoutAttempt(checkoutFingerprint);

      const response = await checkoutApi.createPedido(
        {
          tipo_entrega: tipoEntrega,
          direccion_id: tipoEntrega === "DOMICILIO" ? direccionId : null,
          metodo_pago: metodo,
          referencia_externa: referencia.trim() || null,
          cupon_codigo: cuponCodigo.trim() || null,
          observaciones: observaciones.trim() || null,
          credito: metodo === "CREDITO_TIENDA" && creditoPlazo && creditoFrecuencia
            ? { plazo_meses: creditoPlazo, frecuencia_pago: creditoFrecuencia }
            : null,
          items: items.map((item) => ({
            variante_id: item.variantId,
            cantidad: item.quantity,
          })),
        },
        idempotencyKey,
      );

      const pedidoId = response.data.pedido_id;

      if (!pedidoId) {
        throw new Error(
          "El servidor creó el pedido pero no devolvió su identificador.",
        );
      }

      clearCheckoutAttempt();
      clearCart();

      navigate(`/checkout/confirmacion/${pedidoId}`, {
        replace: true,
      });
    } catch (cause) {
      setError(toApiError(cause, "No se pudo confirmar el pedido.").message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="route-loading">
        <span className="route-loading__spinner" />
        <p>Preparando tu compra...</p>
      </div>
    );
  if (checkoutConfig && !checkoutConfig.habilitado)
    return (
      <section className={`${styles.empty} container`}>
        <h1>Compras en línea temporalmente pausadas</h1>
        <p>El catálogo sigue disponible, pero Moda Sarita deshabilitó temporalmente la confirmación de pedidos web.</p>
        <Link className="button button-primary" to="/catalogo">
          Volver al catálogo
        </Link>
      </section>
    );

  if (items.length === 0)
    return (
      <section className={`${styles.empty} container`}>
        <h1>No hay productos para procesar</h1>
        <p>Tu carrito está vacío o el pedido ya fue confirmado.</p>
        <Link className="button button-primary" to="/catalogo">
          Volver al catálogo
        </Link>
      </section>
    );

  return (
    <main className={`${styles.page} container`}>
      <header className={styles.header}>
        <div>
          <p>Último paso</p>
          <h1>Finaliza tu compra</h1>
        </div>
        <Link className={styles.back} to="/carrito">
          <ArrowLeft size={18} />
          Volver al carrito
        </Link>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span>
                <Store size={20} />
              </span>
              <h2>Forma de entrega</h2>
            </div>
            <div className={styles.options}>
              <button
                type="button"
                className={`${styles.option} ${tipoEntrega === "RECOGER" ? styles.optionActive : ""}`}
                onClick={() => setTipoEntrega("RECOGER")}
                disabled={checkoutConfig?.permitirRecoleccionTienda === false}
              >
                <Store size={22} />
                <span>
                  <strong>Recoger en tienda</strong>
                  <small>{checkoutConfig?.permitirRecoleccionTienda === false ? "No disponible temporalmente" : "Sin costo en Av. Juárez #14 B, Huejutla."}</small>
                </span>
              </button>
              <button
                type="button"
                className={`${styles.option} ${tipoEntrega === "DOMICILIO" ? styles.optionActive : ""}`}
                onClick={() => setTipoEntrega("DOMICILIO")}
                disabled={checkoutConfig?.permitirEnvioDomicilio === false}
              >
                <Truck size={22} />
                <span>
                  <strong>Entrega a domicilio</strong>
                  <small>{checkoutConfig?.permitirEnvioDomicilio === false ? "No disponible temporalmente" : `Envío ${checkoutConfig?.envioGratisHabilitado ? `gratis desde ${formatMoney(checkoutConfig.envioGratisDesde)}` : formatMoney(checkoutConfig?.costoEnvioDomicilio ?? 0)}`}</small>
                </span>
              </button>
            </div>
          </section>

          {tipoEntrega === "DOMICILIO" && (
            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <span>
                  <MapPin size={20} />
                </span>
                <h2>Dirección de entrega</h2>
              </div>
              <div className={styles.addressList}>
                {direcciones.map((address) => (
                  <label className={styles.address} key={address.id}>
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={direccionId === address.id}
                      onChange={() => setDireccionId(address.id)}
                    />
                    <span>
                      <strong>
                        {address.es_principal
                          ? "Dirección principal"
                          : `${address.calle} ${address.numero_exterior || ""}`}
                      </strong>
                      <p>
                        {address.calle} {address.numero_exterior}
                        {address.numero_interior
                          ? `, Int. ${address.numero_interior}`
                          : ""}
                        , {address.colonia}, {address.ciudad}, {address.estado},
                        C.P. {address.codigo_postal}
                      </p>
                    </span>
                  </label>
                ))}
              </div>
              <button
                className={styles.inlineButton}
                type="button"
                onClick={() => setShowAddressForm((current) => !current)}
              >
                {showAddressForm
                  ? "Cancelar captura"
                  : "+ Agregar otra dirección"}
              </button>
              {showAddressForm && (
                <form className={styles.newAddress} onSubmit={saveAddress}>
                  <div className={styles.grid}>
                    {(
                      [
                        ["calle", "Calle"],
                        ["numero_exterior", "Número exterior"],
                        ["numero_interior", "Número interior"],
                        ["colonia", "Colonia"],
                        ["ciudad", "Ciudad"],
                        ["estado", "Estado"],
                        ["codigo_postal", "Código postal"],
                      ] as const
                    ).map(([key, label]) => (
                      <div className={styles.field} key={key}>
                        <label htmlFor={`address-${key}`}>{label}</label>
                        <input
                          id={`address-${key}`}
                          value={String(newAddress[key] || "")}
                          onChange={(event) =>
                            setNewAddress((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }))
                          }
                          required={
                            !["numero_interior", "colonia"].includes(key)
                          }
                        />
                      </div>
                    ))}
                    <div className={`${styles.field} ${styles.fieldFull}`}>
                      <label htmlFor="address-reference">Referencias</label>
                      <textarea
                        id="address-reference"
                        value={newAddress.referencias || ""}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            referencias: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <button
                    className={styles.inlineButton}
                    type="submit"
                    disabled={savingAddress}
                  >
                    {savingAddress ? "Guardando..." : "Guardar dirección"}
                  </button>
                </form>
              )}
            </section>
          )}

          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span>
                <WalletCards size={20} />
              </span>
              <h2>Método de pago</h2>
            </div>
            <div className={styles.paymentList}>
              {metodos.length === 0 && (
                <div className={styles.warning}>
                  <AlertTriangle size={19} />
                  <span>No hay métodos de pago web activos. Contacta a Moda Sarita antes de confirmar tu compra.</span>
                </div>
              )}
              {visibleMetodos.map((payment) => {
                const esCreditoTienda = payment.codigo === "CREDITO_TIENDA";
                const creditoDeshabilitado =
                  esCreditoTienda && creditoOpciones?.elegible !== true;

                return (
                  <label
                    className={`${styles.payment} ${
                      creditoDeshabilitado ? styles.paymentDisabled : ""
                    }`}
                    key={payment.codigo}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={payment.codigo}
                      checked={metodo === payment.codigo}
                      disabled={creditoDeshabilitado}
                      onChange={() => setMetodo(payment.codigo)}
                    />
                    {isCard(payment.codigo) || esCreditoTienda ? (
                      <CreditCard size={21} />
                    ) : (
                      <WalletCards size={21} />
                    )}
                    <span>
                      <strong>{payment.nombre}</strong>
                      <p>
                        {esCreditoTienda
                          ? creditoOpciones?.elegible
                            ? `Disponible: ${formatMoney(
                                creditoOpciones.credito_disponible ?? 0,
                              )}. Puedes financiar esta compra.`
                            : getCreditoUnavailableMessage(
                                creditoOpciones,
                                totalEstimado,
                              )
                          : payment.descripcion ||
                            payment.instrucciones_web ||
                            "Método disponible para la tienda en línea."}
                      </p>
                    </span>
                  </label>
                );
              })}
            </div>
            {metodo === "CREDITO_TIENDA" && creditoOpciones?.mostrar && creditoOpciones.elegible && (
              <div className={styles.creditPlan}>
                <div className={styles.creditPlanHeader}>
                  <div><strong>Financia esta compra con tu línea</strong><span>Disponible: {formatMoney(creditoOpciones.credito_disponible ?? 0)}</span></div>
                  <CreditCard size={22} />
                </div>
                <p>Esta opción se muestra únicamente porque tu crédito está activo, tiene disponibilidad suficiente y la configuración actual permite financiamiento web sin enganche.</p>
                <div className={styles.creditPlanGrid}>
                  <label><span>Plazo</span><select value={creditoPlazo ?? ""} onChange={(event) => setCreditoPlazo(Number(event.target.value))}>{(creditoOpciones.plazos ?? []).map((plazo) => <option key={plazo} value={plazo}>{plazo} mes(es)</option>)}</select></label>
                  <label><span>Frecuencia</span><select value={creditoFrecuencia ?? ""} onChange={(event) => setCreditoFrecuencia(event.target.value as "SEMANAL" | "QUINCENAL" | "MENSUAL")}>{(creditoOpciones.frecuencias ?? []).map((frecuencia) => <option key={frecuencia} value={frecuencia}>{frecuencia.charAt(0) + frecuencia.slice(1).toLowerCase()}</option>)}</select></label>
                </div>
                <small>El servidor vuelve a validar límite, mora, cuotas vencidas, número de créditos activos y calendario antes de crear el financiamiento.</small>
              </div>
            )}
            {selectedMethod?.instrucciones_web && (
              <div className={styles.instructions}>
                {selectedMethod.instrucciones_web}
              </div>
            )}
            {selectedMethod?.requiere_referencia && (
              <div className={styles.field}>
                <label htmlFor="payment-reference">Referencia o concepto</label>
                <input
                  id="payment-reference"
                  value={referencia}
                  onChange={(event) => setReferencia(event.target.value)}
                />
              </div>
            )}
            {selectedMethod && isCard(selectedMethod.codigo) && selectedMethod.codigo !== "CREDITO_TIENDA" && (
              <div className={styles.warning}>
                <AlertTriangle size={19} />
                <span>
                  El pedido quedará pendiente hasta completar o confirmar el
                  cobro con la pasarela configurada. Esta entrega no almacena
                  datos de tarjeta.
                </span>
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span className="material-symbols-outlined">sell</span>

              <h2>Cupón de descuento</h2>
            </div>

            <div className={styles.couponRow}>
              <input
                value={cuponCodigo}
                disabled={Boolean(cuponAplicado)}
                onChange={(event) => {
                  setCuponCodigo(event.target.value.toUpperCase());

                  setCuponAplicado(null);
                  setErrorCupon("");
                }}
                placeholder="Ej. BIENVENIDA10"
                maxLength={80}
              />

              {!cuponAplicado ? (
                <button
                  type="button"
                  onClick={handleValidarCupon}
                  disabled={validandoCupon || !cuponCodigo.trim()}
                >
                  {validandoCupon ? "Validando..." : "Validar cupón"}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.removeCoupon}
                  onClick={() => {
                    setCuponAplicado(null);
                    setCuponCodigo("");
                    setErrorCupon("");
                  }}
                >
                  Quitar
                </button>
              )}
            </div>

            {errorCupon && (
              <div className={styles.couponError}>{errorCupon}</div>
            )}

            {cuponAplicado && (
              <div className={styles.couponSuccess}>
                <div>
                  <strong>✓ Cupón aplicado</strong>

                  <span>{cuponAplicado.codigo}</span>
                </div>

                <strong>-{formatMoney(cuponAplicado.descuento)}</strong>
              </div>
            )}

            {!cuponAplicado && !errorCupon && (
              <p className={styles.couponHint}>
                Introduce tu código para conocer el descuento antes de confirmar
                la compra.
              </p>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}>
              <span>
                <MapPin size={20} />
              </span>
              <h2>Notas para tu pedido</h2>
            </div>
            <div className={styles.field}>
              <label htmlFor="order-notes">Observaciones opcionales</label>
              <textarea
                id="order-notes"
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
                placeholder="Horario preferido, referencias o indicaciones..."
              />
            </div>
          </section>
        </div>

        <aside className={styles.summary}>
          <h2>Resumen del pedido</h2>
          <div className={styles.itemList}>
            {items.map((item) => (
              <div className={styles.item} key={item.variantId}>
                <img
                  src={item.imageUrl || "/product-placeholder.svg"}
                  alt=""
                />
                <span>
                  <strong>{item.productName}</strong>
                  <small>
                    {item.quantity} × {formatMoney(item.price)}
                  </small>
                </span>
                <span>{formatMoney(item.quantity * item.price)}</span>
              </div>
            ))}
          </div>
          <div className={styles.totals}>
            <div>
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>

            {cuponAplicado && (
              <div className={styles.discountRow}>
                <span>Cupón {cuponAplicado.codigo}</span>

                <strong>-{formatMoney(cuponAplicado.descuento)}</strong>
              </div>
            )}

            <div>
              <span>Envío</span>

              <span>
                {tipoEntrega === "RECOGER"
                  ? "Sin costo"
                  : alcanzaEnvioGratis
                    ? "Gratis"
                    : formatMoney(costoEnvio)}
              </span>
            </div>

            {metodo === "CREDITO_TIENDA" && creditoOpciones?.mostrar && creditoOpciones.elegible && (
              <div className={styles.creditSummaryRow}>
                <span>Financiamiento</span>
                <strong>{creditoPlazo ?? "—"} mes(es) · {creditoFrecuencia ? creditoFrecuencia.toLowerCase() : "—"}</strong>
              </div>
            )}

            <div className={styles.total}>
              <strong>Total</strong>

              <div className={styles.finalPrice}>
                {cuponAplicado && (
                  <del>{formatMoney(subtotal + costoEnvio)}</del>
                )}

                <strong>{formatMoney(totalEstimado)}</strong>
              </div>
            </div>
          </div>
          <button
            className={styles.confirm}
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !perfil ||
              !metodo ||
              !checkoutConfig?.habilitado ||
              (tipoEntrega === "DOMICILIO" && !direccionId)
            }
          >
            {submitting && <LoaderCircle size={18} className="spin" />}
            {submitting ? "Confirmando..." : metodo === "CREDITO_TIENDA" ? "Confirmar compra a crédito" : "Confirmar pedido"}
          </button>
          <p className={styles.legal}>
            Al confirmar aceptas que el servidor revalide existencias, precios, cupón y costo de entrega antes de crear el pedido.
          </p>
        </aside>
      </div>
    </main>
  );
}
