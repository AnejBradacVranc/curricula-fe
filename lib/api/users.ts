import type { ApiResponse, FindUserByEmailRequest, User } from "@/types";
import { api } from "./axios";
import { unwrap } from "./unwrap";

export const getUsers = () =>
  unwrap(api.get<ApiResponse<User[]>>("/schools/users"));

export const getUserByEmail = (params: FindUserByEmailRequest) =>
  unwrap(
    api.get<ApiResponse<User>>("/schools/users/by-email", { params }),
  );
