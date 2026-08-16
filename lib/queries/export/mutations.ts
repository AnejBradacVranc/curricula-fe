import { exportTeacherPdf } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useExportTeacherPdf() {
  return useMutation({
    mutationFn: (id: number) => exportTeacherPdf(id),
  });
}
