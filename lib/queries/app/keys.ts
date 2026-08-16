export const appKeys = {
  all: ["app"] as const,
  info: () => [...appKeys.all, "info"] as const,
};
