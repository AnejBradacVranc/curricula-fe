import type {
  ApiResponse,
  CreateTeacherRequest,
  Teacher,
  TeacherDetail,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getTeachers = () =>
  unwrap(api.get<ApiResponse<Teacher[]>>("/schools/teachers"));

export const getTeacher = (id: number) =>
  unwrap(api.get<ApiResponse<TeacherDetail | null>>(`/schools/teachers/${id}`));

export const createTeacher = (data: CreateTeacherRequest) =>
  unwrap(api.post<ApiResponse<Teacher>>("/schools/teachers", data));
