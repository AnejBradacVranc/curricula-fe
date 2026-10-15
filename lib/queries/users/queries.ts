import { getUserByEmail, getUsers } from "@/lib/api";
import type { FindUserByEmailRequest } from "@/types";
import { useQuery } from "@tanstack/react-query";

import { userKeys } from "./keys";

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: getUsers,
  });
}

export function useUserByEmail(email: string) {
  const trimmed = email.trim();

  return useQuery({
    queryKey: userKeys.byEmail(trimmed),
    queryFn: () => getUserByEmail({ email: trimmed } satisfies FindUserByEmailRequest),
    enabled: trimmed.length > 0,
  });
}
