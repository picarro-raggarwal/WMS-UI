export interface MockRecipe {
  recipe_row_id: number;
  recipe_id: string;
  recipe_name: string;
  version_id: number;
  duration: number;
  created_at: number;
  steps: MockRecipeStep[];
}

export interface MockRecipeStep {
  step_id: number;
  duration: number;
  step_sequence: number;
}

export const mockRecipes: MockRecipe[] = [
  {
    recipe_row_id: 1,
    recipe_id: "REC001",
    recipe_name: "Daily Calibration",
    version_id: 1,
    duration: 1800, // 30 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
    steps: [
      { step_id: 1, duration: 300, step_sequence: 0 },
      { step_id: 2, duration: 600, step_sequence: 1 },
      { step_id: 3, duration: 300, step_sequence: 2 },
      { step_id: 4, duration: 600, step_sequence: 3 }
    ]
  },
  {
    recipe_row_id: 2,
    recipe_id: "REC002",
    recipe_name: "Weekly Maintenance",
    version_id: 2,
    duration: 3600, // 1 hour
    created_at: Math.floor(Date.now() / 1000) - 86400 * 14, // 14 days ago
    steps: [
      { step_id: 5, duration: 900, step_sequence: 0 },
      { step_id: 6, duration: 1200, step_sequence: 1 },
      { step_id: 7, duration: 900, step_sequence: 2 },
      { step_id: 8, duration: 600, step_sequence: 3 }
    ]
  },
  {
    recipe_row_id: 3,
    recipe_id: "REC003",
    recipe_name: "Gas Analysis Protocol",
    version_id: 1,
    duration: 2700, // 45 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
    steps: [
      { step_id: 9, duration: 600, step_sequence: 0 },
      { step_id: 10, duration: 900, step_sequence: 1 },
      { step_id: 11, duration: 600, step_sequence: 2 },
      { step_id: 12, duration: 600, step_sequence: 3 }
    ]
  },
  {
    recipe_row_id: 4,
    recipe_id: "REC004",
    recipe_name: "System Diagnostics",
    version_id: 3,
    duration: 1200, // 20 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 1, // 1 day ago
    steps: [
      { step_id: 13, duration: 300, step_sequence: 0 },
      { step_id: 14, duration: 600, step_sequence: 1 },
      { step_id: 15, duration: 300, step_sequence: 2 }
    ]
  },
  {
    recipe_row_id: 5,
    recipe_id: "REC005",
    recipe_name: "Environmental Monitoring",
    version_id: 1,
    duration: 2400, // 40 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 5, // 5 days ago
    steps: [
      { step_id: 16, duration: 600, step_sequence: 0 },
      { step_id: 17, duration: 900, step_sequence: 1 },
      { step_id: 18, duration: 900, step_sequence: 2 }
    ]
  },
  {
    recipe_row_id: 6,
    recipe_id: "REC006",
    recipe_name: "Quality Control Check",
    version_id: 2,
    duration: 1500, // 25 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 10, // 10 days ago
    steps: [
      { step_id: 19, duration: 300, step_sequence: 0 },
      { step_id: 20, duration: 600, step_sequence: 1 },
      { step_id: 21, duration: 300, step_sequence: 2 },
      { step_id: 22, duration: 300, step_sequence: 3 }
    ]
  },
  {
    recipe_row_id: 7,
    recipe_id: "REC007",
    recipe_name: "Safety Protocol",
    version_id: 1,
    duration: 900, // 15 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
    steps: [
      { step_id: 23, duration: 300, step_sequence: 0 },
      { step_id: 24, duration: 300, step_sequence: 1 },
      { step_id: 25, duration: 300, step_sequence: 2 }
    ]
  },
  {
    recipe_row_id: 8,
    recipe_id: "REC008",
    recipe_name: "Data Collection Routine",
    version_id: 4,
    duration: 3300, // 55 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 6, // 6 days ago
    steps: [
      { step_id: 26, duration: 600, step_sequence: 0 },
      { step_id: 27, duration: 900, step_sequence: 1 },
      { step_id: 28, duration: 900, step_sequence: 2 },
      { step_id: 29, duration: 600, step_sequence: 3 },
      { step_id: 30, duration: 300, step_sequence: 4 }
    ]
  },
  {
    recipe_row_id: 9,
    recipe_id: "REC009",
    recipe_name: "Calibration Protocol",
    version_id: 1,
    duration: 1800, // 30 minutes
    created_at: Math.floor(Date.now() / 1000) - 86400 * 1, // 1 day ago
    steps: [
      { step_id: 7, duration: 300, step_sequence: 0 }, // Zero Port
      { step_id: 23, duration: 600, step_sequence: 1 }, // Span Port
      { step_id: 1, duration: 300, step_sequence: 2 }, // Regular Port 1
      { step_id: 2, duration: 600, step_sequence: 3 } // Regular Port 2
    ]
  }
];

// Mock step names mapping
export const mockStepNames: Record<number, string> = {
  1: "Initialization",
  2: "Calibration",
  3: "Verification",
  4: "Final Check",
  5: "System Check",
  6: "Maintenance",
  7: "Zero Port",
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
  23: "Span Port",
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
