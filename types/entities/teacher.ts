import type { Timestamps } from "./common";

export interface Teacher extends Timestamps {
  id: number;
  name: string;
  surname: string;
  email: string;
  schoolId: number;
  assignedHours: number;
}
