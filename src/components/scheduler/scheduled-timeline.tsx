import { Button } from "@/components/ui/button";
import { useGetAllRecipesQuery } from "@/pages/method/data/recipes.slice";
import { formatDateTime, formatLabel, formatTime } from "@/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, RotateCcw } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

// Define ScheduleJob types to avoid circular dependency
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

// JobInstance interface matches the one from scheduler.tsx
interface JobInstance {
  id: string;
  jobType: "measure" | "calibration";
  startTime: Date;
  endTime: Date;
  recipe?: number;
  originalJob: ScheduleJob;
}

interface TimelineRow {
  type: string;
  label: string;
  showFrequency: boolean;
  frequency?: string;
  scheduleDetails?: ScheduleJob;
  jobType: "measure" | "calibration";
  recipeId: number;
}

interface ScheduledTimelineProps {
  currentTime: Date;
  jobs: JobInstance[];
  timeScale: "1h" | "12h" | "24h" | "7d";
  setTimeScale: (scale: "1h" | "12h" | "24h" | "7d") => void;
  isGrouped: boolean;
  setIsGrouped: (grouped: boolean) => void;
  onScheduleJob?: (recipeId?: number) => void;
}

const ScheduledTimeline: React.FC<ScheduledTimelineProps> = ({
  currentTime,
  jobs,
  timeScale,
  setTimeScale,
  isGrouped,
  setIsGrouped,
  onScheduleJob
}) => {
  // Fetch recipes for name lookup
  const { data: recipes } = useGetAllRecipesQuery();

  // Create recipe lookup map
  const recipeMap = useMemo(() => {
    if (!recipes) return new Map();
    //@TODO  this should proabably be recipe_id but the backend is not returning it correctly
    return new Map(
      recipes.map((recipe) => [recipe.recipe_row_id, recipe.recipe_name])
    );
  }, [recipes]);

  // Get recipe name by ID
  const getRecipeName = (recipeId?: number) => {
    if (!recipeId) return "";
    return recipeMap.get(recipeId) || `Recipe ${recipeId}`;
  };

  // Timeline window state - defines what portion of the schedule we're viewing
  const [windowStartTime, setWindowStartTime] = useState<Date>(() => {
    // Start the window to include any currently running jobs
    const runningJobs = jobs.filter(
      (job) => job.startTime <= currentTime && job.endTime > currentTime
    );

    if (runningJobs.length > 0) {
      // Start window from the earliest running job's start time
      const earliestStart = Math.min(
        ...runningJobs.map((job) => job.startTime.getTime())
      );
      return new Date(earliestStart);
    }

    // Default to starting 30 minutes before current time to show context
    return new Date(currentTime.getTime() - 30 * 60 * 1000);
  });

  // Track if user has manually panned - prevents auto-reset
  const [hasUserPanned, setHasUserPanned] = useState(false);

  // Track previous NOW position to detect if change is due to window manipulation
  const [previousNowPosition, setPreviousNowPosition] = useState<number>(0);
  const [isWindowChanging, setIsWindowChanging] = useState(false);

  // Hover state for timeline
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    time: Date;
    job?: JobInstance;
    jobs: JobInstance[];
  } | null>(null);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);

  // Update window when timeScale changes, but respect user panning
  useEffect(() => {
    // Only auto-reset if user hasn't manually panned or if timeScale changed
    if (hasUserPanned) return;

    // Mark that window is changing
    setIsWindowChanging(true);

    // When timeScale changes, reset window to show current context
    const runningJobs = jobs.filter(
      (job) => job.startTime <= currentTime && job.endTime > currentTime
    );

    if (runningJobs.length > 0) {
      const earliestStart = Math.min(
        ...runningJobs.map((job) => job.startTime.getTime())
      );
      setWindowStartTime(new Date(earliestStart));
    } else {
      setWindowStartTime(new Date(currentTime.getTime() - 30 * 60 * 1000));
    }

    // Reset window changing flag after a brief delay
    setTimeout(() => setIsWindowChanging(false), 100);
  }, [timeScale]); // Removed currentTime and jobs from dependencies

  // Reset user panning when timeScale changes
  useEffect(() => {
    setHasUserPanned(false);
  }, [timeScale]);

  // Auto-pan when NOW line goes beyond the right edge
  useEffect(() => {
    // Don't auto-pan if user has manually panned
    if (hasUserPanned) return;

    const nowPosition = getNowLinePosition();

    // If NOW line is beyond 100% (off the right edge), pan forward to bring it back to ~10%
    if (nowPosition > 100) {
      setIsWindowChanging(true);
      const viewDuration = getViewDuration();
      // Calculate new window start time to put NOW at 10% from the left
      const newWindowStart = new Date(
        currentTime.getTime() - viewDuration * 0.1
      );
      setWindowStartTime(newWindowStart);
      // Reset window changing flag after a brief delay
      setTimeout(() => setIsWindowChanging(false), 100);
    }
  }, [currentTime, windowStartTime, hasUserPanned]); // Monitor currentTime changes

  // Track NOW position changes to detect window vs time changes
  useEffect(() => {
    const currentNowPosition = getNowLinePosition();
    const positionDiff = Math.abs(currentNowPosition - previousNowPosition);

    // If position changed by more than 5% and it's not a window change,
    // it's likely due to window manipulation
    if (positionDiff > 5 && !isWindowChanging) {
      setIsWindowChanging(true);
      setTimeout(() => setIsWindowChanging(false), 100);
    }

    setPreviousNowPosition(currentNowPosition);
  }, [windowStartTime]);

  // Calculate the rows based on job types and recipes with stable sorting
  const rows = useMemo(() => {
    const recipeRowMap = new Map<string, TimelineRow>();

    jobs.forEach((job) => {
      const recipeId = job.recipe;
      const rowKey = `${job.jobType}_${recipeId || "default"}`;

      if (!recipeRowMap.has(rowKey)) {
        const recipeName = getRecipeName(recipeId);
        recipeRowMap.set(rowKey, {
          type: rowKey,
          label:
            job.jobType === "calibration"
              ? `Calibration${recipeName ? ` - ${recipeName}` : ""}`
              : `Measurement${recipeName ? ` - ${recipeName}` : ""}`,
          showFrequency: job.jobType === "calibration",
          frequency:
            job.jobType === "calibration" &&
            job.originalJob.job_type === "calibration"
              ? `Every ${
                  (job.originalJob as CalibrationJob).frequency_amount
                } ${(job.originalJob as CalibrationJob).frequency_unit}`
              : undefined,
          scheduleDetails: job.originalJob,
          jobType: job.jobType,
          recipeId: recipeId || 0
        });
      }
    });

    // Convert to array and sort: measurements first, then by recipe ID for stable ordering
    return Array.from(recipeRowMap.values()).sort((a, b) => {
      // Measurements always come first
      if (a.jobType !== b.jobType) {
        if (a.jobType === "measure") return -1;
        if (b.jobType === "measure") return 1;
      }
      // Within same job type, sort by recipe ID for consistent ordering
      return a.recipeId - b.recipeId;
    });
  }, [jobs, getRecipeName]);

  const getViewDuration = () => {
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

  const windowEndTime = useMemo(() => {
    return new Date(windowStartTime.getTime() + getViewDuration());
  }, [windowStartTime, timeScale]);

  const getJobPosition = (startTime: Date, endTime: Date) => {
    const viewDuration = getViewDuration();
    const windowStart = windowStartTime.getTime();

    const startOffset = startTime.getTime() - windowStart;
    const duration = endTime.getTime() - startTime.getTime();

    return {
      left: `${(startOffset / viewDuration) * 100}%`,
      width: `${(duration / viewDuration) * 100}%`
    };
  };

  // Calculate position of the "now" line
  const getNowLinePosition = () => {
    const viewDuration = getViewDuration();
    const windowStart = windowStartTime.getTime();
    const nowOffset = currentTime.getTime() - windowStart;
    return (nowOffset / viewDuration) * 100;
  };

  // Handle mouse movement on timeline
  const handleTimelineMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const timelineElement = event.currentTarget;
    const rect = timelineElement.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;

    // Account for the left column width (w-48 = 192px)
    const leftColumnWidth = 192; // 48 * 4px (Tailwind's w-48)
    const timelineAreaX = relativeX - leftColumnWidth;
    const timelineAreaWidth = rect.width - leftColumnWidth;

    // Only calculate if we're actually over the timeline area
    if (timelineAreaX < 0 || timelineAreaX > timelineAreaWidth) {
      setHoverPosition(null);
      return;
    }

    // Calculate percentage position within the timeline area only
    const positionPercent = (timelineAreaX / timelineAreaWidth) * 100;

    // Calculate the time at this position
    const viewDuration = getViewDuration();
    const timeOffset = (positionPercent / 100) * viewDuration;
    const hoverTime = new Date(windowStartTime.getTime() + timeOffset);

    // Find which job (if any) is at this time
    const jobsAtTime = visibleJobs.filter(
      (job) => hoverTime >= job.startTime && hoverTime <= job.endTime
    );

    setHoverPosition({
      x: positionPercent,
      time: hoverTime,
      job: jobsAtTime[0], // Primary job for backward compatibility
      jobs: jobsAtTime // All jobs at this time
    });
  };

  const handleTimelineMouseEnter = () => {
    setIsHoveringTimeline(true);
  };

  const handleTimelineMouseLeave = () => {
    setIsHoveringTimeline(false);
    setHoverPosition(null);
  };

  // Pan controls
  const panLeft = () => {
    const viewDuration = getViewDuration();
    const panAmount = viewDuration * 0.25; // Pan by 25% of current view
    setIsWindowChanging(true);
    setWindowStartTime(new Date(windowStartTime.getTime() - panAmount));
    setHasUserPanned(true); // Mark that user has manually panned
    setTimeout(() => setIsWindowChanging(false), 100);
  };

  const panRight = () => {
    const viewDuration = getViewDuration();
    const panAmount = viewDuration * 0.25; // Pan by 25% of current view
    setIsWindowChanging(true);
    setWindowStartTime(new Date(windowStartTime.getTime() + panAmount));
    setHasUserPanned(true); // Mark that user has manually panned
    setTimeout(() => setIsWindowChanging(false), 100);
  };

  const resetToNow = () => {
    // Reset to show current context
    const runningJobs = jobs.filter(
      (job) => job.startTime <= currentTime && job.endTime > currentTime
    );

    setIsWindowChanging(true);
    if (runningJobs.length > 0) {
      const earliestStart = Math.min(
        ...runningJobs.map((job) => job.startTime.getTime())
      );
      setWindowStartTime(new Date(earliestStart));
    } else {
      setWindowStartTime(new Date(currentTime.getTime() - 30 * 60 * 1000));
    }
    setHasUserPanned(false); // Reset the panning flag
    setTimeout(() => setIsWindowChanging(false), 100);
  };

  const renderTimeMarkers = () => {
    const markers = [];
    const HOUR = 60 * 60 * 1000;
    const FIFTEEN_MIN = 15 * 60 * 1000;
    const FIVE_SEC = 5 * 1000;
    const viewDuration = getViewDuration();

    // Round the window start time to the nearest hour (at the beginning of the hour)
    const hourAlignedTime = new Date(windowStartTime);
    hourAlignedTime.setMinutes(0, 0, 0);

    if (timeScale === "7d") {
      const markerCount = 7;
      const dayInterval = 24 * HOUR;

      // For 7d view, align to start of day
      const firstMarkerTime = new Date(hourAlignedTime);
      firstMarkerTime.setHours(0, 0, 0, 0);

      for (let i = 0; i <= markerCount; i++) {
        const markerTime = new Date(
          firstMarkerTime.getTime() + i * dayInterval
        );
        const position =
          ((markerTime.getTime() - windowStartTime.getTime()) / viewDuration) *
          100;

        // Only show markers that are within the visible area
        if (position >= -5 && position <= 105) {
          const weekday = markerTime.toLocaleDateString(undefined, {
            weekday: "short"
          });
          const date = markerTime.getDate();
          const time = "00:00";

          markers.push(
            <div
              key={i}
              className={`top-0 absolute border-gray-100 border-l h-full`}
              style={{ left: `${position}%` }}
            >
              <div className="-top-8 absolute flex flex-col items-center -translate-x-1/2">
                <span className="text-gray-400 text-xs">{weekday}</span>
                <span className="text-gray-600 text-xs">{date}</span>
                <span className="text-[10px] text-gray-400">{time}</span>
              </div>
            </div>
          );
        }
      }
    } else {
      const markerInterval = timeScale === "1h" ? FIFTEEN_MIN : HOUR;
      const markerCount = Math.ceil(viewDuration / markerInterval) + 2; // Add extra markers for smooth panning

      // For hour views, create hour-aligned markers
      for (let i = -1; i <= markerCount; i++) {
        let markerTime: Date;

        if (timeScale === "1h") {
          // For 1h view, show 15-min markers
          markerTime = new Date(hourAlignedTime.getTime() + i * markerInterval);
        } else {
          // For 12h and 24h views, show hourly markers
          markerTime = new Date(hourAlignedTime.getTime() + i * HOUR);
        }

        const position =
          ((markerTime.getTime() - windowStartTime.getTime()) / viewDuration) *
          100;

        // Only show markers that are within the visible area (with some buffer)
        if (position >= -5 && position <= 105) {
          // Only display the hour part for hour markers, full time for 15-min markers
          const label =
            timeScale === "1h"
              ? formatTime(markerTime)
              : `${markerTime.getHours()}:00`;

          markers.push(
            <div
              key={i}
              className="top-0 absolute border-gray-100 border-l h-full"
              style={{ left: `${position}%` }}
            >
              <span
                className={`-top-6 absolute text-gray-500 text-xs whitespace-nowrap -translate-x-1/2 ${
                  position > 100 ? "hidden" : ""
                }`}
              >
                {label}
              </span>
            </div>
          );
        }
      }
    }
    return markers;
  };

  interface GroupedJob {
    jobType: "measure" | "calibration";
    recipe?: number;
    startTime: Date;
    endTime: Date;
    count: number;
    rowType: string;
  }

  const groupSequentialJobs = (
    rowJobs: JobInstance[]
  ): (GroupedJob | JobInstance)[] => {
    if (!isGrouped) return rowJobs;

    const groups: GroupedJob[] = [];
    let currentGroup: GroupedJob | null = null;

    // Sort jobs by start time
    const sortedJobs = [...rowJobs].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    sortedJobs.forEach((job) => {
      const rowType = `${job.jobType}_${job.recipe || "default"}`;

      if (!currentGroup) {
        currentGroup = {
          jobType: job.jobType,
          recipe: job.recipe,
          startTime: job.startTime,
          endTime: job.endTime,
          count: 1,
          rowType
        };
      } else {
        // Check if this job starts right after the current group ends
        // and is of the same type/recipe
        if (
          Math.abs(job.startTime.getTime() - currentGroup.endTime.getTime()) <
            1000 &&
          job.jobType === currentGroup.jobType &&
          job.recipe === currentGroup.recipe
        ) {
          currentGroup.endTime = job.endTime;
          currentGroup.count++;
        } else {
          groups.push(currentGroup);
          currentGroup = {
            jobType: job.jobType,
            recipe: job.recipe,
            startTime: job.startTime,
            endTime: job.endTime,
            count: 1,
            rowType
          };
        }
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  // Filter jobs to only show those that are visible in the current window (with some buffer)
  const visibleJobs = useMemo(() => {
    const windowStart = windowStartTime.getTime();
    const windowEnd = windowEndTime.getTime();
    const buffer = getViewDuration() * 0.1; // 10% buffer on each side

    return jobs.filter((job) => {
      const jobStart = job.startTime.getTime();
      const jobEnd = job.endTime.getTime();

      // Show job if it overlaps with the visible window (including buffer)
      return jobEnd >= windowStart - buffer && jobStart <= windowEnd + buffer;
    });
  }, [jobs, windowStartTime, windowEndTime, getViewDuration]);

  // Group jobs by row using visible jobs
  const jobsByRow = useMemo(() => {
    const result = new Map<string, JobInstance[]>();

    rows.forEach((row) => {
      result.set(row.type, []);
    });

    visibleJobs.forEach((job) => {
      const rowType = `${job.jobType}_${job.recipe || "default"}`;
      const rowJobs = result.get(rowType) || [];
      rowJobs.push(job);
      result.set(rowType, rowJobs);
    });

    return result;
  }, [visibleJobs, rows]);

  const nowLinePosition = getNowLinePosition();
  const isNowLineVisible = nowLinePosition >= 0 && nowLinePosition <= 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setTimeScale("1h")}
            variant={timeScale === "1h" ? "default" : "outline"}
            size="sm"
          >
            1h
          </Button>
          <Button
            onClick={() => setTimeScale("12h")}
            variant={timeScale === "12h" ? "default" : "outline"}
            size="sm"
          >
            12h
          </Button>
          <Button
            onClick={() => setTimeScale("24h")}
            variant={timeScale === "24h" ? "default" : "outline"}
            size="sm"
          >
            24h
          </Button>
          <Button
            onClick={() => setTimeScale("7d")}
            variant={timeScale === "7d" ? "default" : "outline"}
            size="sm"
          >
            7 days
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* <Button onClick={() => setIsGrouped(!isGrouped)} variant="outline" size="sm">
            {isGrouped ? "Show Individual" : "Group Sequential"}
          </Button> */}

          {/* Show status indicator when NOW is not visible */}
          {!isNowLineVisible && (
            <div className="flex items-center gap-2 bg-orange-50 px-2 py-1 rounded-md text-orange-600 text-sm">
              <div className="bg-orange-500 rounded-full w-2 h-2 animate-pulse"></div>
              Current time is{" "}
              {nowLinePosition < 0 ? "in the past" : "in the future"}
            </div>
          )}

          {/* Pan controls */}
          <div className="hidden flex items-center gap-1 border rounded-md">
            <Button
              onClick={panLeft}
              variant="ghost"
              size="sm"
              className="p-0 w-8 h-8"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              onClick={resetToNow}
              variant={!isNowLineVisible ? "default" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 ${
                !isNowLineVisible
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : ""
              }`}
              title={
                !isNowLineVisible
                  ? "Jump to current time - NOW is off-screen"
                  : "Reset to current time"
              }
            >
              <RotateCcw size={14} />
            </Button>
            <Button
              onClick={panRight}
              variant="ghost"
              size="sm"
              className="p-0 w-8 h-8"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg w-full">
        <div
          className="relative"
          onMouseMove={handleTimelineMouseMove}
          onMouseEnter={handleTimelineMouseEnter}
          onMouseLeave={handleTimelineMouseLeave}
        >
          <div className="relative pl-48 border-gray-200 border-b h-8">
            <div className="relative w-full h-full">
              {renderTimeMarkers()}

              {/* "Now" indicator line */}
              {nowLinePosition >= 0 && nowLinePosition <= 100 && (
                <motion.div
                  key={isWindowChanging ? `window-${Date.now()}` : "stable"}
                  className="top-0 z-10 absolute bg-red-500 w-0.5 h-full"
                  style={{
                    transform: "translateZ(0)", // Force hardware acceleration
                    backfaceVisibility: "hidden" // Reduce rendering artifacts
                  }}
                  animate={{
                    left: `${Math.round(nowLinePosition * 100) / 100}%`
                  }}
                  initial={{
                    left: `${Math.round(nowLinePosition * 100) / 100}%`
                  }}
                  transition={{
                    duration: isWindowChanging ? 0 : 1,
                    ease: "linear",
                    type: "tween"
                  }}
                >
                  <div className="-top-6 absolute bg-red-500 px-1 py-0.5 rounded w-16 text-white text-xs text-center whitespace-nowrap -translate-x-1/2">
                    NOW{" "}
                    <span className="hidden">{formatTime(currentTime)}</span>
                  </div>
                </motion.div>
              )}

              {/* Hover time indicator */}
              {isHoveringTimeline &&
                hoverPosition &&
                hoverPosition.x >= 0 &&
                hoverPosition.x <= 100 && (
                  <div
                    className="top-0 z-20 absolute bg-primary-500 w-0.5 h-full pointer-events-none"
                    style={{ left: `${hoverPosition.x}%` }}
                  >
                    <div className="-top-12 absolute bg-primary-500 px-2 py-1 rounded max-w-64 text-white text-xs text-center whitespace-nowrap -translate-x-1/2">
                      <div className="font-medium">
                        {timeScale === "7d"
                          ? formatDateTime(hoverPosition.time)
                          : formatDateTime(hoverPosition.time)}
                      </div>
                      {hoverPosition.jobs && hoverPosition.jobs.length > 0 ? (
                        <div className="opacity-90 mt-0.5 text-[10px]">
                          {hoverPosition.jobs.length === 1 ? (
                            <>
                              {hoverPosition.jobs[0].jobType === "measure"
                                ? "Measurement"
                                : "Calibration"}
                              {hoverPosition.jobs[0].recipe &&
                                ` - ${getRecipeName(
                                  hoverPosition.jobs[0].recipe
                                )}`}
                            </>
                          ) : (
                            <>
                              {hoverPosition.jobs.length} jobs running:
                              <br />
                              {hoverPosition.jobs.map((job, index) => (
                                <div key={index}>
                                  {job.jobType === "measure"
                                    ? "Measurement"
                                    : "Calibration"}
                                  {job.recipe &&
                                    ` - ${getRecipeName(job.recipe)}`}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="opacity-75 mt-0.5 text-[10px]">
                          No job scheduled
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {rows.map((row) => {
            const rowJobs = jobsByRow.get(row.type) || [];
            // Check if any job in this row is currently running
            const isRowRunning = rowJobs.some(
              (job) =>
                job.startTime.getTime() <= currentTime.getTime() &&
                job.endTime.getTime() >= currentTime.getTime()
            );

            // Get the first job to show schedule details
            const firstJob = rowJobs[0];
            const scheduleDetails = firstJob?.originalJob;

            return (
              <div
                key={row.type}
                className="relative flex border-gray-100 border-b h-28"
              >
                <div className="relative flex-shrink-0 bg-gray-50/50 p-3 border-gray-100 border-r w-48">
                  {/* {isRowRunning && (
                    <div className="bottom-3 left-3 absolute bg-primary-500 mt-1 px-2 rounded-full font-medium text-[10px] text-white">
                      running now
                    </div>
                  )} */}
                  <div
                    className={`mb-1 font-medium text-sm ${
                      isRowRunning ? "text-primary-500" : ""
                    }`}
                  >
                    {formatLabel(getRecipeName(firstJob?.recipe)) ||
                      formatLabel(
                        getRecipeName(scheduleDetails?.recipe_row_id)
                      ) ||
                      row.label}
                  </div>
                  {scheduleDetails && (
                    <div className="space-y-1 text-gray-600 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start:</span>
                        <span className="font-medium text-[10px] leading-tight">
                          {formatDateTime(
                            new Date(scheduleDetails.start_epoch * 1000)
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">
                          {scheduleDetails.job_type === "measure"
                            ? `${
                                (scheduleDetails as MeasurementJob)
                                  .duration_seconds / 60
                              }min`
                            : `${
                                (scheduleDetails as CalibrationJob)
                                  .job_duration_seconds / 60
                              }min`}
                        </span>
                      </div>

                      {scheduleDetails.job_type === "calibration" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Freq:</span>
                            <span className="font-medium text-[10px]">
                              {
                                (scheduleDetails as CalibrationJob)
                                  .frequency_amount
                              }{" "}
                              {
                                (scheduleDetails as CalibrationJob)
                                  .frequency_unit
                              }
                            </span>
                          </div>
                        </>
                      )}

                      {firstJob?.recipe &&
                        scheduleDetails.job_type === "measure" && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Recipe:</span>
                            <span className="font-medium">
                              {getRecipeName(firstJob?.recipe)}
                            </span>
                          </div>
                        )}
                    </div>
                  )}{" "}
                </div>

                <div className="relative flex-grow h-full overflow-hidden">
                  {/* "Now" indicator line for this row */}
                  {nowLinePosition >= 0 && nowLinePosition <= 100 && (
                    <motion.div
                      key={
                        isWindowChanging
                          ? `row-window-${Date.now()}`
                          : "row-stable"
                      }
                      className="top-0 z-10 absolute bg-red-500 opacity-30 w-0.5 h-full pointer-events-none"
                      style={{
                        transform: "translateZ(0)", // Force hardware acceleration
                        backfaceVisibility: "hidden" // Reduce rendering artifacts
                      }}
                      animate={{
                        left: `${Math.round(nowLinePosition * 100) / 100}%`
                      }}
                      initial={{
                        left: `${Math.round(nowLinePosition * 100) / 100}%`
                      }}
                      transition={{
                        duration: isWindowChanging ? 0 : 1,
                        ease: "linear",
                        type: "tween"
                      }}
                    ></motion.div>
                  )}

                  {/* Hover time indicator for this row */}
                  {isHoveringTimeline &&
                    hoverPosition &&
                    hoverPosition.x >= 0 &&
                    hoverPosition.x <= 100 && (
                      <div
                        className="top-0 z-20 absolute bg-primary-500 opacity-50 w-0.5 h-full pointer-events-none"
                        style={{ left: `${hoverPosition.x}%` }}
                      ></div>
                    )}

                  {groupSequentialJobs(rowJobs).map((job, jobIndex) => {
                    const isGrouped = "count" in job;
                    const position = getJobPosition(job.startTime, job.endTime);

                    // Check if this job is currently running
                    const isRunning =
                      job.startTime.getTime() <= currentTime.getTime() &&
                      job.endTime.getTime() >= currentTime.getTime();

                    return (
                      <div
                        key={
                          isGrouped
                            ? `group-${jobIndex}`
                            : `job-${(job as JobInstance).id}`
                        }
                        className={`absolute top-[10%] h-[80%]   cursor-pointer bg-gray-100 border rounded-lg transition-all group ${
                          isRunning ? " " : ""
                        }`}
                        style={position}
                      >
                        {/* Show count for grouped jobs */}
                        {isGrouped && (
                          <div className="hidden absolute inset-0 flex justify-center items-center font-medium text-gray-600 text-xs">
                            {(job as GroupedJob).count}
                          </div>
                        )}
                        {onScheduleJob && job.recipe && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="right-1 bottom-1 absolute opacity-0 group-hover:opacity-100 p-0 w-5 h-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleJob(job.recipe);
                            }}
                          >
                            <Plus size={10} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduledTimeline;
