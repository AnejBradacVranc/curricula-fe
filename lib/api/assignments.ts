import type {
  ApiResponse,
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
  ProgramSubjectItem,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const assignTeacher = (data: CreateAssignmentRequest) =>
  unwrap(
    api.post<ApiResponse<ProgramSubjectItem>>("/schools/assignments", data),
  );

export const unassignTeacher = (data: DeleteAssignmentRequest) =>
  unwrap(api.delete<ApiResponse<null>>("/schools/assignments", { data }));
