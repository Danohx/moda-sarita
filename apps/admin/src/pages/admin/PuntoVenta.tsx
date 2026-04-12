import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Receipt,
  Package,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import styles from "../../../styles/PuntoVenta.module.css";
import type { Producto } from "@shared/api/productos.api";
import { productosService } from "@admin/services/productos.service";
import { categoriaService } from "@admin/services/categorias.service";
import { variantesService } from "@admin/services/variantes.service";
import { clientesService } from "@admin/services/clientes.service";
import { ventasService } from "@admin/services/ventas.service";
import ModalVariantes from "@admin/components/components/ModalVariantes";
import ModalCliente, {
  type ClientePOS,
} from "@admin/components/components/ModalClientes";
import ModalCheckout from "@admin/components/components/ModalCheckout";
import ModalApartado from "@admin/components/components/ModalApartado";

interface CategoriaItem {
  id: string | number;
  nombre: string;
  activo?: boolean;
}

interface ProductoItem {
  id: string | number;
  nombre: string;
  sku: string;
  precio_venta: number;
  stock_total: number;
  activo: boolean;
  destacado: boolean;
  categoria: {
    id: string | number;
    nombre: string;
  } | null;
}

interface CarritoItem {
  id: string;
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  variante?: string;
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
  color_nombre?: string | null;
  color_hex?: string | null;
  talla_nombre?: string | null;
  talla_tipo?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ModalVarianteItem {
  id: string;
  etiqueta: string;
  stock: number;
  precio?: number;
}

interface ModalGrupoVariante {
  nombre: string;
  variantes: ModalVarianteItem[];
}

interface ProductoVariantesModal {
  id: string;
  nombre: string;
  sku?: string;
  precio: number;
  imagen?: string;
  grupos: ModalGrupoVariante[];
}

// ─── Formatter singleton — se crea una sola vez ───────────────────────────────
const CURRENCY_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});
const formatMoneda = (valor: number) => CURRENCY_FORMATTER.format(valor);

