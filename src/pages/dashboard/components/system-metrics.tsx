import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import NumberFlow from "@number-flow/react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useGetSystemMetricsQuery } from "../data/systemMetrics.slice";
import type { SystemMetric, MetricRange } from "../data/systemMetrics.slice";
import { METRIC_BEHAVIORS } from "../data/systemMetrics.slice";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/spinner";
import { useSocket } from "@/hooks/useSocket";
import { NoSystemMetricsError } from "./no-system-metrics-error";
import { useState, useEffect } from "react";
import { formatLabel } from "@/utils";

type RangeSegment = {
  min: number;
  max: number;
  label: string;
  color: string;
  icon: "check" | "alert" | "warning";
};

function RangeIndicator({
  value,
  thresholds: { unit },
  segments,
  status,
  metricName,
}: {
  value: number | null;
  thresholds: {
    unit: string;
  };
  segments: RangeSegment[];
  status: string;
  metricName: string;
}) {
  const activeSegment =
    value !== null
      ? segments.findIndex((segment) => value >= segment.min && value <= segment.max)
      : -1;

  const behavior = METRIC_BEHAVIORS[metricName] || { higherIsBetter: false };
  const isMfcMetric = metricName.toLowerCase().includes("mfc");

  const getSegmentColor = (index: number, isActive: boolean, status?: string) => {
    if (status === "error" || value === null) return "bg-neutral-300 dark:bg-neutral-700";
    if (!isActive) return "bg-neutral-100 dark:bg-neutral-700";

    const isHighStatus = status === "high" || status === "low";
    const shouldBeRed = behavior.higherIsBetter ? status === "low" : status === "high";

    return isHighStatus && shouldBeRed ? "bg-red-500" : "bg-primary-500";
  };

  const currentSegment = segments[activeSegment] || segments[0];
  const statusLabel =
    status === "error"
      ? "Error"
      : value === null
      ? "No Data"
      : segments.length > 0
      ? currentSegment?.label || "Unknown"
      : status.charAt(0).toUpperCase() + status.slice(1);

  const tooltipContent = (
    <div className="space-y-2">
      <div className="font-semibold">Ranges</div>
      <div className="space-y-1">
        {segments.length > 0 ? (
          segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  index === activeSegment && status !== "error" && value !== null
                    ? status === "low" || status === "error" || status === "high"
                      ? behavior.higherIsBetter
                        ? status === "low"
                          ? "bg-red-500"
                          : "bg-primary-500"
                        : status === "high"
                        ? "bg-red-500"
                        : "bg-primary-500"
                      : "bg-primary-500"
                    : "bg-neutral-700"
                }`}
              />
              <span>
                {segment.label}: {segment.min.toFixed(1)}-{segment.max.toFixed(1)}
                <span className="text-sm ml-1 text-neutral-300">{unit}</span>
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-neutral-500">No range data available</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-3">
      {segments.length > 0 && (
        <div className="flex h-1.5 gap-1">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`flex-1 h-full rounded-full transition-all duration-300 ${getSegmentColor(
                index,
                index === activeSegment,
                status
              )}`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          {status === "error" || value === null ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 text-neutral-400">
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
          ) : isMfcMetric && status === "low" ? (
            // Special handling for MFC metrics with "low" status - show red exclamation
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 text-red-500">
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (status === "low" && !behavior.higherIsBetter) ||
            (status === "high" && behavior.higherIsBetter) ? (
            <CheckCircle2 className="w-4 h-4 text-primary-500" />
          ) : (status === "high" && !behavior.higherIsBetter) ||
            (status === "low" && behavior.higherIsBetter) ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 text-red-500">
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <CheckCircle2 className="w-4 h-4 text-primary-500" />
          )}
          <span className="font-medium dark:text-white">{statusLabel}</span>
        </div>

        {segments.length > 0 && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="min-w-md shadow-xl border-none rounded-xl p-4">
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

function getSegmentsFromRange(range: MetricRange, metricName: string): RangeSegment[] {
  const behavior = METRIC_BEHAVIORS[metricName] || { higherIsBetter: false };

  return Object.entries(range).map(([label, range]) => {
    const isHighOrExtreme = label.includes("high") || label.includes("extreme");
    const shouldBeRed = behavior.higherIsBetter ? !isHighOrExtreme : isHighOrExtreme;

    return {
      min: range[0],
      max: range[1],
      label,
      color: shouldBeRed ? "red" : "green",
      icon: shouldBeRed ? "alert" : "check",
    };
  });
}

function MetricCard({ metric }: { metric: SystemMetric }) {
  const segments = metric.range ? getSegmentsFromRange(metric.range, metric.name) : [];
  const isMfcMetric = metric.name.toLowerCase().includes("mfc");

  return (
    <div className="flex flex-col gap-2 bg-white -50 ring-1 ring-neutral-500/10 shadow-sm dark:bg-neutral-800 p-4   rounded-xl shadow-card">
      <div>
        <div className="flex justify-between items-center">
          <dt className="text-base font-medium text-neutral-800 dark:text-neutral-100 tracking-tight">
            {formatLabel(metric.name)}
          </dt>
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight mt-1 dark:text-white">
            {metric.value === null ? (
              "-"
            ) : (
              <NumberFlow
                value={metric.value}
                format={{
                  minimumFractionDigits: metric.name.includes("mfc") ? 2 : 1,
                  maximumFractionDigits: metric.name.includes("mfc") ? 2 : 1,
                }}
              />
            )}
            <span className="text-sm ml-1 text-neutral-600">{metric.unit}</span>
          </p>
          {isMfcMetric && metric.set_point !== null && metric.set_point !== undefined && (
            // Show setpoint for MFC metrics in addition to the range indicator
            <div className="  ">
              <div className="flex items-center">
                <span className="text-sm text-neutral-500 dark:text-white">
                  Set Point: {metric.set_point?.toFixed(2)} {metric.unit}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <dd className="flex flex-col gap-2">
        <RangeIndicator
          value={metric.value}
          thresholds={{ unit: metric.unit }}
          segments={segments}
          status={metric.status}
          metricName={metric.name}
        />
      </dd>
    </div>
  );
}

export function MetricsCards() {
  const { fencelineJobState, connected } = useSocket();
  const [hasStableError, setHasStableError] = useState(false); // this is to prevent the error from flickering when the data is loading while error is present

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    isError: isMetricsDataError,
    isSuccess,
  } = useGetSystemMetricsQuery(undefined, {
    skip: fencelineJobState?.state === "SystemStartup" || !connected,
    pollingInterval: fencelineJobState?.state === "SystemStartup" || !connected ? 0 : 5000,
  });

  useEffect(() => {
    if (isMetricsDataError) {
      setHasStableError(true);
    } else if (isSuccess && metricsData) {
      setHasStableError(false);
    }
  }, [isMetricsDataError, isSuccess, metricsData]);

  if (isMetricsDataError || hasStableError) {
    return (
      <div className=" relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white /50 z-10 flex items-center justify-center rounded-xl  lur-sm flex-col gap-2 ">
          <AlertCircle className="size-6 text-red-500" />
          <p className="text-sm font-medium text-black">Error loading metrics</p>
          <p className="text-xs text-neutral-500">Please check the system status and try again.</p>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <NoSystemMetricsError key={index} />
          ))}
        </dl>
      </div>
    );
  }

  if (isMetricsLoading) {
    return (
      <div className=" relative">
        <dl className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <NoSystemMetricsError key={index} />
          ))}
        </dl>
      </div>
    );
  }

  const filteredMetrics = metricsData?.system_metrics?.filter((metric) => metric.name !== "ups");

  return (
    <>
      <dl className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMetrics?.map((metric) => (
          <MetricCard key={metric.name} metric={metric} />
        ))}
      </dl>
    </>
  );
}
