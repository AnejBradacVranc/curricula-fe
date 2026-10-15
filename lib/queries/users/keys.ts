export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,
  byEmail: (email: string) =>
    [...userKeys.all, "by-email", email.toLowerCase()] as const,
};
