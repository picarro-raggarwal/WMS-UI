import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertOctagon, AlertTriangle, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetMetricsQuery } from "../../live-data/data/metrics.slice";
import {
  MetricThreshold,
  useGetAllThresholdsQuery,
  useSetMetricThresholdMutation,
  useSetWindRoseThresholdMutation
} from "../data/thresholds.slice";

interface ThresholdVisualizationProps extends MetricThreshold {
  isEditing?: boolean;
}

const ThresholdVisualization = ({
  warning,
  alarm,
  unit,
  isEditing
}: ThresholdVisualizationProps) => {
  if (!warning && !alarm) return null;

  // Create visualization scale - use the highest threshold plus some padding for better display
  const highestThreshold = Math.max(alarm || 0, warning || 0);
  const maxValue = highestThreshold * 1.3; // Add 30% padding for better visualization
  const warningPos = warning ? (warning / maxValue) * 100 : 0;
  const alarmPos = alarm ? (alarm / maxValue) * 100 : 0;

  // Generate tick marks
  const tickCount = 100;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const position = (i / (tickCount - 1)) * 100;
    const value = (position / 100) * maxValue;

    // Calculate height based on proximity to thresholds
    let height = 4; // Base height

    if (warning && Math.abs(value - warning) < maxValue * 0.1) {
      const proximity = 1 - Math.abs(value - warning) / (maxValue * 0.1);
      height = 4 + proximity * 8; // Up to 12px tall
    }

    if (alarm && Math.abs(value - alarm) < maxValue * 0.1) {
      const proximity = 1 - Math.abs(value - alarm) / (maxValue * 0.1);
      height = Math.max(height, 4 + proximity * 12); // Up to 16px tall
    }

    // Color based on position
    let color = "bg-green-400";
    if (warning && value >= warning * 0.8) {
      color = "bg-yellow-400";
    }
    if (alarm && value >= alarm * 0.8) {
      color = "bg-red-400";
    }

    return { position, height, color, value };
  });

  return (
    <div className={`${isEditing ? "opacity-60" : ""}`}>
      <div className="flex gap-4 mb-4">
        {warning && (
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 shadow-sm px-3 py-2 border dark:border-neutral-700/50 rounded-full">
            <AlertTriangle size={14} className="text-yellow-600 shrink-0" />
            <span className="font-semibold text-yellow-600 dark:text-white text-sm">
              Warning: {warning} {unit}
            </span>
          </div>
        )}
        {alarm && (
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 shadow-sm px-3 py-2 border dark:border-neutral-700/50 rounded-full">
            <AlertOctagon size={14} className="text-red-600" />
            <span className="font-semibold text-red-600 dark:text-white text-sm">
              Alarm: {alarm} {unit}
            </span>
          </div>
        )}
      </div>

      <div className="relative -mx-6 -mb-6 h-12">
        <div className="right-0 bottom-0 left-0 absolute bg-gradient-to-r from-transparent via-yellow-50 dark:via-yellow-950/30 to-red-50 dark:to-red-950/30 rounded-b-lg h-8 overflow-hidden">
          {/* Tick marks */}
          <div className="absolute inset-0">
            {ticks.map((tick, i) => (
              <div
                key={i}
                className={`absolute bottom-0 w-0.5 ${tick.color} opacity-60`}
                style={{
                  left: `${tick.position}%`,
                  height: `${tick.height}px`,
                  transform: "translateX(-50%)"
                }}
              />
            ))}
          </div>
        </div>

        {/* Warning marker line */}
        {warning && (
          <div
            className="bottom-0 z-20 absolute bg-yellow-500 opacity-90 w-1 h-8"
            style={{ left: `${warningPos}%`, transform: "translateX(-50%)" }}
          />
        )}

        {/* Alarm marker line */}
        {alarm && (
          <div
            className="bottom-0 z-20 absolute bg-red-500 opacity-90 w-1 h-8"
            style={{ left: `${alarmPos}%`, transform: "translateX(-50%)" }}
          />
        )}

        {/* Scale labels */}
        <div className="top-0 left-6 absolute font-medium text-muted-foreground text-xs">
          0 {unit}
        </div>
        <div className="top-0 right-6 absolute font-medium text-muted-foreground text-xs">
          {maxValue.toFixed(1)} {unit}
        </div>
      </div>
    </div>
  );
};

