import { login, logout, register } from "@/lib/api";
import type { LoginRequest, RegisterRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
