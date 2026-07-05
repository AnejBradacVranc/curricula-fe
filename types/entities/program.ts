import type { Timestamps } from "./common";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";
import type { ProgramYear, Year } from "./year";

export interface Program extends Timestamps {
  id: number;
  name: string;
  schoolId: number;
  availableHours: number;
}

export interface ProgramSubjectItem extends Timestamps {
  subjectId: number;
  yearId: number;
  teacherId: number | null;
  requiredHours: number;
  subject: Omit<Subject, "schoolId">;
  teacher: Omit<Teacher, "schoolId"> | null;
  programYear: {
    yearId: number;
    numWeeks: number;
    year: Year;
  };
}

export interface ProgramWithRelations extends Program {
  programYears: ProgramYear[];
  programSubjects: ProgramSubjectItem[];
}
