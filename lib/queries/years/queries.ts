import { getYears } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { yearKeys } from "./keys";

export function useYears(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: yearKeys.list(),
    queryFn: getYears,
    enabled: options?.enabled ?? true,
  });
}
