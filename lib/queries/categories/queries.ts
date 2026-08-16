import { getCategories } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { categoryKeys } from "./keys";

export function useCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
    enabled: options?.enabled ?? true,
  });
}
