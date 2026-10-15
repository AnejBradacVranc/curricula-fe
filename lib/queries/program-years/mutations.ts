import { createProgramYear, updateProgramYear } from "@/lib/api";
import type {
  CreateProgramYearRequest,
  UpdateProgramYearRequest,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programKeys } from "../programs/keys";

function invalidateProgramYearQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  programId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: programKeys.detail(programId),
    }),
    queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
  ]);
}

export function useCreateProgramYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramYearRequest) => createProgramYear(data),
    onSuccess: (_data, variables) =>
      invalidateProgramYearQueries(queryClient, variables.programId),
  });
}

export function useUpdateProgramYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgramYearRequest) => updateProgramYear(data),
    onSuccess: (_data, variables) =>
      invalidateProgramYearQueries(queryClient, variables.programId),
  });
}
