export interface CreateAssignmentRequest {
  classId: number;
  subjectId: number;
  teacherId: number;
  programId: number;
  yearId: number;
}

export type DeleteAssignmentRequest = CreateAssignmentRequest;