export const ThresholdsTab = () => {
  const {
    data: metricsConfig,
    isError: isErrorMetrics,
    isLoading: isLoadingMetrics
  } = useGetMetricsQuery();

  const {
    data: thresholdsData,
    isError: isErrorThresholds,
    isLoading: isLoadingThresholds
  } = useGetAllThresholdsQuery();

  const [setMetricThreshold, { isLoading: isSaving }] =
    useSetMetricThresholdMutation();

  const [setWindRoseThreshold, { isLoading: isWindRoseSaving }] =
    useSetWindRoseThresholdMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingMetrics, setEditingMetrics] = useState<
    Record<string, MetricThreshold>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatMetricLabel = (id: string): string => {
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const availableMetrics = metricsConfig
    ? Object.entries(metricsConfig.metrics)
        .filter(([_, config]) => config.type.toLowerCase() === "compound")
        .map(([id, config]) => ({
          id,
          label: formatMetricLabel(id),
          unit: config.unit || "",
          type: config.type
        }))
    : [];

  availableMetrics.push({
    id: "wind_rose_calm_threshold",
    label: "Wind Rose Calm Threshold",
    type: "hardware",
    unit: "m/s"
  });

  const filteredMetrics = availableMetrics.filter((metric) =>
    metric.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateThresholds = (
    warning: number,
    alarm: number
  ): string | null => {
    if (isNaN(warning) || isNaN(alarm)) {
      return "Please enter valid numbers";
    }
    if (warning < 0 || alarm < 0) {
      return "Values must be positive";
    }
    if (warning >= alarm) {
      return "Warning must be less than alarm level";
    }
    return null;
  };

  const handleEditClick = (metricId: string) => {
    const isWindRose = metricId === "wind_rose_calm_threshold";
    const windRoseThreshold = thresholdsData.wind_rose_calm_threshold ?? 0;
    const existingThreshold = isWindRose
      ? { warning: windRoseThreshold || 0, alarm: windRoseThreshold + 10 || 0 }
      : thresholdsData?.metric_thresholds[metricId];

    setEditingMetrics({
      ...editingMetrics,
      [metricId]: {
        warning: existingThreshold?.warning || 0,
        alarm: existingThreshold?.alarm || 0
      } as MetricThreshold
    });
    // Clear any existing errors
    const { [metricId]: _, ...restErrors } = errors;
    setErrors(restErrors);
  };

  const handleCancelEdit = (metricId: string) => {
    const { [metricId]: _, ...rest } = editingMetrics;

    setEditingMetrics(rest);
    // Clear errors for this metric
    const { [metricId]: __, ...restErrors } = errors;
    setErrors(restErrors);
  };

  const handleSaveThreshold = async (metricId: string) => {
    const threshold = editingMetrics[metricId];
    if (!threshold) return;

    const isWindRose = metricId === "wind_rose_calm_threshold";

    // Validate first
    const validationError = validateThresholds(
      threshold.warning,
      threshold.alarm
    );
    if (validationError) {
      setErrors({ ...errors, [metricId]: validationError });
      return;
    }

    if (isWindRose) {
      try {
        await setWindRoseThreshold({
          calm_threshold: threshold.warning
        }).unwrap();

        toast.success(`Thresholds updated for ${formatMetricLabel(metricId)}`);
        handleCancelEdit(metricId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to save thresholds";
        setErrors({ ...errors, [metricId]: errorMessage });
      }
    } else {
      try {
        await setMetricThreshold({
          metric_name: metricId,
          warning: threshold.warning,
          alarm: threshold.alarm
        }).unwrap();

        toast.success(`Thresholds updated for ${formatMetricLabel(metricId)}`);
        handleCancelEdit(metricId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to save thresholds";
        setErrors({ ...errors, [metricId]: errorMessage });
      }
    }
  };

  const handleThresholdChange = (
    metricId: string,
    type: "warning" | "alarm",
    value: number
  ) => {
    const isWindRose = metricId === "wind_rose_calm_threshold";

    if (isWindRose) {
      setEditingMetrics({
        ...editingMetrics,
        [metricId]: {
          ...editingMetrics[metricId],
          ["warning"]: value,
          ["alarm"]: value + 10
        }
      });
    } else {
      setEditingMetrics({
        ...editingMetrics,
        [metricId]: {
          ...editingMetrics[metricId],
          [type]: value
        }
      });
    }

    // Clear error when user starts editing
    if (errors[metricId]) {
      const { [metricId]: _, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  const isEditing = (metricId: string) => metricId in editingMetrics;

  if (isLoadingMetrics || isLoadingThresholds) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-muted-foreground">Loading thresholds...</div>
      </div>
    );
  }

  if (isErrorMetrics || isErrorThresholds) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-red-500">Error loading thresholds data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <CardTitle className="mb-2 text-lg">
            Threshold Configuration
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Configure warning and alarm thresholds for compound metrics. The
            visual scale shows where your thresholds are set.
          </p>
        </div>
        <div className="relative flex-1 mb-4">
          <Search className="top-[calc(50%-9px)] left-3 z-10 absolute w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Filter by metric name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6"
          />
        </div>
        <div className="space-y-6">
          {filteredMetrics.length === 0 ? (
            <div className="py-12 text-muted-foreground text-base text-center">
              {searchQuery
                ? "No compound metrics match your search."
                : "No compound metrics available for threshold configuration."}
            </div>
          ) : (
            filteredMetrics.map((metric) => {
              const isWindRose = metric.id === "wind_rose_calm_threshold";
              const existingThreshold =
                thresholdsData?.metric_thresholds[metric.id];
              const editing = isEditing(metric.id);
              const editingValues = editingMetrics[metric.id];
              const hasError = errors[metric.id];

              // Use editing values if available, otherwise use existing thresholds
              const displayWarning = editing
                ? editingValues.warning
                : existingThreshold?.warning;
              const displayAlarm = editing
                ? editingValues.alarm
                : existingThreshold?.alarm;

              // Wind-rose threshold
              const windRoseThreshold =
                thresholdsData.wind_rose_calm_threshold ?? 0;

              if (isWindRose) {
                return (
                  <div key={metric.id} className="space-y-3">
                    <div className="bg-white dark:bg-neutral-900 p-6 border dark:border-neutral-700/50 rounded-lg">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="font-semibold text-base">
                            {metric.label}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {metric.unit} • {metric.type}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {editing ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelEdit(metric.id)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                loading={isWindRoseSaving}
                                onClick={() => handleSaveThreshold(metric.id)}
                                disabled={isWindRoseSaving}
                              >
                                Save
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(metric.id)}
                            >
                              {windRoseThreshold
                                ? "Edit"
                                : "Configure thresholds"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {editing ? (
                        <div className="flex gap-4 mb-6">
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium text-yellow-600 text-sm">
                              <AlertTriangle size={14} />
                              Calm Level
                            </label>
                            <Input
                              type="number"
                              value={editingValues.warning}
                              onChange={(e) =>
                                handleThresholdChange(
                                  metric.id,
                                  "warning",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              className="w-full"
                              step="0.1"
                              placeholder={`Enter clam threshold (${metric.unit})`}
                              min={0}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 mb-4">
                          {windRoseThreshold && (
                            <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 shadow-sm px-3 py-2 border dark:border-neutral-700/50 rounded-full">
                              <AlertTriangle
                                size={14}
                                className="text-yellow-600 shrink-0"
                              />
                              <span className="font-semibold text-yellow-600 dark:text-white text-sm">
                                Calm Level: {windRoseThreshold} m/s
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* inline error when edting */}
                      {hasError && (
                        <Alert variant="destructive">
                          <AlertTriangle className="w-4 h-4" />
                          <AlertTitle>{hasError}</AlertTitle>
                        </Alert>
                      )}

                      {/* Empty state when no thresholds are configured */}
                      {!editing && !windRoseThreshold && (
                        <div className="dark:bg-neutral-800/50 mb-6 p-4 border border-neutral-200 dark:border-neutral-700 border-dashed rounded-lg">
                          <div className="py-4 text-center">
                            <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                              No thresholds configured for this metric
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={metric.id} className="space-y-3">
                  <div className="bg-white dark:bg-neutral-900 p-6 border dark:border-neutral-700/50 rounded-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="font-semibold text-base">
                          {metric.label}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {metric.unit} • {metric.type}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {editing ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelEdit(metric.id)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              loading={isSaving}
                              onClick={() => handleSaveThreshold(metric.id)}
                              disabled={isSaving}
                            >
                              Save
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(metric.id)}
                          >
                            {existingThreshold?.warning ||
                            existingThreshold?.alarm
                              ? "Edit"
                              : "Configure thresholds"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {editing ? (
                      <div className="flex gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 font-medium text-yellow-600 text-sm">
                            <AlertTriangle size={14} />
                            Warning Level
                          </label>
                          <Input
                            type="number"
                            value={editingValues.warning}
                            onChange={(e) =>
                              handleThresholdChange(
                                metric.id,
                                "warning",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            onFocus={(e) => e.target.select()}
                            className="w-full"
                            step="0.1"
                            placeholder={`Enter warning threshold (${metric.unit})`}
                            min={0}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 font-medium text-red-600 text-sm">
                            <AlertOctagon size={14} />
                            Alarm Level
                          </label>
                          <Input
                            type="number"
                            value={editingValues.alarm}
                            onChange={(e) =>
                              handleThresholdChange(
                                metric.id,
                                "alarm",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            onFocus={(e) => e.target.select()}
                            className="w-full"
                            step="0.1"
                            placeholder={`Enter alarm threshold (${metric.unit})`}
                            min={0}
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* inline error when edting */}
                    {hasError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertTitle>{hasError}</AlertTitle>
                      </Alert>
                    )}

                    {/* Empty state when no thresholds are configured */}
                    {!editing && !displayWarning && !displayAlarm && (
                      <div className="dark:bg-neutral-800/50 mb-6 p-4 border border-neutral-200 dark:border-neutral-700 border-dashed rounded-lg">
                        <div className="py-4 text-center">
                          <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                            No thresholds configured for this metric
                          </div>
                        </div>
                      </div>
                    )}

                    <ThresholdVisualization
                      warning={displayWarning}
                      alarm={displayAlarm}
                      unit={metric.unit}
                      isEditing={editing}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};
