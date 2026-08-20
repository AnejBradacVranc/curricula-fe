import { getMySchool, getSchools } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { schoolKeys } from "./keys";

export function useSchools() {
  return useQuery({
    queryKey: schoolKeys.list(),
    queryFn: getSchools,
  });
}

export function useMySchool() {
  return useQuery({
    queryKey: schoolKeys.me(),
    queryFn: getMySchool,
  });
}
