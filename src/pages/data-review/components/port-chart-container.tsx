import { Spinner } from "@/components/spinner";
import { RootState } from "@/lib/store";
import { MetricDataResponse } from "@/pages/live-data/data/metrics.slice";
import { getAmbientPort } from "@/types/common/ports";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getPortById } from "../data/mock-data";
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
  metricData: MetricDataResponse[string] | null;
  isLoading: boolean;
  isRegenerating: boolean;
  isError?: boolean;
  rollingAverage: "15min" | "1hour" | "24hour";
};

export const PortChartContainer = ({
  portId,
  timeRange,
  startEndTimeRange,
  metricData,
  isLoading,
  isRegenerating,
  isError,
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

  // Get inlets from global state
  const globalInlets = useSelector(
    (state: RootState) => (state as any).settingsGlobal?.inlets
  );

  // Get inlet info from global state or fallback to mock data
  const inletInfo = useMemo(() => {
    // Check if it's Ambient port
    const ambientPort = getAmbientPort();
    if (portId === ambientPort.id) {
      return {
        displayLabel: "Ambient",
        portId: ambientPort.portNumber,
        unit: "ppb"
      };
    }

    // Extract inlet ID from portId (format: "inlet-{id}")
    const inletId = portId.replace("inlet-", "");

    // Find inlet in global state
    if (globalInlets?.result) {
      const inlet = globalInlets.result.find(
        (inlet: any) => inlet.id.toString() === inletId
      );

      if (inlet) {
        return {
          displayLabel: inlet.displayLabel || `Port ${inlet.portId}`,
          portId: inlet.portId,
          unit: "ppb"
        };
      }
    }

    // Fallback to mock data
    const port = getPortById(portId);
    return {
      displayLabel: port?.label || portId,
      portId: port?.number || 0,
      unit: port?.unit || "ppb"
    };
  }, [portId, globalInlets]);

  useEffect(() => {
    if (
      !metricData ||
      !metricData.timestamps ||
      metricData.timestamps.length === 0
    ) {
      setFormattedData({
        data: [],
        mean: 0,
        stdDev: 0,
        unit: ""
      });
      return;
    }

    try {
      // Convert API metric data to the format expected by the chart components
      const { timestamps, values, mean, std_dev, unit, thresholds } =
        metricData;

      // Combine timestamps and values into chart data format
      const chartData = timestamps.map((timestamp, index) => ({
        timestamps: timestamp,
        [portId]: values[index] || 0
      }));

      const finalData: FormattedData = {
        data: chartData,
        mean: mean || 0,
        stdDev: std_dev || 0,
        unit: unit || inletInfo.unit || "ppb",
        thresholds: thresholds
          ? {
              warning: thresholds.warning,
              alarm: thresholds.alarm
            }
          : {
              // Calculate thresholds if not provided
              warning: (mean || 0) + (std_dev || 0) * 1.5,
              alarm: (mean || 0) + (std_dev || 0) * 2.5
            }
      };

      setFormattedData(finalData);
    } catch (error) {
      console.error("Error converting metric data:", error);
      setFormattedData({
        data: [],
        mean: 0,
        stdDev: 0,
        unit: ""
      });
    }
  }, [metricData, portId, inletInfo.unit]);

  const thresholdConfig = formattedData?.thresholds
    ? {
        warning: {
          value: formattedData.thresholds.warning,
          color: "#fbbf24", // amber-400
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
  if (isLoading && !metricData) {
    return (
      <ChartProvider>
        <div className="bg-white shadow-card p-6 rounded-xl">
          <div className="space-y-4">
            <DataReviewChartHeader
              label={inletInfo.displayLabel}
              portId={inletInfo.portId}
              mean={null}
              stdDev={null}
              thresholds={null}
              unit={null}
              showWarning={false}
              showAlarm={false}
              onWarningToggle={() => {
                /* empty */
              }}
              onAlarmToggle={() => {
                /* empty */
              }}
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

  if (isError) {
    return (
      <ChartProvider>
        <div className="bg-white shadow-card p-6 rounded-xl">
          <div className="space-y-4">
            <DataReviewChartHeader
              label={inletInfo.displayLabel}
              portId={inletInfo.portId}
              mean={null}
              stdDev={null}
              thresholds={null}
              unit={null}
              showWarning={false}
              showAlarm={false}
              onWarningToggle={() => {
                /* empty */
              }}
              onAlarmToggle={() => {
                /* empty */
              }}
              currentValue={null}
              isFetchingMetricsData={false}
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 -ml-8">
                <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
                  Error loading data for {portId}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChartProvider>
    );
  }

  if (
    !metricData ||
    !metricData.timestamps ||
    metricData.timestamps.length === 0
  ) {
    return (
      <ChartProvider>
        <div className="bg-white shadow-card p-6 rounded-xl">
          <div className="space-y-4">
            <DataReviewChartHeader
              label={inletInfo.displayLabel}
              portId={inletInfo.portId}
              mean={null}
              stdDev={null}
              thresholds={null}
              unit={null}
              showWarning={false}
              showAlarm={false}
              onWarningToggle={() => {
                /* empty */
              }}
              onAlarmToggle={() => {
                /* empty */
              }}
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
            label={inletInfo.displayLabel}
            portId={inletInfo.portId}
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
                    portId={portId}
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
