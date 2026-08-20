export const teacherKeys = {
  all: ["teachers"] as const,
  list: () => [...teacherKeys.all, "list"] as const,
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (id: number) => [...teacherKeys.details(), id] as const,
};
