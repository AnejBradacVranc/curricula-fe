export const schoolKeys = {
  all: ["schools"] as const,
  lists: () => [...schoolKeys.all, "list"] as const,
  list: () => [...schoolKeys.lists()] as const,
  me: () => [...schoolKeys.all, "me"] as const,
};
