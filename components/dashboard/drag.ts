import type { Teacher } from "@/types";

export const TEACHER_DRAG_MIME = "application/x-curricula-teacher";

export type TeacherDragPayload = Pick<Teacher, "id" | "name" | "surname">;

export function setTeacherDragData(
  dataTransfer: DataTransfer,
  teacher: TeacherDragPayload,
) {
  dataTransfer.setData(TEACHER_DRAG_MIME, JSON.stringify(teacher));

  const el = document.createElement("div");

  el.textContent = `${teacher.name[0].toUpperCase()} ${teacher.surname[0].toUpperCase()}`;
  el.style.position = "fixed";
  el.style.top = "-1000px";
  el.style.padding = "6px 12px";
  el.style.backgroundColor = "var(--primary)";
  el.style.color = "var(--primary-foreground)";
  el.style.borderRadius = "var(--radius)";
  el.style.font = "600 14px sans-serif";
  el.style.whiteSpace = "nowrap";

  document.body.appendChild(el);

  dataTransfer.setDragImage(el, 20, 20);

  dataTransfer.effectAllowed = "copy";

  requestAnimationFrame(() => {
    document.body.removeChild(el);
  });
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
