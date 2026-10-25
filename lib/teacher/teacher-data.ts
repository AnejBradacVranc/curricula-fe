import type { TeacherDetail } from "@/types";
import type { TeacherDetailAssignment } from "@/types/entities/teacher-detail";

export type TeacherAssignmentSection = {
  categoryId: number;
  categoryName: string;
  rows: TeacherDetailAssignment[];
};

export type TeacherAssignmentProgramGroup = {
  programId: number;
  programName: string;
  sections: TeacherAssignmentSection[];
};

export function buildTeacherAssignmentsByProgram(
  teacher?: TeacherDetail | null,
): TeacherAssignmentProgramGroup[] {
  if (!teacher) {
    return [];
  }

  const programs = new Map<
    number,
    {
      programId: number;
      programName: string;
      categories: Map<number, TeacherAssignmentSection>;
    }
  >();

  for (const assignment of teacher.assignments) {
    const { program, subject } = assignment.programSubject;
    const { category } = subject;

    let programGroup = programs.get(program.id);
    if (!programGroup) {
      programGroup = {
        programId: program.id,
        programName: program.name,
        categories: new Map(),
      };
      programs.set(program.id, programGroup);
    }

    const existing = programGroup.categories.get(category.id);
    if (existing) {
      existing.rows.push(assignment);
      continue;
    }

    programGroup.categories.set(category.id, {
      categoryId: category.id,
      categoryName: category.name,
      rows: [assignment],
    });
  }

  return Array.from(programs.values())
    .sort((a, b) => a.programName.localeCompare(b.programName, "sl"))
    .map((programGroup) => ({
      programId: programGroup.programId,
      programName: programGroup.programName,
      sections: Array.from(programGroup.categories.values())
        .sort((a, b) => a.categoryId - b.categoryId)
        .map((section) => ({
          ...section,
          rows: [...section.rows].sort((a, b) =>
            a.programSubject.subject.name.localeCompare(
              b.programSubject.subject.name,
              "sl",
            ),
          ),
        })),
    }));
}
