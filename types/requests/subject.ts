export interface CreateSubjectRequest {
  name: string;
  categoryId: number;
  abbrevation: string;
}

export interface UpdateSubjectRequest {
  id: number;
  name: string;
  categoryId: number;
  abbrevation: string;
}
