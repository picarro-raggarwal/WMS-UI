import { Spinner } from "@/components/spinner";
import { Card } from "@/components/ui/card";
import * as echarts from "echarts";
import { AngleAxisOption, LegendOption } from "echarts/types/dist/shared";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { WindData, WindRoseDirection, WindSpeedBinKey } from "../types";

interface WindRoseChartProps {
  windData: WindData;
  timeRange: string;
  isLoading: boolean;
}

interface BarSeries {
  name: string;
  type: "bar";
  data: number[];
  coordinateSystem: "polar";
  stack: string;
  emphasis: { focus: string };
}

function transformWindRoseData(data: WindData) {
  const windRose = data?.wind_rose || {};

  const directionBins: WindRoseDirection[] = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  const speedBins: { key: WindSpeedBinKey; label: string }[] = [
    { key: "count_0_2", label: "0-2" },
    { key: "count_2_4", label: "2-4" },
    { key: "count_4_6", label: "4-6" },
    { key: "count_6_8", label: "6-8" },
    { key: "count_8_plus", label: ">8" },
  ];

  const percentMatrix: string[][] = [];
  const seriesData: BarSeries[] = [];

  const totalByDirection: number[] = directionBins.map((dir) => {
    const dirData = windRose[dir] ?? {};
    return speedBins.reduce((sum, bin) => sum + (dirData[bin.key] ?? 0), 0);
  });

  speedBins.forEach(({ key, label }) => {
    const data: number[] = directionBins.map((dir) => {
      const dirData = windRose[dir] ?? {};
      return dirData[key] ?? 0;
    });

    const percentData: string[] = data.map((val, i) =>
      totalByDirection[i] > 0
        ? ((val / totalByDirection[i]) * 100).toFixed(1)
        : "0.0"
    );

    percentMatrix.push(percentData);

    seriesData.push({
      name: `${label} m/s`,
      type: "bar",
      data,
      coordinateSystem: "polar",
      stack: "total",
      emphasis: { focus: "series" },
    });
  });

  const calmCount = data?.calm_occurrences ?? 0;
  const totalCount = (data?.total_occurrences ?? 0) + calmCount;
  const calmPercentage =
    totalCount > 0 ? ((calmCount / totalCount) * 100).toFixed(2) : "0.0";
  const calmThreshold = data?.calm_threshold ?? 0;

  return {
    series: seriesData.map((s) => ({
      ...s,
      // radius: ["30%", "80%"],
    })),
    categories: directionBins,
    percentMatrix,
    calm: {
      count: calmCount,
      percentage: calmPercentage,
      total: totalCount,
      threshold: calmThreshold,
    },
  };
}

export const WindRoseChart = ({
  windData,
  timeRange,
  isLoading,
}: WindRoseChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();
  const { theme } = useTheme();

  const getTimeRangeDisplay = (range: string) => {
    switch (range) {
      case "5m":
        return "Last 5 minutes";
      case "1h":
        return "Last hour";
      case "24h":
        return "Last 24 hours";
      case "7d":
        return "Last 7 days";
      case "1M":
        return "Last month";
      default:
        return "custom";
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current, theme);
    return () => {
      chartInstance.current?.dispose();
    };
  }, [theme]);

  useEffect(() => {
    if (!chartInstance.current || !windData) return;

    const isDark = theme === "dark";
    const { categories, series, percentMatrix, calm } =
      transformWindRoseData(windData);

    const option = {
      textStyle: {
        fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
      },
      tooltip: {
        textStyle: {
          fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
        },
        trigger: "item",
        formatter: function (params) {
          const { seriesName, name, value, seriesIndex, dataIndex } = params;

          if (seriesName === "Calm") {
            return `Calm<br/>${value} occurrences (${calm.percentage}%)`;
          }

          const percent = percentMatrix[seriesIndex]?.[dataIndex] ?? "0.0";
          return `${seriesName}<br/>${name} : ${value} occurrences (${percent}%)`;
        },
      },
      legend: {
        data: ["0-2 m/s", "2-4 m/s", "4-6 m/s", "6-8 m/s", ">8 m/s"],
        textStyle: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
        orient: "horizontal",
        top: "bottom",
        left: "center",
        itemGap: 20,
        align: "left",
      } as LegendOption,
      polar: {
        radius: ["15%", "80%"],
      },
      angleAxis: {
        type: "category",
        data: categories,
        boundaryGap: false,
        axisLine: {
          show: true,
          lineStyle: {
            color: isDark
              ? "rgba(229, 231, 235, 0.3)"
              : "rgba(55, 65, 81, 0.2)",
          },
        },
        axisLabel: {
          color: isDark ? "#e5e7eb" : "#374151",
          align: "center",
        },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: isDark
              ? "rgba(229, 231, 235, 0.1)"
              : "rgba(55, 65, 81, 0.1)",
          },
        },
      } as AngleAxisOption,
      radiusAxis: {
        axisLine: { show: false },
        axisLabel: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: isDark
              ? "rgba(229, 231, 235, 0.1)"
              : "rgba(55, 65, 81, 0.1)",
          },
        },
      },
      series: [...series],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "center",

          style: {
            text: `{a|Calm:}\n{b|${calm.percentage}%}`,
            rich: {
              a: {
                fontSize: 13,
                fontWeight: "semibold",
                color: isDark ? "#e5e7eb" : "#374151",
                align: "center",
                fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
              },
              b: {
                fontSize: 13,
                fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
                fontWeight: "bold",
                color: isDark ? "#e5e7eb" : "#374151",
                align: "center",
              },
            },
            textAlign: "center",
            textVerticalAlign: "middle",
          },
        },
      ],
      color: ["#5da33a", "#488162", "#149ee3", "#5e70f4", "#f67619"],
    } as echarts.EChartsOption;

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windData, theme]);

  const { calm } = transformWindRoseData(windData);

  if (!windData) {
    return (
      <Card className="p-6">
        <div className="">
          <div className="flex items-center">
            <span className="font-semibold text-gray-900 dark:text-gray-50 text-base">
              Wind Data
            </span>
            {isLoading && <Spinner className="ml-2" />}
          </div>
          {!isLoading && (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <p className="font-medium text-lg">Data unavailable</p>
              <p className="text-sm">
                No wind data available for the selected time range
              </p>
            </div>
          )}
        </div>

        <div
          ref={chartRef}
          style={{ height: "400px", width: "100%" }}
          className="-mt-16"
        />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-1 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-gray-50 text-base">
            Wind Data
          </span>
          <span className="font-semibold text-base">
            {windData?.average_wind_speed?.toFixed(1) ?? "0.0"} m/s
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-muted-foreground text-sm">
            {getTimeRangeDisplay(timeRange)}
          </div>
          <div className="font-medium text-muted-foreground text-sm">
            avg speed
          </div>
        </div>
      </div>

      <div
        ref={chartRef}
        style={{ height: "400px", width: "100%" }}
        className="-mt-16"
      />

      <div className="flex flex-col justify-end items-end mt-2 text-xs">
        <span>
          Calm: <strong>{calm.percentage}%</strong> ({calm.count} of{" "}
          {calm.total})
        </span>
        <span>
          Calm threshold: <strong>{calm.threshold} m/s</strong>
        </span>
      </div>
    </Card>
  );
};
