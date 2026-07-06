import type { ClassSubjectAssignment } from "./class";
import type { Timestamps } from "./common";
import type { Program } from "./program";
import type { Subject } from "./subject";
import type { Year } from "./year";

export interface ProgramSubject extends Timestamps {
  programId: number;
  subjectId: number;
  yearId: number;
  requiredHours: number;
}

export interface ProgramSubjectWithRelations extends ProgramSubject {
  subject: Omit<Subject, "schoolId">;
  program: Omit<Program, "schoolId">;
  programYear: {
    yearId: number;
    numWeeks: number;
    year: Year;
  };
  assignments: ClassSubjectAssignment[];
}
