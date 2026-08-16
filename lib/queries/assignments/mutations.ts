import { assignTeacher, unassignTeacher } from "@/lib/api";
import type {
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programKeys } from "../programs/keys";
import { teacherKeys } from "../teachers/keys";

export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => assignTeacher(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: teacherKeys.detail(variables.teacherId),
      });
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}

export function useUnassignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteAssignmentRequest) => unassignTeacher(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: teacherKeys.detail(variables.teacherId),
      });
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}
