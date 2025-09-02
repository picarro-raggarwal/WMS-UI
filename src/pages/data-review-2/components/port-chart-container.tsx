import { Spinner } from "@/components/spinner";
import { useEffect, useState } from "react";
import { MockChartData, getPortById } from "../data/mock-data";
import { FormattedData } from "../types";
import { ChartProvider } from "./data-review-chart-context";
import DataReviewChartHeader from "./data-review-chart-header";
import DataReviewLineChart from "./data-review-line-chart";

type PortChartContainerProps = {
  portId: string;
  timeRange: string;
  startEndTimeRange: {
    start: number;
    end: number;
  } | null;
  mockData: MockChartData | null;
  isLoading: boolean;
  isRegenerating: boolean;
  rollingAverage: "15min" | "1hour" | "24hour";
};

export const PortChartContainer = ({
  portId,
  timeRange,
  startEndTimeRange,
  mockData,
  isLoading,
  isRegenerating,
  rollingAverage
}: PortChartContainerProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [formattedData, setFormattedData] = useState<FormattedData>({
    data: [],
    mean: 0,
    stdDev: 0,
    unit: ""
  });

  const port = getPortById(portId);

  useEffect(() => {
    if (!mockData || !port || !mockData.data || mockData.data.length === 0) {
      setFormattedData({
        data: [],
        mean: 0,
        stdDev: 0,
        unit: ""
      });
      return;
    }

    try {
      // Convert mock data to the format expected by the chart components
      const finalData: FormattedData = {
        data: mockData.data.map((point) => ({
          timestamps: point.timestamp,
          [portId]: point.value
        })),
        mean: mockData.stats?.mean || 0,
        stdDev: mockData.stats?.stdDev || 0,
        unit: port.unit || "",
        thresholds: {
          warning:
            (mockData.stats?.mean || 0) + (mockData.stats?.stdDev || 0) * 1.5,
          alarm:
            (mockData.stats?.mean || 0) + (mockData.stats?.stdDev || 0) * 2.5
        }
      };

      setFormattedData(finalData);
    } catch (error) {
      console.error("Error converting mock data:", error);
      setFormattedData({
        data: [],
        mean: 0,
        stdDev: 0,
        unit: ""
      });
    }
  }, [mockData, port, portId]);

  const thresholdConfig = formattedData?.thresholds
    ? {
        warning: {
          value: formattedData.thresholds.warning,
          color: "#f97316", // orange
          visible: showWarning
        },
        alarm: {
          value: formattedData.thresholds.alarm,
          color: "#ef4444", // red
          visible: showAlarm
        }
      }
    : null;

  // Only show loading skeleton if we have no data at all
  if (isLoading && !mockData) {
    return (
      <ChartProvider>
        <div className="bg-white shadow-card p-6 rounded-xl">
          <div className="space-y-4">
            <DataReviewChartHeader
              label={port?.label || portId}
              mean={null}
              stdDev={null}
              thresholds={null}
              unit={null}
              showWarning={false}
              showAlarm={false}
              onWarningToggle={() => {}}
              onAlarmToggle={() => {}}
              currentValue={null}
              isFetchingMetricsData={true}
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 -ml-6">
                <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded flex items-center justify-center">
                  <Spinner />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChartProvider>
    );
  }

  if (!mockData || !port) {
    return (
      <ChartProvider>
        <div className="bg-white shadow-card p-6 rounded-xl">
          <div className="space-y-4">
            <DataReviewChartHeader
              label={portId}
              mean={null}
              stdDev={null}
              thresholds={null}
              unit={null}
              showWarning={false}
              showAlarm={false}
              onWarningToggle={() => {}}
              onAlarmToggle={() => {}}
              currentValue={null}
              isFetchingMetricsData={false}
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 -ml-8">
                <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
                  No data available for {portId}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChartProvider>
    );
  }

  return (
    <ChartProvider>
      <div className="bg-white shadow-card p-6 rounded-xl">
        <div className="space-y-4">
          <DataReviewChartHeader
            label={port.label}
            mean={formattedData.mean}
            stdDev={formattedData.stdDev}
            thresholds={formattedData.thresholds}
            unit={formattedData.unit}
            showWarning={showWarning}
            showAlarm={showAlarm}
            onWarningToggle={() => setShowWarning(!showWarning)}
            onAlarmToggle={() => setShowAlarm(!showAlarm)}
            currentValue={null}
            isFetchingMetricsData={isRegenerating}
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 -ml-8 relative">
              {formattedData.data.length > 0 ? (
                <>
                  <DataReviewLineChart
                    data={formattedData.data}
                    index="timestamps"
                    categories={[portId]}
                    thresholds={thresholdConfig}
                    units={formattedData.unit}
                    timeRange={timeRange}
                    enableZoom={true}
                    rollingAverage={rollingAverage}
                  />
                  {/* {isRegenerating && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
                      <Spinner />
                    </div>
                  )} */}
                </>
              ) : (
                <div className="w-full h-[300px] flex items-center justify-center text-gray-500 border rounded">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChartProvider>
  );
};

export default PortChartContainer;
