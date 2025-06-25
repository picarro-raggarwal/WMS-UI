import { PageHeader } from "../../components/ui/page-header";
import SystemStatus from "./components/system-status";
import { Card, CardTitle } from "@/components/ui/card";
import { MetricsCards } from "./components/system-metrics";
import { useGetSystemStatusQuery } from "./data/systemStatus.slice";
import GasLevelsCard from "./components/gas-levels";
import MeasurementState from "./components/measurement-state";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/spinner";

const DashboardPage = () => {
  const {
    data: systemStatus,
    isLoading: isSystemStatusLoading,
    isError: systemStatusError,
  } = useGetSystemStatusQuery(undefined, {
    pollingInterval: 5000,
  });

  if (isSystemStatusLoading || systemStatusError || !systemStatus) {
    return (
      <div>
        <PageHeader pageName="System Overview" />
        <div className="max-w-4xl mx-auto w-full px-8 md:px-12 py-8 flex flex-col gap-10 gap-y-4">
          <Card className=" h-full bg-transparent shadow-none border border-dashed border-gray-200 dark:border-neutral-700 ">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="dark:bg-neutral-800 p-2 rounded-full mb-3">
                <Spinner />
              </div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Status Unknown
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Cannot connect to device. Attempting to reconnect...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader pageName="System Overview" />
      <div className="max-w-8xl mx-auto w-full px-8 md:px-12 py-8 flex flex-col gap-10 gap-y-4 pb-12">
        {systemStatusError && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Alert className="text-red-500 text-center font-medium text-xs">
                Error fetching system status
              </Alert>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xl">{JSON.stringify(systemStatusError)}</div>
            </TooltipContent>
          </Tooltip>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <div className="col-span-2">
              <MeasurementState />
            </div>

            <Card className="p-6">
              <CardTitle className="border-b-2 dark:border-neutral-700 dark:text-white font-semibold leading-none mb-3  pb-2 text-base md:text-lg tracking-tight">
                System Metrics
              </CardTitle>
              <MetricsCards />
            </Card>

            <GasLevelsCard />
          </div>
          <div className="col-span-1">
            <Card className="h-full">
              <SystemStatus
                systemStatus={systemStatus}
                isSystemStatusLoading={isSystemStatusLoading}
                systemStatusError={systemStatusError}
                errorRetryingConnectionUI={false}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
