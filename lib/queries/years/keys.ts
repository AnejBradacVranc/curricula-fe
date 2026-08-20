export const yearKeys = {
  all: ["years"] as const,
  lists: () => [...yearKeys.all, "list"] as const,
  list: () => [...yearKeys.lists()] as const,
};
