import { assignTeacher, unassignTeacher } from "@/lib/api";
import type {
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programKeys } from "../programs/keys";
import { teacherKeys } from "../teachers/keys";

function invalidateAssignmentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  programId: number,
  teacherId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: programKeys.detail(programId),
    }),
    queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
    queryClient.invalidateQueries({
      queryKey: teacherKeys.detail(teacherId),
    }),
    queryClient.invalidateQueries({ queryKey: teacherKeys.list() }),
  ]);
}

export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => assignTeacher(data),
    onSuccess: (_data, variables) =>
      invalidateAssignmentQueries(
        queryClient,
        variables.programId,
        variables.teacherId,
      ),
  });
}

export function useUnassignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteAssignmentRequest) => unassignTeacher(data),
    onSuccess: (_data, variables) =>
      invalidateAssignmentQueries(
        queryClient,
        variables.programId,
        variables.teacherId,
      ),
  });
}
