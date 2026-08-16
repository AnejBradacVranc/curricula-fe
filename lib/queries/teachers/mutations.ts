import {
  createTeacher,
  createTeachers,
  deleteTeacher,
  updateTeacher,
} from "@/lib/api";
import type {
  CreateTeacherRequest,
  CreateTeachersRequest,
  UpdateTeacherRequest,
} from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teacherKeys } from "./keys";

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherRequest) => createTeacher(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}

export function useCreateTeachers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeachersRequest) => createTeachers(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}

export function useUpdateTeacher(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      profileImage,
    }: {
      data: UpdateTeacherRequest;
      profileImage?: File | null;
    }) => updateTeacher(id, data, profileImage),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTeacher(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: teacherKeys.list() });
    },
  });
}
