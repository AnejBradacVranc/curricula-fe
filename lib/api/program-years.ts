import type {
  ApiResponse,
  CreateProgramYearRequest,
  DeleteProgramYearRequest,
  ProgramYear,
  UpdateProgramYearRequest,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const createProgramYear = (data: CreateProgramYearRequest) =>
  unwrap(
    api.post<ApiResponse<ProgramYear>>("/schools/program-years", data),
  );

export const updateProgramYear = (data: UpdateProgramYearRequest) =>
  unwrap(
    api.patch<ApiResponse<ProgramYear>>("/schools/program-years", data),
  );

export const deleteProgramYear = (data: DeleteProgramYearRequest) =>
  unwrap(
    api.delete<ApiResponse<ProgramYear>>("/schools/program-years", { data }),
  );
