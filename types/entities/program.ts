import type { Timestamps } from "./common";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";

export interface Program extends Timestamps {
  id: number;
  name: string;
  schoolId: number;
  availableHours: number;
}

export interface ProgramSubjectItem extends Timestamps {
  subjectId: number;
  teacherId: number | null;
  requiredHours: number;
  subject: Omit<Subject, "schoolId">;
  teacher: Omit<Teacher, "schoolId"> | null;
}

export interface ProgramWithRelations extends Program {
  programSubjects: ProgramSubjectItem[];
}
