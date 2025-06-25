import { useState, useEffect } from "react";
import { formatTime } from "@/utils";

const TimelineQueue = () => {
  const [timeScale, setTimeScale] = useState("12h");

  const roundTo15Minutes = (date) => {
    const ms = 1000 * 60 * 15;
    return new Date(Math.floor(date.getTime() / ms) * ms);
  };

  const getCurrentProgress = () => {
    const now = new Date();
    const blockStart = roundTo15Minutes(now);
    const elapsedMs = now - blockStart;
    const percentage = Math.min(100, (elapsedMs / (15 * 60 * 1000)) * 100);
    const remainingSeconds = Math.max(0, 15 * 60 - Math.floor(elapsedMs / 1000));
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingSecs = remainingSeconds % 60;

    return {
      percentage,
      remaining: `${remainingMinutes}:${remainingSecs.toString().padStart(2, "0")}`,
    };
  };

  const [currentTime, setCurrentTime] = useState(roundTo15Minutes(new Date()));
  const [progress, setProgress] = useState(getCurrentProgress());

  // Generate scheduled tasks (non-comp tasks)
  const generateScheduledTasks = () => {
    // Example scheduled tasks - in real app this would come from your scheduler
    return [
      {
        type: "spike",
        frequency: "weekly",
        // Schedule for top of next hour
        startTime: new Date(Math.ceil(currentTime.getTime() / 3600000) * 3600000),
      },
      {
        type: "5-blend",
        frequency: "weekly",
        // Schedule for 2 hours from now
        startTime: new Date(Math.ceil(currentTime.getTime() / 3600000) * 3600000 + 7200000),
      },
    ];
  };

  // Fill gaps with compliance tasks
  const fillWithCompTasks = (scheduledTasks) => {
    const allTasks = [];
    let currentSlot = new Date(currentTime);

    // Round to next 15 min
    currentSlot.setMinutes(Math.ceil(currentSlot.getMinutes() / 15) * 15, 0, 0);

    // Sort scheduled tasks by start time
    const sortedScheduled = [...scheduledTasks].sort((a, b) => a.startTime - b.startTime);

    sortedScheduled.forEach((scheduledTask, index) => {
      // Fill gap before this scheduled task
      while (currentSlot < scheduledTask.startTime) {
        allTasks.push({
          type: "comp",
          startTime: new Date(currentSlot),
          isGapFiller: true,
        });
        currentSlot = new Date(currentSlot.getTime() + 15 * 60000);
      }

      // Add scheduled task
      allTasks.push(scheduledTask);
      currentSlot = new Date(scheduledTask.startTime.getTime() + 15 * 60000);
    });

    // Fill remaining slots to end of view
    const viewEndTime = new Date(currentTime.getTime() + getViewDuration());
    while (currentSlot < viewEndTime) {
      allTasks.push({
        type: "comp",
        startTime: new Date(currentSlot),
        isGapFiller: true,
      });
      currentSlot = new Date(currentSlot.getTime() + 15 * 60000);
    }

    return allTasks;
  };

  const getViewDuration = () => {
    switch (timeScale) {
      case "12h":
        return 12 * 60 * 60 * 1000;
      case "24h":
        return 24 * 60 * 60 * 1000;
      case "7d":
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 12 * 60 * 60 * 1000;
    }
  };

  // Generate all tasks including gap-filling comp tasks
  const [tasks, setTasks] = useState(() => {
    const scheduled = generateScheduledTasks();
    return fillWithCompTasks(scheduled);
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newProgress = getCurrentProgress();
      setProgress(newProgress);
      setCurrentTime(roundTo15Minutes(new Date()));
      const scheduled = generateScheduledTasks();
      setTasks(fillWithCompTasks(scheduled));
    }, 1000); // Update every second for smooth progress

    return () => clearInterval(intervalId);
  }, [timeScale]); // Add timeScale as dependency since it affects task generation

  const getTaskPosition = (task) => {
    const viewDuration = getViewDuration();
    const diffMillis = task.startTime - currentTime;

    return {
      left: `${(diffMillis / viewDuration) * 100}%`,
      width: `${((15 * 60 * 1000) / viewDuration) * 100}%`,
    };
  };

  const renderTimeMarkers = () => {
    const markers = [];
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const viewDuration = getViewDuration();
    const markerCount = viewDuration / THIRTY_MINUTES;

    for (let i = 0; i <= markerCount; i += 2) {
      // Step by 2 to show every hour
      const markerTime = new Date(currentTime.getTime() + i * THIRTY_MINUTES);
      const position = ((i * THIRTY_MINUTES) / viewDuration) * 100;

      let label;
      if (timeScale === "7d") {
        if (markerTime.getHours() === 0) {
          // Only show day at midnight
          label = markerTime.toLocaleDateString(undefined, { weekday: "short" });
        } else if (markerTime.getHours() % 6 === 0) {
          // Show hours every 6 hours
          label = formatTime(markerTime);
        }
      } else {
        label = formatTime(markerTime);
      }

      if (label) {
        markers.push(
          <div
            key={i}
            className="top-0 absolute border-gray-200 border-l h-full"
            style={{ left: `${position}%` }}>
            <span className="-top-6 absolute text-gray-500 text-xs -translate-x-1/2">{label}</span>
          </div>
        );
      }
    }
    return markers;
  };

  return (
    <div className="p-4 w-full">
      {/* Status Bar */}
      <div className="bg-white mb-6 p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <span className="font-medium text-emerald-600">Running now</span>
            <span className="text-gray-600">Remaining {progress.remaining}</span>
            <span className="text-gray-600">{Math.round(progress.percentage)}% complete</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="bg-gray-100 rounded-full w-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-1000"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTimeScale("12h")}
            className={`px-3 py-1 rounded ${
              timeScale === "12h" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
            }`}>
            12h
          </button>
          <button
            onClick={() => setTimeScale("24h")}
            className={`px-3 py-1 rounded ${
              timeScale === "24h" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
            }`}>
            24h
          </button>
          <button
            onClick={() => setTimeScale("7d")}
            className={`px-3 py-1 rounded ${
              timeScale === "7d" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
            }`}>
            7 days
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative bg-white border border-gray-200 rounded-lg w-full">
        <div className="relative p-2 w-full h-32">
          {renderTimeMarkers()}

          {/* Tasks */}
          {tasks.map((task, index) => {
            const position = getTaskPosition(task);
            const width = parseFloat(position.width);

            return (
              <div
                key={`${task.startTime.getTime()}-${index}`}
                className={`absolute top-8 h-16 rounded-lg ${
                  task.type === "spike"
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : task.type === "5-blend"
                    ? "bg-orange-50 border-orange-200 text-orange-800"
                    : "bg-purple-50 border-purple-200 text-purple-800"
                } border p-2 transition-all overflow-hidden ${
                  task.startTime.getTime() === currentTime.getTime()
                    ? "ring-2 ring-emerald-500 ring-offset-2"
                    : ""
                }`}
                style={position}>
                {width > 3 && (
                  <>
                    <div className="font-medium text-sm truncate">{task.type}</div>
                    {width > 10 && task.frequency && (
                      <div className="text-gray-600 text-xs truncate">{task.frequency}</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineQueue;
