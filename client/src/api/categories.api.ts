import type { CategoryListResponse, CategoryTreeResponse, Category } from "../types/category";
import axiosInstance from "./axios";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

/**
 * Get categories (public - only active categories)
 */
export async function getCategories() {
  const res = await axiosInstance.get<CategoryListResponse>("/categories", {
    params: { isActive: true, limit: 200, sort: "sortOrder" }
  });
  return res.data.items;
}

/**
 * Get category tree (public) — roots + children grouped by parentId
 */
export async function getCategoryTree() {
  return apiGet<CategoryTreeResponse>("/categories/tree");
}

/**
 * Admin: Get all categories with pagination
 */
export async function getAllCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  return apiGet<CategoryListResponse>("/categories", params);
}

/**
 * Admin: Get category by ID
 */
export async function getCategoryById(id: string) {
  return apiGet<Category>(`/categories/${id}`);
}

/**
 * Admin: Create category
 */
export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}) {
  return apiPost<Category>("/categories", data);
}

/**
 * Admin: Update category
 */
export async function updateCategory(id: string, data: Partial<{
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
}>) {
  return apiPatch<Category>(`/categories/${id}`, data);
}

/**
 * Admin: Delete category
 */
export async function deleteCategory(id: string) {
  return apiDelete(`/categories/${id}`);
}
