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
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programKeys } from "../programs/keys";
import { programSubjectKeys } from "./keys";

export function useCreateProgramSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramSubjectRequest) =>
      createProgramSubject(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: programSubjectKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}

export function useUpdateProgramSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgramSubjectRequest) =>
      updateProgramSubject(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: programSubjectKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}

export function useDeleteProgramSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteProgramSubjectRequest) =>
      deleteProgramSubject(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: programSubjectKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}
