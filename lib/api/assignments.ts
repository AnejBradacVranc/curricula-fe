import type {
  ApiResponse,
  Assignment,
  AssignmentWithRelations,
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getAssignments = () =>
  unwrap(
    api.get<ApiResponse<AssignmentWithRelations[]>>("/schools/assignments"),
  );

export const createAssignment = (data: CreateAssignmentRequest) =>
  unwrap(api.post<ApiResponse<Assignment>>("/schools/assignments", data));

export const deleteAssignment = (data: DeleteAssignmentRequest) =>
  unwrap(api.delete<ApiResponse<null>>("/schools/assignments", { data }));
