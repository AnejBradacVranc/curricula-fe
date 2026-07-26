export interface CreateTeacherRequest {
  name: string;
  surname: string;
  email: string;
  assignedHours: number;
  color?: string;
}

export interface CreateTeachersRequest {
  teachers: CreateTeacherRequest[];
}

export interface ExtractedTeacher {
  name: string;
  surname: string;
  email: string;
}
