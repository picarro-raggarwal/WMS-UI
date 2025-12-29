import { Spinner } from "@/components/spinner";
import { ProgressCircle } from "@/components/tremor/progress-circle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/hooks/useSocket";
import { useGetJobHistoryQuery } from "@/pages/method/data/fencelineJob.slice";
import {
  CurrentJob,
  useGetCurrentStateQuery
} from "@/pages/method/data/fencelineStateMachine.slice";
import { WebSocketJobData, WebSocketJobStateData } from "@/types";
import { formatLabel, formatTime, formatUnixTimestamp } from "@/utils";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Infinity as InfinityIcon
} from "lucide-react";
import { useEffect, useState } from "react";
interface CurrentState {
  state: string;
  system_status?: string;
  current_job?: WebSocketJobData | CurrentJob;
  lastFetched?: number;
}

const MeasurementState = () => {
  const { fencelineJobState, connected } = useSocket();
  const [wsError, setWsError] = useState(false);
  const [currentState, setCurrentState] = useState<CurrentState | null>(null);

  // Only query these endpoints if websocket has an error or is not connected
  const { data: stateData, isLoading: isStateLoading } =
    useGetCurrentStateQuery(undefined, {
      pollingInterval: 5000,
      skip: connected && !wsError
    });

  const { data: jobHistoryData, isLoading: isJobHistoryLoading } =
    useGetJobHistoryQuery(undefined, {
      pollingInterval: 5000
    });

  // Update state when websocket data changes
  useEffect(() => {
    if (!connected || !fencelineJobState) {
      setCurrentState(null);
      return;
    }
    try {
      const wsData = fencelineJobState?.data as WebSocketJobStateData;
      if (!wsData) return;

      const state = wsData.state;
      const currentJob = wsData.current_job;

      if (!state) {
        setWsError(true);
        return;
      }

      setCurrentState({
        state,
        current_job: currentJob
          ? {
              ...currentJob,
              job_type: currentJob.job_type || null,
              recipe: currentJob.recipe_name || "Unknown Recipe",
              elapsed_time: currentJob.elapsed_time_seconds,
              duration: currentJob.total_expected_duration_seconds,
              status: "in_progress" //assuming here that all jobs are in progress from ws but need to revisit this
            }
          : null,
        lastFetched: Date.now()
      });
      setWsError(false);
    } catch (error) {
      setWsError(true);
    }
  }, [connected, fencelineJobState]);

  // Fall back to API data if websocket fails
  useEffect(() => {
    if (!wsError || !stateData) return;

    setCurrentState({
      state: stateData.state,
      current_job: null,
      lastFetched: Date.now()
    });
  }, [wsError, stateData]);

  const isLoading = (!connected && isStateLoading) || isJobHistoryLoading;

  if (isLoading || !currentState) {
    return (
      <Card className="relative flex flex-col shadow-xl p-6 h-full">
        <div className="top-0 left-0 absolute -mt-px w-full overflow-hidden">
          <div className="flex h-[2px] w-full-scale-x-100">
            <div className="flex-none blur-sm w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
            <div className="flex-none blur-[1px] -ml-[100%] w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          </div>
        </div>
        <CardTitle className="mb-3 pb-2 dark:border-neutral-700 border-b-2 font-semibold dark:text-white text-base md:text-lg leading-none tracking-tight">
          Current Run
        </CardTitle>
        <div className="flex flex-1 justify-center items-center">
          <Spinner />
        </div>
      </Card>
    );
  }

  const isRunning =
    currentState.state === "Running" || currentState.state === "SystemStartup";

  const calculateProgress = () => {
    const job = currentState?.current_job;
    if (!job) return 0;

    let elapsed = 0;
    let duration = 0;

    if ("elapsed_time_seconds" in job) {
      // WebSocket format
      elapsed = job.elapsed_time_seconds;
      duration = job.total_expected_duration_seconds;
    } else {
      // API format
      elapsed = job.elapsed_time;
      duration = job.duration;
    }

    if (!elapsed || !duration || duration === 0) return 0;

    const progress = Math.floor((elapsed / duration) * 100);
    return Math.min(progress, 100);
  };

  const progressPercentage = calculateProgress();

  // Format time for display
  const formatTimeDisplay = (seconds: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getJobTime = (job: WebSocketJobData | CurrentJob) => {
    if ("elapsed_time_seconds" in job) {
      return {
        elapsed: job.elapsed_time_seconds,
        total: job.total_expected_duration_seconds
      };
    }
    return {
      elapsed: job.elapsed_time,
      total: job.duration
    };
  };

  return (
    <Card className="relative flex flex-col shadow-xl p-6 h-full">
      <div className="top-0 left-0 absolute -mt-px w-full overflow-hidden">
        <div className="flex h-[2px] w-full-scale-x-100">
          <div className="flex-none blur-sm w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          <div className="flex-none blur-[1px] -ml-[100%] w-full [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(88,186,37,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        </div>
      </div>
      <CardTitle className="mb-3 pb-2 dark:border-neutral-700 border-b-2 font-semibold dark:text-white text-base md:text-lg leading-none tracking-tight">
        Current Run
      </CardTitle>
      <div className="flex flex-1 items-center py-2.5">
        <div className="flex justify-center items-center w-24 h-24">
          {currentState.state === "SystemStartup" && (
            <Spinner size="14" className="text-primary-500" />
          )}
          {(currentState.state === "Idle" ||
            currentState.state === "Unknown") && (
            <div className="bg-neutral-50 border-4 border-neutral-200 rounded-full w-14 h-14 text-primary-500" />
          )}

          {currentState.current_job &&
            (currentState.current_job.job_type === "manual" ? (
              <ProgressCircle
                value={0}
                radius={38}
                strokeWidth={9}
                color="primary"
              >
                <p className="font-medium text-xs">
                  <InfinityIcon size={20} className="text-primary-600" />
                </p>
              </ProgressCircle>
            ) : (
              <ProgressCircle
                value={progressPercentage}
                radius={38}
                strokeWidth={9}
                color="primary"
              >
                <p className="font-medium text-base">{progressPercentage}%</p>
              </ProgressCircle>
            ))}

          {currentState.state !== "SystemStartup" &&
            currentState.state !== "Idle" &&
            currentState.state !== "Unknown" &&
            !currentState.current_job && (
              <ProgressCircle
                value={0}
                radius={30}
                strokeWidth={6}
                color="primary"
              >
                <p className="opacity-0 font-medium text-base">{0}%</p>
              </ProgressCircle>
            )}
        </div>

        <div className="px-4">
          <div className="flex items-center gap-4 mb-1">
            <div
              className={`${
                isRunning
                  ? "bg-primary-500/5 text-primary-500"
                  : "bg-neutral-100 text-neutral-600"
              } -ml-1 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5`}
            >
              <div
                className={`w-1.5 h-1.5 ${
                  isRunning ? "bg-primary-500" : "bg-neutral-400"
                } rounded-full`}
              />
              {currentState.state || "Unknown"}
            </div>
          </div>

          {currentState.current_job && (
            <div className="mb-2">
              <span className="font-medium text-base">
                {formatLabel(
                  currentState.current_job.recipe_name ||
                    currentState.current_job.recipe_name ||
                    (currentState.current_job as CurrentJob).recipe
                )}
              </span>
              <div className="flex items-center gap-2 mt-1 text-neutral-500 text-sm">
                <span>
                  Elapsed:{" "}
                  <span className="tabular-nums">
                    {formatTimeDisplay(
                      getJobTime(currentState.current_job).elapsed
                    )}
                  </span>
                </span>
                {currentState.current_job.job_type === "manual" ? (
                  ""
                ) : (
                  <span>
                    Total:{" "}
                    {formatTimeDisplay(
                      getJobTime(currentState.current_job).total
                    )}
                  </span>
                )}
                <span className="bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">
                  Job #{currentState.current_job.job_id}
                </span>
              </div>
            </div>
          )}

          {currentState.state === "Idle" && (
            <div className="text-neutral-500 text-sm">
              As of {formatTime(new Date(currentState.lastFetched))}
            </div>
          )}
        </div>
      </div>

      <div className="-m-6 mt-2">
        <Accordion
          type="single"
          collapsible
          className="bg-neutral-50 hover:bg-neutral-50 dark:bg-neutral-800/50 dark:hover:bg-neutral-700 px-8 py-1 border-neutral-100 dark:border-neutral-700 border-t rounded-b-xl w-full"
        >
          <AccordionItem value="recent-runs" className="border-b-0">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={18} className="text-neutral-500" />
                <span className="font-medium">Recent Runs</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-3 pb-4">
                <div className="relative">
                  {jobHistoryData?.map((job, index) => (
                    <div
                      key={job.job_id}
                      className="relative flex gap-4 pb-4 last:pb-0"
                    >
                      {index < jobHistoryData.length - 1 && (
                        <div className="top-8 bottom-0 left-4 absolute bg-neutral-200 dark:bg-neutral-700 w-px" />
                      )}

                      <div className="z-10 relative flex-shrink-0 mt-1">
                        <div className="flex justify-center items-center bg-white dark:bg-neutral-800 rounded-full ring-2 ring-neutral-100 dark:ring-neutral-700 w-8 h-8">
                          {job.job_status === "finished" ? (
                            <CheckCircle2
                              size={18}
                              className="text-primary-500"
                            />
                          ) : job.job_status === "cancelled" ? (
                            <AlertCircle size={18} className="text-amber-500" />
                          ) : job.job_status === "in_progress" ? (
                            <Spinner className="text-primary-500" />
                          ) : job.job_status === "created" ? (
                            <CircleDashed
                              size={16}
                              className="text-neutral-400"
                            />
                          ) : (
                            <AlertCircle size={18} className="text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm capitalize">
                            {job.job_type}
                          </span>
                          <span className="bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full font-medium text-neutral-600 dark:text-neutral-400 text-xs">
                            Job #{job.job_id}
                          </span>
                          {job.job_status === "in_progress" && (
                            <span className="bg-primary-500 dark:bg-primary-900/30 px-2 py-0.5 rounded-full font-medium text-white text-xs">
                              Running Now
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                              job.job_status === "finished"
                                ? "bg-neutral-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                                : job.job_status === "cancelled"
                                ? " bg-neutral-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                : job.job_status === "in_progress"
                                ? "bg-neutral-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                                : job.job_status === "created"
                                ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {job.job_status}
                          </span>
                        </div>

                        {/* Timeline details */}
                        <div className="flex flex-wrap items-center gap-3 text-neutral-500 dark:text-neutral-400 text-xs">
                          {job.duration > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span className="font-medium">
                                {formatTimeDisplay(job.duration)}
                              </span>
                            </div>
                          )}
                          {job.start_time && (
                            <div className="flex items-center gap-1">
                              <span className="text-neutral-400">Started:</span>
                              <span className="font-medium">
                                {formatUnixTimestamp(job.start_time)}
                              </span>
                            </div>
                          )}
                          {job.end_time && (
                            <div className="flex items-center gap-1">
                              <span className="text-neutral-400">Ended:</span>
                              <span className="font-medium">
                                {formatUnixTimestamp(job.end_time)}
                              </span>
                            </div>
                          )}
                          {job.message && (
                            <div className="flex items-center gap-1">
                              <div className="text-neutral-600 dark:text-neutral-400 text-xs m">
                                {job.message}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {(!jobHistoryData || jobHistoryData.length === 0) && (
                    <div className="py-8 text-center">
                      <Clock
                        size={32}
                        className="mx-auto mb-2 text-neutral-300 dark:text-neutral-600"
                      />
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        No recent jobs found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
};

export default MeasurementState;
