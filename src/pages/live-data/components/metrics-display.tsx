import { Wind } from "lucide-react";
import { useGetMetricDataQuery } from "../data/metrics.slice";

interface MetricValueProps {
  label: string;
  value: number;
  unit: string;
  icon?: React.ReactNode;
}

const MetricValueCompact = ({ label, value, unit }: MetricValueProps) => {
  return (
    <div className="flex flex-col p-2 px-4 pr-6 min-w-[110px] first:">
      <span className="font-medium text-neutral-600 dark:text-neutral-400 text-sm uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-neutral-900 dark:text-white text-xl tracking-tight">
          {value.toFixed(1)}
        </span>
        <span className="font-medium text-neutral-500 dark:text-neutral-400 text-base">{unit}</span>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 rounded-xl">
    <div className="flex justify-between items-center gap-6 p-4">
      <div className="flex-1 bg-neutral-50 dark:bg-neutral-750 p-4 rounded-lg">
        <div className="flex items-center gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center animate-pulse">
              <div className="bg-neutral-200 dark:bg-neutral-700 mb-2 rounded w-12 h-3" />
              <div className="bg-neutral-200 dark:bg-neutral-700 rounded w-16 h-5" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-750 p-4 rounded-lg">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="flex flex-col">
            <div className="bg-neutral-200 dark:bg-neutral-700 mb-2 rounded w-20 h-3" />
            <div className="bg-neutral-200 dark:bg-neutral-700 rounded w-24 h-5" />
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-neutral-200 dark:bg-neutral-700 mb-2 rounded w-16 h-3" />
            <div className="bg-neutral-200 dark:bg-neutral-700 rounded w-20 h-5" />
          </div>
          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full w-16 h-16" />
        </div>
      </div>
    </div>
  </div>
);

export const MetricsDisplay = () => {
  const metrics = ["TVOC", "CH4", "CO2", "H2O"];

  const { data: metricsData, isLoading: isLoadingMetricsData } = useGetMetricDataQuery(
    {
      latest_value: true,
      metrics: metrics.join(","),
    },
    {
      pollingInterval: 1000,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: windData, isLoading: isLoadingWindData } = useGetMetricDataQuery(
    {
      latest_value: true,
      metrics: "wind_direction,wind_speed",
    },
    {
      pollingInterval: 1000,
      refetchOnMountOrArgChange: true,
    }
  );

  if (isLoadingMetricsData || isLoadingWindData) {
    return <LoadingSkeleton />;
  }

  const windSpeed = windData?.wind_speed?.values[0] || 0;
  const windDirection = windData?.wind_direction?.values[0] || 0;

  // Get cardinal direction based on degrees
  const getCardinalDirection = (degrees: number): string => {
    const directions = [
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
      "N",
    ];

    const DIRECTION_COUNT = directions.length;
    const DEGREES_PER_DIRECTION = 360 / DIRECTION_COUNT;

    const normalizedDegrees = ((degrees % 360) + 360) % 360;
    const directionIndex = Math.round(normalizedDegrees / DEGREES_PER_DIRECTION) % DIRECTION_COUNT;

    return directions[directionIndex];
  };

  return (
    <div className="top-0 z-10 sticky bg-white/90 backdrop-blur-sm border-neutral-100 dark:border-neutral-700 border-t">
      <div className="dark:bg-neutral-800 shadow-sm text-neutral-950 dark:text-neutral-50 be">
        <div className="flex lg:flex-row flex-col justify-between items-center gap-6 mx-auto px-8 md:px-12 w-full max-w-8xl">
          <div className="flex-1">
            <div className="flex-1 gap-8 grid grid-cols-4 -ml-4 py-2 divide-x divide-neutral-200 dark:divide-neutral-700 max-w-[500px]">
              {metrics.map((metric) => (
                <MetricValueCompact
                  key={metric}
                  label={metric}
                  value={metricsData?.[metric]?.values[0] || 0}
                  unit={metricsData?.[metric]?.unit || ""}
                />
              ))}
            </div>
          </div>

          <div className="py-2">
            <div className="flex justify-between items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-100 dark:bg-neutral-100 p-2 rounded-md">
                  <Wind className="w-5 h-5 text-neutral-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-neutral-600 dark:text-neutral-300 text-xs">Wind Speed</span>
                  <span className="font-bold text-black dark:text-white text-lg tracking-tight">
                    {windSpeed?.toFixed(2)}
                    m/s
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-neutral-600 dark:text-neutral-300 text-xs">Direction</span>
                  <span className="min-w-[95px] font-bold text-black dark:text-white text-lg text-right tracking-tight">
                    {windDirection?.toFixed(0)}° {getCardinalDirection(windDirection)}
                  </span>
                </div>

                <div className="relative bg-white dark:bg-neutral-800 border border-inset border-neutral-200 dark:border-neutral-700 rounded-full w-[75px] h-[75px]">
                  {/* Tick marks */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 36 }, (_, i) => i * 10).map((tickAngle) => {
                      const isActive =
                        Math.abs(((windDirection - tickAngle + 180) % 360) - 180) < 15;
                      const isMajor = tickAngle % 45 === 0; // Major ticks every 45 degrees
                      return (
                        <div
                          key={tickAngle}
                          className="absolute inset-0"
                          style={{ transform: `rotate(${tickAngle}deg)` }}>
                          <div
                            className={`absolute top-0.5 left-1/2 -translate-x-1/2 rounded-sm transition-all duration-300 ${
                              isActive
                                ? isMajor
                                  ? "bg-primary-600 w-px h-3"
                                  : "bg-primary-500/80 w-px h-2"
                                : isMajor
                                ? "bg-neutral-400 dark:bg-neutral-500 w-px h-2"
                                : "bg-neutral-200 dark:bg-neutral-600 w-px h-1.5"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Cardinal directions */}
                  <div className="z-10 absolute inset-0 text-[10px]">
                    <div className="top-0 left-1/2 absolute flex justify-center items-center bg-white/50 backdrop-blur-[1px] px-1 !rounded-full -translate-x-1/2">
                      <span className="font-bold text-neutral-600">N</span>
                    </div>
                    <div className="top-1/2 right-[1px] absolute flex justify-center items-center bg-white/50 backdrop-blur-[1px] px-1 rounded-full -translate-y-1/2">
                      <span className="font-bold text-neutral-600">E</span>
                    </div>
                    <div className="bottom-0 left-1/2 absolute flex justify-center items-center bg-white/50 backdrop-blur-[1px] px-1 rounded-full -translate-x-1/2">
                      <span className="font-bold text-neutral-600">S</span>
                    </div>
                    <div className="top-1/2 left-[1px] absolute flex justify-center items-center bg-white/50 backdrop-blur-[1px] px-1 rounded-full -translate-y-1/2">
                      <span className="font-bold text-neutral-600">W</span>
                    </div>
                  </div>

                  {/* Crosshair lines */}
                  <div className="absolute inset-[15%]">
                    <div className="left-1/2 absolute bg-neutral-200 dark:bg-neutral-700 opacity-60 w-[1px] h-full -translate-x-[0.5px]" />
                    <div className="top-1/2 absolute bg-neutral-200 dark:bg-neutral-700 opacity-60 w-full h-[1px] -translate-y-[0.5px]" />
                  </div>

                  {/* Inner circular backdrop */}
                  <div className="absolute inset-[35%] bg-white dark:bg-neutral-800 shadow-inner border border-neutral-100 dark:border-neutral-700 rounded-full" />

                  {/* Direction arrow */}
                  <div
                    className="z-20 absolute inset-0 transition-transform duration-500 ease-out"
                    style={{
                      transform: `rotate(${windDirection + 270}deg)`,
                    }}>
                    <div className="relative h-full">
                      <div className="top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2">
                        <div className="relative w-[24px] h-[24px]">
                          {/* Arrow body */}
                          <div className="top-1/2 -right-0.5 -left-0.5 absolute bg-primary-600 rounded-sm h-0.5 -translate-y-1/2">
                            <div
                              className="top-[1.5px] -right-0.5 absolute border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-primary-600 w-0 h-0 -translate-y-1/2"
                              style={{
                                transform: "translateX(3px) translateY(-6px)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
