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

function invalidateTeacherQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  teacherId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: teacherKeys.detail(teacherId),
    }),
    queryClient.invalidateQueries({ queryKey: teacherKeys.list() }),
  ]);
}

export function useCreateAdditionalActivityAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdditionalActivityAssignmentRequest) =>
      createAdditionalActivityAssignment(data),
    onSuccess: (_data, variables) =>
      invalidateTeacherQueries(queryClient, variables.teacherId),
  });
}

export function useDeleteAdditionalActivityAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteAdditionalActivityAssignmentRequest) =>
      deleteAdditionalActivityAssignment(data),
    onSuccess: (_data, variables) =>
      invalidateTeacherQueries(queryClient, variables.teacherId),
  });
}
