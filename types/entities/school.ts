import type { Timestamps } from "./common";
import type { Program } from "./program";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";

export interface School extends Timestamps {
  id: number;
  name: string;
  tel: string | null;
  email: string | null;
  address: string | null;
}

export type SchoolProgram = Omit<Program, "schoolId">;
export type SchoolSubject = Omit<Subject, "schoolId">;
export type SchoolTeacher = Omit<Teacher, "schoolId">;

export interface SchoolWithRelations extends School {
  programs: SchoolProgram[];
  subjects: SchoolSubject[];
  teachers: SchoolTeacher[];
}
