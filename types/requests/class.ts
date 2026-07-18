export interface CreateClassRequest {
  programId: number;
  yearId: number;
  label: string;
}

export interface DeleteClassRequest {
  id: number;
  programId: number;
  yearId: number;
}
