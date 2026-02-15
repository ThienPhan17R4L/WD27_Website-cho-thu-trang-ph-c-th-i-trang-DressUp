import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products.api";
import type {
  ProductListParams,
  ProductListParamsInput,
} from "@/types/product";

export function useProducts(input: ProductListParamsInput) {
  const params: ProductListParams = useMemo(
    () => ({
      page: input.page ?? 1,
      limit: input.limit ?? 12,
      sort: input.sort,
      q: input.q?.trim() || undefined,
      categoryId: input.categoryId || undefined,
      status: input.status,
      tag: input.tag,
      brand: input.brand,
      priceMin: input.priceMin || undefined,
      priceMax: input.priceMax || undefined,
    }),
    [input]
  );

  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    staleTime: 30_000,

    placeholderData: (previousData) => previousData,
  });
}
