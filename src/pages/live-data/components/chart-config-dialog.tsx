import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MetricOption } from "@/types/data-review";
import { Grid, Grid2x2, Search, Settings, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetMetricsQuery } from "../data/metrics.slice";
import { formatLabel } from "@/utils";

interface ChartConfigDialogProps {
  selectedMetrics: string[];
  onMetricsChange: React.Dispatch<React.SetStateAction<[string, string]>>;
}

export const ChartConfigDialog = ({ selectedMetrics, onMetricsChange }: ChartConfigDialogProps) => {
  const {
    data: metricsConfig,
    isError: isErrorMetrics,
    isLoading: isLoadingMetrics,
  } = useGetMetricsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [newSelectedMetrics, setNewSelectedMetrics] = useState<string[]>([]);

  useEffect(() => {
    setNewSelectedMetrics(selectedMetrics);
  }, [selectedMetrics]);

  const handleMetricToggle = (metricId: string) => {
    if (newSelectedMetrics.includes(metricId)) {
      setNewSelectedMetrics(newSelectedMetrics.filter((id) => id !== metricId));
    } else {
      const newMetrics = [...newSelectedMetrics, metricId];
      if (newMetrics.length > 2) {
        newMetrics.shift();
      }
      setNewSelectedMetrics(newMetrics);
    }
  };

  const availableMetrics: MetricOption[] = Object.entries(metricsConfig?.metrics ?? {}).map(
    ([id, config]) => ({
      id: id,
      label: formatLabel(id),
      unit: config.unit ?? "",
      type: config.type,
    })
  );

  const filteredMetrics = availableMetrics.filter(
    (metric) =>
      metric.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="w-4 h-4" />
          Configure Charts
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-neutral-50 !p-0 max-w-2xl max-h-[70vh] overflow-y-auto thin-scrollbar-light">
        <DialogHeader className="top-0 sticky bg-white px-6 pt-6 pb-4 border-neutral-100 border-b">
          <DialogTitle>Configure Display Metrics</DialogTitle>
          <div className="mb-4 pt-1 text-muted-foreground text-sm">
            Select up to 2 metrics to display
          </div>
          <div className="relative mt-2">
            <Search className="top-[calc(50%-.5rem)] left-3 z-20 absolute w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-6"
            />
          </div>
        </DialogHeader>

        <div className="px-6 pt-0 pb-8">
          <div className="gap-3 grid grid-cols-2">
            {isLoadingMetrics && (
              <div className="flex justify-center items-center col-span-2">
                <Spinner />
              </div>
            )}
            {isErrorMetrics && (
              <div className="flex justify-center items-center col-span-2">
                <p className="text-muted-foreground text-sm">Error loading metrics</p>
              </div>
            )}
            {!isErrorMetrics &&
              filteredMetrics?.map((metric) => (
                <div
                  key={metric.id}
                  onClick={() => handleMetricToggle(metric.id)}
                  className="flex items-center space-x-3 bg-white hover:bg-muted/50 shadow-sm px-4 py-4 rounded-lg active:scale-[.98] transition-scale duration-100 cursor-pointer">
                  <Checkbox
                    id={metric.id}
                    checked={newSelectedMetrics.includes(metric.id)}
                    className="pointer-events-none"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-center gap-2 pt-1">
                      <label className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed">
                        {metric.label}
                      </label>
                      <p className="flex items-center text-muted-foreground text-xs capitalize">
                        {metric.type}
                      </p>
                    </div>
                    {metric.unit && (
                      <p className="text-muted-foreground text-sm">Unit: {metric.unit}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <DialogFooter className="bottom-0 sticky flex justify-between bg-white px-6 py-4 border-neutral-100 border-t">
          <div>
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
          </div>
          <div>
            <DialogTrigger asChild>
              <Button
                variant="primary"
                onClick={() => {
                  if (newSelectedMetrics.length < 2) {
                    return;
                  }
                  onMetricsChange([newSelectedMetrics[0], newSelectedMetrics[1]]);
                }}>
                Apply
              </Button>
            </DialogTrigger>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
