import RecipeTimeline from "@/components/scheduler/recipe-timeline";
import ScheduledTimeline from "@/components/scheduler/scheduled-timeline";
import { Card, CardTitle } from "@/components/ui/card";
import { useGetCurrentScheduleQuery } from "@/pages/method/data/fencelineScheduler.slice";
import { formatDateTime, formatUnixTimestamp } from "@/utils";
import {
  addDays,
  addHours,
  addMinutes,
  addWeeks,
  compareAsc,
  isAfter,
  isBefore
} from "date-fns";
import { CalendarRange, Clock, ListFilter } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useGetJobHistoryQuery } from "./data/fencelineJob.slice";
import { generateMockRecipeTimeline } from "./data/mock-recipe-timeline";

// Type for job history items
interface JobHistoryItem {
  job_id: number;
  created_at: number;
  start_time: number | null;
  end_time: number | null;
  duration: number;
  job_status: string;
  job_type: string;
  recipe_id: number;
  message: string | null;
}

// Type for the server error response
interface ServerError {
  error?: {
    name?: string;
    message?: string;
    description?: string;
  };
}

// Job types matching the API response
interface MeasurementJob {
  job_type: "measure";
  start_epoch: number;
  duration_seconds: number;
  recipe?: number;
  recipe_row_id?: number;
}

interface CalibrationJob {
  schedule_id: string;
  job_type: "calibration";
  frequency_unit: string;
  frequency_amount: number;
  start_epoch: number;
  job_duration_seconds: number;
  recipe: number;
  recipe_row_id?: number;
}

type ScheduleJob = MeasurementJob | CalibrationJob;

// Instance of a job with concrete start and end times
interface JobInstance {
  id: string;
  jobType: "measure" | "calibration";
  startTime: Date;
  endTime: Date;
  recipe?: number;
  originalJob: ScheduleJob;
}

