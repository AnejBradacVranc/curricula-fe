import type {
  ApiResponse,
  CreateProgramSubjectRequest,
  DeleteProgramSubjectRequest,
  ProgramSubject,
  ProgramSubjectWithRelations,
  UpdateProgramSubjectRequest,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getProgramSubjects = () =>
  unwrap(
    api.get<ApiResponse<ProgramSubjectWithRelations[]>>(
      "/schools/subject-to-program",
    ),
  );

export const createProgramSubject = (data: CreateProgramSubjectRequest) =>
  unwrap(
    api.post<ApiResponse<ProgramSubject>>("/schools/subject-to-program", data),
  );

export const updateProgramSubject = (data: UpdateProgramSubjectRequest) =>
  unwrap(
    api.patch<ApiResponse<ProgramSubjectWithRelations>>(
      "/schools/subject-to-program",
      data,
    ),
  );

export const deleteProgramSubject = (data: DeleteProgramSubjectRequest) =>
  unwrap(api.delete<ApiResponse<null>>("/schools/subject-to-program", { data }));
