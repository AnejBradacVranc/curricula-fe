import type { ProgramClass, ProgramSubjectItem, ProgramWithRelations } from "@/types";

export type CurriculumSubjectRow = {
  subjectId: number;
  subjectName: string;
  cellsByYearId: Map<number, ProgramSubjectItem>;
};

export function buildCurriculumRows(program: ProgramWithRelations) {
  const rowsBySubject = new Map<number, CurriculumSubjectRow>();

  for (const programSubject of program.programSubjects) {
    const existing = rowsBySubject.get(programSubject.subjectId);

    if (existing) {
      existing.cellsByYearId.set(programSubject.yearId, programSubject);
      continue;
    }

    rowsBySubject.set(programSubject.subjectId, {
      subjectId: programSubject.subjectId,
      subjectName: programSubject.subject.name,
      cellsByYearId: new Map([[programSubject.yearId, programSubject]]),
    });
  }

  return Array.from(rowsBySubject.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName, "sl"),
  );
}

export function getClassesForYear(
  program: ProgramWithRelations,
  yearId: number,
): ProgramClass[] {
  const programYear = program.programYears.find((item) => item.yearId === yearId);

  return [...(programYear?.classes ?? [])].sort((a, b) =>
    a.label.label.localeCompare(b.label.label, "sl"),
  );
}

export function getAssignmentKey(
  programId: number,
  subjectId: number,
  yearId: number,
  classId: number,
) {
  return `${programId}-${subjectId}-${yearId}-${classId}`;
}

export function findAssignmentForClass(
  programSubject: ProgramSubjectItem | undefined,
  classId: number,
) {
  return programSubject?.assignments.find(
    (assignment) => assignment.classId === classId,
  );
}
