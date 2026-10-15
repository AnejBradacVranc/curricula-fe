import type {
  ApiResponse,
  CreateProgramRequest,
  ImportProgramRequest,
  Program,
  ProgramWithRelations,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";
import { ProgramLean } from "@/types/entities/program";

export const getPrograms = () =>
  unwrap(api.get<ApiResponse<ProgramLean[]>>("/schools/programs"));

export const getProgram = (id: number) =>
  unwrap(api.get<ApiResponse<ProgramWithRelations>>(`/schools/programs/${id}`));

export const createProgram = (data: CreateProgramRequest) =>
  unwrap(api.post<ApiResponse<Program>>("/schools/programs", data));

export const importProgram = (data: ImportProgramRequest) =>
  unwrap(
    api.post<ApiResponse<ProgramWithRelations>>(
      "/schools/programs/import",
      data,
    ),
  );

export const deleteProgram = (id: number) =>
  unwrap(api.delete<ApiResponse<Program>>(`/schools/programs/${id}`));
