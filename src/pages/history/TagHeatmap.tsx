import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as echarts from "echarts";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { tagHeatmapMatrixData } from "./data/mock-data";

interface TagHeatmapProps {
  tagId: string;
}

export default function TagHeatmap({ tagId }: TagHeatmapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const data = tagHeatmapMatrixData[tagId] || [];

  console.log(data);

  // Multi-select filter state
  const [selectedExposures, setSelectedExposures] = useState<number[]>([]);

  // Extract unique days and hours for axes
  const days = Array.from(new Set(data.map(([day]) => day)));
  const hours = Array.from(new Set(data.map(([, hour]) => hour)));

  // Filter data by selected exposure levels
  const filteredData =
    selectedExposures.length > 0
      ? data.filter(([, , value]) => selectedExposures.includes(Number(value)))
      : data;

  // Map data to [hourIndex, dayIndex, value] for eCharts
  const chartData = filteredData.map(([day, hour, value]) => [
    hours.indexOf(hour),
    days.indexOf(day),
    value
  ]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        position: "top",
        formatter: (params: any) =>
          `Day: ${days[params.value[1]]}<br/>Hour: ${
            hours[params.value[0]]
          }<br/>Exposure: ${params.value[2]}`
      },
      grid: { height: "60%", top: "10%" },
      xAxis: {
        type: "category",
        data: hours,
        splitArea: { show: true },
        name: "Hour"
      },
      yAxis: {
        type: "category",
        data: days,
        splitArea: { show: true },
        name: "Day"
      },
      visualMap: {
        type: "piecewise",
        pieces: [
          { value: 0, color: "#2563eb" }, // primary-600
          { value: 1, color: "#d97706" }, // amber-600
          { value: 2, color: "#4b5563" } // gray-600
        ],
        show: false,
        left: "center",
        bottom: "5%"
      },
      series: [
        {
          name: "Exposure",
          type: "heatmap",
          data: chartData,
          label: { show: true },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" }
          }
        }
      ]
    };

    chart.setOption(option);

    // Resize chart on window resize
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [tagId, selectedExposures]);

  // Helper for All/None
  const allLevels = [1, 2, 3, 4, 5];
  const allSelected = selectedExposures.length === allLevels.length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className={` justify-between ${
                selectedExposures.length > 0
                  ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                  : ""
              }`}
            >
              Exposure Level
              <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="" align="center">
            <DropdownMenuItem
              className="flex items-center space-x-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setSelectedExposures(allSelected ? [] : allLevels);
              }}
            >
              <Checkbox checked={allSelected} />
              <span>All</span>
            </DropdownMenuItem>
            {allLevels.map((level) => (
              <DropdownMenuItem
                key={level}
                className="flex items-center space-x-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setSelectedExposures((prev) =>
                    prev.includes(level)
                      ? prev.filter((l) => l !== level)
                      : [...prev, level]
                  );
                }}
              >
                <Checkbox checked={selectedExposures.includes(level)} />
                <span>{level}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div ref={chartRef} style={{ width: "100%", height: 500 }} />
    </div>
  );
}
