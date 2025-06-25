import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  XCircle,
  Trash,
  Loader2,
  CheckCircle2,
  Plus,
  Info,
  AlertCircle,
  OctagonPause,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  useIsSchedulerRunningQuery,
  useRunManualJobMutation,
  useStopSchedulerMutation,
  useScrapScheduleMutation,
  useStartSchedulerMutation,
  useStopManualRunMutation,
} from "@/pages/method/data/fencelineScheduler.slice";
import { useGetMeasurementStatusQuery } from "@/pages/method/data/fencelineStateMachine.slice";
import { Recipe } from "@/pages/method/data/recipes.slice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ApiErrorResponse {
  error?: {
    name?: string;
    description?: string;
    message?: string;
  };
}

interface SchedulerActionsProps {
  allRecipes: Recipe[];
}

const SchedulerActions = ({ allRecipes }: SchedulerActionsProps) => {
  const [confirmStopOpen, setConfirmStopOpen] = useState(false);
  const [confirmScrapOpen, setConfirmScrapOpen] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [confirmStopManualOpen, setConfirmStopManualOpen] = useState(false);

  const [manualJobDialogOpen, setManualJobDialogOpen] = useState(false);
  const [selectedManualRecipeId, setSelectedManualRecipeId] = useState<string>("");
  const [manualJobError, setManualJobError] = useState<string | null>(null);

  const manualRecipes = allRecipes?.filter((recipe) => recipe.duration <= 0) || [];
  const standardRecipes = allRecipes?.filter((recipe) => recipe.duration > 0) || [];

  const [manualJobLoading, setManualJobLoading] = useState(false);
  const [stoppingScheduler, setStoppingScheduler] = useState(false);
  const [scrappingSchedule, setScrappingSchedule] = useState(false);
  const [startingScheduler, setStartingScheduler] = useState(false);
  const [stoppingManualRun, setStoppingManualRun] = useState(false);

  const {
    data: isSchedulerRunning,
    refetch: refetchSchedulerStatus,
    isLoading: isSchedulerRunningLoading,
  } = useIsSchedulerRunningQuery(undefined, {
    pollingInterval: 2500,
  });

  const { data: measurementStatus } = useGetMeasurementStatusQuery(undefined, {
    pollingInterval: 2500,
  });

  const isManualJobRunning =
    measurementStatus?.system_status === "Executing" &&
    measurementStatus?.current_job?.job_type === "manual";

  const [runManualJob] = useRunManualJobMutation();
  const [stopScheduler] = useStopSchedulerMutation();
  const [scrapSchedule] = useScrapScheduleMutation();
  const [startScheduler] = useStartSchedulerMutation();
  const [stopManualRun] = useStopManualRunMutation();

  const resetManualJobModal = () => {
    setSelectedManualRecipeId("");
    setManualJobError(null);
    setManualJobLoading(false);
  };

  const handleManualJobDialogChange = (open: boolean) => {
    setManualJobDialogOpen(open);
    if (!open) {
      resetManualJobModal();
    }
  };

  const handleRunManualJob = async () => {
    if (!selectedManualRecipeId) {
      setManualJobError("Please select a recipe");
      return;
    }

    setManualJobLoading(true);
    setManualJobError(null);

    try {
      await runManualJob({
        recipe_row_id: parseInt(selectedManualRecipeId),
      }).unwrap();
      toast.success("Manual job started successfully");
      refetchSchedulerStatus(); // Refresh scheduler status
      setManualJobDialogOpen(false);
    } catch (error: unknown) {
      console.error("Failed to run manual job:", error);

      let errorMessage = "Failed to start manual job";

      if (typeof error === "object" && error !== null && "data" in error) {
        const errorData = (error as FetchBaseQueryError).data as ApiErrorResponse;
        if (errorData?.error?.description) {
          errorMessage = errorData.error.description;
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      }

      setManualJobError(errorMessage);
    } finally {
      setManualJobLoading(false);
    }
  };

  const handleStopScheduler = async () => {
    setStoppingScheduler(true);
    try {
      await stopScheduler().unwrap();
      toast.success("Scheduler stopped successfully");
      refetchSchedulerStatus(); // Refresh scheduler status
      setConfirmStopOpen(false);
    } catch (error) {
      console.error("Failed to stop scheduler:", error);
      toast.error("Failed to stop scheduler");
    } finally {
      setStoppingScheduler(false);
    }
  };

  // Handle scrapping the schedule with confirmation
  const handleScrapSchedule = async () => {
    setScrappingSchedule(true);
    try {
      await scrapSchedule().unwrap();
      toast.success("Schedule scrapped successfully");
      setConfirmScrapOpen(false);
    } catch (error) {
      console.error("Failed to scrap schedule:", error);
      toast.error("Failed to scrap schedule");
    } finally {
      setScrappingSchedule(false);
    }
  };

  // Handle starting the scheduler with confirmation
  const handleStartScheduler = async () => {
    setStartingScheduler(true);
    try {
      await startScheduler().unwrap();
      toast.success("Scheduler started successfully");
      refetchSchedulerStatus(); // Refresh scheduler status
      setConfirmStartOpen(false);
    } catch (error) {
      console.error("Failed to start scheduler:", error);
      toast.error("Failed to start scheduler");
    } finally {
      setStartingScheduler(false);
    }
  };

  // Handle stopping a manual run with confirmation
  const handleStopManualRun = async () => {
    setStoppingManualRun(true);
    try {
      await stopManualRun().unwrap();
      toast.success("Manual run stopped successfully");
      refetchSchedulerStatus(); // Refresh scheduler status
      setConfirmStopManualOpen(false);
    } catch (error) {
      console.error("Failed to stop manual run:", error);
      toast.error("Failed to stop manual run");
    } finally {
      setStoppingManualRun(false);
    }
  };

  return (
    <Card className="flex flex-col gap-2 p-4">
      <CardTitle className="pb-2 dark:border-neutral-700 font-semibold dark:text-white text-base leading-none tracking-tight">
        Scheduler Controls
      </CardTitle>

      <div
        className={`space-y-2 py-3 border-t border-b ${
          isSchedulerRunningLoading ? "opacity-0" : ""
        }`}>
        {/* Scheduler Status */}
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-neutral-500">Scheduler</span>
          <div className="flex items-center gap-1.5">
            {isSchedulerRunning ? (
              <>
                <CheckCircle2 className="size-4 text-primary-500" />
                <span className="text-primary-500">Running</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-red-500" />
                <span className="text-red-500">Stopped</span>
              </>
            )}
          </div>
        </div>

        {isManualJobRunning && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-neutral-500">Manual</span>
            <div className="flex items-center gap-1.5">
              <Loader2 className="size-4 text-primary-500 animate-spin" />
              <span className="text-primary-500 truncate">
                {measurementStatus?.current_job?.recipe?.substring(0, 8) || "Running"}
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Stop Scheduler Button & Confirmation Dialog - Only show when scheduler is running */}
      {isSchedulerRunning && (
        <Dialog open={confirmStopOpen} onOpenChange={setConfirmStopOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full">
              <OctagonPause className="mr-1.5 w-4 h-4" />
              Stop Scheduler
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stop Scheduler</DialogTitle>
              <DialogDescription>
                Are you sure you want to stop the scheduler? This will halt all scheduled jobs.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConfirmStopOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleStopScheduler}
                disabled={stoppingScheduler}>
                {stoppingScheduler && <Loader2 className="mr-1.5 w-4 h-4 animate-spin" />}
                Stop Scheduler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Start Scheduler Button & Confirmation Dialog - Only show when scheduler is not running */}
      {!isSchedulerRunning && !isManualJobRunning && (
        <Dialog open={confirmStartOpen} onOpenChange={setConfirmStartOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Play className="mr-1.5 w-4 h-4" />
              Start Scheduler
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Scheduler</DialogTitle>
              <DialogDescription>
                Are you sure you want to start the scheduler? This will begin processing the current
                schedule.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConfirmStartOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleStartScheduler}
                disabled={startingScheduler || isManualJobRunning}>
                {startingScheduler && <Loader2 className="mr-1.5 w-4 h-4 animate-spin" />}
                Start Scheduler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Scrap Schedule Button & Confirmation Dialog - Only show when neither scheduler nor manual job is running */}
      {isSchedulerRunning && (
        <Dialog open={confirmScrapOpen} onOpenChange={setConfirmScrapOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Trash className="mr-1.5 w-4 h-4" />
              Scrap Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scrap Schedule</DialogTitle>
              <DialogDescription>
                Are you sure you want to scrap the current schedule? This will remove all scheduled
                jobs and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConfirmScrapOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleScrapSchedule}
                disabled={scrappingSchedule}>
                {scrappingSchedule && <Loader2 className="mr-1.5 w-4 h-4 animate-spin" />}
                Scrap Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Stop Manual Run Button & Confirmation Dialog - Only show when a manual job is running */}
      {isManualJobRunning && (
        <Dialog open={confirmStopManualOpen} onOpenChange={setConfirmStopManualOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <XCircle className="mr-1.5 w-4 h-4" />
              Stop Manual Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stop Manual Run</DialogTitle>
              <DialogDescription>
                Are you sure you want to stop the current manual run? This will interrupt the
                process immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setConfirmStopManualOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleStopManualRun}
                loading={stoppingManualRun}
                disabled={stoppingManualRun}>
                Stop Manual Run
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Manual Job Dialog - Only show when manual job is not running */}
      {!isManualJobRunning && (
        <Dialog open={manualJobDialogOpen} onOpenChange={handleManualJobDialogChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="mr-1.5 w-4 h-4" />
              New Manual Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Run New Manual Job</DialogTitle>
              <DialogDescription>
                Manual runs begin immediately and continue until manually stopped.
              </DialogDescription>

              {isSchedulerRunning && (
                <div className="flex gap-2 bg-gray-100 dark:bg-neutral-800 mt-2 p-4 rounded-lg text-sm">
                  <Info className="mt-1 mr-1 size-4 text-gray-500 dark:text-white shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Scheduler is currently running. The scheduler needs to be stopped before a
                    manual run can begin.
                  </p>
                </div>
              )}
            </DialogHeader>
            <div className="py-2">
              {manualRecipes.length === 0 && standardRecipes.length === 0 ? (
                <div className="py-4 text-gray-500 text-center">No recipes available</div>
              ) : (
                <div className="space-y-4">
                  {manualJobError && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4 text-white" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{manualJobError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-1">
                    <label htmlFor="recipe-select" className="font-medium text-sm">
                      Select Recipe
                    </label>
                    <Select
                      value={selectedManualRecipeId}
                      onValueChange={setSelectedManualRecipeId}
                      disabled={manualJobLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {manualRecipes.length > 0 && (
                          <>
                            <div className="px-3 py-1.5 font-medium text-neutral-500 text-xs">
                              Manual Recipes (No Duration)
                            </div>
                            {manualRecipes.map((recipe) => (
                              <SelectItem
                                key={recipe.recipe_row_id}
                                value={recipe.recipe_row_id.toString()}>
                                {recipe.recipe_name}
                              </SelectItem>
                            ))}
                          </>
                        )}

                        {standardRecipes.length > 0 && (
                          <>
                            {manualRecipes.length > 0 && (
                              <div className="my-1 border-neutral-200 dark:border-neutral-700 border-b" />
                            )}
                            <div className="px-3 py-1.5 font-medium text-neutral-500 text-xs">
                              Standard Recipes
                            </div>
                            {standardRecipes.map((recipe) => (
                              <SelectItem
                                key={recipe.recipe_row_id}
                                value={recipe.recipe_row_id.toString()}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{recipe.recipe_name}</span>
                                  <span className="ml-2 text-neutral-400 text-xs">
                                    {Math.floor(recipe.duration / 60)}:
                                    {(recipe.duration % 60).toString().padStart(2, "0")}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setManualJobDialogOpen(false)}>
                      Cancel
                    </Button>

                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleRunManualJob}
                      disabled={manualJobLoading || !selectedManualRecipeId}>
                      {manualJobLoading ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        "Run Job"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default SchedulerActions;
