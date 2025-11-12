import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PageHeader } from "@/components/ui/page-header";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { loadPortConfig } from "@/types/common/port-config";
import { generateAllPorts, isAmbientPort } from "@/types/common/ports";
import { formatDate, formatDateTime } from "@/utils";
import { ChartConfigDialog } from "./components/chart-config-dialog";
import {
  ChartSyncProvider,
  useChartSync
} from "./components/chart-sync-context";
import { ExportDialog } from "./components/export-dialog";
import { PortChartContainer } from "./components/port-chart-container";
import { generateMockDataForPorts, getPortById } from "./data/mock-data";

type TimeRange = "1h" | "24h" | "7d" | "1month" | "custom";
type RollingAverage = "15min" | "1hour" | "24hour";

const TIME_RANGES: Record<Exclude<TimeRange, "custom">, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "1month": 30 * 24 * 60 * 60 * 1000
};

const ROLLING_AVERAGE_OPTIONS = [
  { value: "15min", label: "15 Min" },
  { value: "1hour", label: "1 Hour" },
  { value: "24hour", label: "24 Hour" }
] as const;

// Get default selected ports - first 4 enabled ports (excluding port #0)
export const getDefaultSelectedPorts = (): string[] => {
  const portConfig = loadPortConfig();
  const allPorts = generateAllPorts();

  // Filter to only enabled ports, excluding port #0 (Ambient)
  const enabledPorts = allPorts
    .filter(
      (port) =>
        !isAmbientPort(port.portNumber) &&
        portConfig.enabled[port.portNumber] === true
    )
    .slice(0, 4); // Take first 4 ports

  return enabledPorts.map((port) => port.id);
};

export const DEFAULT_SELECTED_PORTS: string[] = getDefaultSelectedPorts();

