import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EChartsLine } from "@/components/ui/echarts-line";
import { AlertOctagon, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { AVAILABLE_METRICS } from "./chart-config-dialog";
import { formatLabel, formatTime } from "@/utils";

interface ChartData {
  timestamp: number;
  value: number;
}

const formatValue = (value: number) => {
  return value.toFixed(1);
};

// helper funcs for stats
const calculateMean = (values: number[]): number => {
  if (!values.length) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

const calculateStdDev = (values: number[], mean: number): number => {
  if (!values.length) return 0;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
};

interface StatsBarProps {
  label: string;
  mean: number;
  stdDev: number;
  warning: number;
  alarm: number;
  unit: string;
  onClick?: () => void;
  showWarning: boolean;
  showAlarm: boolean;
  onWarningToggle: () => void;
  onAlarmToggle: () => void;
  currentValue: number;
}

const StatsBar = ({
  label,
  mean,
  stdDev,
  warning,
  alarm,
  unit,
  onClick,
  showWarning,
  showAlarm,
  onWarningToggle,
  onAlarmToggle,
  currentValue,
}: StatsBarProps) => (
  <div className="flex items-center gap-6 bg-white dark:bg-neutral-800 -m-6 mb-4 px-4 py-5 !pb-3 border-neutral-200 dark:border-neutral-700 border-b border-dashed rounded-t-xl s">
    <Button
      variant="ghost"
      className="gap-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 -ml-1 px-3 h-full"
      onClick={onClick}>
      <span className="flex flex-col items-start">
        <p className="text-neutral-600 dark:text-neutral-300 text-xs">Data Source</p>
        <p className="font-bold text-black dark:text-white text-xl md:text-2xl tracking-tight whitespace-nowrap">
          {formatLabel(label)}
        </p>
      </span>
    </Button>

    <div className="flex justify-between items-center gap-6 pl-6 border-neutral-200 dark:border-neutral-700 border-l border-dashed divide-x divide-dashed divide-neutral-200 dark:divide-neutral-700 tabular-nums dark:text-neutral-300 text-sm">
      <div className="flex flex-col items-start">
        <span className="text-neutral-600 dark:text-neutral-300 text-xs">Value</span>
        <span className="font-bold tabular-nums text-black dark:text-white text-lg md:text-xl md:leading-9 tracking-tight whitespace-nowrap">
          {currentValue.toFixed(2)}
          {unit}
        </span>
      </div>
      <div className="flex flex-col items-start pl-6">
        <span className="text-neutral-600 dark:text-neutral-300 text-xs">Mean:</span>
        <span className="font-bold tabular-nums text-black dark:text-white text-lg md:text-xl md:leading-9 tracking-tight whitespace-nowrap">
          {mean.toFixed(2)}
          {unit}
        </span>
      </div>
      <div className="flex flex-col items-start pl-6">
        <span className="text-neutral-600 dark:text-neutral-300 text-xs">σ:</span>
        <span className="font-bold tabular-nums text-black dark:text-white text-lg md:text-xl md:leading-9 tracking-tight whitespace-nowrap">
          {stdDev.toFixed(2)}
          {unit}
        </span>
      </div>

      <Button
        variant="ghost"
        onClick={onWarningToggle}
        className="flex flex-col items-start !h-full">
        <span className="flex flex-col items-start">
          <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs">
            <Checkbox
              id="show-warning"
              checked={showWarning}
              onCheckedChange={(checked) => {
                if (typeof checked === "boolean") onWarningToggle();
              }}
              className="data-[state=checked]:bg-orange-500 border-orange-500 rounded-sm w-4 h-4 data-[state=checked]:text-white"
            />
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            Warning:
          </span>
          <span className="font-bold tabular-nums text-black text-lg md:text-xl tracking-tight whitespace-nowrap">
            {warning.toFixed(0)}
            {unit}
          </span>
        </span>
      </Button>
      <Button variant="ghost" onClick={onAlarmToggle} className="flex flex-col items-start !h-full">
        <span className="flex flex-col items-start">
          <span className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 text-xs">
            <Checkbox
              id="show-alarm"
              checked={showAlarm}
              onCheckedChange={(checked) => {
                if (typeof checked === "boolean") onAlarmToggle();
              }}
              className="data-[state=checked]:bg-red-500 border-red-500 rounded-sm w-3.5 h-3.5 data-[state=checked]:text-white"
            />
            <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
            Alarm:
          </span>
          <span className="font-bold tabular-nums text-black text-lg md:text-xl tracking-tight whitespace-nowrap">
            {alarm.toFixed(0)}
            {unit}
          </span>
        </span>
      </Button>
    </div>
  </div>
);

const SingleChart = ({
  metricId,
  data,
  timeRange,
}: {
  metricId: string;
  data: Record<string, number | string>[];
  timeRange: string;
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  const metric = AVAILABLE_METRICS.find((m) => m.id === metricId);
  if (!metric || metricId === "wind_rose") return null;

  const currentValue = data[data.length - 1]?.[metricId];
  const unit = metricId.includes("temp") ? "°" : " ppb";

  // Calculate statistics
  const values = data.map((d) => Number(d[metricId])).filter((v) => !isNaN(v));
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values, mean);

  // Define thresholds based on metric type
  const getThresholds = (metricId: string) => {
    switch (metricId) {
      case "tvoc":
        return {
          warning: 30,
          alarm: 40,
        };
      case "ch4":
        return {
          warning: 35,
          alarm: 50,
        };
      case "cavity_pressure":
        return {
          warning: 35,
          alarm: 50,
        };
      default:
        return {
          warning: 50,
          alarm: 65,
        };
    }
  };

  const thresholdValues = getThresholds(metricId);

  const thresholds = {
    warning: {
      value: thresholdValues.warning,
      color: "#f97316", // orange
      visible: showWarning,
    },
    alarm: {
      value: thresholdValues.alarm,
      color: "#ef4444", // red
      visible: showAlarm,
    },
  };

  return (
    <div className="bg-white shadow-card p-6 rounded-xl">
      <div className="space-y-4">
        <StatsBar
          label={metric.label}
          mean={mean}
          stdDev={stdDev}
          warning={thresholdValues.warning}
          alarm={thresholdValues.alarm}
          unit={unit}
          onClick={() => console.log("Clicked", metric.label)}
          showWarning={showWarning}
          showAlarm={showAlarm}
          onWarningToggle={() => setShowWarning(!showWarning)}
          onAlarmToggle={() => setShowAlarm(!showAlarm)}
          currentValue={currentValue}
        />
        <div className="flex items-center gap-2 -ml-8">
          <EChartsLine
            data={data}
            index="timestamp"
            categories={[metricId]}
            colors={["#59953f"]}
            valueFormatter={formatValue}
            showYAxis={true}
            showXAxis={true}
            showTooltip={true}
            thresholds={thresholds}
            units={unit}
            timeRange={timeRange}
          />
        </div>
      </div>
    </div>
  );
};

interface RealTimeChartsProps {
  metricsData: Record<string, ChartData[]>;
  isLargeDataset: boolean;
  onDatasetToggle: () => void;
  selectedMetrics: string[];
  timeRange?: string;
  onMetricsChange: (metrics: string[]) => void;
}

export const RealTimeCharts = ({
  metricsData,
  isLargeDataset,
  onDatasetToggle,
  selectedMetrics,
  timeRange = "realtime",
  onMetricsChange,
}: RealTimeChartsProps) => {
  // Filter out wind_rose from selected metrics
  const filteredMetrics = selectedMetrics.filter((metric) => metric !== "wind_rose");

  // If no regular metrics selected, return null
  if (filteredMetrics.length === 0) return null;

  // Transform data for LineChart
  const chartData = metricsData[filteredMetrics[0]]?.map((item, index) => {
    const dataPoint: Record<string, number | string> = {
      timestamp: formatTime(new Date(item.timestamp)),
    };
    filteredMetrics.forEach((metricId) => {
      dataPoint[metricId] = metricsData[metricId]?.[index]?.value;
    });
    return dataPoint;
  });

  return (
    <div className="space-y-4">
      {filteredMetrics.map((metricId) => (
        <SingleChart key={metricId} metricId={metricId} data={chartData} timeRange={timeRange} />
      ))}
    </div>
  );
};
