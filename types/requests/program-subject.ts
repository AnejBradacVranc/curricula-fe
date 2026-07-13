export interface CreateProgramSubjectRequest {
  programId: number;
  subjectId: number;
  yearId: number;
  requiredHours: number;
}

export interface UpdateProgramSubjectRequest {
  programId: number;
  subjectId: number;
  yearId: number;
  requiredHours: number;
}
