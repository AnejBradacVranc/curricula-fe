import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserNoPassword,
} from "@/types";
import { api, setAccessToken } from "./axios";
import { unwrap } from "./unwrap";

export const login = async (credentials: LoginRequest) => {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    credentials,
  );
  setAccessToken(response.data.data.accessToken);
  return response.data.data;
};

export const register = (data: RegisterRequest) =>
  unwrap(api.post<ApiResponse<UserNoPassword>>("/auth/register", data));

export const logout = () => setAccessToken(null);
