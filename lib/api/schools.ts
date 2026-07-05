import type {
  ApiResponse,
  CreateSchoolRequest,
  School,
  SchoolWithRelations,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getSchools = () =>
  unwrap(api.get<ApiResponse<SchoolWithRelations[]>>("/schools"));

export const getMySchool = () =>
  unwrap(api.get<ApiResponse<SchoolWithRelations>>("/schools/me"));

export const createSchool = (data: CreateSchoolRequest) =>
  unwrap(api.post<ApiResponse<School>>("/schools", data));
