import { Button } from "@/components/ui/button";
import {
  RecipePort,
  RecipeTimelineItem,
  SmartRecipeStep
} from "@/pages/method/data/mock-recipe-timeline";
import { formatDateTime, formatTime } from "@/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface RecipeTimelineProps {
  currentTime: Date;
  recipes: RecipeTimelineItem[];
  timeScale: "1h" | "12h" | "24h" | "7d";
  setTimeScale: (scale: "1h" | "12h" | "24h" | "7d") => void;
}

const RecipeTimeline: React.FC<RecipeTimelineProps> = ({
  currentTime,
  recipes,
  timeScale,
  setTimeScale
}) => {
  // Timeline window state
  const [windowStartTime, setWindowStartTime] = useState<Date>(() => {
    // Start the window to include any currently running recipes
    const runningRecipes = recipes.filter(
      (recipe) =>
        recipe.startTime <= currentTime && recipe.endTime > currentTime
    );

    if (runningRecipes.length > 0) {
      const earliestStart = Math.min(
        ...runningRecipes.map((recipe) => recipe.startTime.getTime())
      );
      return new Date(earliestStart);
    }

    return new Date(currentTime.getTime() - 30 * 60 * 1000);
  });

  const [hasUserPanned, setHasUserPanned] = useState(false);
  const [isWindowChanging, setIsWindowChanging] = useState(false);

  // Hover state for timeline
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    time: Date;
    recipe?: RecipeTimelineItem;
    port?: RecipePort;
    smartStep?: SmartRecipeStep;
  } | null>(null);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);

  // Update window when timeScale changes
  useEffect(() => {
    if (hasUserPanned) return;

    setIsWindowChanging(true);
    const runningRecipes = recipes.filter(
      (recipe) =>
        recipe.startTime <= currentTime && recipe.endTime > currentTime
    );

    if (runningRecipes.length > 0) {
      const earliestStart = Math.min(
        ...runningRecipes.map((recipe) => recipe.startTime.getTime())
      );
      setWindowStartTime(new Date(earliestStart));
    } else {
      setWindowStartTime(new Date(currentTime.getTime() - 30 * 60 * 1000));
    }

    setTimeout(() => setIsWindowChanging(false), 100);
  }, [timeScale]);

  useEffect(() => {
    setHasUserPanned(false);
  }, [timeScale]);

  // Auto-pan when NOW line goes beyond the right edge
  useEffect(() => {
    if (hasUserPanned) return;

    const nowPosition = getNowLinePosition();
    if (nowPosition > 100) {
      setIsWindowChanging(true);
      const viewDuration = getViewDuration();
      const newWindowStart = new Date(
        currentTime.getTime() - viewDuration * 0.1
      );
      setWindowStartTime(newWindowStart);
      setTimeout(() => setIsWindowChanging(false), 100);
    }
  }, [currentTime, windowStartTime, hasUserPanned]);

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

  const getPosition = (startTime: Date, endTime: Date) => {
    const viewDuration = getViewDuration();
    const windowStart = windowStartTime.getTime();

    const startOffset = startTime.getTime() - windowStart;
    const duration = endTime.getTime() - startTime.getTime();

    return {
      left: `${(startOffset / viewDuration) * 100}%`,
      width: `${(duration / viewDuration) * 100}%`
    };
  };

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

    const leftColumnWidth = 192;
    const timelineAreaX = relativeX - leftColumnWidth;
    const timelineAreaWidth = rect.width - leftColumnWidth;

    if (timelineAreaX < 0 || timelineAreaX > timelineAreaWidth) {
      setHoverPosition(null);
      return;
    }

    const positionPercent = (timelineAreaX / timelineAreaWidth) * 100;
    const viewDuration = getViewDuration();
    const timeOffset = (positionPercent / 100) * viewDuration;
    const hoverTime = new Date(windowStartTime.getTime() + timeOffset);

    // Find which recipe, port, or smart step is at this time
    let hoverRecipe: RecipeTimelineItem | undefined;
    let hoverPort: RecipePort | undefined;
    let hoverSmartStep: SmartRecipeStep | undefined;

    for (const recipe of recipes) {
      if (hoverTime >= recipe.startTime && hoverTime <= recipe.endTime) {
        hoverRecipe = recipe;

        // Check ports
        for (const port of recipe.ports) {
          if (hoverTime >= port.startTime && hoverTime <= port.endTime) {
            hoverPort = port;
            break;
          }
        }

        // Check smart recipe steps
        for (const step of recipe.smartRecipeSteps) {
          if (hoverTime >= step.startTime && hoverTime <= step.endTime) {
            hoverSmartStep = step;
            break;
          }
        }
        break;
      }
    }

    setHoverPosition({
      x: positionPercent,
      time: hoverTime,
      recipe: hoverRecipe,
      port: hoverPort,
      smartStep: hoverSmartStep
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
    const panAmount = viewDuration * 0.25;
    setIsWindowChanging(true);
    setWindowStartTime(new Date(windowStartTime.getTime() - panAmount));
    setHasUserPanned(true);
    setTimeout(() => setIsWindowChanging(false), 100);
  };

  const panRight = () => {
    const viewDuration = getViewDuration();
    const panAmount = viewDuration * 0.25;
    setIsWindowChanging(true);
    setWindowStartTime(new Date(windowStartTime.getTime() + panAmount));
    setHasUserPanned(true);
    setTimeout(() => setIsWindowChanging(false), 100);
  };

  const resetToNow = () => {
    const runningRecipes = recipes.filter(
      (recipe) =>
        recipe.startTime <= currentTime && recipe.endTime > currentTime
    );

    setIsWindowChanging(true);
    if (runningRecipes.length > 0) {
      const earliestStart = Math.min(
        ...runningRecipes.map((recipe) => recipe.startTime.getTime())
      );
      setWindowStartTime(new Date(earliestStart));
    } else {
      setWindowStartTime(new Date(currentTime.getTime() - 30 * 60 * 1000));
    }
    setHasUserPanned(false);
    setTimeout(() => setIsWindowChanging(false), 100);
  };

  const renderTimeMarkers = () => {
    const markers = [];
    const HOUR = 60 * 60 * 1000;
    const viewDuration = getViewDuration();

    const hourAlignedTime = new Date(windowStartTime);
    hourAlignedTime.setMinutes(0, 0, 0);

    if (timeScale === "7d") {
      const markerCount = 7;
      const dayInterval = 24 * HOUR;

      const firstMarkerTime = new Date(hourAlignedTime);
      firstMarkerTime.setHours(0, 0, 0, 0);

      for (let i = 0; i <= markerCount; i++) {
        const markerTime = new Date(
          firstMarkerTime.getTime() + i * dayInterval
        );
        const position =
          ((markerTime.getTime() - windowStartTime.getTime()) / viewDuration) *
          100;

        if (position >= -5 && position <= 105) {
          const weekday = markerTime.toLocaleDateString(undefined, {
            weekday: "short"
          });
          const date = markerTime.getDate();
          const time = "00:00";

          markers.push(
            <div
              key={i}
              className="top-0 absolute border-gray-100 border-l h-full"
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
      const markerInterval = timeScale === "1h" ? 15 * 60 * 1000 : HOUR;
      const markerCount = Math.ceil(viewDuration / markerInterval) + 2;

      for (let i = -1; i <= markerCount; i++) {
        let markerTime: Date;

        if (timeScale === "1h") {
          markerTime = new Date(hourAlignedTime.getTime() + i * markerInterval);
        } else {
          markerTime = new Date(hourAlignedTime.getTime() + i * HOUR);
        }

        const position =
          ((markerTime.getTime() - windowStartTime.getTime()) / viewDuration) *
          100;

        if (position >= -5 && position <= 105) {
          const label =
            timeScale === "1h"
              ? formatTime(markerTime)
              : `${markerTime.getHours()}:00`;

          // Adjust positioning to prevent overflow at edges
          let labelPosition = position;
          let transformClass = "-translate-x-1/2"; // Default center alignment

          // For left edge markers, align to the right to prevent overflow
          if (position < 10) {
            labelPosition = Math.max(0, position);
            transformClass = "translate-x-0";
          }
          // For right edge markers, align to the left to prevent overflow
          else if (position > 90) {
            labelPosition = Math.min(100, position);
            transformClass = "-translate-x-full";
          }

          markers.push(
            <div
              key={i}
              className="top-0 absolute border-gray-100 border-l h-full"
              style={{ left: `${position}%` }}
            >
              <span
                className={`top-0 absolute text-gray-500 text-xs whitespace-nowrap ${transformClass}`}
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

  // Filter recipes to only show those that are visible in the current window
  const visibleRecipes = useMemo(() => {
    const windowStart = windowStartTime.getTime();
    const windowEnd = windowEndTime.getTime();
    const buffer = getViewDuration() * 0.1;

    return recipes.filter((recipe) => {
      const recipeStart = recipe.startTime.getTime();
      const recipeEnd = recipe.endTime.getTime();

      return (
        recipeEnd >= windowStart - buffer && recipeStart <= windowEnd + buffer
      );
    });
  }, [recipes, windowStartTime, windowEndTime, getViewDuration]);

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
          {!isNowLineVisible && (
            <div className="flex items-center gap-2 bg-orange-50 px-2 py-1 rounded-md text-orange-600 text-sm">
              <div className="bg-orange-500 rounded-full w-2 h-2 animate-pulse"></div>
              Current time is{" "}
              {nowLinePosition < 0 ? "in the past" : "in the future"}
            </div>
          )}

          <div className="flex items-center gap-1 border rounded-md">
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
          {/* Time markers header */}
          <div className="relative pl-48 border-gray-200 border-b h-8">
            <div className="relative w-full h-full px-2">
              {renderTimeMarkers()}

              {/* "Now" indicator line */}
              {nowLinePosition >= 0 && nowLinePosition <= 100 && (
                <motion.div
                  key={isWindowChanging ? `window-${Date.now()}` : "stable"}
                  className="top-0 z-10 absolute bg-red-500 w-0.5 h-full"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
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
                    NOW
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
                      {hoverPosition.recipe && (
                        <div className="opacity-90 mt-0.5 text-[10px]">
                          {hoverPosition.recipe.name}
                          {hoverPosition.port &&
                            ` - Port ${hoverPosition.port.portNumber}`}
                          {hoverPosition.smartStep &&
                            ` - ${hoverPosition.smartStep.name}`}
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Recipes Row */}
          <div className="relative flex border-gray-100 border-b h-32">
            {/* Left column with recipes info */}
            <div className="relative flex-shrink-0 bg-gray-50/50 p-3 border-gray-100 border-r w-48">
              <div className="mb-2 font-medium text-sm">Recipes</div>
              <div className="space-y-1 text-gray-600 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Iteration:</span>
                  <span className="font-medium">{visibleRecipes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Running:</span>
                  <span className="font-medium text-green-600">
                    {(() => {
                      const runningRecipe = visibleRecipes.find(
                        (r) => r.status === "running"
                      );
                      if (runningRecipe) {
                        // Calculate iteration number based on how many times this recipe has run
                        const now = new Date();

                        // Find which port is currently active
                        const activePort = runningRecipe.ports.find(
                          (port) => port.startTime <= now && port.endTime >= now
                        );

                        let portInfo = "";
                        if (activePort) {
                          if (runningRecipe.isSmartRecipeActive) {
                            // Smart recipe: show port 1 with instance number
                            portInfo = `Port 1 (${activePort.instance || 1})`;
                          } else {
                            // Normal recipe: show port number
                            portInfo = `Port ${activePort.portNumber}`;
                          }
                        }

                        return (
                          <div className="text-left">
                            <div>{runningRecipe.name}</div>
                            <div className=" opacity-80">
                              {portInfo || "No Port"}
                            </div>
                          </div>
                        );
                      }
                      return "None";
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">60min</span>
                </div>
              </div>
            </div>

            {/* Timeline area for recipes */}
            <div className="relative flex-grow h-full overflow-hidden">
              {/* "Now" indicator line for this row */}
              {nowLinePosition >= 0 && nowLinePosition <= 100 && (
                <motion.div
                  key={
                    isWindowChanging ? `row-window-${Date.now()}` : "row-stable"
                  }
                  className="top-0 z-10 absolute bg-red-500 opacity-30 w-0.5 h-full pointer-events-none"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
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

              {/* All recipes merged into one row - show past, current, and future */}
              <div className="absolute top-[5%] h-[90%] w-full">
                {visibleRecipes.map((recipe) => {
                  const recipePosition = getPosition(
                    recipe.startTime,
                    recipe.endTime
                  );
                  const isRunning =
                    recipe.startTime <= currentTime &&
                    recipe.endTime >= currentTime;
                  const isFuture = recipe.startTime > currentTime;

                  let recipeColor = "bg-blue-100"; // Default for past (light green)
                  if (isRunning) {
                    recipeColor = "bg-primary-200"; // Currently running
                  } else if (isFuture) {
                    recipeColor = "bg-gray-100"; // Future (expected path) - gray
                  }

                  return (
                    <div
                      key={recipe.id}
                      className={`absolute top-0 h-full cursor-pointer border rounded-lg transition-all group ${recipeColor}`}
                      style={recipePosition}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Smart Recipes Row - All smart recipe steps merged */}
          <div className="relative flex border-gray-100 border-b h-32">
            {/* Left column with smart recipes info */}
            <div className="relative flex-shrink-0 bg-gray-50/50 p-3 border-gray-100 border-r w-48">
              <div className="mb-2 font-medium text-sm">Smart Recipes</div>
              <div className="space-y-1 text-gray-600 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Count:</span>
                  <span className="font-medium text-orange-600">
                    {visibleRecipes.filter((r) => r.isSmartRecipeActive).length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Last Port:</span>
                  <span className="font-medium">Port 4 (5)</span>
                </div>
              </div>
            </div>

            {/* Timeline area for smart recipes */}
            <div className="relative flex-grow h-full overflow-hidden">
              {/* "Now" indicator line for this row */}
              {nowLinePosition >= 0 && nowLinePosition <= 100 && (
                <motion.div
                  key={
                    isWindowChanging ? `row-window-${Date.now()}` : "row-stable"
                  }
                  className="top-0 z-10 absolute bg-red-500 opacity-30 w-0.5 h-full pointer-events-none"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
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

              {/* All smart recipe steps merged into one row - show only past and current */}
              <div className="absolute top-[5%] h-[90%] w-full">
                {visibleRecipes.flatMap((recipe) =>
                  recipe.smartRecipeSteps
                    .filter((step) => {
                      // Only show smart recipe steps that have started (past or current)
                      return step.startTime <= currentTime;
                    })
                    .map((step) => {
                      const stepPosition = getPosition(
                        step.startTime,
                        step.endTime
                      );
                      const isRunning =
                        step.startTime <= currentTime &&
                        step.endTime >= currentTime;

                      let stepColor = "bg-orange-300"; // Default for past smart recipes (orange)
                      if (isRunning) {
                        stepColor =
                          step.type === "maintenance"
                            ? "bg-yellow-500"
                            : step.type === "adjustment"
                            ? "bg-blue-500"
                            : "bg-green-500"; // optimization
                      }

                      return (
                        <div
                          key={step.id}
                          className={`absolute top-0 h-full cursor-pointer border rounded transition-all ${stepColor}`}
                          style={stepPosition}
                        />
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeTimeline;
