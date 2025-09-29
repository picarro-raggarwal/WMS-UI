import {
  Port,
  Species,
  SpeciesThresholdsResponse,
  ThresholdConfig
} from "./thresholds.types";

// All available compounds with their default configurations
export const AVAILABLE_COMPOUNDS = [
  {
    name: "TRIMETHYL_SILANOL",
    units: "ppb",
    defaultWarning: { enabled: false, value: 100 },
    defaultAlarm: { enabled: false, value: 200 },
    portCount: 64 // High port count compound
  },
  {
    name: "HCl",
    units: "ppm",
    defaultWarning: { enabled: false, value: 200 },
    defaultAlarm: { enabled: false, value: 500 },
    portCount: 16
  },
  {
    name: "H2S",
    units: "ppm",
    defaultWarning: { enabled: false, value: 150 },
    defaultAlarm: { enabled: false, value: 400 },
    portCount: 64 // High port count compound
  },
  {
    name: "NH3",
    units: "ppm",
    defaultWarning: { enabled: false, value: 300 },
    defaultAlarm: { enabled: false, value: 600 },
    portCount: 16
  },
  {
    name: "CO",
    units: "ppm",
    defaultWarning: { enabled: false, value: 250 },
    defaultAlarm: { enabled: false, value: 550 },
    portCount: 16
  },
  {
    name: "CH4",
    units: "ppm",
    defaultWarning: { enabled: false, value: 180 },
    defaultAlarm: { enabled: false, value: 450 },
    portCount: 64 // High port count compound
  },
  {
    name: "C2H6",
    units: "ppm",
    defaultWarning: { enabled: false, value: 220 },
    defaultAlarm: { enabled: false, value: 480 },
    portCount: 16
  },
  {
    name: "C3H8",
    units: "ppm",
    defaultWarning: { enabled: false, value: 280 },
    defaultAlarm: { enabled: false, value: 520 },
    portCount: 16
  },
  {
    name: "NO",
    units: "ppm",
    defaultWarning: { enabled: false, value: 120 },
    defaultAlarm: { enabled: false, value: 350 },
    portCount: 16
  },
  {
    name: "NO2",
    units: "ppm",
    defaultWarning: { enabled: false, value: 160 },
    defaultAlarm: { enabled: false, value: 380 },
    portCount: 16
  },
  {
    name: "SO2",
    units: "ppm",
    defaultWarning: { enabled: false, value: 190 },
    defaultAlarm: { enabled: false, value: 420 },
    portCount: 16
  }
];

// Generate random threshold values within realistic ranges
const generateRandomThreshold = (
  baseValue: number,
  variation: number = 0.3
): number => {
  const min = Math.max(0, baseValue * (1 - variation));
  const max = baseValue * (1 + variation);
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
};

// Generate ports for a species
const generatePortsForSpecies = (
  compoundName: string,
  portCount: number,
  defaultWarning: ThresholdConfig,
  defaultAlarm: ThresholdConfig
): Port[] => {
  return Array.from({ length: portCount }, (_, index) => {
    const portId = index + 1;

    // Generate realistic port-specific values with some variation
    const warningValue = generateRandomThreshold(defaultWarning.value, 0.2);
    const alarmValue = generateRandomThreshold(defaultAlarm.value, 0.2);

    // Ensure warning < alarm relationship
    const finalWarningValue = Math.min(warningValue, alarmValue * 0.8);
    const finalAlarmValue = Math.max(alarmValue, finalWarningValue * 1.2);

    return {
      port_id: portId,
      name: `Port ${portId}`,
      alarm: {
        enabled: Math.random() > 0.3, // 70% chance of being enabled
        value: finalAlarmValue
      },
      warning: {
        enabled: Math.random() > 0.2, // 80% chance of being enabled
        value: finalWarningValue
      }
    };
  });
};

