import { getProgramSubjects } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { programSubjectKeys } from "./keys";

export function useProgramSubjects() {
  return useQuery({
    queryKey: programSubjectKeys.list(),
    queryFn: getProgramSubjects,
  });
}
