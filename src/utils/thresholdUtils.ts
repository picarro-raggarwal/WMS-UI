export interface Threshold {
  warning: number | null;
  alarm: number | null;
}

export interface PortThresholds {
  [portNumber: number]: Threshold;
}

export interface CompoundThresholds {
  [compound: string]: PortThresholds;
}

/**
 * Generates mock threshold values for 64 ports
 * Warning: 100-500, Alarm: 501-1000
 */
export const generateMockPortThresholds = (): PortThresholds => {
  console.log("Generating mock port thresholds for 64 ports");

  const thresholds: PortThresholds = {};

  for (let port = 1; port <= 64; port++) {
    // Generate random values within ranges
    const warning = Math.floor(Math.random() * 401) + 100; // 100-500
    const alarm = Math.floor(Math.random() * 500) + 501; // 501-1000

    thresholds[port] = { warning, alarm };
  }

  console.log("Generated port thresholds sample:", {
    port1: thresholds[1],
    port2: thresholds[2],
    port64: thresholds[64]
  });

  return thresholds;
};

/**
 * Generates mock compound thresholds for all compounds
 */
export const generateMockCompoundThresholds = (
  compounds: string[]
): CompoundThresholds => {
  console.log("Generating mock data for compounds:", compounds);

  const compoundThresholds: CompoundThresholds = {};

  compounds.forEach((compound) => {
    console.log(`Generating data for compound: ${compound}`);
    compoundThresholds[compound] = generateMockPortThresholds();
  });

  console.log("Generated compound thresholds:", compoundThresholds);
  return compoundThresholds;
};

/**
 * Validates threshold values
 */
export const validateThreshold = (
  warning: number | null,
  alarm: number | null
): string | null => {
  if (warning !== null && alarm !== null && warning >= alarm) {
    return "Warning value must be less than alarm value";
  }
  if (warning !== null && warning < 0) {
    return "Warning value must be positive";
  }
  if (alarm !== null && alarm < 0) {
    return "Alarm value must be positive";
  }
  if (warning !== null && warning > 1000) {
    return "Warning value cannot exceed 1000";
  }
  if (alarm !== null && alarm > 1000) {
    return "Alarm value cannot exceed 1000";
  }
  return null;
};

/**
 * Validates individual port threshold
 */
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

/**
 * Clears all port thresholds for a compound
 */
export const clearAllPortThresholds = (
  compoundThresholds: CompoundThresholds,
  compound: string
): CompoundThresholds => {
  const updated = { ...compoundThresholds };
  const portThresholds = { ...updated[compound] };

  // Clear all ports for this compound
  for (let port = 1; port <= 64; port++) {
    portThresholds[port] = { warning: null, alarm: null };
  }

  updated[compound] = portThresholds;
  return updated;
};

/**
 * Sets all ports to the same threshold values for a compound
 */
export const setAllPortThresholds = (
  compoundThresholds: CompoundThresholds,
  compound: string,
  warning: number | null,
  alarm: number | null
): CompoundThresholds => {
  const updated = { ...compoundThresholds };
  const portThresholds = { ...updated[compound] };

  // Set all ports to the same values
  for (let port = 1; port <= 64; port++) {
    portThresholds[port] = { warning, alarm };
  }

  updated[compound] = portThresholds;
  return updated;
};

/**
 * Compares original and current values to determine which ports were updated
 */
export const getUpdatedPorts = (
  originalThresholds: CompoundThresholds,
  currentThresholds: CompoundThresholds,
  compound: string
): Set<number> => {
  const updatedPorts = new Set<number>();
  const original = originalThresholds[compound];
  const current = currentThresholds[compound];

  if (!original || !current) return updatedPorts;

  for (let port = 1; port <= 64; port++) {
    const originalPort = original[port];
    const currentPort = current[port];

    if (!originalPort || !currentPort) continue;

    if (
      originalPort.warning !== currentPort.warning ||
      originalPort.alarm !== currentPort.alarm
    ) {
      updatedPorts.add(port);
    }
  }

  return updatedPorts;
};
