import { login, register } from "@/lib/api";
import type { LoginRequest, RegisterRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
  });
}
