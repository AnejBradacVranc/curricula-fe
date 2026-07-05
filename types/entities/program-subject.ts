import type { Timestamps } from "./common";
import type { Program } from "./program";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";

export interface ProgramSubject extends Timestamps {
  programId: number;
  subjectId: number;
  teacherId: number | null;
  requiredHours: number;
}

export interface ProgramSubjectWithRelations extends ProgramSubject {
  subject: Omit<Subject, "schoolId">;
  program: Omit<Program, "schoolId">;
  teacher: Omit<Teacher, "schoolId"> | null;
}
