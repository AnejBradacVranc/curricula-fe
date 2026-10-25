import type { TeacherDetail } from "@/types";
import type { TeacherDetailAssignment } from "@/types/entities/teacher-detail";

export type TeacherAssignmentSection = {
  categoryId: number;
  categoryName: string;
  rows: TeacherDetailAssignment[];
};

export function buildTeacherAssignmentSections(
  teacher: TeacherDetail,
): TeacherAssignmentSection[] {
  const sections = new Map<number, TeacherAssignmentSection>();

  for (const assignment of teacher.assignments) {
    const { category } = assignment.programSubject.subject;
    const existing = sections.get(category.id);

    if (existing) {
      existing.rows.push(assignment);
      continue;
    }

    sections.set(category.id, {
      categoryId: category.id,
      categoryName: category.name,
      rows: [assignment],
    });
  }

  return Array.from(sections.values())
    .sort((a, b) => a.categoryId - b.categoryId)
    .map((section) => ({
      ...section,
      rows: [...section.rows].sort((a, b) =>
        a.programSubject.subject.name.localeCompare(
          b.programSubject.subject.name,
          "sl",
        ),
      ),
    }));
}
