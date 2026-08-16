import { createSchool } from "@/lib/api";
import type { CreateSchoolRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { schoolKeys } from "./keys";

export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSchoolRequest) => createSchool(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: schoolKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: schoolKeys.me() });
    },
  });
}
