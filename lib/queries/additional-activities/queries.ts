import { getAdditionalActivities } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { additionalActivityKeys } from "./keys";

export function useAdditionalActivities() {
  return useQuery({
    queryKey: additionalActivityKeys.list(),
    queryFn: getAdditionalActivities,
  });
}
