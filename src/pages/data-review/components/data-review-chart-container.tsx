import { useEffect, useState } from "react";
import DataReviewLineChart from "./data-review-line-chart";
import DataReviewChartHeader from "./data-review-chart-header";
import { ChartProvider } from "./data-review-chart-context";
import { FormattedData } from "../types";
import { useGetMetricDataQuery } from "@/pages/live-data/data/metrics.slice";
import { EmptyStateInfo } from "@/components/empty-state-info";
import { AlertTriangle } from "lucide-react";

type SingleChartProps = {
  metricId: string;
  timeRange: string;
  onRegionSelect?: (start: number, end: number) => void;
  isAxisLocked?: boolean;
  startEndTimeRange: {
    start: number;
    end: number;
  } | null;
};

export const DataReviewChartContainer = ({
  metricId,
  timeRange,
  // onRegionSelect,
  // isAxisLocked,
  startEndTimeRange,
}: SingleChartProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [formattedData, setFormattedData] = useState<FormattedData>({
    data: [],
    mean: 0,
    stdDev: 0,
    unit: "",
  });
  const {
    data: chartData,
    isLoading: isLoadingChartData,
    isFetching: isFetchingChartData,
    isError: isErrorChartData,
    error: errorChartData,
  } = useGetMetricDataQuery(
    {
      metrics: metricId,
      start: startEndTimeRange?.start,
      end: startEndTimeRange?.end,
      downsample_data: true,
      downsample_mode: "MEAN",
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (!chartData) {
      return;
    }
    if (!Object.keys(chartData).includes(metricId)) {
      return;
    }

    const finalData = {
      data: [],
      mean: chartData[metricId].mean,
      stdDev: chartData[metricId].std_dev,
      unit: chartData[metricId].unit,
      thresholds: chartData[metricId].thresholds,
    };

    chartData[metricId].values.forEach((value, index) => {
      finalData.data.push({
        timestamp: chartData[metricId].timestamps[index],
        value: value,
      });
    });

    setFormattedData(finalData);
  }, [chartData, metricId]);

  const thresholdConfig = formattedData?.thresholds
    ? {
        warning: {
          value: formattedData.thresholds.warning,
          color: "#f97316", // orange
          visible: showWarning,
        },
        alarm: {
          value: formattedData.thresholds.alarm,
          color: "#ef4444", // red
          visible: showAlarm,
        },
      }
    : null;

  if (isErrorChartData) {
    return (
      <ChartProvider>
        <div className="bg-white shadow-card p-6 rounded-xl">
          <div className="space-y-4">
            <DataReviewChartHeader
              label={metricId}
              mean={null}
              stdDev={null}
              thresholds={null}
              unit={null}
              showWarning={false}
              showAlarm={false}
              onWarningToggle={() => {}}
              onAlarmToggle={() => {}}
              currentValue={null}
              isFetchingMetricsData={isLoadingChartData || isFetchingChartData}
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 -ml-8">
                {isErrorChartData && (
                  <EmptyStateInfo
                    className="border-none w-full"
                    title={
                      errorChartData?.data?.error?.description || `Data unavailable for ${metricId}`
                    }
                    description={
                      errorChartData?.data?.error?.message ||
                      `Could not render historical data for the selected metric`
                    }
                    icon={<AlertTriangle className="w-4 h-4" />}
                  />
                )}
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
            label={metricId}
            mean={formattedData.mean}
            stdDev={formattedData.stdDev}
            thresholds={formattedData.thresholds}
            unit={formattedData.unit}
            showWarning={showWarning}
            showAlarm={showAlarm}
            onWarningToggle={() => setShowWarning(!showWarning)}
            onAlarmToggle={() => setShowAlarm(!showAlarm)}
            currentValue={null}
            isFetchingMetricsData={isLoadingChartData || isFetchingChartData}
          />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 -ml-8">
              <DataReviewLineChart
                data={formattedData.data}
                index="timestamp"
                categories={[metricId]}
                thresholds={thresholdConfig}
                units={formattedData.unit}
                timeRange={timeRange}
                enableZoom={true}
              />
            </div>
          </div>
        </div>
      </div>
    </ChartProvider>
  );
};

export default DataReviewChartContainer;
