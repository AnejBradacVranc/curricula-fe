import {
  createProgramYear,
  deleteProgramYear,
  updateProgramYear,
} from "@/lib/api";
import type {
  CreateProgramYearRequest,
  DeleteProgramYearRequest,
  UpdateProgramYearRequest,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programSubjectKeys } from "../program-subjects/keys";
import { programKeys } from "../programs/keys";
import { teacherKeys } from "../teachers/keys";

function invalidateProgramYearQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  programId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: programKeys.detail(programId),
    }),
    queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
    queryClient.invalidateQueries({
      queryKey: programSubjectKeys.lists(),
    }),
    queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
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

export function useDeleteProgramYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteProgramYearRequest) => deleteProgramYear(data),
    onSuccess: (_data, variables) =>
      invalidateProgramYearQueries(queryClient, variables.programId),
  });
}
