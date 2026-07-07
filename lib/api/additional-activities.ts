import type {
  AdditionalActivity,
  ApiResponse,
  CreateAdditionalActivityAssignmentRequest,
  DeleteAdditionalActivityAssignmentRequest,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getAdditionalActivities = () =>
  unwrap(
    api.get<ApiResponse<AdditionalActivity[]>>("/schools/additional-activities"),
  );

export const createAdditionalActivityAssignment = (
  data: CreateAdditionalActivityAssignmentRequest,
) =>
  unwrap(
    api.post<ApiResponse<unknown>>(
      "/schools/additional-activity-assignments",
      data,
    ),
  );

export const deleteAdditionalActivityAssignment = (
  data: DeleteAdditionalActivityAssignmentRequest,
) =>
  unwrap(
    api.delete<ApiResponse<null>>("/schools/additional-activity-assignments", {
      data,
    }),
  );
