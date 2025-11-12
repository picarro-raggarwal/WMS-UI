import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { FlaskConical, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { ChartProvider } from "../data-review/components/data-review-chart-context";
import DataReviewLineChart from "../data-review/components/data-review-line-chart";
import { ThresholdsConfig } from "../data-review/types";
import { generateMockData, getTextColor, MockData } from "./data/mock-data";

const TOTAL_PORTS = 62;

const LiveDataPage = () => {
  const liveData = generateMockData(TOTAL_PORTS);

  return (
    <>
      <PageHeader />
      <main className="flex flex-wrap justify-center items-center gap-1 mx-auto px-8 md:px-12 py-4 w-full max-w-8xl">
        {liveData.map((port, index) => (
          <Card port={port} key={index} />
        ))}
      </main>
    </>
  );
};

export default LiveDataPage;

const getCardWidth = (totalPorts: number) => {
  if (totalPorts <= 16) return 216; // 54 * 4 = 216px
  if (totalPorts <= 32) return 152; // 38 * 4 = 152px
  if (totalPorts <= 48) return 128; // 32 * 4 = 128px
  if (totalPorts <= 64) return 112; // 28 * 4 = 112px
  return 120; // fallback for very large numbers
};

const getFontSizeClasses = (cardWidth: number) => {
  if (cardWidth >= 200) {
    return { main: "text-2xl", label: "text-lg" };
  } else if (cardWidth >= 150) {
    return { main: "text-xl", label: "text-base" };
  } else if (cardWidth >= 120) {
    return { main: "text-lg", label: "text-sm" };
  } else {
    return { main: "text-base", label: "text-xs" };
  }
};

const Card = ({ port }: { port: MockData }) => {
  const [open, setOpen] = React.useState(false);
  const [showThreshold, setShowThreshold] = useState(false);
  const { isInActive, portNum, conc, label, status, isSampling, updatedAt } =
    port;
  const cardWidth = getCardWidth(TOTAL_PORTS);
  const { main: mainFontClass, label: labelFontClass } =
    getFontSizeClasses(cardWidth);

  const { data: timeSeriesData, categories } = generateMockTimeSeriesData(port);
  const [chartInstance, setChartInstance] = useState<any>(null);

  // Create threshold configuration
  const thresholdConfig: ThresholdsConfig | null = showThreshold
    ? {
        warning: {
          value: 50, // Set your threshold value here
          color: "#fbbf24", // amber-400 color - brighter yellow for better visibility
          visible: true
        },
        alarm: {
          value: 80, // Set your alarm threshold value here
          color: "#ef4444", // red color
          visible: true
        }
      }
    : null;

  return (
    <>
      <div
        style={{ width: cardWidth, height: cardWidth }}
        className={`relative cursor-pointer group ${
          isInActive
            ? "pointer-events-none opacity-40"
            : "transition-transform duration-200"
        } flex flex-col gap-2 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-border py-4 px-3 ${
          !isInActive && getBgColor(status)
        } transition-colors duration-200`}
        onClick={() => !isInActive && setOpen(true)}
      >
        <div className="flex justify-center items-center">
          <span
            className={`font-semibold text-neutral-800 dark:text-neutral-300 ${labelFontClass}`}
          >
            {portNum}. {label}
          </span>
        </div>
        <div className="flex justify-center items-center">
          <span
            className={`font-bold text-neutral-900 dark:text-neutral-200 ${mainFontClass}`}
          >
            {conc ?? "Flow Error"}
          </span>
        </div>
        <StatusIndicator isSampling={isSampling} />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[50vh] overflow-y-auto">
          <div className="flex justify-between items-center border-zinc-300 dark:border-zinc-500 border-b border-dashed w-full">
            <div className="gap-2 grid grid-cols-6">
              {/* Sensor Name */}
              <div className="flex flex-col pr-4 border-zinc-300 dark:border-zinc-500 border-r border-dashed">
                <div className="font-medium text-zinc-400 dark:text-zinc-400 text-xs">
                  Sensor Name
                </div>
                <span className="font-bold text-neutral-900 dark:text-neutral-200 text-xl">
                  {label}
                </span>
              </div>

              {/* Status */}
              <div className="flex flex-col items-center pr-4 border-zinc-300 dark:border-zinc-500 border-r border-dashed">
                <div className="font-medium text-zinc-400 dark:text-zinc-400 text-xs">
                  Status
                </div>
                <div className={`text-lg font-bold  ${getTextColor(status)}`}>
                  {getStatusText(status)}
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex flex-col pr-4 border-zinc-300 dark:border-zinc-500 border-r border-dashed text-right">
                <div className="font-medium text-zinc-400 dark:text-zinc-400 text-xs">
                  Last Updated
                </div>
                <div className="font-bold text-neutral-900 dark:text-neutral-200 text-base">
                  {new Date(updatedAt).toLocaleString()}
                </div>
              </div>
              {/* Port Number */}
              <div className="flex flex-col items-center pr-4 border-zinc-300 dark:border-zinc-500 border-r border-dashed">
                <div className="font-medium text-zinc-400 dark:text-zinc-400 text-xs">
                  Port Number
                </div>
                <div className="font-bold text-neutral-900 dark:text-neutral-200 text-lg">
                  {portNum}
                </div>
              </div>
              {/* Concentration */}
              <div className="flex flex-col items-center pr-4 border-zinc-300 dark:border-zinc-500 border-r border-dashed">
                <div className="font-medium text-zinc-400 dark:text-zinc-400 text-xs">
                  Concentration
                </div>
                <div className="font-bold text-neutral-900 dark:text-neutral-200 text-lg">
                  {conc ?? "-"}
                </div>
              </div>

              {/* StatusChips */}
              <div className="flex items-center">
                <StatusChips isSampling={isSampling} />
              </div>
            </div>
            <div className="flex justify-center items-center gap-4">
              {/* Threshold Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`threshold-${port.id}`}
                  checked={showThreshold}
                  onCheckedChange={(checked) =>
                    setShowThreshold(checked as boolean)
                  }
                />
                <label
                  htmlFor={`threshold-${port.id}`}
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer"
                >
                  Show Threshold
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() =>
                  chartInstance?.dispatchAction({
                    type: "dataZoom",
                    start: 0,
                    end: 100
                  })
                }
              >
                <RotateCcw className="w-4 h-4" />
                Reset Zoom
              </Button>
            </div>
          </div>

          {/* <div className="relative h-max"> */}
          <ChartProvider>
            <DataReviewLineChart
              data={timeSeriesData}
              categories={categories}
              index={port.id}
              units={
                conc && typeof conc === "string" && conc.includes("ppb")
                  ? "ppb"
                  : ""
              }
              timeRange="1h"
              onInstance={setChartInstance}
              thresholds={thresholdConfig}
            />
          </ChartProvider>
          {/* </div> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

const StatusIndicator = ({ isSampling }: { isSampling: boolean }) => (
  <div className="right-1 bottom-1 absolute flex gap-2">
    {isSampling && <StatusBadge type="sampling" label="S" />}
  </div>
);

const StatusBadge = ({
  type,
  label
}: {
  type: "sampling" | "prime";
  label: string;
}) => (
  <div
    className={`${
      type === "sampling" ? "bg-green-600" : "bg-blue-500"
    } rounded-full w-6 h-6 flex items-center justify-center shadow-md`}
  >
    <span className="font-bold text-white text-xs">{label}</span>
  </div>
);

const StatusBadgeLarge = ({
  type,
  label
}: {
  type: "sampling" | "prime";
  label: string;
}) => (
  <div
    className={`${
      type === "sampling" ? "bg-green-600" : "bg-blue-500"
    } text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
  >
    {label}
  </div>
);

const getBgColor = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "bg-inherit dark:bg-neutral-900";
    case 1:
      return "bg-amber-200/80 dark:bg-amber-600/60";
    case 2:
      return "bg-red-500 dark:bg-red-600";
    case 3:
      return "bg-cyan-100 dark:bg-cyan-800"; // flow error
    default:
      return "bg-gray-400 dark:bg-gray-600";
  }
};

const getStatusText = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "Normal";
    case 1:
      return "Warning";
    case 2:
      return "Critical";
    case 3:
      return "Flow Error";
    default:
      return "Unknown";
  }
};

function generateMockTimeSeriesData(port: MockData): {
  data: { timestamp: number; value: number }[];
  categories: string[];
} {
  // Generate 500 points of mock data for the last 50 minutes
  const now = Date.now();
  const baseValue = port.conc ? parseFloat(port.conc) : 30; // Use port concentration as base

  const data = Array.from({ length: 500 }, (_, i) => {
    const timeOffset = (50 - i) * 60 * 1000; // 50 minutes back
    const timestamp = now - timeOffset;

    // Create more realistic time series with some variation around the base value
    const variation = (Math.random() - 0.5) * 40; // ±20 variation
    const trend = Math.sin(i / 50) * 10; // Add some trend
    const value = Math.max(0, baseValue + variation + trend);

    return {
      timestamp,
      value: Math.round(value * 10) / 10 // Round to 1 decimal place
    };
  });
  return { data, categories: [port.label] };
}

function StatusChips({ isSampling }: { isSampling: boolean }) {
  if (!isSampling) return null;
  if (isSampling) {
    return (
      <span className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full font-semibold text-green-700 text-xs transition-colors">
        <FlaskConical className="w-3 h-3" />
        Sampling
      </span>
    );
  }

  return null;
}
