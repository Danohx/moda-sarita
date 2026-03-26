import { inventarioApi } from "../../../../shared/api/inventario.api";

export const inventarioService = {
  async getExistencias() {
    const response = await inventarioApi.getExistencias();
    return response.data ?? [];
  },

  async getVariantStock(id: string | number) {
    const response = await inventarioApi.getVariantStock(id);
    return response.data;
  },

  async getVariantMovements(id: string | number) {
    const response = await inventarioApi.getVariantMovements(id);
    return response.data ?? [];
  },

  async getProductMovements(id: string | number) {
    const response = await inventarioApi.getProductMovements(id);
    return response.data ?? [];
  },

  async getInventoryTable() {
    const rows = await this.getExistencias();

    return rows.map((item) => ({
      ...item,
      stock: Number(item.stock ?? 0),
      hasStock: Number(item.stock ?? 0) > 0,
      isOutOfStock: Number(item.stock ?? 0) <= 0,
    }));
  },
};