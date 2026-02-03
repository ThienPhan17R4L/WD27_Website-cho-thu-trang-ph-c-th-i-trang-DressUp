import type { CategoryListResponse } from "../types/category";
import axiosInstance from "./axios";

/**
 * Nếu backend bạn chưa có API categories, tạm thời có thể hardcode,
 * hoặc tạo GET /api/categories.
 */
export async function getCategories() {
  const res = await axiosInstance.get<CategoryListResponse>("/categories", { params: { isActive: true, limit: 200, sort: "sortOrder" } });
  return res.data.items;
}
