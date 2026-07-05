import type {
  ApiResponse,
  CreateProgramRequest,
  Program,
  ProgramWithRelations,
} from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getPrograms = () =>
  unwrap(api.get<ApiResponse<ProgramWithRelations[]>>("/schools/programs"));

export const createProgram = (data: CreateProgramRequest) =>
  unwrap(api.post<ApiResponse<Program>>("/schools/programs", data));
