export interface ThresholdConfig {
  enabled: boolean;
  value: number;
}

export interface Port {
  alarm: ThresholdConfig;
  warning: ThresholdConfig;
  name: string;
  port_id: number;
}

export interface Species {
  name: string;
  ports: Port[];
  units: string;
  alarm: ThresholdConfig;
  warning: ThresholdConfig;
}

export interface SpeciesThresholdsResponse {
  species: Species[];
  default_method: boolean;
  last_updated_topology: string;
  last_modified: string;
}

export interface SpeciesThreshold {
  warning: number | null;
  alarm: number | null;
}

export interface PortThresholds {
  [portNumber: number]: SpeciesThreshold;
}

export interface CompoundThresholds {
  [compound: string]: PortThresholds;
}

export type ThresholdType = "warning" | "alarm";

export type Units = "ppm" | "ppb" | "mg/m3";

export interface SpeciesThresholdUpdateRequest {
  species: Species[];
  default_method: boolean;
  last_updated_topology: string;
  last_modified: string;
}

// Update request payload - only species array is sent
export interface SpeciesThresholdUpdatePayload {
  species: Species[];
}
