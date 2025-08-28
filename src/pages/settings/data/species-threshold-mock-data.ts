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

// Mock threshold limits for compounds
export const mockThresholdLimits: Record<
  string,
  { warning: number; alarm: number }
> = {
  HCl: { warning: 200, alarm: 500 },
  H2S: { warning: 150, alarm: 400 },
  NH3: { warning: 300, alarm: 600 },
  CO: { warning: 250, alarm: 550 },
  CH4: { warning: 180, alarm: 450 },
  C2H6: { warning: 220, alarm: 480 },
  C3H8: { warning: 280, alarm: 520 },
  NO: { warning: 120, alarm: 350 },
  NO2: { warning: 160, alarm: 380 },
  SO2: { warning: 190, alarm: 420 }
};

// Compounds available for threshold configuration
export const compounds = [
  "HCl",
  "H2S",
  "NH3",
  "CO",
  "CH4",
  "C2H6",
  "C3H8",
  "NO",
  "NO2",
  "SO2"
];

// Total number of ports
export const portCount = 64;

// Generate mock port thresholds for all compounds
export const generateMockCompoundThresholds = (): CompoundThresholds => {
  const mockData: CompoundThresholds = {};

  compounds.forEach((compound) => {
    mockData[compound] = {};
    for (let port = 1; port <= portCount; port++) {
      // Generate mock values as per requirements: Warning 100-500, Alarm 501-1000
      const warning = Math.floor(Math.random() * 401) + 100; // 100-500
      const alarm = Math.floor(Math.random() * 500) + 501; // 501-1000
      mockData[compound][port] = { warning, alarm };
    }
  });

  return mockData;
};

// Default threshold values for compounds
export const defaultThresholds: Record<string, Threshold> = {
  HCl: { warning: 200, alarm: 500 },
  H2S: { warning: 150, alarm: 400 },
  NH3: { warning: 300, alarm: 600 },
  CO: { warning: 250, alarm: 550 },
  CH4: { warning: 180, alarm: 450 },
  C2H6: { warning: 220, alarm: 480 },
  C3H8: { warning: 280, alarm: 520 },
  NO: { warning: 120, alarm: 350 },
  NO2: { warning: 160, alarm: 380 },
  SO2: { warning: 190, alarm: 420 }
};
