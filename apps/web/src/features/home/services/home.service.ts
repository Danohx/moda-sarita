import {
  categoriasApi,
  type Categoria,
} from "@shared/api/categorias.api";
import {
  productosApi,
  type Producto,
} from "@shared/api/productos.api";
import { FALLBACK_CATEGORIES } from "@web/config/store.config";

export type HomeCategory = {
  id: string | number;
  nombre: string;
  descripcion?: string | null;
};

export type HomeData = {
  categories: HomeCategory[];
  products: Producto[];
  hasApiWarning: boolean;
};

function normalizeCategories(categories: Categoria[]): HomeCategory[] {
  return categories
    .filter((category) => category.activo !== false)
    .slice(0, 4)
    .map((category) => ({
      id: category.id,
      nombre: category.nombre,
      descripcion: category.descripcion,
    }));
}

async function loadFeaturedProducts() {
  const featuredResponse = await productosApi.getAllPublic({ destacado: true });
  const featured = featuredResponse.data.filter(
    (product) => product.activo !== false,
  );

  if (featured.length > 0) {
    return featured.slice(0, 8);
  }

  const allResponse = await productosApi.getAllPublic();
  return allResponse.data
    .filter((product) => product.activo !== false)
    .slice(0, 8);
}

export async function getHomeData(): Promise<HomeData> {
  const [categoriesResult, productsResult] = await Promise.allSettled([
    categoriasApi.getAllPublic(),
    loadFeaturedProducts(),
  ]);

  const categories =
    categoriesResult.status === "fulfilled"
      ? normalizeCategories(categoriesResult.value.data)
      : [];

  const products =
    productsResult.status === "fulfilled" ? productsResult.value : [];

  return {
    categories:
      categories.length > 0
        ? categories
        : FALLBACK_CATEGORIES.map((category) => ({ ...category })),
    products,
    hasApiWarning:
      categoriesResult.status === "rejected" || productsResult.status === "rejected",
  };
}
