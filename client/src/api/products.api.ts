import axiosInstance from "@/api/axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Product, ProductListParams, ProductListResponse } from "@/types/product";

/**
 * Get products (public)
 */
export async function getProducts(params: ProductListParams) {
  const res = await axiosInstance.get<ProductListResponse>("/products", {
    params,
  });
  return res.data;
}

/**
 * Get product by slug (public)
 */
export async function getProductBySlug(slug: string) {
  const res = await axiosInstance.get<Product>(`/products/slug/${encodeURIComponent(slug)}`);
  return res.data;
}

/**
 * Admin: Get all products with pagination
 */
export async function getAllProducts(params?: ProductListParams) {
  return apiGet<ProductListResponse>("/products", params);
}

/**
 * Admin: Get product by ID
 */
export async function getProductById(id: string) {
  return apiGet<Product>(`/products/${id}`);
}

/**
 * Admin: Create product
 */
export async function createProduct(data: any) {
  return apiPost<Product>("/products", data);
}

/**
 * Admin: Update product
 */
export async function updateProduct(id: string, data: any) {
  return apiPatch<Product>(`/products/${id}`, data);
}

/**
 * Admin: Delete product
 */
export async function deleteProduct(id: string) {
  return apiDelete(`/products/${id}`);
}

/**
 * Get tag suggestions
 */
export async function getTagSuggestions(query: string) {
  return apiGet<{ tags: string[] }>("/products/tags/suggestions", { q: query });
}
