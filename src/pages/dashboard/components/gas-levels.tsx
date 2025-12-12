import { EmptyStateInfo } from "@/components/empty-state-info";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { DATE_FORMAT } from "@/constants";
import { formatLabel } from "@/utils";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import { useGetGasTanksQuery } from "../data/gasTanks.slice";

const getStatusStyle = (status: string) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case "ok":
    case "good":
    case "active":
      return {
        className:
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white dark:bg-primary-600",
        icon: <CheckCircle2 className="mr-1 w-3 h-3" />
      };
    case "requires_replacement":
    case "warning":
    case "low":
      return {
        className:
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500 text-white dark:bg-amber-600",
        icon: <AlertTriangle className="mr-1 w-3 h-3" />
      };
    case "error":
    case "critical":
    case "empty":
      return {
        className:
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white dark:bg-red-600",
        icon: <CircleAlert className="mr-1 w-3 h-3" />
      };
    default:
      return {
        className:
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white dark:bg-gray-600",
        icon: <CircleAlert className="mr-1 w-3 h-3" />
      };
  }
};

const GasLevelsCard = () => {
  const {
    data: gasTanksData,
    isLoading: isLoadingGasTankData,
    isError
  } = useGetGasTanksQuery();

  if (isLoadingGasTankData) {
    return (
      <div className="bg-white dark:bg-neutral-800 shadow-card mt-4 p-8 rounded-xl min-h-40">
        <Card className="bg-gray-50 dark:bg-neutral-700 p-6 max-w-md min-h-36"></Card>
      </div>
    );
  }
  if (isError) {
    return (
      <Card className="mt-4 p-6">
        <CardTitle className="mb-3 pb-3 border-b-2 dark:text-white">
          Cylinder Fill Levels
        </CardTitle>
        <div className="text-neutral-500 dark:text-neutral-400 text-sm">
          Error loading gas tanks data
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-4 p-6">
      <CardTitle className="mb-3 pb-2 dark:border-neutral-700 border-b-2 font-semibold dark:text-white text-base md:text-lg tracking-tight">
        Cylinder Fill Levels
      </CardTitle>

      {(!gasTanksData || gasTanksData.gas_tanks.length === 0) && (
        <EmptyStateInfo
          title="No Gas Tank Information Available"
          description="Gas tank data is currently unavailable"
          icon={<CircleAlert className="size-6 text-gray-400" />}
        />
      )}
      {gasTanksData && gasTanksData.gas_tanks.length > 0 && (
        <div className="gap-4 grid grid-cols-2 lg:grid-cols-3">
          {gasTanksData.gas_tanks.map((gasTank) => (
            <div
              key={
                gasTank.gas_tank_name ||
                `gas-tank-${gasTank.gas_tank_type}-${gasTank.current_pressure}`
              }
              className="flex flex-col bg-white dark:bg-neutral-800 shadow-sm p-4 rounded-lg ring-1 ring-neutral-500/10"
            >
              {/* Tank name and status */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-neutral-800 dark:text-neutral-100 text-base tracking-tight">
                  {gasTank.gas_tank_type}
                </h3>
              </div>

              {/* Main content: Percentage on left, tank on right */}
              <div className="flex items-center mb-3">
                <div className="flex items-end">
                  <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-full w-3 h-20">
                    <div
                      className="bottom-0 absolute bg-primary-500 rounded-full w-full transition-all duration-500"
                      style={{ height: `${gasTank.percentage_full}%` }}
                    />
                  </div>
                </div>

                <div className="ml-4">
                  {/* Percentage display with pressure tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="font-bold text-neutral-900 dark:text-white text-2xl tracking-tight">
                          {gasTank?.percentage_full?.toFixed(1)}%
                        </div>
                        {gasTank.tank_status !== "ok" ? (
                          <span
                            className={
                              getStatusStyle(gasTank.tank_status).className
                            }
                          >
                            {getStatusStyle(gasTank.tank_status).icon}
                            {formatLabel(gasTank.tank_status)}
                          </span>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            Full
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <div className="font-medium">Pressure</div>
                        <div>
                          {gasTank?.current_pressure?.toFixed(0)}/
                          {gasTank?.max_pressure?.toFixed(0)} PSI
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Last replaced info at bottom */}
              <div className="pt-3 border-gray-100 dark:border-neutral-700 border-t">
                <div className="mb-1 text-gray-600 dark:text-gray-400 text-xs">
                  Last Replaced
                  <span className="mb-1 ml-1 font-medium text-gray-900 dark:text-white">
                    {format(
                      new Date(gasTank?.last_replaced_time),
                      DATE_FORMAT,
                      {}
                    )}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  by {gasTank.last_replaced_by}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
export default GasLevelsCard;
