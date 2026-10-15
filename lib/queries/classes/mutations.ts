import { createClass, deleteClass } from "@/lib/api";
import type { CreateClassRequest, DeleteClassRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { programKeys } from "../programs/keys";
import { classKeys } from "./keys";

function invalidateClassQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  programId: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: classKeys.lists() }),
    queryClient.invalidateQueries({
      queryKey: programKeys.detail(programId),
    }),
    queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
  ]);
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassRequest) => createClass(data),
    onSuccess: (_data, variables) =>
      invalidateClassQueries(queryClient, variables.programId),
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteClassRequest) => deleteClass(data),
    onSuccess: (_data, variables) =>
      invalidateClassQueries(queryClient, variables.programId),
  });
}
