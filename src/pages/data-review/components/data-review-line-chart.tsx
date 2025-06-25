import { ChartData } from "@/types/data-review";
import {
  formatDateTime,
  formatDate as formatDateUtil,
  formatTime as formatTimeUtil
} from "@/utils";
import type { EChartsOption } from "echarts";
import * as echarts from "echarts";
import type { LineSeriesOption } from "echarts/charts";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { ThresholdsConfig } from "../types";
import { useChartContext } from "./data-review-chart-context";

type DataReviewLineChartProps = {
  data: ChartData[];
  categories: string[];
  index: string;
  colors?: string[];
  className?: string;
  units?: string;
  thresholds?: ThresholdsConfig | null;
  timeRange?: string;
  enableZoom?: boolean;
  onRegionSelect?: (start: number, end: number) => void;
  zoomStart?: number;
  zoomEnd?: number;
  onInstance?: (instance: echarts.ECharts) => void;
};

const formatDate = (
  timestamp: string | number,
  timeRange: string,
  isTooltip = false
) => {
  const date = new Date(Number(timestamp));

  if (isTooltip) {
    // Tooltip always shows full date and time
    return formatDateTime(date);
  }

  // Axis labels format based on timeRange
  if (timeRange === "5m" || timeRange === "1h" || timeRange === "24h") {
    return formatTimeUtil(date);
  }

  // For 7d or longer, just show date
  return formatDateUtil(date);
};

const getColorForValue = (
  value: number,
  thresholds: ThresholdsConfig | null
): string => {
  if (!thresholds) return COLORS[0];
  if (value >= thresholds.alarm.value && thresholds.alarm.visible) {
    return thresholds.alarm.color;
  }
  if (value >= thresholds.warning.value && thresholds.warning.visible) {
    return thresholds.warning.color;
  }
  return COLORS[0];
};

const getIconForValue = (
  value: number,
  thresholds: ThresholdsConfig | null
): string => {
  if (!thresholds) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/></svg>';
  }

  if (value >= thresholds.alarm.value && thresholds.alarm.visible) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>';
  }
  if (value >= thresholds.warning.value && thresholds.warning.visible) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/></svg>';
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return formatTimeUtil(date);
};

const createLineSeries = (
  data: ChartData[],
  categories: string[],
  thresholds: ThresholdsConfig | null
) => {
  const category = categories[0];

  type MarkLine = {
    silent: boolean;
    lineStyle: {
      type: "solid" | "dashed";
      width: number;
    };
    symbol: string;
    label: {
      show: boolean;
    };
    data: {
      yAxis: number;
      lineStyle: {
        color: string;
      };
      label: {
        show: boolean;
      };
    }[];
  };

  let markLine: MarkLine | undefined = undefined;
  if (thresholds?.warning.visible || thresholds?.alarm.visible) {
    markLine = {
      silent: true,
      lineStyle: {
        type: "dashed" as const,
        width: 1
      },
      symbol: "none",
      label: {
        show: false
      },
      data: []
    };
    if (thresholds?.warning.visible) {
      markLine.data.push({
        yAxis: thresholds.warning.value,
        lineStyle: {
          color: thresholds.warning.color
        },
        label: {
          show: false
        }
      });
    }
    if (thresholds?.alarm.visible) {
      markLine.data.push({
        yAxis: thresholds.alarm.value,
        lineStyle: {
          color: thresholds.alarm.color
        },
        label: {
          show: false
        }
      });
    }
  }

  const temp = [
    {
      name: category,
      type: "line" as const,
      data: data.map((item, index) => ({
        value: Number(item.value),
        symbol: index === data.length - 1 ? "circle" : "none",
        symbolSize: index === data.length - 1 ? 8 : 0,
        itemStyle:
          index === data.length - 1
            ? {
                color: getColorForValue(Number(item.value), thresholds),
                borderColor: getColorForValue(Number(item.value), thresholds),
                borderWidth: 2,
                shadowBlur: 4,
                shadowColor: getColorForValue(Number(item.value), thresholds)
              }
            : undefined
      })),
      showSymbol: true,
      smooth: 0,
      sampling: "average",
      lineStyle: {
        width: 1.5
      },
      areaStyle: {
        opacity: 0
      },
      emphasis: {
        focus: "series"
      },
      animationDuration: 300,
      animationEasing: "linear",
      markLine: markLine
    } satisfies LineSeriesOption
  ];

  // ...(thresholds?.warning.visible
  //   ? [
  //     {
  //       name: "Warning Level",
  //       type: "line",
  //       data: new Array(data.length).fill(thresholds.warning.value),
  //       lineStyle: {
  //         type: "dashed",
  //         color: thresholds.warning.color,
  //         width: 1,
  //       },
  //       symbol: "none",
  //       emphasis: {
  //         disabled: true,
  //       },
  //     } satisfies LineSeriesOption,
  //   ]
  //   : []),
  // ...(thresholds?.alarm.visible
  //   ? [
  //     {
  //       name: "Alarm Level",
  //       type: "line",
  //       data: new Array(data.length).fill(thresholds.alarm.value),
  //       lineStyle: {
  //         type: "dashed",
  //         color: thresholds.alarm.color,
  //         width: 1,
  //       },
  //       symbol: "none",
  //       emphasis: {
  //         disabled: true,
  //       },
  //     } satisfies LineSeriesOption,
  //   ]
  //   : []),

  return temp;
};

