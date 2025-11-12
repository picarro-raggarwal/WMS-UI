import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { loadPortConfig, type PortConfig } from "@/types/common/port-config";
import { FlaskConical, RotateCcw } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChartProvider } from "../data-review/components/data-review-chart-context";
import DataReviewLineChart from "../data-review/components/data-review-line-chart";
import { ThresholdsConfig } from "../data-review/types";
import { generateMockData, MockData } from "./data/mock-data";
import {
  getBgColorClass,
  getStatusBarColorClass,
  getStatusTextColorClass
} from "./utils/colors";

const TOTAL_PORTS = 64; // All 64 ports

const LiveDataPage = () => {
  // Load port configuration from shared storage
  const [portConfig, setPortConfig] = useState<PortConfig>(() =>
    loadPortConfig()
  );

  // Listen for port config updates from settings
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      setPortConfig(event.detail);
    };
    window.addEventListener(
      "port-config-updated",
      handleConfigUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "port-config-updated",
        handleConfigUpdate as EventListener
      );
    };
  }, []);

  // Generate mock data and update labels with port configuration
  // Filter out disabled ports (both from port config and isDisabled field)
  const liveData = useMemo(() => {
    const data = generateMockData(TOTAL_PORTS);
    // Update labels to use port configuration names and filter disabled ports
    return data
      .map((port) => ({
        ...port,
        label: portConfig.names[port.portNum] || port.label
      }))
      .filter(
        (port) => portConfig.enabled[port.portNum] !== false && !port.isDisabled
      );
  }, [portConfig]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setContainerWidth(width);
        setContainerHeight(height);
      }
    };

    // Initial measurement
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [liveData.length]);

  // Calculate optimal card size based on viewport and number of ports
  const cardWidth = useMemo(() => {
    if (
      liveData.length === 0 ||
      containerWidth === 0 ||
      containerHeight === 0
    ) {
      return 150;
    }

    const gap = 8; // gap-2 = 0.5rem = 8px
    const availableWidth = containerWidth;

    // Calculate how many cards can fit per row
    // Start with a reasonable card width and calculate how many fit
    let cardsPerRow = Math.floor((availableWidth + gap) / (140 + gap)); // Start with 170px as base
    cardsPerRow = Math.max(1, Math.min(cardsPerRow, liveData.length));

    // Calculate card width to fill available space
    const totalGapWidth = gap * (cardsPerRow - 1);
    const calculatedWidth = (availableWidth - totalGapWidth) / cardsPerRow;

    // Set constraints
    const minWidth = 120;
    const maxWidth = 350;

    return Math.max(minWidth, Math.min(maxWidth, calculatedWidth));
  }, [liveData.length, containerWidth, containerHeight]);

  return (
    <>
      <PageHeader />
      <main className="flex flex-col h-[calc(100vh-7rem)] mx-auto px-8 md:px-12 py-4 w-full max-w-8xl">
        <div className="flex-1 overflow-y-auto w-full px-1">
          <div
            ref={containerRef}
            className="flex flex-wrap justify-center items-start gap-2 w-full"
          >
            {liveData.length > 0 ? (
              liveData.map((port, index) => (
                <Card port={port} key={index} cardWidth={cardWidth} />
              ))
            ) : (
              <div className="flex justify-center items-center w-full py-12">
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  No enabled ports available
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default LiveDataPage;

const getFontSizeClasses = (cardWidth: number) => {
  if (cardWidth >= 160) {
    return {
      portNum: "text-sm",
      label: "text-sm",
      concentration: "text-lg",
      unit: "text-xs"
    };
  } else if (cardWidth >= 130) {
    return {
      portNum: "text-xs",
      label: "text-xs",
      concentration: "text-base",
      unit: "text-[10px]"
    };
  } else {
    return {
      portNum: "text-xs",
      label: "text-xs",
      concentration: "text-sm",
      unit: "text-[10px]"
    };
  }
};

const Card = ({ port, cardWidth }: { port: MockData; cardWidth: number }) => {
  const [open, setOpen] = React.useState(false);
  const [showThreshold, setShowThreshold] = useState(false);
  const { isActive, portNum, conc, label, status, isSampling, updatedAt } =
    port;

  const fontClasses = getFontSizeClasses(cardWidth);

  // Memoize time series data so it doesn't change when threshold is toggled
  const { data: timeSeriesData, categories } = useMemo(
    () => generateMockTimeSeriesData(port),
    [port.id, port.portNum] // Only regenerate if port changes
  );
  const [chartInstance, setChartInstance] = useState<any>(null);

  // Parse concentration value and unit
  const parseConcentration = (concentration: string | null) => {
    if (!concentration) return { value: null, unit: "" };

    // Try to extract unit using common patterns
    const unitMatch = concentration.match(
      /\s*(ppb|ppm|%|°C|°F|mg\/m³|µg\/m³)/i
    );
    if (unitMatch) {
      const unit = unitMatch[1];
      const value = concentration.replace(unitMatch[0], "").trim();
      return { value, unit };
    }

    // Fallback: split by space
    const parts = concentration.trim().split(/\s+/);
    if (parts.length > 1) {
      return { value: parts[0], unit: parts.slice(1).join(" ") };
    }

    return { value: concentration, unit: "" };
  };

  const { value: concValue, unit: concUnit } = parseConcentration(conc);

  // Create threshold configuration
  const thresholdConfig: ThresholdsConfig | null = showThreshold
    ? {
        warning: {
          value: 50,
          color: "#fbbf24",
          visible: true
        },
        alarm: {
          value: 80,
          color: "#ef4444",
          visible: true
        }
      }
    : null;

  const bgColorClass = getBgColorClass(status, isActive);

  return (
    <>
      <div
        style={{
          width: cardWidth,
          minHeight: cardWidth * 0.65
        }}
        className={`relative cursor-pointer group ${
          !isActive
            ? "pointer-events-none opacity-60"
            : "hover:shadow-lg transition-all duration-200"
        } flex flex-col border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm transition-colors duration-200 overflow-hidden ${bgColorClass}`}
        onClick={() => isActive && setOpen(true)}
      >
        {/* Header: Port Number Badge */}
        <div className="flex justify-between items-start px-1.5 pt-1 pb-0.5">
          <div
            className={`px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold ${fontClasses.portNum}`}
          >
            #{portNum}
          </div>
          {isSampling && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-400 dark:border-emerald-600 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-[12px]">
                Sampling
              </span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-start items-center px-1 pb-0.5 gap-0.5">
          {/* Label */}
          <div className="w-full text-center">
            <p
              className={`font-medium text-neutral-700 dark:text-neutral-300 truncate ${fontClasses.label}`}
              title={label}
            >
              {label}
            </p>
          </div>

          {/* Concentration */}
          <div className="flex items-baseline justify-center gap-0.5">
            {concValue ? (
              <>
                <span
                  className={`font-bold text-neutral-900 dark:text-neutral-100 ${fontClasses.concentration}`}
                >
                  {concValue}
                </span>
                {concUnit && (
                  <span
                    className={`text-neutral-600 dark:text-neutral-400 ${fontClasses.unit}`}
                  >
                    {concUnit}
                  </span>
                )}
              </>
            ) : (
              <span
                className={`font-semibold text-cyan-600 dark:text-cyan-400 ${fontClasses.concentration}`}
              >
                Flow Error
              </span>
            )}
          </div>
        </div>

        {/* Status Indicator Bar */}
        {isActive ? (
          <div className={`h-0.5 w-full ${getStatusBarColorClass(status)}`} />
        ) : (
          <div className="h-0.5 w-full bg-slate-400 dark:bg-slate-600" />
        )}
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
                <div
                  className={`text-lg font-bold ${getStatusTextColorClass(
                    status
                  )}`}
                >
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
              timeRange="24h"
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
  // Generate 12 data points over 24 hours (one every 2 hours)
  // Start time: start of yesterday (00:00:00 yesterday)
  // End time: start of today (00:00:00 today)
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startTimestamp = startOfYesterday.getTime();
  const endTimestamp = startOfToday.getTime();
  const totalSpanMs = endTimestamp - startTimestamp; // 24 hours in milliseconds

  const baseValue = port.conc ? parseFloat(port.conc) : 30; // Use port concentration as base
  const dataPoints = 12; // 12 data points
  const intervalMs = totalSpanMs / (dataPoints - 1); // Interval between points

  // Use seeded random for consistent values per port
  // Extract numeric seed from port ID or use port number
  const seed = parseInt(port.id.replace(/\D/g, "")) || port.portNum;

  // Simple seeded random function for consistent data generation
  let randomValue = seed;
  const getSeededRandom = () => {
    randomValue = (randomValue * 9301 + 49297) % 233280;
    return randomValue / 233280;
  };

  const data = Array.from({ length: dataPoints }, (_, i) => {
    // Calculate timestamp: start from start of yesterday, add intervals
    // Point 0 is start of yesterday, point 11 is start of today
    const timestamp = startTimestamp + i * intervalMs;

    // Create realistic time series with variation around the base value
    // Use seeded random so values don't change when threshold is toggled
    const variation = (getSeededRandom() - 0.5) * 40; // ±20 variation
    const trend = Math.sin((i / dataPoints) * Math.PI * 2) * 10; // Add some trend over 24 hours
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
