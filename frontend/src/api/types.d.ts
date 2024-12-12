export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type PrintifyProductVariant = {
  id: number;
  grams: number;
  sku: string;
  title: string;
  price: number;
  is_available: boolean;
  is_default: boolean;
  is_printify_express_eligible: boolean;
  options: [number, number];
};

export type PrintifyProductImage = {
  id: number;
  is_default: boolean;
  is_selected_for_publishing: boolean;
  order: number | null;
  original_url: string;
  thumbnail: string;
  medium: string;
  large: string;
  variant_ids: number[];
};

export type PrintifyProductColor = {
  id: number;
  title: string;
  colors: string[];
  variant_ids: number[];
};

export type PrintifyProductSize = {
  id: number;
  title: string;
  variant_ids: number[];
};

export type PrintifyProduct = {
  id: string;
  title: string;
  description: string;
  images: PrintifyProductImage[];
  is_locked: boolean;
  is_economy_shipping_eligible: boolean;
  is_economy_shipping_enabled: boolean;
  is_printify_express_eligible: boolean;
  is_printify_express_enabled: boolean;
  is_deleted: boolean;
  visible: boolean;
  variants: PrintifyProductVariant[];
  sizes: PrintifyProductSize[];
  colors: PrintifyProductColor[];
};

// export type ProductImage = {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   image: string;
//   object_id: string;
//   is_default: boolean;
//   content_type: number;
//   color: number;
// };

// export type ProductColor = {
//   id: number;
//   name: string;
//   order: number;
//   product: string;
//   content_type: string;
// };

// export type ProductSize = {
//   id: number;
//   name: string;
//   code: string;
//   order: number;
//   is_active: boolean;
// };

// export type ShirtType = {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   name: string;
//   description: string;
//   base_price_cents: number;
//   gender: string;
// };

// export type Clothing = {
//   id: string;
//   name: string;
//   images: ProductImage[];
//   colors: ProductColor[];
//   available_sizes: ProductSize[];
//   created_at: string;
//   updated_at: string;
//   price_adjustment_cents: number;
//   final_price_cents: number;
//   is_active: boolean;
// };

// export type Shirt = Clothing & {
//   product_type: ShirtType;
// };
