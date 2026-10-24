import {
  createProgramSubject,
  deleteProgramSubject,
  updateProgramSubject,
} from "@/lib/api";
import type {
  CreateProgramSubjectRequest,
  DeleteProgramSubjectRequest,
  UpdateProgramSubjectRequest,
} from "@/types";
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { programKeys } from "../programs/keys";
import { teacherKeys } from "../teachers/keys";
import { programSubjectKeys } from "./keys";

function invalidateProgramSubjectQueries(
  queryClient: QueryClient,
  programId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: programSubjectKeys.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: programKeys.detail(programId),
    }),
    queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
  ]);
}

export function useCreateProgramSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramSubjectRequest) =>
      createProgramSubject(data),
    onSuccess: (_data, variables) =>
      invalidateProgramSubjectQueries(queryClient, variables.programId),
  });
}

export function useUpdateProgramSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgramSubjectRequest) =>
      updateProgramSubject(data),
    onSuccess: (_data, variables) =>
      invalidateProgramSubjectQueries(queryClient, variables.programId),
  });
}

export function useDeleteProgramSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteProgramSubjectRequest) =>
      deleteProgramSubject(data),
    onSuccess: (_data, variables) =>
      invalidateProgramSubjectQueries(queryClient, variables.programId),
  });
}
