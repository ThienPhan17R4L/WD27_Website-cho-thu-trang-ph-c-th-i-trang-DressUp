export type RentalTier = {
  label: string;
  days: number;
  price: number; // VND
};

export type Variant = {
  size: string;
  color?: string;
  skuHint?: string;
};

export type ProductStatus = "active" | "archived";

export type Product = {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  brand?: string;
  material?: string;
  colorFamily?: string;
  description?: string;
  images: string[];
  rentalTiers: RentalTier[];
  depositDefault: number;
  variants: Variant[];
  tags: string[];
  care?: string;
  notes?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  minPrice?: number; // Computed field from backend (min price in rentalTiers)
};

export type ProductListResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// params frontend truyền vào hook (có thể thiếu)
export type ProductListParamsInput = {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  categoryId?: string;
  status?: ProductStatus;
  tag?: string;
  brand?: string;
};

// params thực sự gửi sang API (đã normalize)
export type ProductListParams = {
  page: number;
  limit: number;
  sort?: string;
  q?: string;
  categoryId?: string;
  status?: ProductStatus;
  tag?: string;
  brand?: string;
};

