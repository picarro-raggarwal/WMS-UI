export const formatMetricLabel = (id: string): string => {
  return id
    .split("_")
    .map((word) => word.toUpperCase())
    .join(" ");
};
