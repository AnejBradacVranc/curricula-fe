import type { ProgramClass, ProgramSubjectItem, ProgramWithRelations } from "@/types";

export type CurriculumSubjectRow = {
  subjectId: number;
  subjectName: string;
  subjectAbbrevation: string;
  categoryId: number;
  categoryName: string;
  cellsByYearId: Map<number, ProgramSubjectItem>;
};

export type CurriculumSection = {
  categoryId: number;
  categoryName: string;
  rows: CurriculumSubjectRow[];
};

export function buildCurriculumSections(
  program: ProgramWithRelations,
): CurriculumSection[] {
  const rowsBySubject = new Map<number, CurriculumSubjectRow>();

  for (const programSubject of program.programSubjects) {
    const { subject } = programSubject;
    const category = subject.category;
    const existing = rowsBySubject.get(programSubject.subjectId);

    if (existing) {
      existing.cellsByYearId.set(programSubject.yearId, programSubject);
      continue;
    }

    rowsBySubject.set(programSubject.subjectId, {
      subjectId: programSubject.subjectId,
      subjectName: subject.name,
      subjectAbbrevation: subject.abbrevation,
      categoryId: category?.id ?? subject.categoryId,
      categoryName: category?.name ?? "Brez kategorije",
      cellsByYearId: new Map([[programSubject.yearId, programSubject]]),
    });
  }

  const sections = new Map<number, CurriculumSection>();

  for (const row of rowsBySubject.values()) {
    const section = sections.get(row.categoryId) ?? {
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      rows: [],
    };

    section.rows.push(row);
    sections.set(row.categoryId, section);
  }

  return Array.from(sections.values())
    .sort((a, b) => a.categoryId - b.categoryId)
    .map((section) => ({
      ...section,
      rows: section.rows.sort((a, b) =>
        a.subjectName.localeCompare(b.subjectName, "sl"),
      ),
    }));
}

export function getClassesForYear(
  program: ProgramWithRelations,
  yearId: number,
): ProgramClass[] {
  const programYear = program.programYears.find((item) => item.yearId === yearId);

  return programYear?.classes ?? [];
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
