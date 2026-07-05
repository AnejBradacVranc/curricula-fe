import type { Timestamps } from "./common";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";

export interface Assignment extends Timestamps {
  subjectId: number;
  teacherId: number;
}

export interface AssignmentWithRelations extends Assignment {
  subject: Omit<Subject, "schoolId">;
  teacher: Omit<Teacher, "schoolId">;
}
