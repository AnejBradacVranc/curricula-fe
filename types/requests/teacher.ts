export interface CreateTeacherRequest {
  name: string;
  surname: string;
  email?: string | null;
  assignedHours: number;
  color?: string;
}

export interface CreateTeachersRequest {
  teachers: CreateTeacherRequest[];
}

export interface UpdateTeacherRequest {
  name: string;
  surname: string;
  email?: string | null;
  color?: string | null;
  removeProfileImage?: boolean;
}

export interface ExtractedTeacher {
  name: string;
  surname: string;
  email?: string | null;
}
