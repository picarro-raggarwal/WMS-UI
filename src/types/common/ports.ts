// Common port configuration for the entire application
// This ensures consistency across all pages (method, settings, data-review-2, etc.)

export interface Port {
  id: string;
  portNumber: number;
  name: string;
  bankNumber: number;
  enabled: boolean;
  type: "regular";
}

// Mock step names mapping - this is the source of truth for port names
export const mockStepNames: Record<number, string> = {
  1: "Initialization",
  2: "Calibration",
  3: "Verification",
  4: "Final Check",
  5: "System Check",
  6: "Maintenance",
  7: "Testing",
  8: "Purge",
  9: "Gas Analysis",
  10: "Sample Collection",
  11: "Processing",
  12: "Analysis",
  13: "Diagnostics",
  14: "System Test",
  15: "Validation",
  16: "Environmental Check",
  17: "Monitoring",
  18: "Data Collection",
  19: "Quality Check",
  20: "Verification",
  21: "Validation",
  22: "Final Review",
  23: "Safety Check",
  24: "Protocol Verification",
  25: "System Status",
  26: "Data Init",
  27: "Collection",
  28: "Processing",
  29: "Analysis",
  30: "Final Report",
  31: "Initialization",
  32: "Calibration",
  33: "Verification",
  34: "Final Check",
  35: "System Check",
  36: "Maintenance",
  37: "Testing",
  38: "Purge",
  39: "Gas Analysis",
  40: "Sample Collection",
  41: "Processing",
  42: "Analysis",
  43: "Diagnostics",
  44: "System Test",
  45: "Validation",
  46: "Environmental Check",
  47: "Monitoring",
  48: "Data Collection",
  49: "Quality Check",
  50: "Verification",
  51: "Validation",
  52: "Final Review",
  53: "Safety Check",
  54: "Protocol Verification",
  55: "System Status",
  56: "Data Init",
  57: "Collection",
  58: "Processing",
  59: "Analysis",
  60: "Final Report",
  61: "Initialization",
  62: "Calibration",
  63: "Verification",
  64: "Final Check"
};

/**
 * Get initial port data - single source of truth for all ports
 * This is used across Live-data, Port configuration, and Create recipe
 */
export const getInitialPorts = (): Port[] => {
  return generateAllPorts(true);
};

/**
 * Generate all 64 ports with consistent structure
 * @param enabledByDefault - Whether ports should be enabled by default
 * @returns Array of 64 ports organized by banks
 */
export const generateAllPorts = (enabledByDefault: boolean = true): Port[] => {
  const ports: Port[] = [];

  // Generate 64 regular ports (4 banks of 16 ports each)
  for (let bank = 1; bank <= 4; bank++) {
    for (let portInBank = 1; portInBank <= 16; portInBank++) {
      const portNumber = (bank - 1) * 16 + portInBank;

      ports.push({
        id: `port-${portNumber}`,
        portNumber,
        name: mockStepNames[portNumber] || `Port ${portNumber}`,
        bankNumber: bank,
        enabled: enabledByDefault,
        type: "regular"
      });
    }
  }

  return ports;
};

/**
 * Get ports organized by bank
 * @param ports - Array of ports
 * @returns Object with bank numbers as keys and port arrays as values
 */
export const getPortsByBank = (ports: Port[]): Record<number, Port[]> => {
  return ports.reduce((acc, port) => {
    const bankKey = port.bankNumber;
    if (!acc[bankKey]) {
      acc[bankKey] = [];
    }
    acc[bankKey].push(port);
    return acc;
  }, {} as Record<number, Port[]>);
};

/**
 * Get a port by its ID
 * @param portId - The port ID to find
 * @param ports - Array of ports to search in
 * @returns The port if found, undefined otherwise
 */
export const getPortById = (
  portId: string,
  ports: Port[]
): Port | undefined => {
  return ports.find((port) => port.id === portId);
};

/**
 * Get a port by its port number
 * @param portNumber - The port number to find
 * @param ports - Array of ports to search in
 * @returns The port if found, undefined otherwise
 */
export const getPortByNumber = (
  portNumber: number,
  ports: Port[]
): Port | undefined => {
  return ports.find((port) => port.portNumber === portNumber);
};

/**
 * Get port display name with number
 * @param port - The port object
 * @returns Formatted string like "Port #1 - Initialization"
 */
export const getPortDisplayName = (port: Port): string => {
  return `${port.name}`;
};

/**
 * Get port short display name
 * @param port - The port object
 * @returns Formatted string like "P#1: Initialization"
 */
export const getPortShortDisplayName = (port: Port): string => {
  return `P#${port.portNumber}: ${port.name}`;
};
