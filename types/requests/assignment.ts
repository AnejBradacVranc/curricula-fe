export interface CreateAssignmentRequest {
  subjectId: number;
  teacherId: number;
  programId: number;
  yearId: number;
}

export type DeleteAssignmentRequest = CreateAssignmentRequest;
