import {
  categoriasApi,
  type Categoria,
} from "@shared/api/categorias.api";
import { coloresApi, type Color } from "@shared/api/colores.api";
import {
  productoDetalleApi,
  type ProductoDetalleResponseData,
} from "@shared/api/productoDetalle.api";
import { productosApi, type Producto } from "@shared/api/productos.api";
import { tallasApi, type Talla } from "@shared/api/tallas.api";

export type CatalogOptions = {
  categories: Categoria[];
  sizes: Talla[];
  colors: Color[];
};

const detailCache = new Map<string, ProductoDetalleResponseData>();

export async function getCatalogOptions(): Promise<CatalogOptions> {
  const [categoriesResult, sizesResult, colorsResult] = await Promise.allSettled([
    categoriasApi.getAllPublic(),
    tallasApi.getAllPublic(),
    coloresApi.getAllPublic(),
  ]);

  return {
    categories:
      categoriesResult.status === "fulfilled"
        ? categoriesResult.value.data.filter((item) => item.activo !== false)
        : [],
    sizes:
      sizesResult.status === "fulfilled"
        ? sizesResult.value.data.filter((item) => item.activo !== false)
        : [],
    colors:
      colorsResult.status === "fulfilled"
        ? colorsResult.value.data.filter((item) => item.activo !== false)
        : [],
  };
}

export async function getCatalogProducts(filters: {
  q?: string;
  categoryId?: string;
}): Promise<Producto[]> {
  const response = await productosApi.getAllPublic({
    q: filters.q || undefined,
    categoriaId: filters.categoryId || undefined,
  });

  return response.data.filter((product) => product.activo !== false);
}

export async function getProductDetailCached(productId: string | number) {
  const key = String(productId);
  const cached = detailCache.get(key);
  if (cached) return cached;

  const response = await productoDetalleApi.getByProductoIdPublic(productId);
  detailCache.set(key, response.data);
  return response.data;
}

function hasAvailableVariant(
  detail: ProductoDetalleResponseData,
  filters: { sizeId?: string; colorId?: string },
) {
  return detail.variantes.some((variant) => {
    if (variant.activo === false) return false;
    if (filters.sizeId && String(variant.talla_id ?? "") !== filters.sizeId) {
      return false;
    }
    if (filters.colorId && String(variant.color_id ?? "") !== filters.colorId) {
      return false;
    }

    const available =
      Number(variant.stock_fisico ?? 0) - Number(variant.stock_apartado ?? 0);
    return available > 0;
  });
}

export async function filterProductsByVariants(
  products: Producto[],
  filters: { sizeId?: string; colorId?: string },
) {
  if (!filters.sizeId && !filters.colorId) {
    return new Set(products.map((product) => String(product.id)));
  }

  const settled = await Promise.allSettled(
    products.map(async (product) => {
      const detail = await getProductDetailCached(product.id);
      return {
        id: String(product.id),
        matches: hasAvailableVariant(detail, filters),
      };
    }),
  );

  return new Set(
    settled
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<{ id: string; matches: boolean }> =>
          result.status === "fulfilled" && result.value.matches,
      )
      .map((result) => result.value.id),
  );
}
