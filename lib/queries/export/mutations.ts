import { exportTeacherPdf } from "@/lib/api";
import { exportTeachersPdf } from "@/lib/api/export";
import { useMutation } from "@tanstack/react-query";

export function useExportTeacherPdf() {
  return useMutation({
    mutationFn: (id: number) => exportTeacherPdf(id),
  });
}

export function useExportTeachersPdf() {
  return useMutation({
    mutationFn: (ids: undefined | number[]) => exportTeachersPdf(ids),
  });
}
