import React, { useState, useMemo } from "react";
import { X, Search, User, Phone, Mail, Check, AlertCircle } from "lucide-react";
import styles from "../../../styles/ModalCliente.module.css";

export interface ClientePOS {
  id?: string | number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  telefono?: string | null;
  email?: string | null;
  tiene_credito?: boolean;
  limite_credito?: number;
  saldo_deudor?: number;
}

interface ModalClienteProps {
  clientes: ClientePOS[];
  clienteActual: ClientePOS | null;
  onSeleccionar: (cliente: ClientePOS | null) => void;
  onCrearCliente: (cliente: Omit<ClientePOS, "id">) => Promise<void>;
  onCerrar: () => void;
  cargando?: boolean;
}

export const ModalCliente: React.FC<ModalClienteProps> = ({
  clientes,
  clienteActual,
  onSeleccionar,
  onCrearCliente,
  onCerrar,
  cargando = false,
}) => {
  const [vista, setVista] = useState<"buscar" | "crear">("buscar");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<ClientePOS | null>(
    clienteActual,
  );
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    email: "",
  });

  const getNombreCompleto = (c: ClientePOS) =>
    `${c.nombres || ""} ${c.apellido_paterno || ""} ${c.apellido_materno || ""}`.trim();

  const iniciales = (c: ClientePOS) => {
    const n = c.nombres?.charAt(0) ?? "";
    const a = c.apellido_paterno?.charAt(0) ?? "";
    return `${n}${a}`.toUpperCase();
  };

  const clientesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return clientes;
    return clientes.filter((c) => {
      const nombre = getNombreCompleto(c).toLowerCase();
      return (
        nombre.includes(q) ||
        (c.telefono && c.telefono.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [busqueda, clientes]);

  const handleConfirmar = () => {
    onSeleccionar(seleccionado);
    onCerrar();
  };

  const handleChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormulario(null);

    if (!formData.nombres.trim() || !formData.apellido_paterno.trim()) {
      setErrorFormulario("Nombres y apellido paterno son obligatorios.");
      return;
    }
    if (!formData.telefono?.trim() && !formData.email?.trim()) {
      setErrorFormulario("Ingresa al menos un teléfono o un email.");
      return;
    }

    try {
      await onCrearCliente({
        nombres: formData.nombres,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
      });
    } catch (error) {
      setErrorFormulario(
        `No se pudo crear el cliente. Verifica que el teléfono o email no estén duplicados. ${error}`,
      );
    }
  };

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <User size={16} />
            </div>
            <div>
              <h2 className={styles.titulo}>
                {vista === "buscar"
                  ? "Seleccionar cliente"
                  : "Nuevo cliente rápido"}
              </h2>
              <p className={styles.subtitulo}>
                {vista === "buscar"
                  ? `${clientes.length} clientes registrados`
                  : "Completa los datos básicos"}
              </p>
            </div>
          </div>
          <button className={styles.cerrarBtn} onClick={onCerrar} type="button">
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${vista === "buscar" ? styles.tabActivo : ""}`}
            onClick={() => setVista("buscar")}
          >
            Buscar
          </button>
          <button
            type="button"
            className={`${styles.tab} ${vista === "crear" ? styles.tabActivo : ""}`}
            onClick={() => {
              setVista("crear");
              setErrorFormulario(null);
            }}
          >
            Nuevo cliente
          </button>
        </div>

        {/* Vista: Buscar */}
        {vista === "buscar" && (
          <>
            <div className={styles.searchWrap}>
              <div className={styles.searchBox}>
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.lista}>
              {/* Opción público general */}
              <span className={styles.divisorLabel}>Opciones</span>
              <button
                type="button"
                className={`${styles.clienteItem} ${seleccionado === null ? styles.clienteItemActivo : ""}`}
                onClick={() => setSeleccionado(null)}
              >
                <div className={`${styles.avatar} ${styles.avatarGenerico}`}>
                  <User size={14} />
                </div>
                <div className={styles.clienteInfo}>
                  <span className={styles.clienteNombre}>
                    Venta al público general
                  </span>
                  <span className={styles.clienteDetalle}>
                    Sin datos específicos
                  </span>
                </div>
                {seleccionado === null && (
                  <span className={styles.checkIcon}>
                    <Check size={11} />
                  </span>
                )}
              </button>

              {/* Lista de clientes */}
              {clientesFiltrados.length > 0 && (
                <span className={styles.divisorLabel}>Clientes</span>
              )}

              {clientesFiltrados.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  className={`${styles.clienteItem} ${seleccionado?.id === cliente.id ? styles.clienteItemActivo : ""}`}
                  onClick={() => setSeleccionado(cliente)}
                >
                  <div className={styles.avatar}>{iniciales(cliente)}</div>
                  <div className={styles.clienteInfo}>
                    <span className={styles.clienteNombre}>
                      {getNombreCompleto(cliente)}
                    </span>
                    <div className={styles.clienteMeta}>
                      {cliente.telefono && (
                        <span className={styles.clienteDetalle}>
                          <Phone size={10} /> {cliente.telefono}
                        </span>
                      )}
                      {cliente.email && (
                        <span className={styles.clienteDetalle}>
                          <Mail size={10} /> {cliente.email}
                        </span>
                      )}
                    </div>
                  </div>
                  {seleccionado?.id === cliente.id && (
                    <span className={styles.checkIcon}>
                      <Check size={11} />
                    </span>
                  )}
                </button>
              ))}

              {clientesFiltrados.length === 0 && busqueda && (
                <div className={styles.emptyBusqueda}>
                  <p>Sin resultados para "{busqueda}"</p>
                  <button
                    type="button"
                    className={styles.crearDesdeEmpty}
                    onClick={() => setVista("crear")}
                  >
                    Crear cliente ahora
                  </button>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelarBtn}
                onClick={() => {
                  onSeleccionar(null);
                  onCerrar();
                }}
              >
                Quitar cliente
              </button>
              <button
                type="button"
                className={styles.confirmarBtn}
                onClick={handleConfirmar}
              >
                <Check size={14} /> Confirmar
              </button>
            </div>
          </>
        )}

        {/* Vista: Crear */}
        {vista === "crear" && (
          <form
            onSubmit={handleSubmitCrear}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div className={styles.formView}>
              {errorFormulario && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={14} /> {errorFormulario}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombres *</label>
                <input
                  className={styles.formInput}
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChangeForm}
                  placeholder="Ej: María Elena"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Apellido paterno *</label>
                  <input
                    className={styles.formInput}
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChangeForm}
                    placeholder="Ej: García"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Apellido materno</label>
                  <input
                    className={styles.formInput}
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChangeForm}
                    placeholder="Ej: López"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Teléfono</label>
                  <input
                    className={styles.formInput}
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChangeForm}
                    placeholder="555-0000"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    className={styles.formInput}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChangeForm}
                    placeholder="correo@..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelarBtn}
                onClick={() => setVista("buscar")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.guardarBtn}
                disabled={cargando}
              >
                {cargando ? "Guardando..." : "Guardar cliente"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalCliente;