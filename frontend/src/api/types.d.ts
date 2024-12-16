export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  stripe_customer_id: string;
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
