export const additionalActivityKeys = {
  all: ["additional-activities"] as const,
  lists: () => [...additionalActivityKeys.all, "list"] as const,
  list: () => [...additionalActivityKeys.lists()] as const,
};
