import {
  createAdditionalActivityAssignment,
  deleteAdditionalActivityAssignment,
} from "@/lib/api";
import type {
  CreateAdditionalActivityAssignmentRequest,
  DeleteAdditionalActivityAssignmentRequest,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teacherKeys } from "../teachers/keys";

export function useCreateAdditionalActivityAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdditionalActivityAssignmentRequest) =>
      createAdditionalActivityAssignment(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: teacherKeys.detail(variables.teacherId),
      });
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}

export function useDeleteAdditionalActivityAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteAdditionalActivityAssignmentRequest) =>
      deleteAdditionalActivityAssignment(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: teacherKeys.detail(variables.teacherId),
      });
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}
