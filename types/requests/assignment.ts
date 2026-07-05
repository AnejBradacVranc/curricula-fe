export interface CreateAssignmentRequest {
  subjectId: number;
  teacherId: number;
  programId: number;
}

export type DeleteAssignmentRequest = CreateAssignmentRequest;
