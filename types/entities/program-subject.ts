import type { Timestamps } from "./common";
import type { Program } from "./program";
import type { Subject } from "./subject";

export interface ProgramSubject extends Timestamps {
  programId: number;
  subjectId: number;
  requiredHours: number;
}

export interface ProgramSubjectWithRelations extends ProgramSubject {
  subject: Omit<Subject, "schoolId">;
  program: Omit<Program, "schoolId">;
}
