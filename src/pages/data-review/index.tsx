import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { PageHeader } from "@/components/ui/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocalStorage } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { Card } from "@/components/ui/card";
import { formatDateTime, formatDate } from "@/utils";
import { ChartConfigDialog } from "../live-data/components/chart-config-dialog";
import DataReviewChartContainer from "./components/data-review-chart-container";
import { ExportDialog } from "./components/export-dialog";
import { WindRoseChart } from "./components/wind-rose-chart";
import { useGetWindRoseQuery } from "./data/dataReview.api";
// import { WindData } from "./types";

type TimeRange = "1h" | "24h" | "7d" | "1month" | "custom";

const TIME_RANGES: Record<Exclude<TimeRange, "custom">, number> = {
  "1h": 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "1month": 30 * 24 * 60 * 60 * 1000,
};

export const DEFAULT_SELECTED_METRICS: [string, string] = ["mfc_a_pressure", "cabinet_temperature"];

const DataReviewPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>(dateRange);
  const [selectedMetrics, setSelectedMetrics] = useLocalStorage<[string, string]>({
    key: "data-review-selected-metrics",
    defaultValue: DEFAULT_SELECTED_METRICS,
  });
  const [selectedRegion, setSelectedRegion] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const [startEndTimeRange, setStartEndTimeRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [isAxisLocked, setIsAxisLocked] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: windRoseData, isLoading: isLoadingWindRose } = useGetWindRoseQuery(
    { ...startEndTimeRange, downsample_data: true },
    {
      skip: !startEndTimeRange,
    }
  );

  useEffect(() => {
    if (timeRange === "custom") {
      setStartEndTimeRange({
        start: dateRange?.from.valueOf(),
        end: dateRange?.to.valueOf(),
      });
    } else {
      const rangeDuration = TIME_RANGES[timeRange as Exclude<TimeRange, "custom">];
      const now = Date.now();

      setStartEndTimeRange({
        start: now - rangeDuration,
        end: now,
      });
    }
  }, [timeRange, dateRange]);

  return (
    <>
      <PageHeader pageName="Data Review" />
      <main className="flex flex-col mx-auto px-8 md:px-12 py-8 w-full max-w-8xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-l-md rounded-r-none border-r-0  ${
                  timeRange === "1h" && !selectedRegion ? "text-black bg-gray-100" : "text-gray-600"
                }`}
                onClick={() => setTimeRange("1h")}>
                1h
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-none border-r-0 ${
                  timeRange === "24h" && !selectedRegion
                    ? "text-black bg-gray-100"
                    : "text-gray-600"
                }`}
                onClick={() => setTimeRange("24h")}>
                24h
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-none border-r-0 ${
                  timeRange === "7d" && !selectedRegion ? "text-black bg-gray-100" : "text-gray-600"
                }`}
                onClick={() => setTimeRange("7d")}>
                7d
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-l-none rounded-r-none border-r-0 ${
                  timeRange === "1month" && !selectedRegion
                    ? "text-black bg-gray-100"
                    : "text-gray-600"
                }`}
                onClick={() => setTimeRange("1month")}>
                1M
              </Button>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-l-none rounded-r-md ${
                      timeRange === "custom" ? "text-black bg-gray-100" : "text-gray-600"
                    }`}>
                    {timeRange === "custom" && dateRange?.from ? (
                      <span className="text-xs">
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
                      }}>
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        if (draftDateRange?.from && draftDateRange?.to) {
                          setDateRange(draftDateRange);
                          setTimeRange("custom");
                          setSelectedRegion(null);
                          setIsPopoverOpen(false);
                        }
                      }}>
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="font-bold text-black dark:text-white text-lg tracking-tight whitespace-nowrap">
              {timeRange === "custom" && dateRange?.from && dateRange?.to ? (
                <>
                  {formatDateTime(dateRange.from)} - {formatDateTime(dateRange.to)}
                </>
              ) : (
                <>
                  {formatDateTime(
                    new Date(Date.now() - TIME_RANGES[timeRange as Exclude<TimeRange, "custom">])
                  )}{" "}
                  - {formatDateTime(new Date())}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              icon={<LockIcon />}
              onClick={() => setIsAxisLocked(!isAxisLocked)}>
              {isAxisLocked ? "Unlock" : "Lock"} Axis
            </Button> */}
            <ExportDialog
              timeRange={timeRange}
              dateRange={dateRange}
              selectedMetrics={selectedMetrics}
            />
            <ChartConfigDialog
              selectedMetrics={selectedMetrics}
              onMetricsChange={setSelectedMetrics}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="gap-4 grid grid-cols-1">
            {selectedMetrics.map((metric) => (
              <div className="space-y-4">
                <DataReviewChartContainer
                  metricId={metric}
                  timeRange={timeRange}
                  // onRegionSelect={onRegionSelect}
                  isAxisLocked={isAxisLocked}
                  startEndTimeRange={startEndTimeRange}
                />
              </div>
            ))}
          </div>
          <div className="gap-4 grid grid-cols-2">
            <WindRoseChart
              windData={windRoseData}
              timeRange={timeRange}
              isLoading={isLoadingWindRose}
            />
            <Card className="p-6"></Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default DataReviewPage;
