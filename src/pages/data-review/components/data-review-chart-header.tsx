import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatLabel } from "@/utils";
import { AlertOctagon, AlertTriangle, RotateCcw } from "lucide-react";
import { useChartContext } from "./data-review-chart-context";

type StatsBarProps = {
  label: string;
  mean: number;
  stdDev: number;
  unit: string;
  thresholds?: {
    warning: number;
    alarm: number;
  };
  onClick?: () => void;
  showWarning: boolean;
  showAlarm: boolean;
  onWarningToggle: () => void;
  onAlarmToggle: () => void;
  currentValue: number;
  dateRange?: { start: string; end: string };
  isFetchingMetricsData: boolean;
};

const StatsBar = ({
  label,
  mean,
  stdDev,
  thresholds,
  unit,
  onClick,
  showWarning,
  showAlarm,
  onWarningToggle,
  onAlarmToggle,
  currentValue,
  dateRange,
  isFetchingMetricsData
}: StatsBarProps) => {
  const { chartInstance } = useChartContext();

  return (
    <div className="flex items-center justify-between gap-2 bg-white dark:bg-neutral-800 -m-6 mb-4 px-4 py-5 !pb-3 border-neutral-200 dark:border-neutral-700 border-b border-dashed rounded-t-xl">
      <div className="flex ">
        <Button
          variant="ghost"
          className="gap-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 -ml-1 px-3 h-full cursor-default hover:bg-transparent"
          onClick={onClick}
        >
          <span className="flex flex-col items-start">
            <div className="flex gap-2">
              <p className="text-neutral-600 dark:text-neutral-300 text-xs">
                Data Source
              </p>
              {isFetchingMetricsData && <Spinner />}
            </div>
            <p className="font-bold text-black dark:text-white text-xl md:text-2xl tracking-tight whitespace-nowrap">
              {formatLabel(label)}
            </p>

            {dateRange && (
              <p className="text-neutral-600 dark:text-neutral-300 text-xs">
                {dateRange.start} - {dateRange.end}
              </p>
            )}
          </span>
        </Button>

        <div className="flex  justify-between px-2 items-center gap-2 border-neutral-200 space-x-4 dark:border-neutral-700 border-l border-dashed divide-x divide-dashed divide-neutral-200 dark:divide-neutral-700 tabular-nums dark:text-neutral-300 text-sm">
          {currentValue ? (
            <div className="flex flex-col items-start">
              <span className="text-neutral-600 dark:text-neutral-300 text-xs">
                Value
              </span>
              <span className="font-bold tabular-nums text-black dark:text-white text-lg md:text-xl md:leading-9 tracking-tight whitespace-nowrap">
                {currentValue.toFixed(2)}
                <span className="text-base ml-1 text-neutral-600">{unit}</span>
              </span>
            </div>
          ) : null}
          {mean ? (
            <div
              className={`flex flex-col items-start ${
                currentValue ? "pl-6" : "pl-0"
              }`}
            >
              <span className="text-neutral-600 dark:text-neutral-300 text-xs">
                Mean:
              </span>
              <span className="font-bold tabular-nums text-black dark:text-white text-lg md:text-xl md:leading-9 tracking-tight whitespace-nowrap">
                {mean?.toFixed(2)}
                <span className="text-base ml-1 text-neutral-600">{unit}</span>
              </span>
            </div>
          ) : null}
          {stdDev ? (
            <div className="flex flex-col items-start pl-2">
              <span className="text-neutral-600 dark:text-neutral-300 text-xs">
                σ:
              </span>
              <span className="font-bold tabular-nums text-black dark:text-white text-lg md:text-xl md:leading-9 tracking-tight whitespace-nowrap">
                {stdDev?.toFixed(2)}
                <span className="text-base ml-1 text-neutral-600">{unit}</span>
              </span>
            </div>
          ) : null}

          {thresholds ? (
            <>
              <div
                onClick={onWarningToggle}
                className="flex flex-col items-start !h-full cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded px-2 py-1"
              >
                <span className="flex flex-col items-start">
                  <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs">
                    <Checkbox
                      id="show-warning"
                      checked={showWarning}
                      onCheckedChange={(checked) => {
                        if (typeof checked === "boolean") onWarningToggle();
                      }}
                      className="data-[state=checked]:bg-amber-400 border-amber-400  data-[state=checked]:border-amber-400  rounded-sm scale-[.80] pt-0.5  data-[state=checked]:text-white"
                    />
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Warning:
                  </span>
                  <span className="font-bold tabular-nums text-black text-lg md:text-xl tracking-tight whitespace-nowrap">
                    {thresholds?.warning?.toFixed(0)}
                    <span className="text-base ml-1 text-neutral-600">
                      {unit}
                    </span>
                  </span>
                </span>
              </div>
              <div
                onClick={onAlarmToggle}
                className="flex flex-col items-start !h-full cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded px-2 py-1"
              >
                <span className="flex flex-col items-start">
                  <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs">
                    <Checkbox
                      id="show-alarm"
                      checked={showAlarm}
                      onCheckedChange={(checked) => {
                        if (typeof checked === "boolean") onAlarmToggle();
                      }}
                      className="data-[state=checked]:bg-red-500 border-red-500 data-[state=checked]:border-red-500  rounded-sm scale-[.80] pt-0.5  data-[state=checked]:text-white"
                    />
                    <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
                    Alarm:
                  </span>
                  <span className="font-bold tabular-nums text-black text-lg md:text-xl tracking-tight whitespace-nowrap">
                    {thresholds?.alarm?.toFixed(0)}
                    <span className="text-base ml-1 text-neutral-600">
                      {unit}
                    </span>
                  </span>
                </span>
              </div>
            </>
          ) : null}

          {/* <div className="flex-grow"></div> */}
        </div>
      </div>

      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            chartInstance?.dispatchAction({
              type: "dataZoom",
              start: 0,
              end: 100
            });
          }}
        >
          <RotateCcw className="w-4 h-4" />
          Reset Zoom
        </Button>
      </div>
    </div>
  );
};

export default StatsBar;
