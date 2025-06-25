import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { generateMockData, MockData } from "./data/mock-data";

const TOTAL_PORTS = 62;

const LiveDataPage = () => {
  const liveData = generateMockData(TOTAL_PORTS);

  return (
    <>
      <PageHeader />
      <main className="flex flex-col items-center py-8 w-full h-full overflow-y-auto">
        <div className="flex flex-wrap justify-center gap-1">
          {liveData.map((port, index) => (
            <Card port={port} key={index} />
          ))}
        </div>
      </main>
    </>
  );
};

export default LiveDataPage;

const Card = ({ port, key }: { port: MockData; key: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { isInActive } = port;

  const handleClick = () => {
    if (!isInActive) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      key={key}
      className={`relative w-40 h-40 [perspective:1000px] cursor-pointer group ${
        isInActive ? "pointer-events-none opacity-40" : " transition-transform duration-200"
      }`}
      onClick={handleClick}>
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}>
        <CardFront port={port} />
        <CardBack port={port} />
      </div>
    </div>
  );
};

const StatusIndicator = ({ isSampling, isPrime }: { isSampling: boolean; isPrime: boolean }) => (
  <div className="right-2 bottom-2 absolute flex gap-2">
    {isSampling && <StatusBadge type="sampling" label="S" />}
    {isPrime && <StatusBadge type="prime" label="P" />}
  </div>
);

const CardFront = ({ port }: { port: MockData }) => {
  const { portNum, conc, label, status, isSampling, isPrime, isInActive } = port;

  return (
    <div
      className={`absolute w-full h-full [backface-visibility:hidden] flex flex-col gap-6 shadow-border py-4 px-3 border-2 rounded-md ${
        !isInActive && getBgColor(status)
      } transition-colors duration-200`}>
      <div className="flex justify-center items-center">
        <span className="font-semibold text-gray-800 text-lg">
          {portNum}. {label}
        </span>
      </div>
      <div className="flex justify-center items-center">
        <span className={`font-bold text-2xl ${conc === null ? "text-gray-900" : "text-gray-900"}`}>
          {conc ?? "Flow Error"}
        </span>
      </div>
      <StatusIndicator isSampling={isSampling} isPrime={isPrime} />
    </div>
  );
};

const CardBack = ({ port }: { port: MockData }) => {
  const { portNum, label, status, updatedAt, isSampling, isPrime } = port;

  return (
    <div className="absolute flex flex-col justify-between bg-white shadow-lg px-3 py-4 border-2 rounded-md w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <div className="text-center">
        <div className="font-bold text-gray-800 text-lg">
          {portNum}. {label}
        </div>
        <div className="space-y-1">
          <div className="flex justify-center items-center gap-2">
            <span className="font-medium text-gray-600 text-sm">Status:</span>
            <span
              className={`text-sm font-semibold ${
                status === 0
                  ? "text-green-600"
                  : status === 1
                  ? "text-amber-600"
                  : status === 2
                  ? "text-red-600"
                  : "text-cyan-500"
              }`}>
              {getStatusText(status)}
            </span>
          </div>
          <div className="text-gray-600 text-sm">Last Updated:</div>
          <div className="text-gray-500 text-xs">{new Date(updatedAt).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-2">
        {isSampling && <StatusBadgeLarge type="sampling" label="Sampling" />}
        {isPrime && <StatusBadgeLarge type="prime" label="Prime" />}
      </div>
    </div>
  );
};

const StatusBadge = ({ type, label }: { type: "sampling" | "prime"; label: string }) => (
  <div
    className={`${
      type === "sampling" ? "bg-green-600" : "bg-blue-500"
    } rounded-full w-8 h-8 flex items-center justify-center shadow-md`}>
    <span className="font-bold text-white text-sm">{label}</span>
  </div>
);

const StatusBadgeLarge = ({ type, label }: { type: "sampling" | "prime"; label: string }) => (
  <div
    className={`${
      type === "sampling" ? "bg-green-600" : "bg-blue-500"
    } text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm`}>
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