const DataReviewPageContent = () => {
  const { isSyncEnabled, setIsSyncEnabled } = useChartSync();
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>(
    dateRange
  );
  const [selectedPorts, setSelectedPorts] = useLocalStorage<string[]>({
    key: "data-review-selected-ports-v3",
    defaultValue: DEFAULT_SELECTED_PORTS
  });
  const [rollingAverage, setRollingAverage] = useState<RollingAverage>("15min");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [mockData, setMockData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [startEndTimeRange, setStartEndTimeRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  useEffect(() => {
    if (timeRange === "custom") {
      setStartEndTimeRange({
        start: dateRange?.from.valueOf(),
        end: dateRange?.to.valueOf()
      });
    } else {
      const rangeDuration =
        TIME_RANGES[timeRange as Exclude<TimeRange, "custom">];
      const now = Date.now();

      setStartEndTimeRange({
        start: now - rangeDuration,
        end: now
      });
    }
  }, [timeRange, dateRange]);

  // Generate mock data when time range or selected ports change
  useEffect(() => {
    if (!startEndTimeRange || selectedPorts.length === 0) return;

    // If we already have data, show regenerating state instead of loading
    const hasExistingData = Object.keys(mockData).length > 0;

    if (hasExistingData) {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
    }

    // Simulate API delay
    setTimeout(() => {
      try {
        const ports = selectedPorts
          .map((portId) => getPortById(portId))
          .filter(Boolean);

        if (ports.length === 0) {
          setMockData({});
          setIsLoading(false);
          setIsRegenerating(false);
          return;
        }

        const data = generateMockDataForPorts(
          ports,
          startEndTimeRange.start,
          startEndTimeRange.end,
          60000 // 1 minute intervals
        );

        const dataMap: Record<string, any> = {};
        data.forEach((item) => {
          if (item && item.portId) {
            dataMap[item.portId] = item;
          }
        });

        setMockData(dataMap);
        setIsLoading(false);
        setIsRegenerating(false);
      } catch (error) {
        console.error("Error generating mock data:", error);
        setMockData({});
        setIsLoading(false);
        setIsRegenerating(false);
      }
    }, 500);
  }, [startEndTimeRange, selectedPorts]);

  return (
    <>
      <PageHeader />
      <main className="flex flex-col mx-auto px-8 md:px-12 py-8 w-full max-w-8xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <div className="flex items-center shrink-0">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-l-md rounded-r-none border-r-0  ${
                  timeRange === "1h" && !isPopoverOpen
                    ? "text-black bg-gray-100"
                    : "text-gray-600"
                }`}
                onClick={() => setTimeRange("1h")}
              >
                1h
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-none border-r-0 ${
                  timeRange === "24h" && !isPopoverOpen
                    ? "text-black bg-gray-100"
                    : "text-gray-600"
                }`}
                onClick={() => setTimeRange("24h")}
              >
                24h
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-none border-r-0 ${
                  timeRange === "7d" && !isPopoverOpen
                    ? "text-black bg-gray-100"
                    : "text-gray-600"
                }`}
                onClick={() => setTimeRange("7d")}
              >
                7d
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-l-none rounded-r-none border-r-0 ${
                  timeRange === "1month" && !isPopoverOpen
                    ? "text-black bg-gray-100"
                    : "text-gray-600"
                }`}
                onClick={() => setTimeRange("1month")}
              >
                1M
              </Button>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-l-none rounded-r-md ${
                      timeRange === "custom"
                        ? "text-black bg-gray-100"
                        : "text-gray-600"
                    }`}
                  >
                    {timeRange === "custom" && dateRange?.from ? (
                      <span className="text-xs whitespace-nowrap">
                        {formatDate(dateRange.from)} -{" "}
                        {dateRange.to ? formatDate(dateRange.to) : ""}
                      </span>
                    ) : (
                      "Custom"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={draftDateRange}
                    onSelect={(range) => {
                      setDraftDateRange(range);
                    }}
                    numberOfMonths={2}
                    toDate={new Date()}
                  />
                  <div className="flex justify-end gap-2 p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDraftDateRange(dateRange);
                        setIsPopoverOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        if (draftDateRange?.from && draftDateRange?.to) {
                          setDateRange(draftDateRange);
                          setTimeRange("custom");
                          setIsPopoverOpen(false);
                        }
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="font-bold text-black dark:text-white text-xs sm:text-sm tracking-tight whitespace-nowrap shrink-0">
              {timeRange === "custom" && dateRange?.from && dateRange?.to ? (
                <>
                  {formatDateTime(dateRange.from)} -{" "}
                  {formatDateTime(dateRange.to)}
                </>
              ) : (
                <>
                  {formatDateTime(
                    new Date(
                      Date.now() -
                        TIME_RANGES[timeRange as Exclude<TimeRange, "custom">]
                    )
                  )}{" "}
                  - {formatDateTime(new Date())}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Rolling Avg:
              </span>
              <Select
                value={rollingAverage}
                onValueChange={(value) =>
                  setRollingAverage(value as RollingAverage)
                }
              >
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLLING_AVERAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sync X:
              </span>
              <Switch
                checked={isSyncEnabled}
                onCheckedChange={setIsSyncEnabled}
              />
            </div>
            <ChartConfigDialog
              selectedPorts={selectedPorts}
              onPortsChange={setSelectedPorts}
            />
            <ExportDialog
              timeRange={timeRange}
              dateRange={dateRange}
              selectedMetrics={selectedPorts}
            />
          </div>
        </div>

        <div className="space-y-4">
          {selectedPorts.length === 0 ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  No Ports Selected
                </p>
                <p className="text-gray-500 mb-4">
                  Configure charts to select up to 4 ports to display
                </p>
                <ChartConfigDialog
                  selectedPorts={selectedPorts}
                  onPortsChange={setSelectedPorts}
                />
              </div>
            </div>
          ) : (
            <div className="gap-4 grid grid-cols-1">
              {selectedPorts.map((portId) => (
                <PortChartContainer
                  key={portId}
                  portId={portId}
                  timeRange={timeRange}
                  startEndTimeRange={startEndTimeRange}
                  mockData={mockData[portId] || null}
                  isLoading={isLoading}
                  isRegenerating={isRegenerating}
                  rollingAverage={rollingAverage}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const DataReviewPage = () => {
  return (
    <ChartSyncProvider>
      <DataReviewPageContent />
    </ChartSyncProvider>
  );
};

export default DataReviewPage;
