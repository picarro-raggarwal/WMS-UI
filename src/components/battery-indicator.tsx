import React from "react";

interface BatteryIndicatorProps {
  level: number;
  label?: string;
  charging?: boolean;
}

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ level, label, charging = false }) => {
  const getBatteryColor = (level: number) => {
    if (level > 60) return "bg-primary-500";
    if (level > 20) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center">
        <div className="relative flex items-center w-8 h-4 border-2 border-neutral-700 rounded-md">
          <div
            className={`h-full ${getBatteryColor(level)} rounded`}
            style={{ width: `${Math.max(0, Math.min(100, level))}%` }}></div>
        </div>{" "}
        {/* Charging Icon */}
        {charging && (
          <svg
            className="  w-3 h-3 text-white  "
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M13 2L3 14H10L8 22L18 10H11L13 2Z" />
          </svg>
        )}
      </div>
      <span className="text-neutral-200 text-xs font-medium tracking-tight">
        {Math.round(level)}% {label && <span className=" text-neutral-500">{label}</span>}
      </span>
    </div>
  );
};

export default BatteryIndicator;