// Generate mock data for all available compounds
export const generateMockSpeciesThresholdsData =
  (): SpeciesThresholdsResponse => {
    const species: Species[] = AVAILABLE_COMPOUNDS.map((compound) => {
      const ports = generatePortsForSpecies(
        compound.name,
        compound.portCount,
        compound.defaultWarning,
        compound.defaultAlarm
      );

      return {
        name: compound.name,
        units: compound.units,
        alarm: compound.defaultAlarm,
        warning: compound.defaultWarning,
        ports
      };
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

// Generate mock data for specific compounds only
export const generateMockSpeciesThresholdsDataForCompounds = (
  compoundNames: string[]
): SpeciesThresholdsResponse => {
  const species: Species[] = [];

  compoundNames.forEach((compoundName) => {
    const compoundConfig = AVAILABLE_COMPOUNDS.find(
      (c) => c.name === compoundName
    );

    if (compoundConfig) {
      const ports = generatePortsForSpecies(
        compoundConfig.name,
        compoundConfig.portCount,
        compoundConfig.defaultWarning,
        compoundConfig.defaultAlarm
      );

      species.push({
        name: compoundConfig.name,
        units: compoundConfig.units,
        alarm: compoundConfig.defaultAlarm,
        warning: compoundConfig.defaultWarning,
        ports
      });
    }
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

// Generate empty mock data (no compounds available)
export const generateEmptyMockSpeciesThresholdsData =
  (): SpeciesThresholdsResponse => {
    return {
      species: [],
      default_method: false,
      last_updated_topology: new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", ""),
      last_modified: new Date().toISOString().replace("T", " ").replace("Z", "")
    };
  };

// Utility function to check if a compound exists in the available compounds list
export const isCompoundAvailable = (compoundName: string): boolean => {
  return AVAILABLE_COMPOUNDS.some((compound) => compound.name === compoundName);
};

// Get compound configuration by name
export const getCompoundConfig = (compoundName: string) => {
  return AVAILABLE_COMPOUNDS.find((compound) => compound.name === compoundName);
};

// Get all compound names
export const getAllCompoundNames = (): string[] => {
  return AVAILABLE_COMPOUNDS.map((compound) => compound.name);
};

// Get compounds by units
export const getCompoundsByUnits = (units: string): string[] => {
  return AVAILABLE_COMPOUNDS.filter((compound) => compound.units === units).map(
    (compound) => compound.name
  );
};

// Mock data scenarios for testing different states
export const MOCK_DATA_SCENARIOS = {
  // All compounds available
  ALL_COMPOUNDS: () => generateMockSpeciesThresholdsData(),

  // Only specific compounds available
  SPECIFIC_COMPOUNDS: (names: string[]) =>
    generateMockSpeciesThresholdsDataForCompounds(names),

  // No compounds available
  NO_COMPOUNDS: () => generateEmptyMockSpeciesThresholdsData(),

  // Only gas compounds (ppm)
  GAS_COMPOUNDS_ONLY: () =>
    generateMockSpeciesThresholdsDataForCompounds(getCompoundsByUnits("ppm")),

  // Only TRIMETHYL_SILANOL (ppb)
  SILANOL_ONLY: () =>
    generateMockSpeciesThresholdsDataForCompounds(["TRIMETHYL_SILANOL"]),

  // Common compounds only
  COMMON_COMPOUNDS: () =>
    generateMockSpeciesThresholdsDataForCompounds([
      "HCl",
      "H2S",
      "NH3",
      "CO",
      "CH4"
    ])
};

// Default export for easy importing
export default {
  generateMockSpeciesThresholdsData,
  generateMockSpeciesThresholdsDataForCompounds,
  generateEmptyMockSpeciesThresholdsData,
  isCompoundAvailable,
  getCompoundConfig,
  getAllCompoundNames,
  getCompoundsByUnits,
  MOCK_DATA_SCENARIOS,
  AVAILABLE_COMPOUNDS
};