function ScheduleComponent() {
  const { data: schedule, isLoading, error } = useGetCurrentScheduleQuery();

  const {
    data: jobHistoryData,
    isLoading: isLoadingJobHistory,
    isError: isErrorJobHistory
  } = useGetJobHistoryQuery(undefined, {
    pollingInterval: 5000
  });

  const [activeTab, setActiveTab] = useState<"table" | "gantt" | "recipes">(
    "gantt"
  );
  const [timeRange, setTimeRange] = useState<
    "12hr" | "24hr" | "72hr" | "168hr"
  >("168hr");
  const [timeScale, setTimeScale] = useState<"1h" | "12h" | "24h" | "7d">(
    "24h"
  );
  const [isGrouped, setIsGrouped] = useState(true);

  // Generate mock recipe timeline data
  const recipeTimelineData = useMemo(() => generateMockRecipeTimeline(), []);

  // Convert timeRange to milliseconds
  const getTimeRangeInMs = (range: string): number => {
    switch (range) {
      case "12hr":
        return 12 * 60 * 60 * 1000;
      case "24hr":
        return 24 * 60 * 60 * 1000;
      case "72hr":
        return 72 * 60 * 60 * 1000;
      case "168hr":
        return 168 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  };
  // Function to extrapolate jobs over a time period with priority-based scheduling
  const extrapolateSchedule = useCallback(
    (
      jobs: ScheduleJob[] | undefined,
      timeRangeStr: string,
      currentTime: Date,
      jobHistory?: JobHistoryItem[]
    ): JobInstance[] => {
      if (!jobs || jobs.length === 0) return [];

      const now = currentTime;
      const endTime = new Date(now.getTime() + getTimeRangeInMs(timeRangeStr));

      // Separate calibration and measurement jobs
      const calibrationJobs = jobs.filter(
        (job) => job.job_type === "calibration"
      ) as CalibrationJob[];
      const measurementJobs = jobs.filter(
        (job) => job.job_type === "measure"
      ) as MeasurementJob[];

      // Phase 1: Schedule all calibration jobs first (they have priority)
      const calibrationInstances: JobInstance[] = [];

      calibrationJobs.forEach((job) => {
        let currentStart = new Date(job.start_epoch * 1000);
        const jobDuration = job.job_duration_seconds * 1000;

        // Check if this is a currently running calibration
        const currentEnd = new Date(currentStart.getTime() + jobDuration);
        if (currentStart < now && currentEnd > now) {
          calibrationInstances.push({
            id: `calib_${job.schedule_id}_${currentStart.getTime()}`,
            jobType: "calibration",
            startTime: currentStart,
            endTime: currentEnd,
            recipe: job.recipe,
            originalJob: job
          });

          // Calculate next occurrence after this one completes
          switch (job.frequency_unit) {
            case "minutes":
              currentStart = addMinutes(currentEnd, job.frequency_amount);
              break;
            case "hours":
              currentStart = addHours(currentEnd, job.frequency_amount);
              break;
            case "days":
              currentStart = addDays(currentEnd, job.frequency_amount);
              break;
            case "weeks":
              currentStart = addWeeks(currentEnd, job.frequency_amount);
              break;
            default:
              currentStart = addDays(currentEnd, job.frequency_amount);
              break;
          }
        }
        // If calibration started in the past and completed, find next occurrence
        else if (currentStart < now) {
          const calculateNextOccurrence = (date: Date) => {
            switch (job.frequency_unit) {
              case "minutes":
                return addMinutes(date, job.frequency_amount);
              case "hours":
                return addHours(date, job.frequency_amount);
              case "days":
                return addDays(date, job.frequency_amount);
              case "weeks":
                return addWeeks(date, job.frequency_amount);
              default:
                return addDays(date, job.frequency_amount);
            }
          };

          while (currentStart < now) {
            currentStart = calculateNextOccurrence(currentStart);
          }
        }

        // Add all future calibration instances
        while (currentStart < endTime) {
          const currentEnd = new Date(
            currentStart.getTime() + job.job_duration_seconds * 1000
          );

          calibrationInstances.push({
            id: `calib_${job.schedule_id}_${currentStart.getTime()}`,
            jobType: "calibration",
            startTime: currentStart,
            endTime: currentEnd,
            recipe: job.recipe,
            originalJob: job
          });

          // Calculate next occurrence
          switch (job.frequency_unit) {
            case "minutes":
              currentStart = addMinutes(currentStart, job.frequency_amount);
              break;
            case "hours":
              currentStart = addHours(currentStart, job.frequency_amount);
              break;
            case "days":
              currentStart = addDays(currentStart, job.frequency_amount);
              break;
            case "weeks":
              currentStart = addWeeks(currentStart, job.frequency_amount);
              break;
            default:
              currentStart = addDays(currentStart, job.frequency_amount);
              break;
          }
        }
      });

      // Sort calibrations by start time
      calibrationInstances.sort((a, b) => compareAsc(a.startTime, b.startTime));

      // Phase 2: Resolve calibration conflicts (calibration vs calibration)
      const resolvedCalibrations: JobInstance[] = [];
      let lastCalibEnd: Date | null = null;

      calibrationInstances.forEach((calib) => {
        if (!lastCalibEnd || isAfter(calib.startTime, lastCalibEnd)) {
          // No conflict, add as-is
          resolvedCalibrations.push(calib);
          lastCalibEnd = calib.endTime;
        } else {
          // Calibration conflict - shift this one to start after the previous one
          const adjustedStart = new Date(lastCalibEnd);
          const adjustedEnd = new Date(
            adjustedStart.getTime() +
              (calib.originalJob as CalibrationJob).job_duration_seconds * 1000
          );

          if (isBefore(adjustedEnd, endTime)) {
            resolvedCalibrations.push({
              ...calib,
              startTime: adjustedStart,
              endTime: adjustedEnd
            });
            lastCalibEnd = adjustedEnd;
          }
        }
      });

      // Phase 3: Fill gaps with measurement jobs
      const allInstances: JobInstance[] = [];

      if (measurementJobs.length > 0) {
        const measurementJob = measurementJobs[0]; // Assume one measurement job type
        const measurementDuration = measurementJob.duration_seconds * 1000;
        let hasCurrentMeasurement = false;

        // Check for currently running jobs from job history
        const runningMeasurement = jobHistory?.find(
          (job) =>
            job.job_status === "in_progress" && job.job_type === "measure"
        );
        const runningCalibration = jobHistory?.find(
          (job) =>
            job.job_status === "in_progress" && job.job_type === "calibration"
        );

        // Check for queued jobs (created but not started)
        const queuedJobs =
          jobHistory?.filter((job) => job.job_status === "created") || [];
        const queuedMeasurement = queuedJobs.find(
          (job) => job.job_type === "measure"
        );
        const queuedCalibration = queuedJobs.find(
          (job) => job.job_type === "calibration"
        );

        let currentMeasurementStart: Date;
        let currentMeasurementEnd: Date;

        if (runningMeasurement && runningMeasurement.start_time) {
          // Use actual start time from job history
          hasCurrentMeasurement = true;
          currentMeasurementStart = new Date(
            runningMeasurement.start_time * 1000
          ); // Convert from Unix timestamp
          currentMeasurementEnd = new Date(
            currentMeasurementStart.getTime() +
              runningMeasurement.duration * 1000
          );

          // Include the currently running measurement
          allInstances.push({
            id: `measure_${currentMeasurementStart.getTime()}`,
            jobType: "measure",
            startTime: currentMeasurementStart,
            endTime: currentMeasurementEnd,
            originalJob: measurementJob
          });

          // Shift any calibrations that would conflict with this currently running measurement
          resolvedCalibrations.forEach((calib) => {
            if (
              calib.startTime < currentMeasurementEnd &&
              calib.endTime > currentMeasurementStart
            ) {
              // Calibration conflicts with currently running measurement - delay it until measurement ends
              const delay =
                currentMeasurementEnd.getTime() - calib.startTime.getTime();
              calib.startTime = new Date(currentMeasurementEnd);
              calib.endTime = new Date(calib.endTime.getTime() + delay);
            }
          });
        }

        // For now, just add calibrations - we'll resolve conflicts at the end
        allInstances.push(...resolvedCalibrations);

        // Include currently running calibration if it exists
        if (runningCalibration && runningCalibration.start_time) {
          const runningCalibStart = new Date(
            runningCalibration.start_time * 1000
          );
          const runningCalibEnd = new Date(
            runningCalibStart.getTime() + runningCalibration.duration * 1000
          );

          // Add the currently running calibration
          allInstances.push({
            id: `running_calib_${runningCalibration.job_id}`,
            jobType: "calibration",
            startTime: runningCalibStart,
            endTime: runningCalibEnd,
            recipe: runningCalibration.recipe_id,
            originalJob: {
              job_type: "calibration",
              schedule_id: runningCalibration.job_id.toString(),
              frequency_unit: "hours",
              frequency_amount: 1,
              start_epoch: runningCalibration.start_time,
              job_duration_seconds: runningCalibration.duration,
              recipe: runningCalibration.recipe_id
            }
          });
        }

        // Calculate where measurements should start based on actual job queue and cadence
        let fillStart: Date;
        if (hasCurrentMeasurement) {
          fillStart = currentMeasurementEnd;
        } else {
          // Queue prioritization: When both measurement and calibration are queued, calibration wins
          if (queuedCalibration && queuedMeasurement) {
            // Both are queued - calibration has priority, so measurement waits
            const nextCalibration = resolvedCalibrations.find(
              (calib) => calib.startTime >= now
            );
            if (nextCalibration) {
              fillStart = nextCalibration.endTime;
            } else {
              fillStart = now;
            }
          } else if (queuedMeasurement) {
            // Only measurement is queued - it should run next
            fillStart = now;
          } else {
            // No queued jobs - calculate next measurement time based on original schedule
            const originalStart = new Date(measurementJob.start_epoch * 1000);
            if (originalStart >= now) {
              fillStart = originalStart;
            } else {
              const elapsedTime = now.getTime() - originalStart.getTime();
              const intervals = Math.ceil(elapsedTime / measurementDuration);
              fillStart = new Date(
                originalStart.getTime() + intervals * measurementDuration
              );
            }
          }
        }

        resolvedCalibrations.forEach((calib, index) => {
          // Fill gap before this calibration
          while (fillStart < calib.startTime) {
            const measurementEnd = new Date(
              fillStart.getTime() + measurementDuration
            );

            // If measurement would overlap with calibration, let measurement finish and shift calibration
            if (measurementEnd > calib.startTime) {
              // Add the full measurement
              allInstances.push({
                id: `measure_${fillStart.getTime()}`,
                jobType: "measure",
                startTime: fillStart,
                endTime: measurementEnd,
                originalJob: measurementJob
              });

              // Shift the calibration to start after this measurement
              const delay =
                measurementEnd.getTime() - calib.startTime.getTime();
              calib.startTime = new Date(measurementEnd);
              calib.endTime = new Date(calib.endTime.getTime() + delay);

              fillStart = measurementEnd;
              break;
            } else {
              // Full measurement fits before calibration
              allInstances.push({
                id: `measure_${fillStart.getTime()}`,
                jobType: "measure",
                startTime: fillStart,
                endTime: measurementEnd,
                originalJob: measurementJob
              });
              fillStart = measurementEnd;
            }
          }

          // Move fill start to after this calibration
          fillStart = calib.endTime;
        });

        // Fill remaining time after last calibration
        while (fillStart < endTime) {
          const measurementEnd = new Date(
            fillStart.getTime() + measurementDuration
          );

          if (measurementEnd > endTime) {
            // Truncate to fit in time window
            const availableTime = endTime.getTime() - fillStart.getTime();
            if (availableTime >= 60000) {
              // 1 minute minimum
              allInstances.push({
                id: `measure_${fillStart.getTime()}`,
                jobType: "measure",
                startTime: fillStart,
                endTime: endTime,
                originalJob: measurementJob
              });
            }
            break;
          } else {
            allInstances.push({
              id: `measure_${fillStart.getTime()}`,
              jobType: "measure",
              startTime: fillStart,
              endTime: measurementEnd,
              originalJob: measurementJob
            });
            fillStart = measurementEnd;
          }
        }
      } else {
        // No measurement jobs, just add calibrations
        allInstances.push(...resolvedCalibrations);
      }

      // Final sort by start time
      allInstances.sort((a, b) => compareAsc(a.startTime, b.startTime));

      // Final conflict resolution with smart prioritization
      const finalSchedule: JobInstance[] = [];
      let lastEndTime: Date | null = null;

      allInstances.forEach((job) => {
        if (!lastEndTime || isAfter(job.startTime, lastEndTime)) {
          // No conflict, add as-is
          finalSchedule.push(job);
          lastEndTime = job.endTime;
        } else {
          // There's a conflict - handle based on job type
          const delay = lastEndTime.getTime() - job.startTime.getTime();

          if (job.jobType === "calibration") {
            // For calibrations: always delay to start immediately after previous job
            const adjustedStart = new Date(lastEndTime);
            const jobDuration = job.endTime.getTime() - job.startTime.getTime();
            const adjustedEnd = new Date(adjustedStart.getTime() + jobDuration);

            if (isBefore(adjustedEnd, endTime)) {
              finalSchedule.push({
                ...job,
                startTime: adjustedStart,
                endTime: adjustedEnd
              });
              lastEndTime = adjustedEnd;
            }
          } else {
            // For measurements: skip if conflict with calibration (calibrations have priority)
            const previousJob = finalSchedule[finalSchedule.length - 1];
            if (previousJob && previousJob.jobType === "calibration") {
              // Skip this measurement - calibration takes priority
              // Don't add to schedule, don't update lastEndTime
            } else {
              // Delay measurement normally
              const adjustedStart = new Date(lastEndTime);
              const jobDuration =
                job.endTime.getTime() - job.startTime.getTime();
              const adjustedEnd = new Date(
                adjustedStart.getTime() + jobDuration
              );

              if (isBefore(adjustedEnd, endTime)) {
                finalSchedule.push({
                  ...job,
                  startTime: adjustedStart,
                  endTime: adjustedEnd
                });
                lastEndTime = adjustedEnd;
              }
            }
          }
        }
      });

      return finalSchedule;
    },
    []
  );

  // Generate the schedule based on current data and selected time range
  const scheduledJobs = useMemo(() => {
    // Create a clean current time without random seconds/milliseconds
    // TODO: This should come from backend API in a real implementation
    const cleanCurrentTime = new Date();
    cleanCurrentTime.setSeconds(0, 0); // Remove seconds and milliseconds

    return extrapolateSchedule(
      schedule,
      timeRange,
      cleanCurrentTime,
      jobHistoryData
    );
  }, [schedule, timeRange, jobHistoryData, extrapolateSchedule]);

  // Map our timeRange to timeScale for the Gantt chart
  const mapTimeRangeToTimeScale = (
    timeRange: string
  ): "1min" | "1h" | "12h" | "24h" | "7d" => {
    switch (timeRange) {
      case "12hr":
        return "12h";
      case "24hr":
        return "24h";
      case "72hr":
        return "24h"; // Show 24h scale for 72h
      case "168hr":
        return "7d"; // 7 days
      default:
        return "24h";
    }
  };

  // Update timeScale when timeRange changes
  // useMemo(() => {
  //   setTimeScale(mapTimeRangeToTimeScale(timeRange));
  // }, [timeRange]);

  return (
    <Card className="relative flex flex-col shadow-xl p-6 h-full">
      <CardTitle className="mb-3 pb-2 dark:border-neutral-700 border-b-2 font-semibold dark:text-white text-base md:text-xl leading-none tracking-tight">
        Schedule
      </CardTitle>

      {/* Tabs Navigation */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "gantt"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("gantt")}
        >
          <CalendarRange className="inline-block mr-1 w-4 h-4" />
          Timeline View
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "table"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("table")}
        >
          <ListFilter className="inline-block mr-1 w-4 h-4" />
          Table View
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "recipes"
              ? "border-b-2 border-primary-500 text-primary-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("recipes")}
        >
          <Clock className="inline-block mr-1 w-4 h-4" />
          Recipe Timeline
        </button>
      </div>

      {/* Table View */}
      {activeTab === "table" ? (
        isLoading ? (
          <div>Loading schedule...</div>
        ) : error ? (
          <div>Error loading schedule</div>
        ) : scheduledJobs.length === 0 ? (
          <div>No jobs scheduled in the selected time range</div>
        ) : (
          <div className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg max-h-[calc(50vh-200px)] overflow-y-auto">
            <h4 className="mb-3 font-medium">Schedule</h4>
            {isErrorJobHistory && (
              <div className="bg-red-50 px-2 py-1 rounded-full text-red-500 text-xs">
                Error loading job history
              </div>
            )}
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-2 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Job Type
                  </th>
                  <th className="py-2 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="py-2 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="py-2 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="py-2 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                    Recipe
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduledJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="py-2 text-sm">
                      <span className={` `}>
                        {job.jobType === "measure"
                          ? "Measurement"
                          : "Calibration"}
                      </span>
                    </td>
                    <td className="py-2 text-sm">
                      {formatDateTime(job.startTime)}
                    </td>
                    <td className="py-2 text-sm">
                      {formatDateTime(job.endTime)}
                    </td>
                    <td className="py-2 text-sm">
                      {Math.round(
                        (job.endTime.getTime() - job.startTime.getTime()) /
                          60000
                      )}{" "}
                      minutes
                    </td>
                    <td className="py-2 text-sm">
                      {job.recipe
                        ? `Recipe ${job.recipe}`
                        : job.originalJob.recipe_row_id
                        ? `Recipe ${job.originalJob.recipe_row_id}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Gantt Chart View - only show when not in recipe timeline tab */
        activeTab !== "recipes" &&
        (isLoading ? (
          <div>Loading schedule...</div>
        ) : error ? (
          <div>Error loading schedule</div>
        ) : scheduledJobs.length === 0 ? (
          <div className="bg-white p-8 border border-gray-200 rounded-lg text-gray-500 text-center">
            <div className="mb-2">
              No jobs scheduled in the selected time range
            </div>
          </div>
        ) : (
          <ScheduledTimeline
            currentTime={new Date()}
            jobs={scheduledJobs}
            timeScale={timeScale}
            setTimeScale={setTimeScale}
            isGrouped={isGrouped}
            setIsGrouped={setIsGrouped}
          />
        ))
      )}

      {/* Recipe Timeline View */}
      {activeTab === "recipes" && (
        <RecipeTimeline
          currentTime={new Date()}
          recipes={recipeTimelineData}
          timeScale={timeScale}
          setTimeScale={setTimeScale}
        />
      )}

      {/* Hidden section - only show when not in recipe timeline tab */}
      {activeTab !== "recipes" && (
        <div className="hidden mt-8">
          <h3 className="mb-2 font-medium text-lg">Active Schedule</h3>
          {isLoading ? (
            <div>Loading schedule...</div>
          ) : error ? (
            <div>Error loading schedule</div>
          ) : schedule?.length === 0 ? (
            <div className="text-gray-500">No items on schedule</div>
          ) : (
            <ul className="space-y-4 max-w-md">
              {schedule?.map((job, index) => (
                <li
                  key={index}
                  className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="inline-block bg-white mr-2 px-3 py-1 rounded-full ring-1 ring-primary-500/20 font-medium text-primary-500 text-sm">
                        {job.job_type === "measure"
                          ? "Measurement"
                          : "Calibration"}
                      </span>
                      {job.job_type === "calibration" && (
                        <span className="text-gray-500 text-sm">
                          ID: {job.schedule_id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="gap-2 grid grid-cols-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-500">Start Time:</span>
                      <span className="font-medium">
                        {formatUnixTimestamp(job.start_epoch)}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">
                        {job.job_type === "measure"
                          ? `${job.duration_seconds / 60} minutes`
                          : `${job.job_duration_seconds / 60} minutes`}
                      </span>
                    </div>

                    {job.job_type === "calibration" && (
                      <>
                        <div className="flex flex-col">
                          <span className="text-gray-500">Recipe:</span>
                          <span className="font-medium">{job.recipe}</span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-gray-500">Frequency:</span>
                          <span className="font-medium">
                            Every {job.frequency_amount} {job.frequency_unit}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

export default ScheduleComponent;
