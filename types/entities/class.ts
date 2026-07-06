import type { Teacher } from "./teacher";

export interface ClassLabel {
  id: number;
  label: string;
}

export interface ProgramClass {
  id: number;
  programId: number;
  yearId: number;
  labelId: number;
  label: ClassLabel;
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
