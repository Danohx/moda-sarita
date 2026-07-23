export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  productSlug?: string | null;
  imageUrl?: string | null;
  price: number;
  quantity: number;
  stockAvailable: number;
  sku?: string | null;
  sizeId?: string | null;
  sizeName?: string | null;
  colorId?: string | null;
  colorName?: string | null;
  colorHex?: string | null;
};

export type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

export type CartMutationResult = {
  ok: boolean;
  quantityAdded: number;
  message: string;
};

export type CartValidationIssueType =
  | "UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "QUANTITY_ADJUSTED"
  | "PRICE_UPDATED";

export type CartValidationIssue = {
  variantId: string;
  productName: string;
  type: CartValidationIssueType;
  message: string;
};
