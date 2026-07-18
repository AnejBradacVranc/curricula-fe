import type { Teacher } from "./teacher";

export interface ProgramClass {
  id: number;
  programId: number;
  yearId: number;
  label: string;
}

export interface ClassSubjectAssignment {
  classId: number;
  programId: number;
  subjectId: number;
  yearId: number;
  teacherId: number;
  class: ProgramClass;
  teacher: Omit<Teacher, "schoolId">;
}
