import type { ApiResponse, Category } from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getCategories = () =>
  unwrap(api.get<ApiResponse<Category[]>>("/schools/categories"));
