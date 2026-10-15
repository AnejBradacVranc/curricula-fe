import { getSubjects } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { subjectKeys } from "./keys";

export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.list(),
    queryFn: getSubjects,
  });
}
