export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type ProductImage = {
  id: string;
  created_at: string;
  updated_at: string;
  image: string;
  object_id: string;
  is_default: boolean;
  content_type: number;
  color: number;
};

export type ProductColor = {
  id: number;
  name: string;
  order: number;
  product: string;
  content_type: string;
};

export type ProductSize = {
  id: number;
  name: string;
  code: string;
  order: number;
  is_active: boolean;
};

export type ShirtType = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  base_price_cents: number;
  gender: string;
};

export type Clothing = {
  id: string;
  name: string;
  images: ProductImage[];
  colors: ProductColor[];
  available_sizes: ProductSize[];
  created_at: string;
  updated_at: string;
  price_adjustment_cents: number;
  final_price_cents: number;
  is_active: boolean;
};

export type Shirt = Clothing & {
  product_type: ShirtType;
};
