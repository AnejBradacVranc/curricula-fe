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

export interface UpdateTeacherRequest {
  name: string;
  surname: string;
  email: string;
  color?: string | null;
}

export interface ExtractedTeacher {
  name: string;
  surname: string;
  email: string;
}
