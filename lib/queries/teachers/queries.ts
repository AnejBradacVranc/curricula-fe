import { getTeacher, getTeachers } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import { teacherKeys } from "./keys";

export function useTeachers() {
  return useQuery({
    queryKey: teacherKeys.list(),
    queryFn: getTeachers,
  });
}

export function useTeacher(
  id: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => getTeacher(id),
    enabled:
      (options?.enabled ?? true) && Number.isFinite(id) && id > 0,
  });
}