const createVisualMap = (thresholds: ThresholdsConfig | null) => {
  if (
    !thresholds ||
    (!thresholds.warning.visible && !thresholds.alarm.visible)
  ) {
    return {
      show: false,
      pieces: [
        {
          gt: Number.MIN_SAFE_INTEGER,
          lte: Number.MAX_SAFE_INTEGER,
          color: COLORS[0]
        }
      ],
      outOfRange: {
        color: "#999"
      }
    };
  }

  type Piece = {
    gt?: number;
    lte?: number;
    color: string;
  };

  const temp = {
    show: false,
    pieces: [],
    outOfRange: {
      color: "#999"
    }
  };

  const normalPiece: Piece = {
    gt: Number.MIN_SAFE_INTEGER,
    color: COLORS[0]
  };
  let warningPiece: Piece | undefined = undefined;
  let alarmPiece: Piece | undefined = undefined;

  if (thresholds.warning.visible) {
    normalPiece.lte = thresholds.warning.value;
    warningPiece = {
      gt: thresholds.warning.value,
      color: thresholds.warning.color
    };
  }

  if (thresholds.alarm.visible) {
    if (!normalPiece.lte) {
      normalPiece.lte = thresholds.alarm.value;
    }
    if (warningPiece) {
      warningPiece.lte = thresholds.alarm.value;
    }
    alarmPiece = {
      gt: thresholds.alarm.value,
      color: thresholds.alarm.color
    };
  }

  temp.pieces.push(normalPiece);
  if (warningPiece) {
    temp.pieces.push(warningPiece);
  }
  if (alarmPiece) {
    temp.pieces.push(alarmPiece);
  }

  console.log(temp);

  return temp;
};

const COLORS = ["#63B03D", "#3b81f6", "#d1d5db", "#ef4444"];

