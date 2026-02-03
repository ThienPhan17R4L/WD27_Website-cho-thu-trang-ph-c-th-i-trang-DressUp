import axiosInstance from "@/api/axios";
import type { Product, ProductListParams, ProductListResponse } from "@/types/product";

export async function getProducts(params: ProductListParams) {
  const res = await axiosInstance.get<ProductListResponse>("/products", {
    params,
  });
  return res.data;
}

export async function getProductBySlug(slug: string) {
  const res = await axiosInstance.get<Product>(`/products/slug/${encodeURIComponent(slug)}`);
  return res.data;
}
