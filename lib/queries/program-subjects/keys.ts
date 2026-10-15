export const programSubjectKeys = {
  all: ["program-subjects"] as const,
  lists: () => [...programSubjectKeys.all, "list"] as const,
  list: () => [...programSubjectKeys.lists()] as const,
};
