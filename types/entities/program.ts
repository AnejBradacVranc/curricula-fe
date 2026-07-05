import type { Timestamps } from "./common";
import type { Subject } from "./subject";

export interface Program extends Timestamps {
  id: number;
  name: string;
  schoolId: number;
  availableHours: number;
}

export interface ProgramSubjectItem extends Timestamps {
  subjectId: number;
  requiredHours: number;
  subject: Omit<Subject, "schoolId">;
}

export interface ProgramWithRelations extends Program {
  programSubjects: ProgramSubjectItem[];
}
