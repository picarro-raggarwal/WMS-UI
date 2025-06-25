import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import { formatTime, formatDateTime } from "@/utils";

export interface ChartData {
  timestamp: number;
  value: number;
}

interface SimpleEChartsLineProps {
  data: ChartData[];
  xKey: string;
  yKey: string;
  name: string;
  showLegend?: boolean;
  smooth?: boolean;
  timeFormat?: boolean;
  height?: number;
}

export const SimpleEChartsLine = ({
  data,
  xKey,
  yKey,
  name,
  showLegend = false,
  smooth = false,
  timeFormat = true,
  height = 235,
}: SimpleEChartsLineProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, theme);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [theme]);

  useEffect(() => {
    if (!chartInstance.current || !data || data.length === 0) return;

    const formatTimeLocal = (timestamp: number): string => {
      if (!timeFormat) return timestamp.toString();
      const date = new Date(timestamp);
      return formatTime(date);
    };

    const option: EChartsOption = {
      textStyle: {
        fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
      },
      grid: {
        left: 0,
        right: 5,
        top: 10,
        bottom: 35,
        containLabel: true,
      },

      tooltip: {
        trigger: "axis",

        formatter: (params) => {
          // Type assertion for params
          const tooltipParams = params as echarts.DefaultLabelFormatterCallbackParams[];
          const param = tooltipParams[0];

          // Access value as an array
          const valueArray = param.value as [number, number];
          const time = formatDateTime(new Date(valueArray[0]));
          const value = valueArray[1];

          return `<div style="font-size: 14px; color: #fff; font-weight: 500; margin-bottom: 4px;">${time}</div>
                 <div style="font-size: 14px; color: #fff;">${name}: ${value.toFixed(2)}</div>`;
        },
        backgroundColor: isDark ? "#282828" : "#282828",
        borderColor: isDark ? "#282828" : "#282828",
        textStyle: {
          color: isDark ? "#e5e7eb" : "#374151",
          fontSize: 12,
        },
      },
      xAxis: {
        type: "time",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: "#888888",
          formatter: (value: number): string => formatTimeLocal(value),
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: isDark ? "rgba(55, 65, 81, 0.15)" : "rgba(229, 231, 235, 0.5)",
            type: "solid",
            width: 1,
          },
        },
        axisLabel: {
          color: "#888888",
        },
      },
      series: [
        {
          name: name,
          type: "line",
          showSymbol: false,
          smooth: smooth,
          sampling: "average",
          data: data.map((item) => [item[xKey], item[yKey]]),
          lineStyle: {
            width: 1.75,
          },
          itemStyle: {
            color: "#63B03D",
          },
        },
      ],
      legend: {
        show: showLegend,
        top: 0,
        left: 0,
        textStyle: {
          color: isDark ? "#e5e7eb" : "#374151",
        },
      },
    };

    chartInstance.current.setOption(option);
  }, [data, xKey, yKey, name, showLegend, smooth, theme, timeFormat, isDark]);

  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: `${height}px` }} />;
};
