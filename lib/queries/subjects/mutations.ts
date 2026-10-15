import { createSubject, updateSubject } from "@/lib/api";
import type { CreateSubjectRequest, UpdateSubjectRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { subjectKeys } from "./keys";

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectRequest) => createSubject(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubjectRequest) => updateSubject(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
    },
  });
}
