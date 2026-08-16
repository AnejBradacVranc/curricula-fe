import { createProgramYear, updateProgramYear } from "@/lib/api";
import type {
  CreateProgramYearRequest,
  UpdateProgramYearRequest,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programKeys } from "../programs/keys";

export function useCreateProgramYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramYearRequest) => createProgramYear(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}

export function useUpdateProgramYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgramYearRequest) => updateProgramYear(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}
