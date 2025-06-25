import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "next-themes";
import type { LineSeriesOption } from "echarts/charts";
import type { EChartsOption } from "echarts";
import { CheckCircleIcon } from "lucide-react";

interface DataPoint {
  [key: string]: number | string;
}

interface EChartsLineProps {
  data: DataPoint[];
  categories: string[];
  index: string;
  colors?: string[];
  className?: string;
  valueFormatter?: (value: number) => string;
  showYAxis?: boolean;
  showXAxis?: boolean;
  showTooltip?: boolean;
  units?: string;
  thresholds: {
    warning: { value: number; color: string; visible: boolean };
    alarm: { value: number; color: string; visible: boolean };
  };
  timeRange?: string;
}

export function EChartsLine({
  data,
  categories,
  index,
  colors = ["#22c55e", "#3b81f6", "#d1d5db", "#ef4444"],
  valueFormatter = (value: number) => Math.round(value).toString(),
  showYAxis = true,
  showXAxis = true,
  showTooltip = true,
  units = "",
  thresholds,
  timeRange = "realtime",
}: EChartsLineProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize chart
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, theme);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [theme]);

  useEffect(() => {
    if (!chartInstance.current) return;

    const isDark = theme === "dark";

    const getColorForValue = (value: number): string => {
      if (value >= thresholds.alarm.value && thresholds.alarm.visible) {
        return thresholds.alarm.color;
      }
      if (value >= thresholds.warning.value && thresholds.warning.visible) {
        return thresholds.warning.color;
      }
      return colors[0]; // Default green color
    };

    const getIconForValue = (value: number): string => {
      if (value >= thresholds.alarm.value && thresholds.alarm.visible) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>';
      }
      if (value >= thresholds.warning.value && thresholds.warning.visible) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>';
      }
      return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/></svg>';
    };

    const option: EChartsOption = {
      textStyle: {
        fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
      },
      animationDuration: 300,
      animationEasing: "linear",
      grid: {
        left: showYAxis ? 50 : 10,
        right: 15,
        top: 10,
        bottom: showXAxis ? 12 : 10,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        show: showTooltip,
        backgroundColor: isDark ? "#282828" : "#282828",
        borderColor: isDark ? "#282828" : "#282828",
        borderRadius: 10,
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.15)",
        shadowOffsetY: 2,
        enterable: false, // This allows the tooltip to be interactive
        confine: true, // This ensures the tooltip doesn't overflow the chart area
        appendToBody: true,
        hideDelay: 100,
        alwaysShowContent: true,
        axisPointer: {
          animation: false,
          type: "line",
          snap: true,
          lineStyle: {
            color: isDark ? "#374151" : "#374151",
            type: "dashed",
            width: 1.25,
          },
        },
        textStyle: {
          fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
          color: isDark ? "#e5e7eb" : "#374151",
          fontSize: 12,
        },
        formatter: (params: echarts.DefaultLabelFormatterCallbackParams[]) => {
          const mainParam = params[0];
          const value = Number(mainParam.value);

          return `
            <div style="display: flex; flex-direction: column; font-family: 'Wix Madefor Text Variable', system-ui, sans-serif; min-width: 150px; padding: 2px;">
           <div style="font-size: .85rem; font-weight: 600; color: #fff; border-bottom: 1px solid #3c3c3c; padding-left: 8px; padding-right: 8px; padding-bottom: 8px; ">
                ${mainParam.name}
              </div>
            <div style="font-weight: 600;  padding-top: 8px; font-size: 1rem;  font-color: #fff; display: flex; align-items: center; gap: 4px; color: #fff;">
            
            <span style="background-color: ${getColorForValue(
              value
            )}; padding: 2px; border-radius: 4px;">${getIconForValue(
            value
          )}</span> ${valueFormatter(value)}${units}
            </div>
             
              </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        show: showXAxis,
        data: data.map((item) => item[index]),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
          color: "#888888",
          fontSize: 11,
          interval: Math.floor(data.length / 6),
          hideOverlap: true,
          padding: [12, 0, 0, 4],
        },
      },
      yAxis: {
        type: "value",
        show: showYAxis,
        splitNumber: 4,
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
          fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
          color: "#888888",
          fontSize: 11,
          formatter: (value: number) => `${Math.round(value)}${units}`,
          padding: [0, 15, 0, 0],
        },
      },
      series: [
        ...categories.map(
          (category) =>
            ({
              name: category,
              type: "line" as const,
              data: data.map((item, index) => ({
                value: Number(item[category]),
                symbol: index === data.length - 1 ? "circle" : "none",
                symbolSize: index === data.length - 1 ? 8 : 0,
                itemStyle:
                  index === data.length - 1
                    ? {
                        color: getColorForValue(Number(item[category])),
                        borderColor: getColorForValue(Number(item[category])),
                        borderWidth: 2,
                        shadowBlur: 4,
                        shadowColor: getColorForValue(Number(item[category])),
                      }
                    : undefined,
              })),
              showSymbol: true,
              smooth: 0.2,
              lineStyle: {
                width: 2,
              },
              areaStyle: {
                opacity: 0,
              },
              emphasis: {
                focus: "series",
              },
              animationDuration: 300,
              animationEasing: "linear",
            } satisfies LineSeriesOption)
        ),
        // Warning threshold line
        ...(thresholds.warning.visible
          ? [
              {
                name: "Warning Level",
                type: "line" as const,
                data: new Array(data.length).fill(thresholds.warning.value),
                lineStyle: {
                  type: "dashed",
                  color: thresholds.warning.color,
                  width: 1,
                },
                symbol: "none",
                emphasis: {
                  disabled: true,
                },
              } satisfies LineSeriesOption,
            ]
          : []),
        // Alarm threshold line
        ...(thresholds.alarm.visible
          ? [
              {
                name: "Alarm Level",
                type: "line" as const,
                data: new Array(data.length).fill(thresholds.alarm.value),
                lineStyle: {
                  type: "dashed",
                  color: thresholds.alarm.color,
                  width: 1,
                },
                symbol: "none",
                emphasis: {
                  disabled: true,
                },
              } satisfies LineSeriesOption,
            ]
          : []),
      ],
      visualMap: {
        show: false,
        pieces: [
          {
            gt: thresholds.alarm.value,
            color: thresholds.alarm.visible ? thresholds.alarm.color : colors[0],
          },
          {
            gt: thresholds.warning.value,
            lte: thresholds.alarm.value,
            color: thresholds.warning.visible ? thresholds.warning.color : colors[0],
          },
          {
            lte: thresholds.warning.value,
            color: colors[0],
          },
        ],
        seriesIndex: 0,
      },
    };

    chartInstance.current.setOption(option, {
      notMerge: true,
      lazyUpdate: false,
    });
  }, [
    data,
    categories,
    index,
    colors,
    valueFormatter,
    showYAxis,
    showXAxis,
    showTooltip,
    theme,
    units,
    thresholds,
    timeRange,
  ]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }} />;
}
