import { Threshold } from "../data/species-threshold-mock-data";

// Validation function for threshold values
export const validateThreshold = (
  warning: number | null,
  alarm: number | null
): string | null => {
  if (warning === null && alarm === null) {
    return null;
  }

  // Check if Warning or Alarm greater then 1000
  if (warning !== null && warning > 1000) {
    return "Warning value must be less than 1000";
  }
  if (alarm !== null && alarm > 1000) {
    return "Alarm value must be less than 1000";
  }

  // Check if warning is less than alarm when both exist
  if (warning !== null && alarm !== null && warning >= alarm) {
    return "Warning value must be less than alarm value";
  }

  return null;
};

// Validation function for individual port threshold values
export const validatePortThreshold = (
  type: "warning" | "alarm",
  value: number | null,
  currentThreshold: Threshold
): string | null => {
  if (value === null) return null;

  // Check max value
  if (value > 1000) {
    return `${
      type === "warning" ? "Warning" : "Alarm"
    } value cannot exceed 1000`;
  }

  // Check warning < alarm relationship
  if (
    type === "warning" &&
    currentThreshold.alarm !== null &&
    value >= currentThreshold.alarm
  ) {
    return "Warning value must be less than alarm value";
  }

  if (
    type === "alarm" &&
    currentThreshold.warning !== null &&
    currentThreshold.warning >= value
  ) {
    return "Warning value must be less than alarm value";
  }

  return null;
};

// Helper function to check if a port has unsaved changes
export const hasUnsavedChanges = (editedPorts: Set<string>): boolean => {
  return editedPorts.size > 0;
};
