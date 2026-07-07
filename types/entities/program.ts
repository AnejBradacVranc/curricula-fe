import type { ClassSubjectAssignment } from "./class";
import type { Timestamps } from "./common";
import type { Subject } from "./subject";
import type { ProgramYear } from "./year";

export interface Program extends Timestamps {
  id: number;
  name: string;
  schoolId: number;
  //availableHours: number;
}

export interface ProgramSubjectItem extends Timestamps {
  subjectId: number;
  yearId: number;
  requiredHours: number;
  subject: Omit<Subject, "schoolId">;
  programYear: {
    yearId: number;
    numWeeks: number;
    year: ProgramYear["year"];
  };
  assignments: ClassSubjectAssignment[];
}

export interface ProgramWithRelations extends Program {
  programYears: ProgramYear[];
  programSubjects: ProgramSubjectItem[];
}
