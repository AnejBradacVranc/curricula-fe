import type {
  ApiResponse,
  CreateSubjectRequest,
  Subject,
  UpdateSubjectRequest,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getSubjects = () => {
  return unwrap(api.get<ApiResponse<Subject[]>>("/schools/subjects"));
};

export const createSubject = (data: CreateSubjectRequest) =>
  unwrap(api.post<ApiResponse<Subject>>("/schools/subjects", data));

export const updateSubject = (data: UpdateSubjectRequest) =>
  unwrap(api.patch<ApiResponse<Subject>>("/schools/subjects", data));
