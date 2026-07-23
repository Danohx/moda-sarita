import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import type { Producto } from "@shared/api/productos.api";
import { CatalogProductGrid } from "@web/features/catalog/components/CatalogProductGrid";
import {
  filterProductsByVariants,
  getCatalogOptions,
  getCatalogProducts,
  type CatalogOptions,
} from "@web/features/catalog/services/catalog.service";
import { LoadingCards } from "@web/components/ui/LoadingCards";
import styles from "./CatalogPage.module.css";

const PAGE_SIZE = 12;

function productPrice(product: Producto) {
  return Number(product.precio_desde ?? product.precio_venta ?? 0);
}

function productStock(product: Producto) {
  return Number(
    product.stock_disponible_total ??
      product.stock_total ??
      product.stock_fisico_total ??
      0,
  );
}

function parseOptionalNumber(value: string | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Producto[]>([]);
  const [options, setOptions] = useState<CatalogOptions>({
    categories: [],
    sizes: [],
    colors: [],
  });
  const [matchingVariantProducts, setMatchingVariantProducts] = useState<
    Set<string> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [filteringVariants, setFilteringVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");

  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoria") ?? "";
  const sizeId = searchParams.get("talla") ?? "";
  const colorId = searchParams.get("color") ?? "";
  const minPrice = parseOptionalNumber(searchParams.get("precioMin"));
  const maxPrice = parseOptionalNumber(searchParams.get("precioMax"));
  const inStockOnly = searchParams.get("disponible") === "true";
  const sort = searchParams.get("orden") ?? "destacados";
  const currentPage = Math.max(1, Number(searchParams.get("pagina") ?? 1) || 1);

  useEffect(() => {
    document.title = "Catálogo | Moda Sarita";
  }, []);

  useEffect(() => {
    setSearchText(q);
  }, [q]);

  useEffect(() => {
    let active = true;

    getCatalogOptions().then((data) => {
      if (active) setOptions(data);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalized = searchText.trim();
      if (normalized === q) return;

      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (normalized) next.set("q", normalized);
        else next.delete("q");
        next.delete("pagina");
        return next;
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [q, searchText, setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getCatalogProducts({ q, categoryId })
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((catalogError: unknown) => {
        console.error(catalogError);
        if (active) {
          setProducts([]);
          setError("No se pudo cargar el catálogo. Verifica la conexión con la API.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [q, categoryId]);

  useEffect(() => {
    let active = true;

    if (!sizeId && !colorId) {
      setMatchingVariantProducts(null);
      setFilteringVariants(false);
      return () => {
        active = false;
      };
    }

    setMatchingVariantProducts(null);
    setFilteringVariants(true);
    filterProductsByVariants(products, { sizeId, colorId })
      .then((matches) => {
        if (active) setMatchingVariantProducts(matches);
      })
      .finally(() => {
        if (active) setFilteringVariants(false);
      });

    return () => {
      active = false;
    };
  }, [products, sizeId, colorId]);

  function updateFilter(key: string, value: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("pagina");
      return next;
    });
  }

  function handlePriceChange(key: "precioMin" | "precioMax") {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateFilter(key, event.target.value.replace(/[^0-9.]/g, ""));
    };
  }

  function clearFilters() {
    setSearchText("");
    setSearchParams(new URLSearchParams());
  }

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const price = productPrice(product);
      const stock = productStock(product);

      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      if (inStockOnly && stock <= 0) return false;
      if (
        matchingVariantProducts &&
        !matchingVariantProducts.has(String(product.id))
      ) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sort === "precio-asc") return productPrice(left) - productPrice(right);
      if (sort === "precio-desc") return productPrice(right) - productPrice(left);
      if (sort === "nombre") return left.nombre.localeCompare(right.nombre, "es");
      return Number(Boolean(right.destacado)) - Number(Boolean(left.destacado));
    });
  }, [
    products,
    minPrice,
    maxPrice,
    inStockOnly,
    matchingVariantProducts,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (totalPages > 1) next.set("pagina", String(totalPages));
        else next.delete("pagina");
        return next;
      });
    }
  }, [currentPage, totalPages, setSearchParams]);

  const hasActiveFilters = [...searchParams.keys()].some(
    (key) => key !== "pagina" && key !== "orden",
  );

  const selectedCategory = options.categories.find(
    (category) => String(category.id) === categoryId,
  );

  function setPage(page: number) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (page <= 1) next.delete("pagina");
      else next.set("pagina", String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderFilters(idPrefix: string) {
    return (
      <>
        <div className={styles.filterHeader}>
          <div>
            <span>Refina tu búsqueda</span>
            <strong>Filtros</strong>
          </div>
          <button
            className={styles.closeFilters}
            type="button"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor={`${idPrefix}-catalog-category`}>Categoría</label>
          <select
            id={`${idPrefix}-catalog-category`}
            value={categoryId}
            onChange={(event) => updateFilter("categoria", event.target.value)}
          >
            <option value="">Todas las categorías</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor={`${idPrefix}-catalog-size`}>Talla</label>
          <select
            id={`${idPrefix}-catalog-size`}
            value={sizeId}
            onChange={(event) => updateFilter("talla", event.target.value)}
          >
            <option value="">Todas las tallas</option>
            {options.sizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor={`${idPrefix}-catalog-color`}>Color</label>
          <select
            id={`${idPrefix}-catalog-color`}
            value={colorId}
            onChange={(event) => updateFilter("color", event.target.value)}
          >
            <option value="">Todos los colores</option>
            {options.colors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>Rango de precio</span>
          <div className={styles.priceFields}>
            <label>
              <span>Mínimo</span>
              <input
                inputMode="decimal"
                placeholder="$0"
                value={searchParams.get("precioMin") ?? ""}
                onChange={handlePriceChange("precioMin")}
              />
            </label>
            <label>
              <span>Máximo</span>
              <input
                inputMode="decimal"
                placeholder="$2,000"
                value={searchParams.get("precioMax") ?? ""}
                onChange={handlePriceChange("precioMax")}
              />
            </label>
          </div>
        </div>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) =>
              updateFilter("disponible", event.target.checked ? "true" : "")
            }
          />
          <span>Mostrar solo disponibles</span>
        </label>

        <button
          className={styles.clearButton}
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          <RotateCcw size={17} />
          Limpiar filtros
        </button>
      </>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div className="container">
          <p>Moda para cada momento</p>
          <h1>{selectedCategory?.nombre || "Catálogo"}</h1>
          <span>
            Explora prendas y accesorios disponibles en tiempo real desde Moda
            Sarita.
          </span>
        </div>
      </header>

      <div className={`${styles.content} container`}>
        <aside className={styles.sidebar}>{renderFilters("desktop")}</aside>

        <div
          className={`${styles.mobileOverlay} ${filtersOpen ? styles.mobileOverlayOpen : ""}`}
          onClick={() => setFiltersOpen(false)}
          aria-hidden={!filtersOpen}
        />
        <aside
          className={`${styles.mobileFilters} ${filtersOpen ? styles.mobileFiltersOpen : ""}`}
          aria-hidden={!filtersOpen}
        >
          {renderFilters("mobile")}
        </aside>

        <main className={styles.results}>
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={19} aria-hidden="true" />
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Buscar por nombre o descripción..."
                aria-label="Buscar productos"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <button
              className={styles.filterToggle}
              type="button"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>

            <label className={styles.sortSelect}>
              <span>Ordenar</span>
              <select
                value={sort}
                onChange={(event) => updateFilter("orden", event.target.value)}
              >
                <option value="destacados">Destacados</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre</option>
              </select>
            </label>
          </div>

          <div className={styles.resultMeta} aria-live="polite">
            <strong>{filteredProducts.length}</strong>
            <span>
              {filteredProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
              {filteringVariants ? " · validando variantes..." : ""}
            </span>
          </div>

          {loading || filteringVariants ? (
            <LoadingCards count={9} />
          ) : error ? (
            <div className={styles.stateCard} role="alert">
              <PackageSearch size={38} />
              <h2>No pudimos cargar los productos</h2>
              <p>{error}</p>
              <button type="button" className="button button-primary" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className={styles.stateCard}>
              <PackageSearch size={38} />
              <h2>No encontramos coincidencias</h2>
              <p>Prueba con otra búsqueda o elimina algunos filtros.</p>
              <button type="button" className="button button-secondary" onClick={clearFilters}>
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <CatalogProductGrid products={visibleProducts} />
          )}

          {!loading && !filteringVariants && !error && filteredProducts.length > PAGE_SIZE && (
            <nav className={styles.pagination} aria-label="Paginación del catálogo">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                Página <strong>{safePage}</strong> de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </main>
      </div>
    </section>
  );
}
