import type { Role } from "../enums/role";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  schoolId: number;
  name?: string;
  surname?: string;
  role?: Role;
}

export interface LoginResponse {
  accessToken: string;
}
