import type { ApiResponse, Year } from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getYears = () =>
  unwrap(api.get<ApiResponse<Year[]>>("/schools/years"));
