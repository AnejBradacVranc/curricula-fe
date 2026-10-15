import { extractProgram, extractTeachers } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useExtractTeachers() {
  return useMutation({
    mutationFn: (file: File) => extractTeachers(file),
  });
}

export function useExtractProgram() {
  return useMutation({
    mutationFn: (file: File) => extractProgram(file),
  });
}
