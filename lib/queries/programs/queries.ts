import { getProgram, getPrograms } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { programKeys } from "./keys";

export function usePrograms() {
  return useQuery({
    queryKey: programKeys.list(),
    queryFn: getPrograms,
  });
}

export function useProgram(id: number) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => getProgram(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
