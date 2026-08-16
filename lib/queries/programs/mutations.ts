import {
  createProgram,
  deleteProgram,
  importProgram,
} from "@/lib/api";
import type { CreateProgramRequest, ImportProgramRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { subjectKeys } from "../subjects/keys";
import { programKeys } from "./keys";

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramRequest) => createProgram(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
  });
}

export function useImportProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportProgramRequest) => importProgram(data),
    onSuccess: (program) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: programKeys.detail(program.id),
        }),
        queryClient.invalidateQueries({ queryKey: subjectKeys.lists() }),
      ]),
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProgram(id),
    onSuccess: (_data, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: programKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: programKeys.lists() }),
      ]),
  });
}
