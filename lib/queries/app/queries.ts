import { getAppInfo } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { appKeys } from "./keys";

export function useAppInfo() {
  return useQuery({
    queryKey: appKeys.info(),
    queryFn: getAppInfo,
  });
}
