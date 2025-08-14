// Mock data for recipe timeline view
export interface RecipePort {
  portNumber: number;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  isActive: boolean;
  gasType?: string;
  concentration?: number;
  instance?: number; // For smart recipes: which instance of the port this is
}

export interface SmartRecipeStep {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: "maintenance" | "adjustment" | "optimization";
  description: string;
  status: "pending" | "running" | "completed" | "failed";
}

export interface RecipeTimelineItem {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes (base duration)
  totalDuration: number; // in minutes (including smart recipe steps)
  recipeId: number;
  status: "pending" | "running" | "completed" | "failed";
  ports: RecipePort[];
  smartRecipeSteps: SmartRecipeStep[];
  isSmartRecipeActive: boolean;
}

// Generate mock data for the past 24 hours and next 24 hours
export const generateMockRecipeTimeline = (): RecipeTimelineItem[] => {
  const now = new Date();
  const recipes: RecipeTimelineItem[] = [];

  // Start from 24 hours ago
  let currentTime = new Date(now);
  currentTime.setMinutes(0, 0, 0); // Round to start of hour
  currentTime.setHours(currentTime.getHours() - 24); // Go back 24 hours

  // Generate 48 recipes (24 past + 24 future)
  for (let i = 0; i < 48; i++) {
    const recipeStartTime = new Date(
      currentTime.getTime() + i * 60 * 60 * 1000
    );
    const baseDuration = 60; // 1 hour base duration
    const recipeEndTime = new Date(
      recipeStartTime.getTime() + baseDuration * 60 * 1000
    );

    // Smart recipe steps are only generated for recipes that have started (past/current)
    // Future recipes don't have smart recipe steps pre-scheduled
    // Past recipes have higher chance of smart recipe steps since they've had time to trigger
    const isPastRecipe = recipeStartTime < now;
    const hasSmartRecipe =
      recipeStartTime <= now &&
      (isPastRecipe ? Math.random() < 0.6 : Math.random() < 0.3);
    const smartRecipeSteps: SmartRecipeStep[] = [];
    let totalDuration = baseDuration;

    if (hasSmartRecipe) {
      const smartStepTypes: Array<
        "maintenance" | "adjustment" | "optimization"
      > = ["maintenance", "adjustment", "optimization"];

      // Random number of smart steps (1-3)
      const numSteps = Math.floor(Math.random() * 3) + 1;

      for (let s = 0; s < numSteps; s++) {
        // Calculate sequential start time - each step starts after the previous one ends
        let stepStartTime: Date;
        if (s === 0) {
          // First step starts within first 30 minutes of recipe
          stepStartTime = new Date(
            recipeStartTime.getTime() + Math.random() * 30 * 60 * 1000
          );
        } else {
          // Subsequent steps start immediately after the previous step ends
          const previousStep = smartRecipeSteps[s - 1];
          if (!previousStep) {
            // If previous step wasn't added (due to duration constraint), skip this step
            continue;
          }
          stepStartTime = new Date(previousStep.endTime.getTime());
        }

        const stepDuration = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
        const stepEndTime = new Date(
          stepStartTime.getTime() + stepDuration * 60 * 1000
        );

        // Ensure step doesn't extend beyond recipe end
        if (stepEndTime <= recipeEndTime) {
          // Generate more descriptive smart step names and descriptions
          const stepDescriptions = {
            maintenance: [
              "Filter replacement reminder",
              "Sensor cleaning cycle",
              "Flow rate adjustment",
              "Temperature compensation update"
            ],
            adjustment: [
              "Pressure compensation needed",
              "Flow rate optimization",
              "Temperature adjustment required",
              "Gas concentration tuning"
            ],
            optimization: [
              "Performance optimization cycle",
              "Efficiency improvement process",
              "System tuning procedure",
              "Resource optimization check"
            ]
          };

          const stepType = smartStepTypes[s % smartStepTypes.length];
          const descriptions = stepDescriptions[stepType];
          const description =
            descriptions[Math.floor(Math.random() * descriptions.length)];

          smartRecipeSteps.push({
            id: `smart-${i}-${s}`,
            name: `${stepType.charAt(0).toUpperCase() + stepType.slice(1)} ${
              s + 1
            }`,
            startTime: stepStartTime,
            endTime: stepEndTime,
            duration: stepDuration,
            type: stepType,
            description: description,
            status: Math.random() > 0.7 ? "running" : "completed"
          });

          totalDuration += stepDuration;
        } else {
          // If this step doesn't fit, stop adding more steps
          break;
        }
      }
    }

    // Generate ports - when smart recipe is active, only 1 port runs multiple times
    const ports: RecipePort[] = [];
    if (hasSmartRecipe) {
      // Smart recipe active: 1 port that runs multiple times during smart recipe steps
      const smartStepStart = smartRecipeSteps[0]?.startTime || recipeStartTime;
      const smartStepEnd =
        smartRecipeSteps[smartRecipeSteps.length - 1]?.endTime || recipeEndTime;

      // Create multiple instances of the same port during smart recipe execution
      // Ports run sequentially without overlapping - each starts after the previous ends
      const portDuration = 5; // 5 minutes per port instance

      let currentPortTime = new Date(smartStepStart);
      let portInstance = 1;

      while (currentPortTime < smartStepEnd && portInstance <= 8) {
        // Max 8 port instances
        const portEndTime = new Date(
          currentPortTime.getTime() + portDuration * 60 * 1000
        );

        ports.push({
          portNumber: 1, // Always port 1 for smart recipes
          startTime: currentPortTime,
          endTime: portEndTime,
          duration: portDuration,
          isActive: true, // Always active during smart recipe
          gasType: "Smart Gas",
          concentration: Math.floor(Math.random() * 1000) + 100,
          instance: portInstance // Track which instance this is
        });

        // Next port starts immediately after this one ends (no gap)
        currentPortTime = new Date(portEndTime.getTime());
        portInstance++;
      }
    } else {
      // No smart recipe: 6 ports, 10 minutes each (normal operation)
      for (let p = 0; p < 6; p++) {
        const portStartTime = new Date(
          recipeStartTime.getTime() + p * 10 * 60 * 1000
        );
        const portEndTime = new Date(portStartTime.getTime() + 10 * 60 * 1000);

        ports.push({
          portNumber: p + 1,
          startTime: portStartTime,
          endTime: portEndTime,
          duration: 10,
          isActive: Math.random() > 0.3, // 70% chance of being active
          gasType: ["CO2", "CH4", "N2O", "CO", "H2O"][
            Math.floor(Math.random() * 5)
          ],
          concentration: Math.floor(Math.random() * 1000) + 100
        });
      }
    }

    // Determine status based on time with more realistic patterns
    let status: "pending" | "running" | "completed" | "failed" = "pending";
    if (recipeStartTime <= now && recipeEndTime >= now) {
      status = "running";
    } else if (recipeEndTime < now) {
      // Recent past recipes (last 2 hours) have higher chance of still running
      const hoursAgo =
        (now.getTime() - recipeEndTime.getTime()) / (60 * 60 * 1000);
      if (hoursAgo <= 2 && Math.random() < 0.3) {
        status = "running"; // Still running (overdue)
      } else {
        status = Math.random() > 0.1 ? "completed" : "failed";
      }
    }

    // Generate more descriptive recipe names
    const recipeNames = [
      "CO2 Calibration",
      "CH4 Validation",
      "N2O Measurement",
      "CO Analysis",
      "H2O Baseline",
      "Gas Mix Standard",
      "Zero Air Check",
      "Span Gas Test",
      "Multi-Point Cal",
      "Drift Check",
      "Linearity Test",
      "Precision Check"
    ];

    const recipeName = recipeNames[i % recipeNames.length];

    recipes.push({
      id: `recipe-${i}`,
      name: recipeName,
      startTime: recipeStartTime,
      endTime: recipeEndTime,
      duration: baseDuration,
      totalDuration: totalDuration,
      recipeId: i + 1,
      status,
      ports,
      smartRecipeSteps,
      isSmartRecipeActive:
        hasSmartRecipe &&
        smartRecipeSteps.some((step) => step.status === "running")
    });
  }

  return recipes;
};

// Get current recipe (if any)
export const getCurrentRecipe = (
  recipes: RecipeTimelineItem[]
): RecipeTimelineItem | null => {
  const now = new Date();
  return (
    recipes.find(
      (recipe) => recipe.startTime <= now && recipe.endTime >= now
    ) || null
  );
};

// Get upcoming recipes
export const getUpcomingRecipes = (
  recipes: RecipeTimelineItem[],
  count: number = 5
): RecipeTimelineItem[] => {
  const now = new Date();
  return recipes.filter((recipe) => recipe.startTime > now).slice(0, count);
};

// Get completed recipes
export const getCompletedRecipes = (
  recipes: RecipeTimelineItem[],
  count: number = 10
): RecipeTimelineItem[] => {
  const now = new Date();
  return recipes
    .filter((recipe) => recipe.endTime < now && recipe.status === "completed")
    .slice(-count);
};
