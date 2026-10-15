import { getClasses } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { classKeys } from "./keys";

export function useClasses() {
  return useQuery({
    queryKey: classKeys.list(),
    queryFn: getClasses,
  });
}
