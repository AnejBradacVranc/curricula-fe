import type {
  ApiResponse,
  CreateClassRequest,
  DeleteClassRequest,
  ProgramClass,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const createClass = (data: CreateClassRequest) =>
  unwrap(api.post<ApiResponse<ProgramClass>>("/schools/classes", data));

export const deleteClass = (data: DeleteClassRequest) =>
  unwrap(api.delete<ApiResponse<null>>("/schools/classes", { data }));
