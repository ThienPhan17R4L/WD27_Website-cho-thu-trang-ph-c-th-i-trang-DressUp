import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "@/api/products.api";

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 30_000,
  });
}
