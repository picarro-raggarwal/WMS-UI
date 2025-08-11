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
  type: "calibration" | "validation" | "maintenance";
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

// Generate mock data for the next 24 hours
export const generateMockRecipeTimeline = (): RecipeTimelineItem[] => {
  const now = new Date();
  const recipes: RecipeTimelineItem[] = [];

  // Start from the current hour
  let currentTime = new Date(now);
  currentTime.setMinutes(0, 0, 0); // Round to start of hour

  // Generate 24 recipes (one per hour)
  for (let i = 0; i < 24; i++) {
    const recipeStartTime = new Date(
      currentTime.getTime() + i * 60 * 60 * 1000
    );
    const baseDuration = 60; // 1 hour base duration
    const recipeEndTime = new Date(
      recipeStartTime.getTime() + baseDuration * 60 * 1000
    );

    // Generate smart recipe steps (30% chance of having smart recipe steps)
    const hasSmartRecipe = Math.random() < 0.3;
    const smartRecipeSteps: SmartRecipeStep[] = [];
    let totalDuration = baseDuration;

    if (hasSmartRecipe) {
      const smartStepTypes: Array<
        "calibration" | "validation" | "maintenance"
      > = ["calibration", "validation", "maintenance"];

      // Random number of smart steps (1-3)
      const numSteps = Math.floor(Math.random() * 3) + 1;

      for (let s = 0; s < numSteps; s++) {
        const stepStartTime = new Date(
          recipeStartTime.getTime() + Math.random() * 30 * 60 * 1000
        );
        const stepDuration = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
        const stepEndTime = new Date(
          stepStartTime.getTime() + stepDuration * 60 * 1000
        );

        // Ensure step doesn't extend beyond recipe end
        if (stepEndTime <= recipeEndTime) {
          smartRecipeSteps.push({
            id: `smart-${i}-${s}`,
            name: `${
              smartStepTypes[s % smartStepTypes.length]
                .charAt(0)
                .toUpperCase() +
              smartStepTypes[s % smartStepTypes.length].slice(1)
            } Step ${s + 1}`,
            startTime: stepStartTime,
            endTime: stepEndTime,
            duration: stepDuration,
            type: smartStepTypes[s % smartStepTypes.length],
            description: `Automated ${
              smartStepTypes[s % smartStepTypes.length]
            } process`,
            status: Math.random() > 0.7 ? "running" : "pending"
          });

          totalDuration += stepDuration;
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
      const portDuration = 5; // 5 minutes per port instance
      const portInterval = 8; // 8 minutes between port instances

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

        currentPortTime = new Date(
          currentPortTime.getTime() + portInterval * 60 * 1000
        );
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

    // Determine status based on time
    let status: "pending" | "running" | "completed" | "failed" = "pending";
    if (recipeStartTime <= now && recipeEndTime >= now) {
      status = "running";
    } else if (recipeEndTime < now) {
      status = Math.random() > 0.1 ? "completed" : "failed";
    }

    recipes.push({
      id: `recipe-${i}`,
      name: `Recipe ${i + 1}`,
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
