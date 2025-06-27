import { Button } from "@/components/ui/button";

import { ChartProvider } from "@/pages/data-review/components/data-review-chart-context";
import DataReviewLineChart from "@/pages/data-review/components/data-review-line-chart";
import type { ChartData } from "@/types/data-review";
import { Droplets, FlaskConical, RotateCcw } from "lucide-react";
import { useState } from "react";
import { getStatusText, getTextColor, MockData } from "../data/mock-data";

interface DetailsPanelProps {
  selectedBlock: MockData | null;
}

export const DetailsPanel = ({ selectedBlock }: DetailsPanelProps) => {
  const [chartInstance, setChartInstance] = useState<any>(null);
  // const chartRef = useRef<any>(null);

  // Prepare chart data for ECharts (all 500 points)
  const chartData: ChartData[] =
    selectedBlock?.chart?.map((d) => ({
      timestamp: new Date(d.time).getTime(),
      value: Number(d.value)
    })) || [];

  // Tailwind color palette mapping for chart line colors
  const statusLineColors: Record<0 | 1 | 2 | 3, string> = {
    0: "#22c55e", // green-500
    1: "#f59e42", // amber-500
    2: "#ef4444", // red-500
    3: "#06b6d4" // cyan-500
  };

  const getLineColor = (status: 0 | 1 | 2 | 3) =>
    statusLineColors[status] || statusLineColors[0];

  if (!selectedBlock) {
    return (
      <div className="flex flex-col justify-center items-center p-4 border rounded-2xl h-[450px]">
        <div className="flex flex-col justify-center items-center h-1/2 text-zinc-500">
          <div className="flex gap-2 font-semibold text-lg tracking-tight">
            <span>Select a block to view details</span>
          </div>
          <div className="mt-1 text-zinc-400 text-sm">
            Click any colored square on the left
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-xl p-4 border rounded-2xl transition-all duration-300">
      <div className="pb-4 w-full">
        <div className="flex justify-between items-center p-4 border-zinc-300 border-b border-dashed w-full">
          <div className="gap-2 grid grid-cols-6">
            {/* Sensor Name */}
            <div className="flex flex-col border-zinc-300 border-r border-dashed">
              <div className="font-medium text-zinc-400 text-xs">
                Sensor Name
              </div>
              <span className="font-bold text-black text-xl">
                Sensor {selectedBlock.label}
              </span>
            </div>

            {/* Status */}
            <div className="flex flex-col items-center border-zinc-300 border-r border-dashed">
              <div className="font-medium text-zinc-400 text-xs">Status</div>
              <div
                className={`text-lg font-bold  ${getTextColor(
                  selectedBlock.status
                )}`}
              >
                {getStatusText(selectedBlock.status)}
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex flex-col pr-4 border-zinc-300 border-r border-dashed text-right">
              <div className="font-medium text-zinc-400 text-xs">
                Last Updated
              </div>
              <div className="font-bold text-black text-base">
                {new Date(selectedBlock.updatedAt).toLocaleString()}
              </div>
            </div>

            {/* Port Number */}
            <div className="flex flex-col items-center pr-4 border-zinc-300 border-r border-dashed">
              <div className="font-medium text-zinc-400 text-xs">
                Port Number
              </div>
              <div className="font-bold text-black text-lg">
                {selectedBlock.portNum}
              </div>
            </div>

            {/* Concentration */}
            <div className="flex flex-col items-center pr-4 border-zinc-300 border-r border-dashed">
              <div className="font-medium text-zinc-400 text-xs">
                Concentration
              </div>
              <div className="font-bold text-black text-lg">
                {selectedBlock.conc ?? "-"}
              </div>
            </div>

            {/* StatusChips */}
            <div className="flex items-center">
              <StatusChips
                isSampling={selectedBlock.isSampling}
                isPrime={selectedBlock.isPrime}
              />
            </div>
          </div>

          <div className="flex justify-center items-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() =>
                chartInstance?.dispatchAction({
                  type: "dataZoom",
                  start: 0,
                  end: 100
                })
              }
            >
              <RotateCcw className="w-4 h-4" />
              Reset Zoom
            </Button>
          </div>
        </div>

        <div className="min-h-[300px] max-h-[400px] overflow-x-auto">
          <ChartProvider>
            <DataReviewLineChart
              data={chartData}
              categories={["value"]}
              index="timestamp"
              colors={[getLineColor(selectedBlock.status)]}
              units={" ppb"}
              timeRange="24h"
              enableZoom={true}
              onInstance={setChartInstance}
            />
          </ChartProvider>
        </div>
      </div>
    </div>
  );
};

const StatusBadgeLarge = ({
  type,
  label
}: {
  type: "sampling" | "prime";
  label: string;
}) => (
  <div
    className={`${
      type === "sampling" ? "bg-[#E1EFE2] " : "bg-blue-200"
    } px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
  >
    {label}
  </div>
);

function StatusChips({
  isSampling,
  isPrime
}: {
  isSampling: boolean;
  isPrime: boolean;
}) {
  if (!isSampling && !isPrime) return null;
  if (isSampling) {
    return (
      <span className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full font-semibold text-green-700 text-xs transition-colors">
        <FlaskConical className="w-3 h-3" />
        Sampling
      </span>
    );
  }
  if (isPrime) {
    return (
      <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full font-semibold text-blue-700 text-xs transition-colors">
        <Droplets className="w-3 h-3" />
        Prime Active
      </span>
    );
  }
  return null;
}
