import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Edit3,
  Eye,
  Image as ImageIcon,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  ClipboardCheck,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import styles from "../../../styles/AdminProducts.module.css";
import { productosService } from "@admin/services/productos.service";
import type { Producto } from "@shared/api/productos.api";
import { categoriaService } from "@admin/services/categorias.service";
import AdminBreadcrumbs from "@admin/components/layout/AdminBreadcrumbs";

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

function currency(value?: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductoItem[]>([]);
  const [categories, setCategories] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [featuredFilter, setFeaturedFilter] = useState<
    "all" | "featured" | "normal"
  >("all");

  const normalizeProducts = useCallback(
    (data: Producto[], categorias: CategoriaItem[]) => {
      const categoriasMap = new Map(
        categorias.map((categoria) => [String(categoria.id), categoria]),
      );

      const normalized: ProductoItem[] = data.map((product) => {
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
            ? {
                id: categoria.id,
                nombre: categoria.nombre,
              }
            : null,
        };
      });
      return normalized;
    },
    [],
  );

  const buildCategories = useCallback((items: ProductoItem[]) => {
    const uniqueCategories = Array.from(
      new Map(
        items
          .filter((product) => product.categoria)
          .map((product) => [
            String(product.categoria!.id),
            {
              id: product.categoria!.id,
              nombre: product.categoria!.nombre,
            },
          ]),
      ).values(),
    ).sort((a, b) => a.nombre.localeCompare(b.nombre));

    return uniqueCategories;
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
        const normalizedCategories = buildCategories(normalizedProducts);

        console.log(normalizedProducts, normalizedCategories);
        setProducts(normalizedProducts);
        setCategories(normalizedCategories);
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

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleToggleStatus = async (product: ProductoItem) => {
    try {
      await productosService.changeStatus(product.id, !product.activo);
      await loadProducts(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar el estado del producto.");
    }
  };

  const handleToggleFeatured = async (product: ProductoItem) => {
    try {
      await productosService.changeFeatured(product.id, !product.destacado);
      await loadProducts(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar el estado destacado.");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.nombre.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.categoria?.id ?? "") === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.activo) ||
        (statusFilter === "inactive" && !product.activo);

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && product.destacado) ||
        (featuredFilter === "normal" && !product.destacado);

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesFeatured
      );
    });
  }, [products, search, categoryFilter, statusFilter, featuredFilter]);

  const stats = useMemo(() => {
    const active = products.filter((item) => item.activo).length;
    const featured = products.filter((item) => item.destacado).length;
    const stock = products.reduce(
      (acc, item) => acc + Number(item.stock_total ?? 0),
      0,
    );

    return {
      total: products.length,
      active,
      featured,
      stock,
    };
  }, [products]);

  return (
    <section className={styles.products}>
      <header className={styles.header}>
        <div>
          <AdminBreadcrumbs items={[{ label: "Productos" }]} />
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.subtitle}>
            Gestiona catálogo, estados comerciales y accesos a detalle.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            disabled={refreshing || loading}
            onClick={() => void loadProducts(true)}
          >
            <RefreshCw
              size={18}
              className={refreshing ? styles.spinning : ""}
            />
            Actualizar
          </button>

          <Link to="/products/new" className={styles.primaryBtn}>
            <Plus size={18} />
            Nuevo producto
          </Link>

          <Link to="/products/catalogs" className={styles.primaryBtn}>
            <ClipboardCheck size={18} />
            Gestionar categorías
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <article className={`${styles.statCard} ${styles.primaryCard}`}>
          <Box size={28} />
          <div>
            <span>Total productos</span>
            <strong>{stats.total}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.successCard}`}>
          <Tag size={28} />
          <div>
            <span>Activos</span>
            <strong>{stats.active}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.warningCard}`}>
          <Sparkles size={28} />
          <div>
            <span>Destacados</span>
            <strong>{stats.featured}</strong>
          </div>
        </article>

        <article className={`${styles.statCard} ${styles.infoCard}`}>
          <Layers3 size={28} />
          <div>
            <span>Stock total</span>
            <strong>{stats.stock}</strong>
          </div>
        </article>
      </div>

      <section className={styles.filtersCard}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o SKU"
          />
        </div>

        <select
          className={styles.select}
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.nombre}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as typeof statusFilter)
          }
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <select
          className={styles.select}
          value={featuredFilter}
          onChange={(event) =>
            setFeaturedFilter(event.target.value as typeof featuredFilter)
          }
        >
          <option value="all">Todos</option>
          <option value="featured">Destacados</option>
          <option value="normal">No destacados</option>
        </select>
      </section>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <section className={styles.tableCard}>
        {loading ? (
          <div className={styles.centerState}>Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.centerState}>
            No hay productos cargados todavía.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>SKU</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productCell}>
                        <strong>{product.nombre}</strong>
                        {product.destacado ? (
                          <span className={styles.featuredBadge}>
                            Destacado
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>{product.categoria?.nombre ?? "Sin categoría"}</td>
                    <td>{product.sku || "Sin SKU"}</td>
                    <td>{currency(product.precio_venta)}</td>
                    <td>{product.stock_total}</td>
                    <td>
                      <span
                        className={
                          product.activo
                            ? styles.badgeActive
                            : styles.badgeInactive
                        }
                      >
                        {product.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          to={`/products/${product.id}`}
                          className={styles.iconBtn}
                          title="Ver detalle"
                        >
                          <Eye size={17} />
                        </Link>
                        <Link
                          to={`/products/${product.id}/edit`}
                          state={{ from: "list" }}
                          className={styles.iconBtn}
                          title="Editar"
                        >
                          <Edit3 size={17} />
                        </Link>
                        <Link
                          to={`/products/${product.id}/variants`}
                          state={{ from: "list", productoNombre: product.nombre }}
                          className={styles.iconBtn}
                          title="Variantes"
                        >
                          <Layers3 size={17} />
                        </Link>
                        <Link
                          to={`/products/${product.id}/images`}
                          state={{ from: "list" }}
                          className={styles.iconBtn}
                          title="Imágenes"
                        >
                          <ImageIcon size={17} />
                        </Link>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title={product.destacado ? "No destacar" : "Destacar"}
                          onClick={() => void handleToggleFeatured(product)}
                        >
                          <Sparkles size={17} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title={product.activo ? "Desactivar" : "Activar"}
                          onClick={() => void handleToggleStatus(product)}
                        >
                          {product.activo ? (
                            <ToggleRight size={17} />
                          ) : (
                            <ToggleLeft size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default AdminProducts;
