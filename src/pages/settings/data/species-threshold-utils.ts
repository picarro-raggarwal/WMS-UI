import {
  CompoundThresholds,
  SpeciesThreshold,
  SpeciesThresholdsResponse
} from "./thresholds.types";

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
  currentThreshold: SpeciesThreshold
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

// Validation function for API threshold config
export const validateThresholdConfig = (threshold: {
  enabled: boolean;
  value: number;
}): string | null => {
  if (!threshold.enabled) {
    return null; // Disabled thresholds are always valid
  }

  if (threshold.value < 0) {
    return "Threshold value cannot be negative";
  }

  if (threshold.value > 1000) {
    return "Threshold value cannot exceed 1000";
  }

  return null;
};

// Validation function for warning vs alarm relationship in API format
export const validateApiThresholdRelationship = (
  warning: { enabled: boolean; value: number },
  alarm: { enabled: boolean; value: number }
): string | null => {
  if (!warning.enabled || !alarm.enabled) {
    return null; // If either is disabled, no relationship validation needed
  }

  if (warning.value >= alarm.value) {
    return "Warning value must be less than alarm value";
  }

  return null;
};

// Validation function for port threshold in API format
export const validateApiPortThreshold = (
  type: "warning" | "alarm",
  threshold: { enabled: boolean; value: number },
  otherThreshold: { enabled: boolean; value: number }
): string | null => {
  // First validate the individual threshold
  const individualError = validateThresholdConfig(threshold);
  if (individualError) {
    return individualError;
  }

  // Then validate the relationship between warning and alarm
  if (type === "warning") {
    return validateApiThresholdRelationship(threshold, otherThreshold);
  } else {
    return validateApiThresholdRelationship(otherThreshold, threshold);
  }
};

// ============================================================================
// DATA CONVERSION FUNCTIONS
// ============================================================================

export const convertApiToLegacyFormat = (
  apiData: SpeciesThresholdsResponse
): CompoundThresholds => {
  const result: CompoundThresholds = {};

  apiData.species.forEach((species) => {
    result[species.name] = {};
    species.ports.forEach((port) => {
      result[species.name][port.port_id] = {
        warning: port.warning.enabled ? port.warning.value : null,
        alarm: port.alarm.enabled ? port.alarm.value : null
      };
    });
  });

  return result;
};

export const convertLegacyToApiFormat = (
  legacyData: CompoundThresholds
): SpeciesThresholdsResponse => {
  const species: any[] = [];

  Object.entries(legacyData).forEach(([compoundName, ports]) => {
    const portsArray: any[] = [];

    Object.entries(ports).forEach(([portIdStr, threshold]) => {
      const portId = parseInt(portIdStr, 10);
      portsArray.push({
        port_id: portId,
        name: "",
        alarm: {
          enabled: threshold.alarm !== null,
          value: threshold.alarm || 0
        },
        warning: {
          enabled: threshold.warning !== null,
          value: threshold.warning || 0
        }
      });
    });

    species.push({
      name: compoundName,
      units: "ppm", // Default unit
      alarm: { enabled: false, value: 0 },
      warning: { enabled: false, value: 0 },
      ports: portsArray
    });
  });

  return {
    species,
    default_method: false,
    last_updated_topology: new Date()
      .toISOString()
      .replace("T", " ")
      .replace("Z", ""),
    last_modified: new Date().toISOString().replace("T", " ").replace("Z", "")
  };
};

// ============================================================================
// SPECIES DEFAULT UPDATE FUNCTIONS
// ============================================================================

export const checkAndUpdateSpeciesDefaults = (
  apiData: SpeciesThresholdsResponse
): SpeciesThresholdsResponse => {
  return {
    ...apiData,
    species: apiData.species.map((species) => {
      if (species.ports.length === 0) return species;

      // Optimize: single pass to check both warning and alarm values
      const firstPort = species.ports[0];
      const allSameWarning = species.ports.every(
        (p) => p.warning.value === firstPort.warning.value
      );
      const allSameAlarm = species.ports.every(
        (p) => p.alarm.value === firstPort.alarm.value
      );

      return {
        ...species,
        warning: { enabled: allSameWarning, value: firstPort.warning.value },
        alarm: { enabled: allSameAlarm, value: firstPort.alarm.value }
      };
    })
  };
};

// ============================================================================
// PORT UPDATE UTILITIES
// ============================================================================

export const updatePortThreshold = (
  portThresholds: CompoundThresholds,
  compound: string,
  port: number,
  type: "warning" | "alarm",
  value: number | null
): CompoundThresholds => {
  const compoundData = portThresholds[compound];
  if (!compoundData) return portThresholds;

  const portData = compoundData[port];
  if (!portData) return portThresholds;

  // Only update if value actually changed
  if (portData[type] === value) return portThresholds;

  return {
    ...portThresholds,
    [compound]: {
      ...compoundData,
      [port]: {
        ...portData,
        [type]: value
      }
    }
  };
};

export const updateAllPortsForCompound = (
  portThresholds: CompoundThresholds,
  compound: string,
  warning: number | null,
  alarm: number | null
): CompoundThresholds => {
  const compoundData = portThresholds[compound];
  if (!compoundData) return portThresholds;

  const updatedCompoundData = { ...compoundData };

  // Update all existing ports for this compound
  Object.keys(updatedCompoundData).forEach((portIdStr) => {
    const portId = parseInt(portIdStr, 10);
    updatedCompoundData[portId] = {
      warning,
      alarm
    };
  });

  return {
    ...portThresholds,
    [compound]: updatedCompoundData
  };
};

export const clearAllPortsForCompound = (
  portThresholds: CompoundThresholds,
  compound: string
): CompoundThresholds => {
  const compoundData = portThresholds[compound];
  if (!compoundData) return portThresholds;

  const updatedCompoundData = { ...compoundData };

  // Clear all existing ports for this compound
  Object.keys(updatedCompoundData).forEach((portIdStr) => {
    const portId = parseInt(portIdStr, 10);
    updatedCompoundData[portId] = {
      warning: null,
      alarm: null
    };
  });

  return {
    ...portThresholds,
    [compound]: updatedCompoundData
  };
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const validateThresholdsWithError = (
  warning: number | null,
  alarm: number | null,
  compound: string,
  portNumber?: number
): { isValid: boolean; error?: string } => {
  const validationError = validateThreshold(warning, alarm);

  if (validationError) {
    return { isValid: false, error: validationError };
  }

  // Additional validation checks
  if (warning !== null && warning > 1000) {
    return { isValid: false, error: "Warning value cannot exceed 1000" };
  }

  if (alarm !== null && alarm > 1000) {
    return { isValid: false, error: "Alarm value cannot exceed 1000" };
  }

  return { isValid: true };
};

export const validateInlineEdit = (
  type: "warning" | "alarm",
  value: number | null,
  currentThreshold: SpeciesThreshold
): { isValid: boolean; error?: string } => {
  const errorMessage = validatePortThreshold(type, value, currentThreshold);

  if (errorMessage) {
    return { isValid: false, error: errorMessage };
  }

  return { isValid: true };
};
