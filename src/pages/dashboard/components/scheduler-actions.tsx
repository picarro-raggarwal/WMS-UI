import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { DurationInput } from "@/components/ui/duration-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RootState } from "@/lib/store";
import { InletWithPortId } from "@/lib/store/settings-global.slice";
import {
  useIsSchedulerRunningQuery,
  // useRunManualJobMutation,
  useScrapScheduleMutation,
  useStartSchedulerMutation,
  useStopManualRunMutation,
  useStopSchedulerMutation
} from "@/pages/method/data/fencelineScheduler.slice";
import { Recipe } from "@/pages/method/data/recipes.slice";
import { getAmbientPort } from "@/types/common/ports";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  CheckCircle2,
  Info,
  Loader2,
  OctagonPause,
  Play,
  Plus,
  Trash,
  XCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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
  const [selectedPortId, setSelectedPortId] = useState<string>("");
  const [manualJobDuration, setManualJobDuration] = useState<number>(120); // Default 2 minutes in seconds
  const [durationInputErrors, setDurationInputErrors] = useState<Set<string>>(
    new Set()
  );

  // Get ports from global state
  const globalInlets = useSelector(
    (state: RootState) => (state as any).settingsGlobal?.inlets
  );

  // Generate available ports from global state inlets
  const availablePorts = useMemo(() => {
    // If global state is empty, return empty array (APIs are being fetched)
    if (!globalInlets?.result || globalInlets.result.length === 0) {
      return [];
    }

    // Filter to only PORT type, isEnabled, and available inlets
    const enabledPortInlets = globalInlets.result.filter(
      (inlet) =>
        inlet.type === "PORT" &&
        inlet.isEnabled === true &&
        inlet.available === true
    );

    // Transform inlets to port format
    const regularPorts = enabledPortInlets.map((inlet) => ({
      ...inlet, // Include all InletWithPortId fields
      portNumber: inlet.portId,
      bankNumber: inlet.bankId
    }));

    // Add Ambient port
    const ambientPortFromCommon = getAmbientPort();
    const ambientPort: InletWithPortId & {
      portNumber: number;
      bankNumber: number;
    } = {
      type: "PORT" as const,
      name: ambientPortFromCommon.name,
      bankId: 0,
      id: 0,
      zeroPort: false,
      isActive: true,
      available: true,
      label: ambientPortFromCommon.name,
      portId: 0,
      displayLabel: ambientPortFromCommon.name,
      isEnabled: true,
      portNumber: 0,
      bankNumber: 0
    };

    return [ambientPort, ...regularPorts];
  }, [globalInlets]);

  const [manualJobLoading, setManualJobLoading] = useState(false);
  const [stoppingScheduler, setStoppingScheduler] = useState(false);
  const [scrappingSchedule, setScrappingSchedule] = useState(false);
  const [startingScheduler, setStartingScheduler] = useState(false);
  const [stoppingManualRun, setStoppingManualRun] = useState(false);

  const {
    data: isSchedulerRunning,
    refetch: refetchSchedulerStatus,
    isLoading: isSchedulerRunningLoading
  } = useIsSchedulerRunningQuery(undefined, {
    pollingInterval: 2500
  });

  // Manual job status is no longer available via measurement_status API
  const isManualJobRunning = false;

  // const [runManualJob] = useRunManualJobMutation();
  const [stopScheduler] = useStopSchedulerMutation();
  const [scrapSchedule] = useScrapScheduleMutation();
  const [startScheduler] = useStartSchedulerMutation();
  const [stopManualRun] = useStopManualRunMutation();

  const resetManualJobModal = () => {
    setSelectedPortId("");
    setManualJobDuration(120); // Reset to 2 minutes
    setDurationInputErrors(new Set());
    setManualJobLoading(false);
  };

  const handleManualJobDialogChange = (open: boolean) => {
    setManualJobDialogOpen(open);
    if (!open) {
      resetManualJobModal();
    }
  };

  const handleRunManualJob = async () => {
    if (!selectedPortId) {
      toast.error("Please select a port");
      return;
    }

    if (manualJobDuration < 60 || manualJobDuration > 3600) {
      toast.error("Duration must be between 1 and 60 minutes");
      return;
    }

    if (durationInputErrors.size > 0) {
      toast.error("Please fix duration errors");
      return;
    }

    setManualJobLoading(true);

    try {
      const selectedPort = availablePorts.find(
        (port) => port.id.toString() === selectedPortId
      );

      if (!selectedPort) {
        toast.error("Selected port not found");
        setManualJobLoading(false);
        return;
      }

      // TODO: Re-enable API call when ready
      // await runManualJob({
      //   port_id: selectedPort.id,
      //   bank_id: selectedPort.bankId,
      //   duration_seconds: manualJobDuration
      // }).unwrap();

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Manual port run started successfully");
      // refetchSchedulerStatus(); // Refresh scheduler status
      setManualJobDialogOpen(false);
    } catch (error: unknown) {
      console.error("Failed to run manual job:", error);

      let errorMessage = "Failed to start manual port run";

      if (typeof error === "object" && error !== null && "data" in error) {
        const errorData = (error as FetchBaseQueryError)
          .data as ApiErrorResponse;
        if (errorData?.error?.description) {
          errorMessage = errorData.error.description;
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      }

      toast.error(errorMessage);
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
        }`}
      >
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
              <span className="text-primary-500 truncate">Running</span>
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
                Are you sure you want to stop the scheduler? This will halt all
                scheduled jobs.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmStopOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleStopScheduler}
                disabled={stoppingScheduler}
              >
                {stoppingScheduler && (
                  <Loader2 className="mr-1.5 w-4 h-4 animate-spin" />
                )}
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start Scheduler</DialogTitle>
              <DialogDescription>
                Start the scheduler to begin processing the current schedule.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmStartOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartScheduler}
                disabled={startingScheduler || isManualJobRunning}
              >
                {startingScheduler && (
                  <Loader2 className="mr-1.5 w-4 h-4 animate-spin" />
                )}
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
                Are you sure you want to scrap the current schedule? This will
                remove all scheduled jobs and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmScrapOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleScrapSchedule}
                disabled={scrappingSchedule}
              >
                {scrappingSchedule && (
                  <Loader2 className="mr-1.5 w-4 h-4 animate-spin" />
                )}
                Scrap Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Stop Manual Run Button & Confirmation Dialog - Only show when a manual job is running */}
      {isManualJobRunning && (
        <Dialog
          open={confirmStopManualOpen}
          onOpenChange={setConfirmStopManualOpen}
        >
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
                Are you sure you want to stop the current manual run? This will
                interrupt the process immediately.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmStopManualOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleStopManualRun}
                loading={stoppingManualRun}
                disabled={stoppingManualRun}
              >
                Stop Manual Run
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Manual Job Dialog - Only show when manual job is not running */}
      {!isManualJobRunning && (
        <Dialog
          open={manualJobDialogOpen}
          onOpenChange={handleManualJobDialogChange}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="mr-1.5 w-4 h-4" />
              New Manual Port Run
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Run New Manual Port Run</DialogTitle>
              <DialogDescription>
                Configure a one-time manual port run that will interrupt the
                current recipe.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 mt-2 p-4 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
              <Info className="mt-1 mr-1 size-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                  Manual Port Run Information
                </p>
                <ul className="text-blue-700 dark:text-blue-300 text-xs list-disc list-inside space-y-1">
                  <li>After completion, the running recipe will resume</li>
                  <li>
                    This port run can also trigger Smart Recipe, if enabled
                  </li>
                </ul>
              </div>
            </div>
            {isSchedulerRunning && (
              <div className="flex gap-2 bg-gray-100 dark:bg-neutral-800 mt-2 p-4 rounded-lg text-sm">
                <Info className="mt-1 mr-1 size-4 text-gray-500 dark:text-white shrink-0" />
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Scheduler is currently running. The scheduler needs to be
                  stopped before a manual port run can begin.
                </p>
              </div>
            )}
            <div className="py-2">
              {availablePorts.length === 0 ? (
                <div className="py-4 text-gray-500 text-center">
                  No ports available
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="port-select"
                      className="font-medium text-sm"
                    >
                      Select Port
                    </label>
                    <Select
                      value={selectedPortId}
                      onValueChange={setSelectedPortId}
                      disabled={manualJobLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a port" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePorts.map((port) => (
                          <SelectItem key={port.id} value={port.id.toString()}>
                            <div className="flex flex-col ">
                              <span className="font-medium">
                                {port.displayLabel || port.name}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {port.label &&
                                port.label !== (port.displayLabel || port.name)
                                  ? `${port.label} • `
                                  : ""}
                                ID: {port.id} • Bank: {port.bankId}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <label
                      htmlFor="duration-input"
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      Duration (minutes)
                    </label>
                    <DurationInput
                      value={manualJobDuration}
                      onChange={(duration) => setManualJobDuration(duration)}
                      minSeconds={60} // 1 minute minimum
                      maxSeconds={3600} // 60 minutes maximum
                      onError={() =>
                        setDurationInputErrors(
                          (prev) => new Set([...prev, "manual-job-duration"])
                        )
                      }
                      onSuccess={() =>
                        setDurationInputErrors((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete("manual-job-duration");
                          return newSet;
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setManualJobDialogOpen(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleRunManualJob}
                      disabled={
                        manualJobLoading ||
                        !selectedPortId ||
                        manualJobDuration < 60 ||
                        manualJobDuration > 3600 ||
                        durationInputErrors.size > 0
                      }
                    >
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
