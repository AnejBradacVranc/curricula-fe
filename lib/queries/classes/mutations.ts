import { createClass, deleteClass } from "@/lib/api";
import type { CreateClassRequest, DeleteClassRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programKeys } from "../programs/keys";
import { classKeys } from "./keys";

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassRequest) => createClass(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteClassRequest) => deleteClass(data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}
