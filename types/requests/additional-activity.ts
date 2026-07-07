export interface CreateAdditionalActivityAssignmentRequest {
  teacherId: number;
  additionalActivityId: number;
  hoursAmount: number;
}

export interface DeleteAdditionalActivityAssignmentRequest {
  teacherId: number;
  additionalActivityId: number;
}