export const POS: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [cliente, setCliente] = useState<ClientePOS | null>(null);
  const [products, setProducts] = useState<ProductoItem[]>([]);
  const [, setCategories] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVariantesAbierto, setModalVariantesAbierto] = useState(false);
  const [productoModal, setProductoModal] =
    useState<ProductoVariantesModal | null>(null);
  const [variantesActuales, setVariantesActuales] = useState<VarianteItem[]>(
    [],
  );
  const [, setCargandoVariantes] = useState(false);
  const [clientesLista, setClientesLista] = useState<ClientePOS[]>([]);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [cargandoCliente, setCargandoCliente] = useState(false);
  const [modalCheckoutAbierto, setModalCheckoutAbierto] = useState(false);
  const [modalApartadoAbierto, setModalApartadoAbierto] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [procesandoApartado, setProcesandoApartado] = useState(false);

  const productosFiltrados = useMemo(() => {
    const productosActivos = products.filter((p) => p.activo);
    const q = busqueda.toLowerCase().trim();
    if (!q) return productosActivos;

    return productosActivos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.categoria?.nombre?.toLowerCase().includes(q),
    );
  }, [busqueda, products]);

  const normalizeProducts = useCallback(
    (data: Producto[], categorias: CategoriaItem[]) => {
      const categoriasMap = new Map(
        categorias.map((categoria) => [String(categoria.id), categoria]),
      );

      return data.map((product) => {
        const categoria = product.categoria_id
          ? categoriasMap.get(String(product.categoria_id))
          : null;

        return {
          id: product.id,
          nombre: product.nombre ?? "Sin nombre",
          sku: product.sku ?? "",
          precio_venta: Number(product.precio_venta ?? 0),
          stock_total: Number(product.stock_total ?? 0),
          activo: Boolean(product.activo),
          destacado: Boolean(product.destacado),
          categoria: categoria
            ? { id: categoria.id, nombre: categoria.nombre }
            : null,
        };
      });
    },
    [],
  );

  const buildCategories = useCallback((items: ProductoItem[]) => {
    return Array.from(
      new Map(
        items
          .filter((p) => p.categoria)
          .map((p) => [
            String(p.categoria!.id),
            { id: p.categoria!.id, nombre: p.categoria!.nombre },
          ]),
      ).values(),
    ).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, []);

  const loadProducts = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);
        
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [productos, categorias] = await Promise.all([
          productosService.getList(),
          categoriaService.getCategorias(),
        ]);
        const normalizedProducts = normalizeProducts(productos, categorias);
        setProducts(normalizedProducts);
        setCategories(buildCategories(normalizedProducts));
      } catch (err) {
        console.error(err);
        setProducts([]);
        setCategories([]);
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildCategories, normalizeProducts],
  );

  const getStockDisponible = (variante: VarianteItem) =>
    Math.max(
      (Number(variante.stock_fisico ?? 0)) -
        (Number(variante.stock_apartado ?? 0)),
      0,
    );

  const mapVariantesToModal = useCallback(
    (
      producto: ProductoItem,
      variantes: VarianteItem[],
    ): ProductoVariantesModal => {
      const tallasMap = new Map<string, ModalVarianteItem>();
      const coloresMap = new Map<string, ModalVarianteItem>();

      for (const variante of variantes) {
        const stock = getStockDisponible(variante);
        const precio = Number(variante.precio_venta ?? producto.precio_venta ?? 0);

        if (variante.talla_id && variante.talla_nombre) {
          const key = String(variante.talla_id);
          const current = tallasMap.get(key);
          if (!current || stock > current.stock)
            tallasMap.set(key, { id: key, etiqueta: variante.talla_nombre, stock, precio });
        }

        if (variante.color_id && variante.color_nombre) {
          const key = String(variante.color_id);
          const current = coloresMap.get(key);
          if (!current || stock > current.stock)
            coloresMap.set(key, { id: key, etiqueta: variante.color_nombre, stock, precio });
        }
      }

      const grupos: ModalGrupoVariante[] = [];
      if (tallasMap.size > 0)
        grupos.push({ nombre: "Talla", variantes: Array.from(tallasMap.values()) });
      if (coloresMap.size > 0)
        grupos.push({ nombre: "Color", variantes: Array.from(coloresMap.values()) });

      return {
        id: String(producto.id),
        nombre: producto.nombre,
        sku: producto.sku,
        precio: producto.precio_venta,
        grupos,
      };
    },
    [],
  );

  const handleOpenVariantes = useCallback(
    async (producto: ProductoItem) => {
      try {
        setCargandoVariantes(true);
        setError(null);

        const response = await variantesService.getByProductoId(producto.id);
        const variantes = Array.isArray(response) ? response : [];
        const variantesActivas = variantes.filter((v) => v.activo !== false);

        if (variantesActivas.length === 0) return;

        setVariantesActuales(variantesActivas as VarianteItem[]);
        setProductoModal(mapVariantesToModal(producto, variantesActivas as VarianteItem[]));
        setModalVariantesAbierto(true);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las variantes del producto.");
      } finally {
        setCargandoVariantes(false);
      }
    },
    [mapVariantesToModal],
  );

  const handleAgregarVariante = useCallback(
    (
      productoId: string,
      variantesSeleccionadas: Record<string, string>,
      cantidad: number,
    ) => {
      const tallaId = variantesSeleccionadas.Talla
        ? Number(variantesSeleccionadas.Talla)
        : null;
      const colorId = variantesSeleccionadas.Color
        ? Number(variantesSeleccionadas.Color)
        : null;

      const variante = variantesActuales.find((item) => {
        const tallaOk = tallaId === null || Number(item.talla_id ?? 0) === tallaId;
        const colorOk = colorId === null || Number(item.color_id ?? 0) === colorId;
        return tallaOk && colorOk;
      });

      if (!variante) {
        setError("No se encontró una variante válida para la combinación seleccionada.");
        return;
      }

      const stockDisponible = getStockDisponible(variante);
      if (stockDisponible <= 0) {
        setError("La variante seleccionada no tiene stock disponible.");
        return;
      }

      const varianteNombre = [variante.talla_nombre, variante.color_nombre]
        .filter(Boolean)
        .join(" / ");
      const precioFinal = Number(variante.precio_venta ?? productoModal?.precio ?? 0);

      setCarrito((prev) => {
        const existente = prev.find((item) => item.id === variante.id);
        if (existente) {
          return prev.map((item) =>
            item.id === variante.id
              ? { ...item, cantidad: Math.min(existente.cantidad + cantidad, stockDisponible) }
              : item,
          );
        }
        return [
          ...prev,
          {
            id: String(variante.id),
            productoId,
            nombre: productoModal?.nombre ?? "Producto",
            precio: precioFinal,
            cantidad: Math.min(cantidad, stockDisponible),
            stock: stockDisponible,
            variante: varianteNombre || "Variante base",
          },
        ];
      });

      setModalVariantesAbierto(false);
      setProductoModal(null);
      setVariantesActuales([]);
    },
    [productoModal, variantesActuales],
  );

  const loadClientes = useCallback(async () => {
    try {
      const data = await clientesService.getList();
      setClientesLista((data || []) as ClientePOS[]);
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  }, []);

  const handleCrearClientePOS = async (nuevoClienteData: Omit<ClientePOS, "id">) => {
    setCargandoCliente(true);
    try {
      type CreateClientePayload = Parameters<typeof clientesService.create>[0];
      const payload: CreateClientePayload = {
        nombres: nuevoClienteData.nombres,
        apellido_paterno: nuevoClienteData.apellido_paterno,
        apellido_materno: nuevoClienteData.apellido_materno ?? undefined,
        telefono: nuevoClienteData.telefono ?? undefined,
        email: nuevoClienteData.email ?? undefined,
      };
      const respuesta = await clientesService.create(payload);
      const nuevoCliente = respuesta || { ...nuevoClienteData, id: Date.now() };
      setClientesLista((prev) => [nuevoCliente as ClientePOS, ...prev]);
      setCliente(nuevoCliente as ClientePOS);
      setModalClienteAbierto(false);
    } catch (error) {
      setError(`No se pudo crear el cliente. Intente nuevamente. ${error}`);
    } finally {
      setCargandoCliente(false);
    }
  };

  const handlePagarVenta = async (metodo: string) => {
    try {
      setProcesandoPago(true);
      setError(null);

      const payload: Parameters<typeof ventasService.crearVentaPOS>[0] = {
        cliente_id: cliente ? cliente.id : null,
        vendedor_id: "1",
        metodo_pago: metodo,
        tipo: "PUNTO_VENTA",
        items: carrito.map((item) => {
          const cant = Number(item.cantidad);
          if (!item.id || typeof item.id !== "string")
            throw new Error(`El producto ${item.nombre} no tiene un ID de variante válido.`);
          if (isNaN(cant) || cant <= 0)
            throw new Error(`La cantidad para ${item.nombre} debe ser mayor a 0.`);
          return {
            variante_id: String(item.id),
            cantidad: cant,
            precio_unitario: Number(item.precio),
          };
        }),
        descuento: 0,
        costo_envio: 0,
      };

      await ventasService.crearVentaPOS(payload);
      setCarrito([]);
      setCliente(null);
      setModalCheckoutAbierto(false);
      alert("¡Venta registrada con éxito!");
      loadProducts(true);
    } catch (err) {
      console.error("Error al procesar venta:", err);
      setError("Ocurrió un error al procesar la venta.");
    } finally {
      setProcesandoPago(false);
    }
  };

  const handleCrearApartado = async (anticipo: number, diasVigencia: number) => {
    try {
      setProcesandoApartado(true);
      setError(null);

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + diasVigencia);

      const payload: Parameters<typeof ventasService.crearApartado>[0] = {
        cliente_id: cliente ? cliente.id : null,
        vendedor_id: 1,
        anticipo,
        metodo_pago: anticipo > 0 ? "EFECTIVO" : "PENDIENTE",
        fecha_limite_apartado: fechaLimite.toISOString(),
        tipo: "APARTADO",
        items: carrito.map((item) => {
          const cant = Number(item.cantidad);
          if (!item.id || typeof item.id !== "string")
            throw new Error(`El producto ${item.nombre} no tiene un ID de variante válido.`);
          if (isNaN(cant) || cant <= 0)
            throw new Error(`La cantidad para ${item.nombre} debe ser mayor a 0.`);
          return {
            variante_id: String(item.id),
            cantidad: cant,
            precio_unitario: Number(item.precio),
          };
        }),
      };

      await ventasService.crearApartado(payload);
      setCarrito([]);
      setCliente(null);
      setModalApartadoAbierto(false);
      alert("¡Apartado registrado con éxito!");
      loadProducts(true);
    } catch (err) {
      let backendMessage = "Ocurrió un error al crear el apartado.";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { msg?: string; message?: string } }; message?: string };
        backendMessage =
          e.response?.data?.msg || e.response?.data?.message || e.message || backendMessage;
      }
      setError(backendMessage);
    } finally {
      setProcesandoApartado(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadClientes();
  }, [loadProducts, loadClientes]);

  const subtotal = useMemo(
    () => carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [carrito],
  );

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const cambiarCantidad = useCallback((id: string, delta: number) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          cantidad: Math.max(1, Math.min(item.stock, item.cantidad + delta)),
        };
      }),
    );
  }, []);

  const eliminarDelCarrito = useCallback((id: string) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Memoizado para no recrear el array en cada render del POS
  const itemsResumen = useMemo(
    () =>
      carrito.map((item) => ({
        nombre: item.nombre,
        variante: item.variante,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    [carrito],
  );

  const clienteNombreCheckout = useMemo(
    () => (cliente ? `${cliente.nombres} ${cliente.apellido_paterno}` : undefined),
    [cliente],
  );

  return (
    <div className={styles.pos}>
      <div className={styles.header}>
        <h1 className={styles.title}>Punto de Venta</h1>
        <div className={styles.headerActions}>
          <span className={styles.date}>
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.productosPanel}>
          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          )}
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.productosGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.productSkeleton}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonPrice}></div>
                </div>
              ))
            ) : productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className={styles.productoCard}
                  onClick={() => handleOpenVariantes(producto)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleOpenVariantes(producto);
                  }}
                >
                  <div className={styles.productoIcono}>
                    <Package size={32} />
                  </div>
                  <div className={styles.productoInfo}>
                    <h3 className={styles.productoNombre}>{producto.nombre}</h3>
                    <p className={styles.productoSku}>SKU: {producto.sku ?? "N/A"}</p>
                    <div className={styles.productoFooter}>
                      <span className={styles.productoPrecio}>
                        {formatMoneda(producto.precio_venta)}
                      </span>
                      <span
                        className={`${styles.stockBadge} ${
                          producto.stock_total < 10 ? styles.stockBajo : ""
                        }`}
                      >
                        Stock: {producto.stock_total}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <AlertCircle size={48} />
                <p className={styles.emptyTitle}>No existen productos</p>
                <p className={styles.emptySubtitle}>
                  Intente con otro término de búsqueda.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.carritoPanel}>
          <div className={styles.clienteCard}>
            <div
              className={styles.clienteHeader}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={20} />
                <span className={styles.clienteLabel} style={{ fontWeight: "bold" }}>
                  Cliente
                </span>
              </div>

              {cliente && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setModalClienteAbierto(true)}
                    style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px" }}
                  >
                    Cambiar
                  </button>
                  <button
                    onClick={() => setCliente(null)}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px" }}
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>

            <button
              className={styles.clienteBtn}
              type="button"
              onClick={() => !cliente && setModalClienteAbierto(true)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {cliente ? (
                <div className={styles.clienteInfoFull}>
                  <span
                    className={styles.clienteNombre}
                    style={{ display: "block", fontWeight: "bold", fontSize: "15px" }}
                  >
                    {`${cliente.nombres} ${cliente.apellido_paterno} ${cliente.apellido_materno || ""}`.trim()}
                  </span>
                  {cliente.telefono && (
                    <span
                      className={styles.clienteTel}
                      style={{ display: "block", fontSize: "13px", color: "#64748b", marginTop: "4px" }}
                    >
                      Tel: {cliente.telefono}
                    </span>
                  )}
                  {cliente.tiene_credito && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px",
                        backgroundColor: "#eff6ff",
                        borderRadius: "4px",
                        fontSize: "13px",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <strong style={{ color: "#1d4ed8" }}>Cliente con Crédito</strong>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                        <span>Límite: {formatMoneda(cliente.limite_credito || 0)}</span>
                        <span
                          style={{
                            color: (cliente.saldo_deudor ?? 0) > 0 ? "#b91c1c" : "#15803d",
                            fontWeight: "500",
                          }}
                        >
                          Deuda: {formatMoneda(cliente.saldo_deudor || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <span
                  className={styles.clientePlaceholder}
                  style={{ color: "#64748b", display: "flex", justifyContent: "center", alignItems: "center", height: "40px" }}
                >
                  + Seleccionar o Crear Cliente
                </span>
              )}
            </button>
          </div>

          <div className={styles.carritoCard}>
            <div className={styles.carritoHeader}>
              <h2 className={styles.carritoTitle}>
                <ShoppingCart size={20} />
                Carrito de Compra
              </h2>
              {carrito.length > 0 && (
                <span className={styles.carritoBadge}>{carrito.length}</span>
              )}
            </div>

            {carrito.length === 0 ? (
              <div className={styles.carritoVacio}>
                {loading ? (
                  <RefreshCw size={48} className={styles.spinning} />
                ) : (
                  <ShoppingCart size={48} />
                )}
                <p className={styles.vacioTitle}>
                  {loading ? "Cargando..." : "Carrito vacío"}
                </p>
                <p className={styles.vacioSubtitle}>
                  {loading
                    ? "Consultando productos..."
                    : "Agrega productos desde el panel izquierdo"}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.carritoItems}>
                  {carrito.map((item) => (
                    <div key={item.id} className={styles.carritoItem}>
                      <div className={styles.itemInfo}>
                        <h4 className={styles.itemNombre}>{item.nombre}</h4>
                        <div className={styles.itemPrecioWrap}>
                          <p className={styles.itemPrecioUnit}>
                            {formatMoneda(item.precio)} c/u
                          </p>
                          <p className={styles.itemSubtotal}>
                            {formatMoneda(item.precio * item.cantidad)}
                          </p>
                        </div>
                        {item.variante && (
                          <span className={styles.itemVariante}>{item.variante}</span>
                        )}
                      </div>

                      <div className={styles.itemControls}>
                        <div className={styles.cantidadControl}>
                          <button
                            className={styles.cantidadBtn}
                            onClick={() => cambiarCantidad(item.id, -1)}
                            type="button"
                          >
                            <Minus size={16} />
                          </button>
                          <span className={styles.cantidadText}>{item.cantidad}</span>
                          <button
                            className={styles.cantidadBtn}
                            onClick={() => cambiarCantidad(item.id, 1)}
                            type="button"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          className={styles.eliminarBtn}
                          onClick={() => eliminarDelCarrito(item.id)}
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.resumen}>
                  <div className={styles.resumenRow}>
                    <span>Subtotal:</span>
                    <span>{formatMoneda(subtotal)}</span>
                  </div>
                  <div className={styles.resumenRow}>
                    <span>IVA (16%):</span>
                    <span>{formatMoneda(iva)}</span>
                  </div>
                  <div className={styles.resumenTotal}>
                    <span>Total:</span>
                    <span>{formatMoneda(total)}</span>
                  </div>
                </div>
              </>
            )}

            <div className={styles.acciones}>
              <button
                className={styles.procesarBtn}
                disabled={carrito.length === 0 || procesandoPago}
                type="button"
                onClick={() => setModalCheckoutAbierto(true)}
              >
                <CreditCard size={20} />
                {procesandoPago ? "Procesando..." : "Procesar Pago"}
              </button>

              <button
                className={styles.apartarBtn}
                disabled={carrito.length === 0 || procesandoApartado}
                type="button"
                onClick={() => {
                  if (!cliente) {
                    alert("Debes seleccionar un cliente para poder crear un apartado!");
                    return;
                  }
                  setModalApartadoAbierto(true);
                }}
              >
                <Receipt size={20} />
                {procesandoApartado ? "Apartando..." : "Apartar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*
        Los modales se montan condicionalmente solo cuando tienen datos necesarios
        (productoModal para variantes). Los demás se montan siempre pero el CSS
        los oculta con display:none cuando isOpen=false, evitando el costo de
        mount/unmount en cada apertura.
      */}
      {modalVariantesAbierto && productoModal && (
        <ModalVariantes
          producto={productoModal}
          variantesRaw={variantesActuales}
          onCerrar={() => {
            setModalVariantesAbierto(false);
            setProductoModal(null);
            setVariantesActuales([]);
          }}
          onAgregar={handleAgregarVariante}
        />
      )}

      <ModalCliente
        isOpen={modalClienteAbierto}
        clientes={clientesLista}
        clienteActual={cliente}
        onSeleccionar={(c) => {
          setCliente(c);
          setModalClienteAbierto(false);
        }}
        onCrearCliente={handleCrearClientePOS}
        onCerrar={() => setModalClienteAbierto(false)}
        cargando={cargandoCliente}
      />

      <ModalCheckout
        isOpen={modalCheckoutAbierto}
        items={itemsResumen}
        subtotal={subtotal}
        iva={iva}
        total={total}
        clienteNombre={clienteNombreCheckout}
        onPagar={handlePagarVenta}
        onCerrar={() => setModalCheckoutAbierto(false)}
      />

      <ModalApartado
        isOpen={modalApartadoAbierto}
        items={itemsResumen}
        total={total}
        clienteNombre={clienteNombreCheckout}
        onApartar={handleCrearApartado}
        onCerrar={() => setModalApartadoAbierto(false)}
      />
    </div>
  );
};

export default POS;