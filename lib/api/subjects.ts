import type { ApiResponse, CreateSubjectRequest, Subject } from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getSubjects = () =>
  unwrap(api.get<ApiResponse<Subject[]>>("/schools/subjects"));

export const createSubject = (data: CreateSubjectRequest) =>
  unwrap(api.post<ApiResponse<Subject>>("/schools/subjects", data));
