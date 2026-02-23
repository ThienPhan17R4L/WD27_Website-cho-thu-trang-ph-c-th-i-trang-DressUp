import { useQuery } from "@tanstack/react-query";
import { getCategories, getCategoryTree } from "@/api/categories.api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60_000,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ["category-tree"],
    queryFn: getCategoryTree,
    staleTime: 5 * 60_000,
  });
}
