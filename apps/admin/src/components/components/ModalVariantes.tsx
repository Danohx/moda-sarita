import React, { useState } from "react";
import { X, Package, Plus, Minus, ShoppingCart } from "lucide-react";
import styles from "../../../styles/ModalVariantes.module.css";

interface Variante {
  id: string;
  etiqueta: string;
  stock: number;
  precio?: number;
}

interface GrupoVariante {
  nombre: string;
  variantes: Variante[];
}

interface ProductoVariantes {
  id: string;
  nombre: string;
  sku?: string;
  precio: number;
  imagen?: string;
  grupos: GrupoVariante[];
}

interface VarianteRaw {
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

interface ModalVariantesProps {
  producto: ProductoVariantes | null;
  variantesRaw: VarianteRaw[];
  onCerrar: () => void;
  onAgregar: (
    productoId: string,
    variantesSeleccionadas: Record<string, string>,
    cantidad: number,
  ) => void;
}

export const ModalVariantes: React.FC<ModalVariantesProps> = ({
  producto,
  variantesRaw,
  onCerrar,
  onAgregar,
}) => {
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});
  const [cantidad, setCantidad] = useState(1);

  if (!producto) return null;

  const todasSeleccionadas =
    producto.grupos.length === 0 ||
    producto.grupos.every((g) => seleccion[g.nombre]);

  const varianteActiva = (grupoNombre: string, varianteId: string) =>
    seleccion[grupoNombre] === varianteId;

  const seleccionarVariante = (grupoNombre: string, varianteId: string) => {
    setSeleccion((prev) => {
      if (prev[grupoNombre] === varianteId) {
        const nuevaSeleccion = { ...prev };
        delete nuevaSeleccion[grupoNombre];
        return nuevaSeleccion;
      }
      return { ...prev, [grupoNombre]: varianteId };
    });
  };

  const isOpcionDeshabilitada = (grupoNombre: string, varianteId: string) => {
    const simulacion = { ...seleccion, [grupoNombre]: varianteId };

    const existeValida = variantesRaw.some((v) => {
      const stockReal = Math.max(
        (Number(v.stock_fisico) || 0) - (Number(v.stock_apartado) || 0),
        0
      );

      if (stockReal <= 0) return false;

      const tallaSimulada = simulacion["Talla"];
      const colorSimulado = simulacion["Color"];

      const matchTalla = !tallaSimulada || String(v.talla_id) === tallaSimulada;
      const matchColor = !colorSimulado || String(v.color_id) === colorSimulado;

      return matchTalla && matchColor;
    });

    return !existeValida;
  };

  const handleAgregar = () => {
    if (!todasSeleccionadas) return;
    onAgregar(producto.id, seleccion, cantidad);
    onCerrar();
  };

  const formatMoneda = (valor: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valor);

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.productoIcono}>
            <Package size={28} />
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.titulo}>{producto.nombre}</h2>
            {producto.sku && (
              <span className={styles.sku}>SKU: {producto.sku}</span>
            )}
          </div>
          <button className={styles.cerrarBtn} onClick={onCerrar} type="button">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {producto.grupos.map((grupo) => (
            <div key={grupo.nombre} className={styles.grupo}>
              <span className={styles.grupoLabel}>{grupo.nombre}</span>
              <div className={styles.variantesGrid}>
                {grupo.variantes.map((variante) => {
                  const deshabilitado = isOpcionDeshabilitada(grupo.nombre, variante.id);
                  const activa = varianteActiva(grupo.nombre, variante.id);

                  return (
                    <button
                      key={variante.id}
                      type="button"
                      className={`${styles.varianteBtn} ${
                        activa ? styles.varianteActiva : ""
                      } ${deshabilitado ? styles.varianteSinStock : ""}`}
                      onClick={() => seleccionarVariante(grupo.nombre, variante.id)}
                      disabled={deshabilitado}
                    >
                      <span className={styles.varianteEtiqueta}>
                        {variante.etiqueta}
                      </span>
                      {variante.stock < 5 && variante.stock > 0 && !deshabilitado && (
                        <span className={styles.stockAlerta}>
                          {variante.stock} left
                        </span>
                      )}
                      {deshabilitado && (
                        <span className={styles.sinStock}>Agotado/N.D.</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className={styles.cantidadRow}>
            <span className={styles.grupoLabel}>Cantidad</span>
            <div className={styles.cantidadControl}>
              <button
                className={styles.cantidadBtn}
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                type="button"
              >
                <Minus size={16} />
              </button>
              <span className={styles.cantidadNum}>{cantidad}</span>
              <button
                className={styles.cantidadBtn}
                onClick={() => setCantidad((c) => c + 1)}
                type="button"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.precioInfo}>
            <span className={styles.precioLabel}>Total</span>
            <span className={styles.precioValor}>
              {formatMoneda(producto.precio * cantidad)}
            </span>
          </div>
          <button
            className={styles.agregarBtn}
            onClick={handleAgregar}
            disabled={!todasSeleccionadas}
            type="button"
          >
            <ShoppingCart size={18} />
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalVariantes;