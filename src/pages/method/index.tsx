import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useGetHealthCheckQuery } from "./data/fencelineScheduler.slice";
import { useGetAllRecipesQuery, Recipe as ApiRecipe } from "./data/recipes.slice";
import ScheduleComponent from "./scheduler";
import RecipeList from "./recipe-list";
import MeasurementState from "../dashboard/components/measurement-state";
import SchedulerActions from "../dashboard/components/scheduler-actions";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";

interface Recipe {
  id: string;
  name: string;
  version: string;
  lastEdited: string;
}

interface Task {
  type: string;
  startTime: Date;
}

// Timeline state management
const roundTo15Minutes = (date: Date) => {
  const ms = 1000 * 60 * 15;
  return new Date(Math.floor(date.getTime() / ms) * ms);
};

const getViewDuration = (timeScale: string) => {
  switch (timeScale) {
    case "1h":
      return 1 * 60 * 60 * 1000;
    case "12h":
      return 12 * 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    default:
      return 1 * 60 * 60 * 1000;
  }
};

const MethodPage = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Timeline state
  const [timeScale, setTimeScale] = useState("12h");
  const [currentTime, setCurrentTime] = useState(roundTo15Minutes(new Date()));
  const [progress, setProgress] = useState(() => {
    const now = new Date();
    const blockStart = roundTo15Minutes(now);
    const elapsedMs = Number(now) - Number(blockStart);
    return Math.min(100, (elapsedMs / (15 * 60 * 1000)) * 100);
  });

  // Scheduled tasks state
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  const { data: allRecipes } = useGetAllRecipesQuery();
  const { data: healthCheckData, isLoading, error } = useGetHealthCheckQuery();

  // Filter recipes with duration < 0 for manual jobs
  const manualRecipes = useMemo(() => {
    if (!allRecipes) return [];
    return allRecipes;
    // return allRecipes.filter((recipe: ApiRecipe) => recipe.duration <= 0);
  }, [allRecipes]);

  // Get all tasks in 7-day window
  const getTasksIn7Days = () => {
    const now = roundTo15Minutes(new Date());
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get scheduled tasks in 7-day window
    const scheduledIn7Days = scheduledTasks.filter(
      (task) => task.startTime >= now && task.startTime <= sevenDaysFromNow
    );

    // Add daily spike tasks
    let spikeTime = new Date(now.getTime() + 5 * 15 * 60 * 1000);
    while (spikeTime <= sevenDaysFromNow) {
      if (!scheduledIn7Days.some((task) => task.startTime.getTime() === spikeTime.getTime())) {
        scheduledIn7Days.push({
          type: "spike",
          startTime: new Date(spikeTime),
        });
      }
      spikeTime = new Date(spikeTime.getTime() + 24 * 60 * 60 * 1000);
    }

    // Add 5-blend tasks every 4 hours
    let blendTime = new Date(now);
    blendTime.setMinutes(0, 0, 0); // Start at the beginning of the hour
    while (blendTime <= sevenDaysFromNow) {
      if (!scheduledIn7Days.some((task) => task.startTime.getTime() === blendTime.getTime())) {
        scheduledIn7Days.push({
          type: "5-blend",
          startTime: new Date(blendTime),
        });
      }
      blendTime = new Date(blendTime.getTime() + 4 * 60 * 60 * 1000);
    }

    return scheduledIn7Days;
  };

  // Generate scheduled tasks
  const generateScheduledTasks = () => {
    const endTime = new Date(currentTime.getTime() + getViewDuration(timeScale));
    const tasks: Task[] = [];

    // Add scheduled tasks that fall within the current view
    tasks.push(
      ...scheduledTasks.filter(
        (task) => task.startTime >= currentTime && task.startTime < endTime // Changed to < to avoid edge case
      )
    );

    // Add daily spike tasks if none are scheduled in this view
    if (!tasks.some((task) => task.type === "spike")) {
      let spikeTime = new Date(currentTime.getTime() + 5 * 15 * 60 * 1000);
      const DAY_MS = 24 * 60 * 60 * 1000;

      while (spikeTime < endTime) {
        // Changed to < to avoid edge case
        // Only add spike if slot is available
        if (!tasks.some((task) => task.startTime.getTime() === spikeTime.getTime())) {
          tasks.push({
            type: "spike",
            startTime: new Date(spikeTime),
          });
        }
        spikeTime = new Date(spikeTime.getTime() + DAY_MS);
      }
    }

    // Add default 5-blend tasks every 4 hours if none are scheduled
    let blendTime = new Date(currentTime.getTime());
    blendTime.setMinutes(0, 0, 0); // Start at the beginning of the hour
    // Adjust blend time to be at or after current time
    while (blendTime < currentTime) {
      blendTime = new Date(blendTime.getTime() + 4 * 60 * 60 * 1000);
    }
    const FOUR_HOURS = 4 * 60 * 60 * 1000;

    while (blendTime < endTime) {
      // Changed to < to avoid edge case
      // Only add 5-blend if slot is available
      if (!tasks.some((task) => task.startTime.getTime() === blendTime.getTime())) {
        tasks.push({
          type: "5-blend",
          startTime: new Date(blendTime),
        });
      }
      blendTime = new Date(blendTime.getTime() + FOUR_HOURS);
    }

    return tasks;
  };

  // Fill comp tasks in empty slots
  const generateAllTasks = () => {
    const scheduledTasks = generateScheduledTasks();
    const allTasks = [...scheduledTasks];

    // Add comp tasks in empty slots
    let currentSlot = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + getViewDuration(timeScale));

    while (currentSlot < endTime) {
      // Changed to < to avoid edge case
      const slotTaken = scheduledTasks.some(
        (task) => task.startTime.getTime() === currentSlot.getTime()
      );

      if (!slotTaken) {
        allTasks.push({
          type: "comp",
          startTime: new Date(currentSlot),
        });
      }
      currentSlot = new Date(currentSlot.getTime() + 15 * 60 * 1000);
    }

    // Sort tasks by start time
    return allTasks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const [tasks, setTasks] = useState<Task[]>(generateAllTasks());

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date();
      const blockStart = roundTo15Minutes(now);
      const elapsedMs = Number(now) - Number(blockStart);
      setProgress(Math.min(100, (elapsedMs / (15 * 60 * 1000)) * 100));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const now = new Date();
    const blockStart = roundTo15Minutes(now);
    const elapsedMs = Number(now) - Number(blockStart);
    setProgress(Math.min(100, (elapsedMs / (15 * 60 * 1000)) * 100));
    setCurrentTime(roundTo15Minutes(now));
    setTasks(generateAllTasks());
  }, [timeScale, scheduledTasks]);

  const handleScheduleSubmit = (data: {
    startTime: string;
    frequency: { value: string; unit: string };
    duration: string;
  }) => {
    console.log("Scheduling recipe:", selectedRecipe?.name, data);

    if (!selectedRecipe) return;

    // Round start time to nearest 15 minutes
    const startDate = roundTo15Minutes(new Date(data.startTime));
    const newTasks: Task[] = [];

    // Function to check if a time slot is available
    const isSlotAvailable = (time: Date) => {
      // Check if there's any non-comp task at this time
      const existingTask = scheduledTasks.find(
        (task) => task.startTime.getTime() === time.getTime() && task.type !== "comp"
      );
      return !existingTask;
    };

    // Add initial task if slot is available
    if (isSlotAvailable(startDate)) {
      newTasks.push({
        type: selectedRecipe.name.toLowerCase(),
        startTime: startDate,
      });
    } else {
      alert("Selected time slot is not available - another task is already scheduled");
      return;
    }

    // Add recurring tasks if frequency is set
    if (data.frequency.value && data.frequency.unit) {
      const frequencyValue = parseInt(data.frequency.value);
      const endTime = new Date(currentTime.getTime() + getViewDuration(timeScale));
      let nextTime = new Date(startDate);

      while (nextTime <= endTime) {
        let newTime: Date;

        // Calculate next occurrence based on frequency unit
        switch (data.frequency.unit) {
          case "hours":
            newTime = new Date(nextTime.getTime() + frequencyValue * 60 * 60 * 1000);
            break;
          case "days":
            newTime = new Date(nextTime.getTime() + frequencyValue * 24 * 60 * 60 * 1000);
            break;
          case "weeks":
            newTime = new Date(nextTime.getTime() + frequencyValue * 7 * 24 * 60 * 60 * 1000);
            break;
          case "months": {
            const newDate = new Date(nextTime);
            newDate.setMonth(newDate.getMonth() + frequencyValue);
            newTime = newDate;
            break;
          }
          default:
            newTime = nextTime;
        }

        nextTime = roundTo15Minutes(newTime);

        // Only add task if the slot is available
        if (nextTime <= endTime && isSlotAvailable(nextTime)) {
          newTasks.push({
            type: selectedRecipe.name.toLowerCase(),
            startTime: new Date(nextTime),
          });
        }
      }
    }

    // Update scheduled tasks state
    setScheduledTasks((prevTasks) => [...prevTasks, ...newTasks]);
    toast.success("Tasks scheduled successfully");

    setScheduleDialogOpen(false);
    setSelectedRecipe(null);
  };

  if (isLoading)
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader pageName="Method" />
        <main className="flex flex-col gap-6 mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-full overflow-y-auto">
          <div className="flex justify-center items-center p-40">
            <Spinner size="8" />
          </div>
        </main>
      </div>
    );
  if (error) return <div>Error checking scheduler health</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader pageName="Method" />
      <main className="flex flex-col gap-6 mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-full overflow-y-auto">
        <div className="gap-4 grid grid-cols-4">
          <div className="col-span-3">
            <MeasurementState />
          </div>
          <div className="col-span-1">
            <SchedulerActions allRecipes={manualRecipes} />
          </div>
        </div>

        <ScheduleComponent />

        <RecipeList />
      </main>
    </div>
  );
};

export default MethodPage;
