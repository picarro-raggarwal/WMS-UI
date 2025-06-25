import { useEffect, useState } from "react";
import { useGetMetricDataQuery } from "../data/metrics.slice";
import DataReviewLineChart from "../../data-review/components/data-review-line-chart";
import DataReviewChartHeader from "../../data-review/components/data-review-chart-header";
import { ChartProvider } from "../../data-review/components/data-review-chart-context";
import { ChartData } from "@/types/data-review";

interface LiveChartRenderProps {
  selectedMetrics: string[];
}

export const LiveChartRender = ({ selectedMetrics }: LiveChartRenderProps) => {
  const [chartData, setChartData] = useState<Record<string, ChartData[]>>({});
  const [metricStats, setMetricStats] = useState<
    Record<
      string,
      {
        mean: number;
        stdDev: number;
        unit: string;
        thresholds?: { warning: number; alarm: number };
      }
    >
  >({});
  const [thresholdVisibility, setThresholdVisibility] = useState<
    Record<string, { showWarning: boolean; showAlarm: boolean }>
  >({});

  // Fetch historical data (without time range params to get last 24hrs)
  const { data: historicalData, isLoading: loadingHistorical } = useGetMetricDataQuery(
    {
      metrics: selectedMetrics.join(","),
      downsample_data: true,
      downsample_mode: "MEAN",
      // No start/end params to get all historical data (last 24hrs)
    },
    {
      skip: selectedMetrics.length === 0,
      refetchOnMountOrArgChange: true,
    }
  );

  // Fetch latest data every second
  const { data: latestData } = useGetMetricDataQuery(
    {
      metrics: selectedMetrics.join(","),
      latest_value: true,
    },
    {
      skip: selectedMetrics.length === 0,
      pollingInterval: 1000, // Poll every second
    }
  );

  // Initialize chart data with historical data
  useEffect(() => {
    if (historicalData && Object.keys(historicalData).length > 0) {
      const initialChartData: Record<string, ChartData[]> = {};
      const initialMetricStats: Record<
        string,
        {
          mean: number;
          stdDev: number;
          unit: string;
          thresholds?: { warning: number; alarm: number };
        }
      > = {};
      const initialThresholdVisibility: Record<
        string,
        { showWarning: boolean; showAlarm: boolean }
      > = {};

      Object.entries(historicalData).forEach(([metric, data]) => {
        initialChartData[metric] = data.timestamps.map((timestamp, index) => ({
          timestamp: timestamp,
          value: data.values[index],
        }));

        // Store the metric stats
        initialMetricStats[metric] = {
          mean: data.mean,
          stdDev: data.std_dev,
          unit: data.unit || "",
          thresholds: data.thresholds,
        };

        // Initialize threshold visibility
        initialThresholdVisibility[metric] = {
          showWarning: false,
          showAlarm: false,
        };
      });

      setChartData(initialChartData);
      setMetricStats(initialMetricStats);
      setThresholdVisibility(initialThresholdVisibility);
    }
  }, [historicalData]);

  // Append latest data to chart
  useEffect(() => {
    if (latestData && Object.keys(latestData).length > 0) {
      setChartData((prevData) => {
        const updatedData = { ...prevData };

        Object.entries(latestData).forEach(([metric, data]) => {
          if (data.timestamps.length > 0 && data.values.length > 0) {
            const newPoint = {
              timestamp: data.timestamps[0],
              value: data.values[0],
            };

            // Only add if we already have this metric in our chart data
            if (updatedData[metric]) {
              // Keep only the last 24 hours of data
              const oneDayAgoMs = Date.now() - 24 * 60 * 60 * 1000;
              updatedData[metric] = [
                ...updatedData[metric].filter((point) => point.timestamp > oneDayAgoMs),
                newPoint,
              ];
            } else {
              updatedData[metric] = [newPoint];
            }
          }
        });

        return updatedData;
      });
    }
  }, [latestData]);

  if (loadingHistorical && Object.keys(chartData).length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-neutral-500">Loading historical data...</div>
      </div>
    );
  }

  if (selectedMetrics.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-neutral-500 text-center">
          <p className="font-medium text-lg">No metrics selected</p>
          <p className="text-sm">Please select metrics to display real-time trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedMetrics.map((metric, index) => (
        <ChartProvider key={metric}>
          {chartData[metric] && chartData[metric].length > 0 && metricStats[metric] ? (
            <div className="bg-white dark:bg-neutral-800 shadow-card p-6 dark:border dark:border-neutral-700/20 rounded-xl">
              <div className="space-y-4">
                <DataReviewChartHeader
                  label={metric}
                  mean={metricStats[metric].mean}
                  stdDev={metricStats[metric].stdDev}
                  thresholds={metricStats[metric].thresholds}
                  unit={metricStats[metric].unit}
                  showWarning={thresholdVisibility[metric]?.showWarning || false}
                  showAlarm={thresholdVisibility[metric]?.showAlarm || false}
                  onWarningToggle={() =>
                    setThresholdVisibility((prev) => ({
                      ...prev,
                      [metric]: {
                        ...prev[metric],
                        showWarning: !prev[metric]?.showWarning,
                      },
                    }))
                  }
                  onAlarmToggle={() =>
                    setThresholdVisibility((prev) => ({
                      ...prev,
                      [metric]: {
                        ...prev[metric],
                        showAlarm: !prev[metric]?.showAlarm,
                      },
                    }))
                  }
                  currentValue={chartData[metric][chartData[metric].length - 1]?.value}
                  isFetchingMetricsData={loadingHistorical}
                />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 -ml-8">
                    <DataReviewLineChart
                      data={chartData[metric]}
                      index="timestamp"
                      categories={[metric]}
                      thresholds={
                        metricStats[metric].thresholds
                          ? {
                              warning: {
                                value: metricStats[metric].thresholds.warning,
                                color: "#f97316", // orange
                                visible: thresholdVisibility[metric]?.showWarning || false,
                              },
                              alarm: {
                                value: metricStats[metric].thresholds.alarm,
                                color: "#ef4444", // red
                                visible: thresholdVisibility[metric]?.showAlarm || false,
                              },
                            }
                          : null
                      }
                      units={metricStats[metric].unit}
                      timeRange="24h"
                      enableZoom={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-neutral-500">
                {loadingHistorical ? "Loading data..." : "No data available for " + metric}
              </p>
            </div>
          )}
        </ChartProvider>
      ))}
    </div>
  );
};
