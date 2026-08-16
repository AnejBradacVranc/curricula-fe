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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}

export function useImportProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportProgramRequest) => importProgram(data),
    onSuccess: (program) => {
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: programKeys.detail(program.id),
      });
      void queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProgram(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
  });
}
