import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Palette, RefreshCw, Ruler, Save, Shapes } from "lucide-react";
import styles from "../../../styles/ProductCatalogs.module.css";
import { categoriaService } from "@admin/services/categorias.service";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";
import { useAuth } from "@shared/context/AuthContext";
import { canAccess } from "../../utils/permissions";

interface CatalogItem {
  id: string | number;
  nombre: string;
  activo?: boolean;
}

type CatalogType = "categorias" | "colores" | "tallas";

const ProductCatalogs: React.FC = () => {
  const { user } = useAuth();

  const canReadCatalogs = canAccess(user, {
    permissions: "inventario.categorias.read",
  });

  const canCreateCatalogs = canAccess(user, {
    permissions: "inventario.categorias.create",
  });

  const canToggleCatalogs = canAccess(user, {
    permissions: "inventario.categorias.delete",
  });

  const [tab, setTab] = useState<CatalogType>("categorias");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const meta = useMemo(
    () =>
      ({
        categorias: { icon: <Shapes size={18} />, title: "Categorías" },
        colores: { icon: <Palette size={18} />, title: "Colores" },
        tallas: { icon: <Ruler size={18} />, title: "Tallas" },
      })[tab],
    [tab],
  );

  const getCatalogItems = useCallback(
    async (currentTab: CatalogType): Promise<CatalogItem[]> => {
      if (!canReadCatalogs) return [];

      switch (currentTab) {
        case "categorias":
          return await categoriaService.getCategorias();
        case "colores":
          return await categoriaService.getColores();
        case "tallas":
          return await categoriaService.getTallas();
        default:
          return [];
      }
    },
    [canReadCatalogs],
  );

  const loadItems = useCallback(
    async (isRefresh = false) => {
      if (!canReadCatalogs) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        setError(null);

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const data = await getCatalogItems(tab);
        setItems(data ?? []);
      } catch (err) {
        console.error(err);
        setItems([]);
        setError(
          `No se pudo cargar el catálogo de ${meta.title.toLowerCase()}.`,
        );
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [canReadCatalogs, getCatalogItems, tab, meta.title],
  );

  useEffect(() => {
    void loadItems(true);
  }, [loadItems]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canCreateCatalogs) {
      setError("No tienes permiso para crear catálogos.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setError(null);
      setSaving(true);

      switch (tab) {
        case "categorias":
          await categoriaService.createCategoria({ nombre: trimmedName });
          break;
        case "colores":
          await categoriaService.createColor({ nombre: trimmedName });
          break;
        case "tallas":
          await categoriaService.createTalla({ nombre: trimmedName });
          break;
      }

      setName("");
      await loadItems(true);
    } catch (err) {
      console.error(err);
      setError(`No se pudo crear el registro en ${meta.title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (catalog: CatalogItem) => {
    if (!canToggleCatalogs) {
      setError("No tienes permiso para activar o desactivar catálogos.");
      return;
    }

    try {
      setError(null);

      switch (tab) {
        case "categorias":
          await categoriaService.changeCategoriaStatus(
            catalog.id,
            !catalog.activo,
          );
          break;
        case "colores":
          await categoriaService.changeColorStatus(catalog.id, !catalog.activo);
          break;
        case "tallas":
          await categoriaService.changeTallaStatus(catalog.id, !catalog.activo);
          break;
      }

      await loadItems(true);
    } catch (err) {
      console.error(err);
      setError(`No se pudo cambiar el estado en ${meta.title.toLowerCase()}.`);
    }
  };

  if (!canReadCatalogs) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <div>
            <AdminBreadcrumbs
              items={[
                { label: "Productos", to: "/products" },
                { label: "Catálogos" },
              ]}
            />
            <h1 className={styles.title}>Catálogos base</h1>
            <p className={styles.subtitle}>
              No tienes permisos para consultar categorías, colores y tallas.
            </p>
          </div>
        </header>

        <div className={styles.errorBox}>
          No tienes permiso para ver catálogos.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <AdminBreadcrumbs
            items={[
              { label: "Productos", to: "/products" },
              { label: "Catálogos" },
            ]}
          />
          <h1 className={styles.title}>Catálogos base</h1>
          <p className={styles.subtitle}>
            Administra categorías, colores y tallas que alimentan productos y
            variantes.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          disabled={refreshing || loading}
          onClick={() => void loadItems(true)}
        >
          <RefreshCw size={18} className={refreshing ? styles.spinning : ""} />
          Actualizar
        </button>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === "categorias" ? styles.activeTab : styles.tab}
          onClick={() => setTab("categorias")}
        >
          <Shapes size={18} /> Categorías
        </button>
        <button
          type="button"
          className={tab === "colores" ? styles.activeTab : styles.tab}
          onClick={() => setTab("colores")}
        >
          <Palette size={18} /> Colores
        </button>
        <button
          type="button"
          className={tab === "tallas" ? styles.activeTab : styles.tab}
          onClick={() => setTab("tallas")}
        >
          <Ruler size={18} /> Tallas
        </button>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>
            {meta.icon} {meta.title}
          </h2>
        </div>

        {canCreateCatalogs && (
          <form className={styles.inlineForm} onSubmit={handleCreate}>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Nombre de ${meta.title.toLowerCase().slice(0, -1)}`}
              required
            />
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={saving}
            >
              <Save size={18} />
              Crear
            </button>
          </form>
        )}

        {loading ? (
          <div className={styles.centerState}>Cargando catálogo...</div>
        ) : items.length === 0 ? (
          <div className={styles.centerState}>
            No hay registros cargados todavía.
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => (
              <article key={item.id} className={styles.itemRow}>
                <div>
                  <strong>{item.nombre}</strong>
                  <span>{item.activo ? "Activo" : "Inactivo"}</span>
                </div>

                {canToggleCatalogs ? (
                  <button
                    type="button"
                    className={item.activo ? styles.statusOff : styles.statusOn}
                    onClick={() => void handleToggleStatus(item)}
                  >
                    {item.activo ? "Desactivar" : "Activar"}
                  </button>
                ) : (
                  <span>{item.activo ? "Activo" : "Inactivo"}</span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default ProductCatalogs;