const DataReviewLineChart = (props: DataReviewLineChartProps) => {
  const {
    data,
    categories,
    index,
    units = "",
    thresholds,
    timeRange = "realtime",
    enableZoom = false
  } = props;
  const htmlContainerRef = useRef<HTMLDivElement>();
  const chartInstanceRef = useRef<echarts.ECharts>();
  const { theme } = useTheme();
  const { setChartInstance } = useChartContext();

  useEffect(() => {
    if (!htmlContainerRef.current) {
      return;
    }

    const htmlContainer = htmlContainerRef.current;
    const chartInstance = echarts.init(htmlContainer, theme);
    chartInstanceRef.current = chartInstance;
    setChartInstance(chartInstance);
    if (props.onInstance) props.onInstance(chartInstance);

    // enable the zoom brush, remove the listener because "finished" fires many times
    new Promise((resolve) => {
      chartInstance.on("finished", () => {
        chartInstance.dispatchAction({
          type: "takeGlobalCursor",
          key: "dataZoomSelect",
          dataZoomSelectActive: true
        });
        resolve(true);
      });
    }).then(() => {
      chartInstance.off("finished");
    });

    // enable double click to reset zoom
    const handleDoubleClick = () => {
      chartInstance?.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    };

    const handleResize = () => {
      chartInstance.resize();
    };

    htmlContainer.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("resize", handleResize);

    return () => {
      htmlContainer.removeEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("resize", handleResize);
      chartInstance.dispose();
    };
  }, [theme]); // ignore "setChartInstance" dependency

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const isDark = theme === "dark";

    const option: EChartsOption = {
      animationDuration: 300,
      animationEasing: "linear",
      grid: {
        left: 50,
        right: 10,
        top: 35,
        bottom: 12,
        containLabel: true
      },
      visualMap: createVisualMap(thresholds),
      xAxis: {
        type: "category",
        data: data.map((item) => item.timestamp),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: "#888888",
          fontSize: 11,
          formatter: (value: string) => formatDate(Number(value), timeRange),
          hideOverlap: true,
          padding: [8, 0, 0, 0],
          fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif"
        }
      },

      tooltip: {
        trigger: "axis",
        backgroundColor: isDark ? "#282828" : "#282828",
        borderColor: isDark ? "#282828" : "#282828",
        borderRadius: 10,
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.15)",
        shadowOffsetY: 2,
        enterable: false,
        confine: true,
        appendToBody: false,
        hideDelay: 150,
        alwaysShowContent: false,
        axisPointer: {
          animation: false,
          type: "line",
          snap: true,
          lineStyle: {
            color: isDark ? "#374151" : "#374151",
            type: "dashed",
            width: 0.5
          }
        },
        textStyle: {
          fontFamily: "DM Sans, system-ui, sans-serif",
          color: isDark ? "#e5e7eb" : "#374151",
          fontSize: 12
        },
        formatter: (params: echarts.DefaultLabelFormatterCallbackParams[]) => {
          const mainParam = params[0];
          const dataIndex = mainParam.dataIndex!;
          const value = Number(data[dataIndex].value);
          const dataTimestamp = data[dataIndex].timestamp;
          const formattedDate = formatDate(dataTimestamp, timeRange, true);

          return `
            <div style="display: flex; flex-direction: column; font-family: 'DM Sans', system-ui, sans-serif; min-width: 150px; padding: 2px;">
              <div style="font-size: .85rem; font-weight: 600; color: #fff; border-bottom: 1px solid #3c3c3c; padding-left: 8px; padding-right: 8px; padding-bottom: 8px; ">
                ${formattedDate}
              </div>
              <div style="font-weight: 600; padding-top: 8px; font-size: 1rem; font-color: #fff; display: flex; align-items: center; gap: 4px; color: #fff;">
                <span style="background-color: ${getColorForValue(
                  value,
                  thresholds
                )}; padding: 2px; border-radius: 4px;">${getIconForValue(
            value,
            thresholds
          )}</span> ${value?.toFixed(1)}${units}
              </div>
            </div>
          `;
        }
      },
      toolbox: {
        show: true,
        itemSize: 16,
        itemGap: 6,
        right: 8,
        top: 0,
        showTitle: false,
        feature: {
          dataZoom: {
            yAxisIndex: "none",
            icon: {
              zoom: "</>",
              back: "</>"
            },
            iconStyle: {
              borderWidth: 1.5,
              color: "none",
              borderColor: isDark ? "#9ca3af" : "#6b7280",
              opacity: 0.75
            },
            emphasis: {
              iconStyle: {
                borderColor: isDark ? "#e5e7eb" : "#374151"
              }
            }
          }
        }
      },
      yAxis: {
        type: "value",
        splitNumber: 4,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: isDark
              ? "rgba(55, 65, 81, 0.15)"
              : "rgba(229, 231, 235, 0.5)",
            type: "solid",
            width: 1
          }
        },
        axisLabel: {
          color: "#888888",
          fontSize: 11,
          fontFamily: "Wix Madefor Text Variable, system-ui, sans-serif",
          formatter: (value: number) => `${Math.round(value)}`,
          padding: [0, 15, 0, 0]
        }
      },
      series: createLineSeries(data, categories, thresholds)
    };

    chartInstanceRef.current.setOption(option);
  }, [
    data,
    categories,
    index,
    units,
    thresholds,
    theme,
    timeRange,
    enableZoom
  ]);

  return <div ref={htmlContainerRef} className="w-full h-[300px]" />;
};

export default DataReviewLineChart;
