import type { Timestamps } from "./common";

export interface Teacher extends Timestamps {
  id: number;
  name: string;
  surname: string;
  email: string | null;
  color: string | null;
  profileImage: string | null;
  schoolId: number;
  assignedHours: string | number;
  additionalActivityHours: string | number;
  totalHours: string | number;
}
