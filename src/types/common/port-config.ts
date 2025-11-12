// Shared port configuration state management
// This ensures port names and enabled status are synced across settings and create recipe

import {
  AMBIENT_PORT_NAME,
  AMBIENT_PORT_NUMBER,
  isAmbientPort,
  mockStepNames
} from "./ports";

export interface PortConfig {
  names: Record<number, string>;
  enabled: Record<number, boolean>;
}

const STORAGE_KEY = "port-configuration";

/**
 * Get default port configuration from mock data
 */
const getDefaultConfig = (): PortConfig => {
  const names: Record<number, string> = {};
  const enabled: Record<number, boolean> = {};

  // Add Ambient port (always enabled, cannot be renamed)
  names[AMBIENT_PORT_NUMBER] = AMBIENT_PORT_NAME;
  enabled[AMBIENT_PORT_NUMBER] = true;

  // Add regular ports (1-64)
  for (let i = 1; i <= 64; i++) {
    names[i] = mockStepNames[i] || `Port ${i}`;
    enabled[i] = true;
  }

  return { names, enabled };
};

/**
 * Load port configuration from localStorage or return defaults
 */
export const loadPortConfig = (): PortConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all ports are present
      const defaults = getDefaultConfig();
      return {
        names: { ...defaults.names, ...parsed.names },
        enabled: { ...defaults.enabled, ...parsed.enabled }
      };
    }
  } catch (error) {
    console.error("Error loading port configuration:", error);
  }
  return getDefaultConfig();
};

/**
 * Save port configuration to localStorage
 */
export const savePortConfig = (config: PortConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving port configuration:", error);
  }
};

/**
 * Get port name for a specific port number
 */
export const getPortName = (portNumber: number): string => {
  // Always return Ambient name for Ambient port
  if (isAmbientPort(portNumber)) {
    return AMBIENT_PORT_NAME;
  }
  const config = loadPortConfig();
  return (
    config.names[portNumber] ||
    mockStepNames[portNumber] ||
    `Port ${portNumber}`
  );
};

/**
 * Get enabled status for a specific port number
 */
export const getPortEnabled = (portNumber: number): boolean => {
  // Ambient port is always enabled
  if (isAmbientPort(portNumber)) {
    return true;
  }
  const config = loadPortConfig();
  return config.enabled[portNumber] ?? true;
};

/**
 * Update port name
 */
export const updatePortName = (portNumber: number, name: string): void => {
  // Prevent renaming Ambient port
  if (isAmbientPort(portNumber)) {
    return;
  }
  const config = loadPortConfig();
  config.names[portNumber] = name;
  savePortConfig(config);
  // Dispatch custom event to notify other components
  window.dispatchEvent(
    new CustomEvent("port-config-updated", { detail: config })
  );
};

/**
 * Update port enabled status
 */
export const updatePortEnabled = (
  portNumber: number,
  enabled: boolean
): void => {
  // Prevent disabling Ambient port
  if (isAmbientPort(portNumber)) {
    return;
  }
  const config = loadPortConfig();
  config.enabled[portNumber] = enabled;
  savePortConfig(config);
  // Dispatch custom event to notify other components
  window.dispatchEvent(
    new CustomEvent("port-config-updated", { detail: config })
  );
};

/**
 * Update multiple port names at once
 */
export const updatePortNames = (names: Record<number, string>): void => {
  const config = loadPortConfig();
  // Filter out Ambient port from updates
  const filteredNames = { ...names };
  delete filteredNames[AMBIENT_PORT_NUMBER];
  config.names = { ...config.names, ...filteredNames };
  // Ensure Ambient port name is always correct
  config.names[AMBIENT_PORT_NUMBER] = AMBIENT_PORT_NAME;
  savePortConfig(config);
  window.dispatchEvent(
    new CustomEvent("port-config-updated", { detail: config })
  );
};

/**
 * Update multiple port enabled statuses at once
 */
export const updatePortEnabledStatuses = (
  enabled: Record<number, boolean>
): void => {
  const config = loadPortConfig();
  // Filter out Ambient port from updates
  const filteredEnabled = { ...enabled };
  delete filteredEnabled[AMBIENT_PORT_NUMBER];
  config.enabled = { ...config.enabled, ...filteredEnabled };
  // Ensure Ambient port is always enabled
  config.enabled[AMBIENT_PORT_NUMBER] = true;
  savePortConfig(config);
  window.dispatchEvent(
    new CustomEvent("port-config-updated", { detail: config })
  );
};
