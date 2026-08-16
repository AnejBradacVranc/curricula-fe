import { getYears } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { yearKeys } from "./keys";

export function useYears() {
  return useQuery({
    queryKey: yearKeys.list(),
    queryFn: getYears,
  });
}
