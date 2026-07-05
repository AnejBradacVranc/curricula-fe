import type { Teacher } from "@/types";

export const TEACHER_DRAG_MIME = "application/x-curricula-teacher";

export type TeacherDragPayload = Pick<Teacher, "id" | "name" | "surname">;

export function setTeacherDragData(
  dataTransfer: DataTransfer,
  teacher: TeacherDragPayload,
) {
  dataTransfer.setData(TEACHER_DRAG_MIME, JSON.stringify(teacher));
  dataTransfer.effectAllowed = "copy";
}

export function getTeacherDragData(
  dataTransfer: DataTransfer,
): TeacherDragPayload | null {
  const raw = dataTransfer.getData(TEACHER_DRAG_MIME);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TeacherDragPayload;
  } catch {
    return null;
  }
}
