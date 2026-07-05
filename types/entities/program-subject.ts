import type { Timestamps } from "./common";
import type { Program } from "./program";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";
import type { Year } from "./year";

export interface ProgramSubject extends Timestamps {
  programId: number;
  subjectId: number;
  yearId: number;
  teacherId: number | null;
  requiredHours: number;
}

export interface ProgramSubjectWithRelations extends ProgramSubject {
  subject: Omit<Subject, "schoolId">;
  program: Omit<Program, "schoolId">;
  teacher: Omit<Teacher, "schoolId"> | null;
  programYear: {
    yearId: number;
    numWeeks: number;
    year: Year;
  };
}
