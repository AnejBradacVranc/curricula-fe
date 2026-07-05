import type { ProgramSubjectItem, ProgramWithRelations } from "@/types";

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

export function getAssignmentKey(
  programId: number,
  subjectId: number,
  yearId: number,
) {
  return `${programId}-${subjectId}-${yearId}`;
}
