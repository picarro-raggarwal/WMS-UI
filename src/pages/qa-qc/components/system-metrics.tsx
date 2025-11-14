import { EmptyStateInfo } from "@/components/empty-state-info";
import { Spinner } from "@/components/spinner";
import { ProgressCircle } from "@/components/tremor/progress-circle";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  useGetDataCompletenessQuery,
  useGetSystemUptimeQuery
} from "@/pages/qa-qc/data/qaqc.slice";
import { AlertTriangle } from "lucide-react";

interface SystemMetricsProps {
  selectedPeriod?: "last30" | "active";
}

export const SystemMetrics = ({
  selectedPeriod = "last30"
}: SystemMetricsProps) => {
  const queryType = selectedPeriod === "active" ? "active_quarter" : "30";
  const { data, isLoading, isError, error } = useGetSystemUptimeQuery(
    { query_type: queryType },
    { refetchOnMountOrArgChange: true, pollingInterval: 2000 }
  );
  const {
    data: dcData,
    isLoading: isDcLoading,
    isError: isDcError,
    error: dcError
  } = useGetDataCompletenessQuery(
    { query_type: queryType },
    { refetchOnMountOrArgChange: true, pollingInterval: 2000 }
  );

  const periodLabel =
    selectedPeriod === "last30" ? "Last 30 days" : "Active reporting period";

  let uptimeFraction: number | null = null;
  if (data) {
    if (
      selectedPeriod === "last30" &&
      data.thirty_days_success?.value?.system_uptime
    ) {
      uptimeFraction =
        data.thirty_days_success.value.system_uptime.uptime_fraction;
    } else if (data.system_uptime) {
      uptimeFraction = data.system_uptime.uptime_fraction;
    }
  }

  const uptimePercent =
    uptimeFraction !== null ? Math.round(uptimeFraction * 1000) / 10 : null;

  // Calibration success rate - using mock data as there's no API endpoint yet
  const calibrationSuccess = selectedPeriod === "last30" ? 97 : 48.5;

  return (
    <div className="gap-6 grid md:grid-cols-3 t">
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="flex flex-col justify-center items-center py-6 h-full">
          <p className="font-semibold text-black dark:text-gray-500 text-base tracking-tight">
            System Uptime
          </p>
          <p className="mb-4 text-neutral-500 text-xs text-center">
            {periodLabel}
          </p>

          {isLoading ? (
            <Spinner size="8" />
          ) : isError ? (
            <EmptyStateInfo
              className="w-full"
              title={(error as any)?.data?.error?.name || "Service Unavailable"}
              description={
                (error as any)?.data?.error?.message || "Unable to load uptime"
              }
              icon={<AlertTriangle />}
              iconClassName="text-red-600"
            />
          ) : uptimePercent !== null ? (
            <ProgressCircle value={uptimePercent} radius={50} strokeWidth={8}>
              <p className="font-semibold text-xl tracking-tight">
                {uptimePercent}%
              </p>
            </ProgressCircle>
          ) : (
            <EmptyStateInfo
              className="w-full"
              title={data?.not_available?.value?.status || "Not available"}
              description={
                data?.not_available?.value?.message ||
                "Uptime is not available for this period"
              }
              icon={<AlertTriangle />}
              iconClassName="text-red-600"
            />
          )}
        </CardContent>
      </Card>

      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="flex flex-col justify-center items-center py-6 h-full">
          <p className="font-semibold text-black dark:text-gray-500 text-base tracking-tight">
            Data Completeness
          </p>
          <p className="mb-4 text-neutral-500 text-xs text-center">
            {periodLabel}
          </p>

          {isDcLoading ? (
            <div>
              <div className="flex justify-center items-center w-[100px] h-[100px]"></div>{" "}
              <div className="mt-3 h-4 text-muted-foreground text-xs">
                Target
              </div>
            </div>
          ) : isDcError ? (
            <EmptyStateInfo
              className="w-full"
              title={
                (dcError as any)?.data?.error?.name ||
                "Error loading data completeness"
              }
              description={
                (dcError as any)?.data?.error?.message ||
                "Data Completeness is not available for this period"
              }
              icon={<AlertTriangle />}
              iconClassName="text-red-600"
            />
          ) : (
            (() => {
              const frac = (dcData as any)?.data_completeness
                ?.completeness_fraction;
              const target = (dcData as any)?.target as number | undefined;
              const valid = (dcData as any)?.data_completeness
                ?.valid_data_points as number | undefined;
              const total = (dcData as any)?.data_completeness
                ?.total_data_points as number | undefined;

              if (typeof frac === "number") {
                const pct = Math.round(frac * 1000) / 10;
                return (
                  <>
                    <Tooltip>
                      <TooltipTrigger className="cursor-default">
                        <div className="flex justify-center items-center w-[100px] h-[100px]">
                          <ProgressCircle
                            value={pct}
                            radius={50}
                            strokeWidth={8}
                          >
                            <p
                              className={`font-semibold text-xl tracking-tigh `}
                            >
                              {pct}%
                            </p>
                          </ProgressCircle>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-800/40 backdrop-blur-sm ml-2 p-2 rounded-full text-white text-xs">
                        {typeof valid === "number" && typeof total === "number"
                          ? `Valid: ${valid} / Total: ${total} data points`
                          : "No point counts available"}
                      </TooltipContent>
                    </Tooltip>
                    <div className="mt-3 h-4 text-muted-foreground text-xs">
                      Target{" "}
                      {typeof target === "number"
                        ? `${(target * 100).toFixed(0)}%`
                        : null}
                    </div>
                  </>
                );
              }
              return (
                <>
                  <EmptyStateInfo
                    className="w-full"
                    title={
                      (dcError as any)?.data?.error?.name ||
                      "Service Unavailable"
                    }
                    description={
                      (dcError as any)?.data?.error?.message ||
                      "Data Completeness is not available for this period"
                    }
                    icon={<AlertTriangle />}
                    iconClassName="text-red-600"
                  />
                </>
              );
            })()
          )}
        </CardContent>
      </Card>

      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="flex flex-col justify-center items-center py-6 h-full">
          <p className="font-semibold text-black dark:text-gray-500 text-base tracking-tight">
            Calibration Success Rate
          </p>
          <p className="mb-4 text-neutral-500 text-xs text-center">
            {periodLabel}
          </p>
          <ProgressCircle
            value={calibrationSuccess}
            radius={50}
            strokeWidth={8}
          >
            <p className="font-semibold text-xl tracking-tight">
              {calibrationSuccess}%
            </p>
          </ProgressCircle>
        </CardContent>
      </Card>
    </div>
  );
};
