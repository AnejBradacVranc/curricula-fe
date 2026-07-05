import type { ApiResponse } from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getAppInfo = () => unwrap(api.get<ApiResponse<string>>("/"));
