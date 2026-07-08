export interface CreateTeacherRequest {
  name: string;
  surname: string;
  email: string;
  assignedHours: number;
  color?: string;
}
