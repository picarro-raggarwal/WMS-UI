import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Droplets, FlaskConical, RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { ChartProvider } from "../data-review/components/data-review-chart-context";
import DataReviewLineChart from "../data-review/components/data-review-line-chart";
import { generateMockData, getTextColor, MockData } from "./data/mock-data";

const TOTAL_PORTS = 62;

const LiveDataPage = () => {
  const liveData = generateMockData(TOTAL_PORTS);

  return (
    <>
      <PageHeader />
      <main className="flex flex-col items-center w-full h-full">
        <div className="flex flex-wrap justify-center gap-1 pt-5">
          {liveData.map((port, index) => (
            <Card port={port} key={index} />
          ))}
        </div>
      </main>
    </>
  );
};

export default LiveDataPage;

const getCardWidth = (totalPorts: number) => {
  if (totalPorts <= 16) return 216; // 54 * 4 = 216px
  if (totalPorts <= 32) return 152; // 38 * 4 = 152px
  if (totalPorts <= 48) return 128; // 32 * 4 = 128px
  if (totalPorts <= 64) return 112; // 28 * 4 = 112px
  return 120; // fallback for very large numbers
};

const getFontSizeClasses = (cardWidth: number) => {
  if (cardWidth >= 200) {
    return { main: "text-2xl", label: "text-lg" };
  } else if (cardWidth >= 150) {
    return { main: "text-xl", label: "text-base" };
  } else if (cardWidth >= 120) {
    return { main: "text-lg", label: "text-sm" };
  } else {
    return { main: "text-base", label: "text-xs" };
  }
};

const Card = ({ port }: { port: MockData }) => {
  const [open, setOpen] = React.useState(false);
  const {
    isInActive,
    portNum,
    conc,
    label,
    status,
    isSampling,
    isPrime,
    updatedAt
  } = port;
  const cardWidth = getCardWidth(TOTAL_PORTS);
  const { main: mainFontClass, label: labelFontClass } =
    getFontSizeClasses(cardWidth);

  const { data: timeSeriesData, categories } = generateMockTimeSeriesData(port);
  const [chartInstance, setChartInstance] = useState<any>(null);

  return (
    <>
      <div
        style={{ width: cardWidth, height: cardWidth }}
        className={`relative cursor-pointer group ${
          isInActive
            ? "pointer-events-none opacity-40"
            : "transition-transform duration-200"
        } flex flex-col gap-2 border rounded-md shadow-border py-4 px-3 ${
          !isInActive && getBgColor(status)
        } transition-colors duration-200`}
        onClick={() => !isInActive && setOpen(true)}
      >
        <div className="flex justify-center items-center">
          <span className={`font-semibold text-gray-800 ${labelFontClass}`}>
            {portNum}. {label}
          </span>
        </div>
        <div className="flex justify-center items-center">
          <span className={`font-bold text-gray-900 ${mainFontClass}`}>
            {conc ?? "Flow Error"}
          </span>
        </div>
        <StatusIndicator isSampling={isSampling} isPrime={isPrime} />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[60vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4 pr-4">
                <span>
                  {label} (Port {portNum})
                </span>

                {isSampling && (
                  <StatusBadgeLarge type="sampling" label="Sampling" />
                )}
                {isPrime && (
                  <StatusBadgeLarge type="prime" label="Prime Active" />
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex  justify-between items-center gap-x-8 gap-y-2 w-full">
            {/* Sensor Name */}
            <div className="flex flex-col">
              <div className="font-medium text-zinc-400 text-xs">
                Sensor Name
              </div>
              <span className="font-bold text-black text-xl">{label}</span>
            </div>

            {/* Status */}
            <div className="flex flex-col items-center">
              <div className="font-medium text-zinc-400 text-xs">Status</div>
              <div className={`text-lg font-bold  ${getTextColor(status)}`}>
                {getStatusText(status)}
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex flex-col text-right">
              <div className="font-medium text-zinc-400 text-xs">
                Last Updated
              </div>
              <div className="font-bold text-black text-base">
                {new Date(updatedAt).toLocaleString()}
              </div>
            </div>
            {/* Port Number */}
            {/* <div className="flex flex-col items-center">
              <div className="font-medium text-zinc-400 text-xs">
                Port Number
              </div>
              <div className="font-bold text-black text-lg">{portNum}</div>
            </div> */}
            {/* Concentration */}
            <div className="flex flex-col items-center">
              <div className="font-medium text-zinc-400 text-xs">
                Concentration
              </div>
              <div className="font-bold text-black text-lg">{conc ?? "-"}</div>
            </div>

            {/* StatusChips */}
            <div className="flex items-center">
              <StatusChips isSampling={isSampling} isPrime={isPrime} />
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

          <div className="h-72">
            <ChartProvider>
              <DataReviewLineChart
                data={timeSeriesData}
                categories={categories}
                index={port.id}
                units={
                  conc && typeof conc === "string" && conc.includes("ppb")
                    ? "ppb"
                    : ""
                }
                timeRange="1h"
                onInstance={setChartInstance}
              />
            </ChartProvider>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const StatusIndicator = ({
  isSampling,
  isPrime
}: {
  isSampling: boolean;
  isPrime: boolean;
}) => (
  <div className="right-1 bottom-1 absolute flex gap-2">
    {isSampling && <StatusBadge type="sampling" label="S" />}
    {isPrime && <StatusBadge type="prime" label="P" />}
  </div>
);

const StatusBadge = ({
  type,
  label
}: {
  type: "sampling" | "prime";
  label: string;
}) => (
  <div
    className={`${
      type === "sampling" ? "bg-green-600" : "bg-blue-500"
    } rounded-full w-6 h-6 flex items-center justify-center shadow-md`}
  >
    <span className="font-bold text-white text-xs">{label}</span>
  </div>
);

const StatusBadgeLarge = ({
  type,
  label
}: {
  type: "sampling" | "prime";
  label: string;
}) => (
  <div
    className={`${
      type === "sampling" ? "bg-green-600" : "bg-blue-500"
    } text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
  >
    {label}
  </div>
);

const getBgColor = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "bg-inherit";
    case 1:
      return "bg-amber-100";
    case 2:
      return "bg-red-500";
    case 3:
      return "bg-cyan-100"; // flow error
    default:
      return "bg-gray-400";
  }
};

const getStatusText = (status: 0 | 1 | 2 | 3): string => {
  switch (status) {
    case 0:
      return "Normal";
    case 1:
      return "Warning";
    case 2:
      return "Critical";
    case 3:
      return "Flow Error";
    default:
      return "Unknown";
  }
};

function generateMockTimeSeriesData(port: MockData): {
  data: { timestamp: number; value: number }[];
  categories: string[];
} {
  // Generate 200 points of mock data for the last 200 minutes
  const now = Date.now();
  const data = Array.from({ length: 200 }, (_, i) => {
    return {
      timestamp: now - (50 - i) * 60 * 1000,
      value:
        port.conc && !isNaN(parseFloat(port.conc))
          ? parseFloat(port.conc) + Math.random() * 10 - 5
          : Math.random() * 100
    };
  });
  return { data, categories: [port.label] };
}

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
