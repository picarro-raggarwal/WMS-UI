import { Card } from "@/components/ui/card";
import { Wind } from "lucide-react";
import { useGetMetricDataQuery } from "../data/metrics.slice";

export function WindChart() {
  const {
    data: windRoseData,
    isLoading: loadingData,
    isError: errorLoadingSelectedMetricsData,
  } = useGetMetricDataQuery(
    {
      latest_value: true,
      metrics: "wind_direction, wind_speed",
    },
    {
      pollingInterval: 5000,
      refetchOnMountOrArgChange: true,
    }
  );

  if (loadingData) {
    return (
      <Card className="col-span-2 bg-white shadow-card p-4 rounded-xl">
        <div>Loading...</div>
      </Card>
    );
  }

  if (errorLoadingSelectedMetricsData || !windRoseData) {
    return (
      <Card className="col-span-2 bg-white shadow-card p-4 rounded-xl">
        <div>Error loading wind data</div>
      </Card>
    );
  }

  const windSpeed = windRoseData.wind_speed.values[0];
  const windDirection = windRoseData.wind_direction.values[0];

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
    const directionIndex =
      Math.round(normalizedDegrees / DEGREES_PER_DIRECTION) % DIRECTION_COUNT;

    return directions[directionIndex];
  };

  return (
    <Card className="col-span-2 bg-white shadow-card px-4 py-2 rounded-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-100 dark:bg-neutral-100 p-2 rounded-md">
            <Wind className="w-5 h-5 text-neutral-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-neutral-600 dark:text-neutral-300 text-xs">
              Wind Speed
            </span>
            <span className="font-bold text-black dark:text-white text-lg tracking-tight">
              {windSpeed.toFixed(1)} m/s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-neutral-600 dark:text-neutral-300 text-xs">
              Direction
            </span>
            <span className="font-bold text-black dark:text-white text-lg tracking-tight">
              {windDirection.toFixed(0)}° {getCardinalDirection(windDirection)}
            </span>
          </div>

          {/* Enhanced Compass */}
          <div className="relative w-[70px] h-[70px]">
            {/* Outer ring with more refined gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-neutral-800 to-neutral-50 dark:to-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-700 rounded-full" />

            {/* Direction circles at cardinal points */}
            {/* <div className="absolute inset-2 border border-neutral-200 dark:border-neutral-700 rounded-full" /> */}

            {/* Cardinal directions */}
            <div className="z-10 absolute inset-0">
              <div className="-top-1 left-1/2 absolute font-semibold text-primary-600 text-xs -translate-x-1/2">
                N
              </div>
              <div className="top-1/2 right-0 absolute font-semibold text-neutral-500 dark:text-neutral-400 text-xs -translate-y-1/2">
                E
              </div>
              <div className="-bottom-1 left-1/2 absolute font-semibold text-neutral-500 dark:text-neutral-400 text-xs -translate-x-1/2">
                S
              </div>
              <div className="top-1/2 left-0 absolute font-semibold text-neutral-500 dark:text-neutral-400 text-xs -translate-y-1/2">
                W
              </div>
            </div>

            {/* Faint crosshair lines */}
            <div className="absolute inset-[15%]">
              <div className="left-1/2 absolute bg-neutral-200 dark:bg-neutral-700 opacity-60 w-[1px] h-full -translate-x-[0.5px]" />
              <div className="top-1/2 absolute bg-neutral-200 dark:bg-neutral-700 opacity-60 w-full h-[1px] -translate-y-[0.5px]" />
            </div>

            {/* Inner circular backdrop */}
            <div className="absolute inset-[35%] bg-white dark:bg-neutral-800 shadow-inner border border-neutral-100 dark:border-neutral-700 rounded-full" />

            {/* Enhanced direction arrow with proper rotation - the arrow now rotates around its center */}
            <div
              className="z-20 absolute inset-0 transition-transform duration-500 ease-out"
              style={{
                transform: `rotate(${windDirection + 90}deg)`,
              }}
            >
              <div className="relative h-full">
                {/* Arrow shape */}
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
                {/* Center Dot moved to tail of needle */}
                {/* <div className="top-[15px] left-[15px] absolute bg-primary-600 rounded-full w-2 h-2 translate-y-4" /> */}
              </div>
            </div>

            {/* Center dot */}
            {/* <div className="top-1/2 left-1/2 z-30 absolute bg-primary-600 dark:bg-primary-500 -mt-1 -ml-1 rounded-full w-2 h-2" /> */}
          </div>
        </div>
      </div>
    </Card>
  );
}
