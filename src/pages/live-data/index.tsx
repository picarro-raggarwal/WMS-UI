import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useLocalStorage } from "@mantine/hooks";
import { DEFAULT_SELECTED_METRICS } from "../data-review";
import { ChartConfigDialog } from "./components/chart-config-dialog";
import { LiveChartRender } from "./components/live-chart-render";
import { MetricsDisplay } from "./components/metrics-display";

const LiveDataPage = () => {
  const [selectedMetrics, setSelectedMetrics] = useLocalStorage<
    [string, string]
  >({
    key: "live-data-selected-metrics",
    defaultValue: DEFAULT_SELECTED_METRICS
  });

  return (
    <>
      <PageHeader
        pageName={
          <>
            <div className="flex items-center gap-2">
              <h1>Real-time Monitoring</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-[150px]">
                  <Badge className="text-xs" variant="outline">
                    <div className="bg-primary-500 mr-2 rounded-full size-2 animate-pulse" />
                    <span className="text-neutral-500 text-xs">Live</span>
                  </Badge>
                </div>
              </div>
            </div>
          </>
        }
      />
      <MetricsDisplay />
      <main className="flex flex-col mx-auto px-8 md:px-12 py-8 w-full max-w-8xl">
        {/* Page Header with Config */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="font-semibold text-black dark:text-white text-base md:text-xl leading-none tracking-tight whitespace-nowrap">
              Live Data <span className="text-neutral-500">Last 24 hours</span>
            </div>
          </div>
          <div className="flex gap-2">
            <ChartConfigDialog
              selectedMetrics={selectedMetrics}
              onMetricsChange={setSelectedMetrics}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          <LiveChartRender selectedMetrics={selectedMetrics} />
        </div>
      </main>
    </>
  );
};

export default LiveDataPage;
