import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime } from "@/utils";
import { useLocalStorage } from "@mantine/hooks";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  Clock,
  CloudDownload,
  FileText,
  History,
  Settings
} from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  useDownloadExportFileQuery,
  useExportConcentrationMutation,
  useExportSubcomponentsMutation,
  useGetAllExportsQuery,
  useGetAvailableSubcomponentsQuery,
  useGetExportStatusQuery
} from "../../data-review/data/dataExport.api";

interface ExportDialogProps {
  timeRange: string;
  dateRange?: DateRange;
  selectedMetrics: string[];
}

type DataType = "concentration" | "telemetry";
type ConcentrationDataType = "avg" | "time_series";
type TimeRangeType = "current" | "custom" | "all";

function PendingTaskMonitor({
  taskId,
  onCompleted,
  onProgressUpdate
}: {
  taskId: string;
  onCompleted: (taskId: string, fileName?: string) => void;
  onProgressUpdate: (taskId: string, progress: number) => void;
}) {
  const [isTerminal, setIsTerminal] = useState(false);

  const { data: statusData } = useGetExportStatusQuery(
    { task_id: taskId },
    {
      pollingInterval: 5000,
      skip: isTerminal
    }
  );

  useEffect(() => {
    if (statusData) {
      const status = statusData.status.toLowerCase();

      if (status === "pending" || status === "in_progress") {
        onProgressUpdate(taskId, statusData.progress || 0);
      }

      if (status === "completed") {
        setIsTerminal(true);
        onCompleted(taskId, statusData.file_name);
      } else if (status === "failed" || status === "error") {
        setIsTerminal(true);
        onCompleted(taskId);
      }
    }
  }, [statusData, taskId, onCompleted, onProgressUpdate]);

  return null;
}

export function ExportDialog({
  timeRange,
  dateRange,
  selectedMetrics
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataType, setDataType] = useState<DataType>("concentration");
  const [concentrationDataType, setConcentrationDataType] =
    useState<ConcentrationDataType>("avg");
  const [timeRangeType, setTimeRangeType] = useState<TimeRangeType>("current");
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >();
  const [selectedSubcomponents, setSelectedSubcomponents] = useState<string[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("export");

  const [pendingTasks, setPendingTasks] = useLocalStorage<string[]>({
    key: "export-pending-tasks",
    defaultValue: []
  });

  const { data: subcomponentsData } = useGetAvailableSubcomponentsQuery();
  const availableSubcomponents =
    subcomponentsData?.available_subcomponents || [];

  const [triggerConcentrationExport, { isLoading: isExportingConcentration }] =
    useExportConcentrationMutation();
  const [triggerSubcomponentsExport, { isLoading: isExportingSubcomponents }] =
    useExportSubcomponentsMutation();

  const { data: allExports, refetch: refetchAllExports } =
    useGetAllExportsQuery();

  useEffect(() => {
    if (allExports?.exports) {
      const activeTasks = Object.entries(allExports.exports)
        .filter(
          ([, exportInfo]) =>
            exportInfo.status.toLowerCase() === "pending" ||
            exportInfo.status.toLowerCase() === "in_progress"
        )
        .map(([taskId]) => taskId);

      if (activeTasks.length > 0) {
        setPendingTasks((prev) => {
          const existingTasks = new Set(prev);
          const newTasks = activeTasks.filter(
            (taskId) => !existingTasks.has(taskId)
          );

          if (newTasks.length > 0) {
            return [...prev, ...newTasks];
          }
          return prev;
        });
      }
    }
  }, [allExports, setPendingTasks]);

  const handleProgressUpdate = (taskId: string, progress: number) => {
    setTaskProgresses((prev) => ({
      ...prev,
      [taskId]: progress
    }));
  };

  const handleTaskCompleted = (taskId: string, fileName?: string) => {
    setPendingTasks((prev) => prev.filter((id) => id !== taskId));

    setTaskProgresses((prev) => {
      const newProgresses = { ...prev };
      delete newProgresses[taskId];
      return newProgresses;
    });
    refetchAllExports();

    if (fileName) {
      toast.success("Export completed!", {
        description: `${fileName} is ready for download.`
      });
    } else {
      toast.error("Export failed!", {
        description: `Task ${taskId.slice(
          0,
          8
        )}... has failed. Check the history for details.`
      });
    }
  };

  const getTimeRangeParams = () => {
    if (timeRangeType === "all") {
      return {};
    }

    if (
      timeRangeType === "custom" &&
      customDateRange?.from &&
      customDateRange?.to
    ) {
      if (customDateRange.from.getTime() === customDateRange.to.getTime()) {
        throw new Error("Please select a date range, not a single day");
      }

      const startDate = new Date(customDateRange.from);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(customDateRange.to);
      endDate.setHours(23, 59, 59, 999);

      return {
        start_time: startDate.getTime(),
        end_time: endDate.getTime()
      };
    }

    if (timeRangeType === "current") {
      if (timeRange === "custom" && dateRange?.from && dateRange?.to) {
        return {
          start_time: dateRange.from.getTime(),
          end_time: dateRange.to.getTime()
        };
      }

      const now = Date.now();
      const ranges = {
        "1h": now - 60 * 60 * 1000,
        "24h": now - 24 * 60 * 60 * 1000,
        "7d": now - 7 * 24 * 60 * 60 * 1000,
        "30d": now - 30 * 24 * 60 * 60 * 1000
      };

      return {
        start_time: ranges[timeRange as keyof typeof ranges] || ranges["24h"],
        end_time: now
      };
    }

    return {};
  };

  // Check if export should be disabled
  const isExportDisabled = () => {
    if (
      timeRangeType === "custom" &&
      (!customDateRange?.from || !customDateRange?.to)
    ) {
      return true;
    }
    if (dataType === "telemetry" && selectedSubcomponents.length === 0) {
      return true;
    }
    return false;
  };

  const handleExport = async () => {
    try {
      if (timeRangeType === "custom") {
        if (!customDateRange?.from || !customDateRange?.to) {
          toast.error("Validation Error", {
            description:
              "Please select both start and end dates for custom range."
          });
          return;
        }
        if (customDateRange.from.getTime() === customDateRange.to.getTime()) {
          toast.error("Validation Error", {
            description: "Please select a date range, not a single day."
          });
          return;
        }
      }

      let result;
      const timeRangeParams = getTimeRangeParams();

      if (dataType === "concentration") {
        const exportParams = {
          data_type: concentrationDataType,
          ...timeRangeParams
        };

        result = await triggerConcentrationExport(exportParams).unwrap();
      } else {
        if (selectedSubcomponents.length === 0) {
          toast.error("Validation Error", {
            description:
              "Please select at least one subcomponent for telemetry export."
          });
          return;
        }

        const exportParams = {
          subcomponents: selectedSubcomponents,
          ...timeRangeParams
        };

        result = await triggerSubcomponentsExport(exportParams).unwrap();
      }

      if (result?.task_id) {
        setPendingTasks((prev) => [...prev, result.task_id]);
        refetchAllExports();
        setActiveTab("history");
        toast.success("Export started!", {
          description: `Task ID: ${result.task_id}. You can monitor progress in the History tab.`
        });
      } else {
        toast.error("Export Error", {
          description:
            "Export request completed but no task ID was returned. Please check the Export History."
        });
      }
    } catch (error: unknown) {
      console.error("Export failed:", error);
      if (error && typeof error === "object" && "data" in error) {
        const rtqError = error as {
          data?: {
            error?: { description?: string; name?: string; message?: string };
          };
          status?: number;
          error?: string;
        };
        if (rtqError.data?.error) {
          const errorData = rtqError.data;
          if (errorData.error.description === "Invalid subcomponents") {
            toast.error("Invalid Subcomponents", {
              description: `${errorData.error.message} Please select only valid subcomponents and try again.`
            });
          } else {
            toast.error("Export Failed", {
              description: `${
                errorData.error.description || errorData.error.name
              }: ${errorData.error.message || "Please try again."}`
            });
          }
        } else if (rtqError.status) {
          toast.error("Export Failed", {
            description: `${rtqError.status} ${
              rtqError.error || "Server Error"
            }. Please check your parameters and try again.`
          });
        }
      } else if (
        error instanceof TypeError &&
        error.message.includes("fetch")
      ) {
        toast.error("Network Error", {
          description:
            "Could not connect to the export service. Please check your internet connection and try again."
        });
      } else {
        toast.error("Unexpected Error", {
          description: `${
            error instanceof Error ? error.message : "An unknown error occurred"
          }. Please try again or contact support if the problem persists.`
        });
      }
    }
  };

  const handleSubcomponentChange = (component: string, checked: boolean) => {
    setSelectedSubcomponents((prev) =>
      checked ? [...prev, component] : prev.filter((c) => c !== component)
    );
  };

  const isExporting = isExportingConcentration || isExportingSubcomponents;

  const [taskProgresses, setTaskProgresses] = useState<Record<string, number>>(
    {}
  );

  const getPendingTasksProgress = () => {
    if (pendingTasks.length === 0) return null;

    const progresses = pendingTasks
      .map((taskId) => taskProgresses[taskId])
      .filter((progress) => progress !== undefined);

    if (progresses.length === 0) return 0;

    const avgProgress =
      progresses.reduce((sum, progress) => sum + progress, 0) /
      progresses.length;
    return Math.round(avgProgress);
  };

  const pendingProgress = getPendingTasksProgress();

  const tabClasnames =
    "px-4 flex items-center shadow-none justify-start gap-2 data-[state=active]:bg-neutral-100 data-[state=active]:shadow-none data-[state=active]:dark:bg-neutral-700 data-[state=inactive]:hover:bg-neutral-50 data-[state=inactive]:dark:hover:bg-neutral-800 h-12 rounded-lg transition-colors";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CloudDownload className="mr-1 w-3 h-3" />
          Data Export {pendingTasks.length > 0 && `(${pendingTasks.length})`}
          {pendingProgress !== null &&
            pendingProgress > 0 &&
            ` - ${pendingProgress}%`}
        </Button>
      </DialogTrigger>
      <DialogContent className="pb-0 max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Configure your export settings and monitor export progress.
          </DialogDescription>
        </DialogHeader>

        {pendingTasks.map((taskId) => (
          <PendingTaskMonitor
            key={taskId}
            taskId={taskId}
            onCompleted={handleTaskCompleted}
            onProgressUpdate={handleProgressUpdate}
          />
        ))}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex items-start gap-6 h-[600px]"
        >
          <TabsList className="flex flex-col items-stretch bg-white dark:!bg-neutral-800 p-0 w-[200px] h-auto">
            <TabsTrigger value="export" className={tabClasnames}>
              <Settings size={16} />
              <span>Configure</span>
            </TabsTrigger>
            <TabsTrigger value="history" className={tabClasnames}>
              <History size={16} />
              <div className="flex items-center gap-2">
                <span>History</span>
                {pendingTasks.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 bg-primary-500 px-1.5 py-0.5 rounded-full text-white text-xs">
                      <Spinner size="4" className="p-0.5" />
                      {pendingProgress !== null && pendingProgress > 0
                        ? `${pendingProgress}%`
                        : pendingTasks.length}
                    </span>
                  </div>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="export"
            className="flex-1 mt-0 pr-2 pb-8 overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="font-medium text-sm">Data Type</Label>
                <RadioGroup
                  value={dataType}
                  onValueChange={(value) => setDataType(value as DataType)}
                >
                  <div className="gap-3 grid grid-cols-2">
                    <Label htmlFor="concentration">
                      <div
                        className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                          dataType === "concentration"
                            ? "border-primary-500   dark:bg-primary-950"
                            : "border-gray-200 hover:border-gray-300 bg-white dark:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="concentration"
                            id="concentration"
                          />
                          <div>
                            <div className="font-medium text-sm">
                              Measurement Data
                            </div>
                            <div className="mt-1 text-muted-foreground text-xs">
                              Gas measurement data
                            </div>
                          </div>
                        </div>
                      </div>
                    </Label>

                    <Label htmlFor="telemetry">
                      <div
                        className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                          dataType === "telemetry"
                            ? "border-primary-500   dark:bg-primary-950"
                            : "border-gray-200 hover:border-gray-300 bg-white dark:bg-neutral-800"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="telemetry" id="telemetry" />
                          <div>
                            <div className="font-medium text-sm">
                              Subcomponent Data
                            </div>
                            <div className="mt-1 text-muted-foreground text-xs">
                              System subcomponent readings
                            </div>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {dataType === "concentration" && (
                <div className="space-y-3">
                  <Label className="font-medium text-sm">Data Resolution</Label>
                  <RadioGroup
                    value={concentrationDataType}
                    onValueChange={(value) =>
                      setConcentrationDataType(value as ConcentrationDataType)
                    }
                  >
                    <div className="gap-3 grid grid-cols-2">
                      <Label htmlFor="avg">
                        <div
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            concentrationDataType === "avg"
                              ? "border-primary-500 dark:bg-primary-950"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="avg" id="avg" />
                            <div>
                              <div className="font-medium text-sm">
                                Average Data
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Averaged measurements
                              </div>
                            </div>
                          </div>
                        </div>
                      </Label>

                      <Label htmlFor="time_series">
                        <div
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            concentrationDataType === "time_series"
                              ? "border-primary-500 dark:bg-primary-950"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value="time_series"
                              id="time_series"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                Time Series Data
                              </div>
                              <div className="text-muted-foreground text-xs">
                                Raw time series
                              </div>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {dataType === "telemetry" && (
                <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="font-medium text-sm">Subcomponents</Label>
                    <p className="text-muted-foreground text-xs">
                      Select which subcomponents to include in the export
                    </p>
                  </div>
                  <div className="o">
                    <div className="gap-2 grid grid-cols-2">
                      {availableSubcomponents.length === 0 ? (
                        <p className="py-4 text-muted-foreground text-sm text-center">
                          Loading subcomponents...
                        </p>
                      ) : (
                        availableSubcomponents.map((component) => (
                          <div
                            key={component}
                            onClick={() =>
                              handleSubcomponentChange(
                                component,
                                !selectedSubcomponents.includes(component)
                              )
                            }
                            className="flex items-center space-x-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 p-2 border rounded-lg transition-colors cursor-pointer"
                          >
                            <Checkbox
                              id={component}
                              checked={selectedSubcomponents.includes(
                                component
                              )}
                              className="pointer-events-none"
                            />
                            <Label
                              htmlFor={component}
                              className="flex-1 font-normal text-sm cursor-pointer pointer-events-none"
                            >
                              {component}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="font-medium text-sm">Time Range</Label>
                <RadioGroup
                  value={timeRangeType}
                  onValueChange={(value) =>
                    setTimeRangeType(value as TimeRangeType)
                  }
                >
                  <div className="space-y-2">
                    <Label htmlFor="current">
                      <div
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          timeRangeType === "current"
                            ? "border-primary-500 dark:bg-primary-950"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="current" id="current" />
                          <div>
                            <div className="font-medium text-sm">
                              Current View
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {timeRange === "custom"
                                ? `${
                                    dateRange?.from
                                      ? formatDate(dateRange.from)
                                      : ""
                                  } - ${
                                    dateRange?.to
                                      ? formatDate(dateRange.to)
                                      : ""
                                  }`
                                : timeRange}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Label>

                    <Label htmlFor="custom">
                      <div
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          timeRangeType === "custom"
                            ? "border-primary-500 dark:bg-primary-950"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="custom" id="custom" />
                          <div>
                            <div className="font-medium text-sm">
                              Custom Date Range
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Select specific start and end dates
                            </div>
                          </div>
                        </div>
                      </div>
                    </Label>

                    <Label htmlFor="all">
                      <div
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          timeRangeType === "all"
                            ? "border-primary-500 dark:bg-primary-950"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="all" id="all" />
                          <div>
                            <div className="font-medium text-sm">
                              All Available Data
                            </div>
                            <div className="text-muted-foreground text-xs">
                              Export complete historical dataset
                            </div>
                          </div>
                        </div>
                      </div>
                    </Label>

                    {timeRangeType === "custom" && (
                      <div className="bg-gray-50 dark:bg-neutral-800 mt-4 p-4 border rounded-lg">
                        <Label className="block mb-3 font-medium text-sm">
                          Select Date Range
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="justify-start w-full font-normal text-left"
                            >
                              <CalendarIcon className="mr-2 w-4 h-4" />
                              {customDateRange?.from ? (
                                customDateRange.to ? (
                                  customDateRange.from.getTime() ===
                                  customDateRange.to.getTime() ? (
                                    <span className="text-red-500">
                                      {format(
                                        customDateRange.from,
                                        "LLL dd, y"
                                      )}{" "}
                                      - Please select a range
                                    </span>
                                  ) : (
                                    <>
                                      {format(
                                        customDateRange.from,
                                        "LLL dd, y"
                                      )}{" "}
                                      00:00 -{" "}
                                      {format(customDateRange.to, "LLL dd, y")}{" "}
                                      23:59
                                    </>
                                  )
                                ) : (
                                  <>
                                    {format(customDateRange.from, "LLL dd, y")}{" "}
                                    - Select end date
                                  </>
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-auto" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={customDateRange?.from}
                              selected={customDateRange}
                              onSelect={setCustomDateRange}
                              disabled={(date) => date > new Date()}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || isExportDisabled()}
                  variant="primary"
                  className="flex-1"
                >
                  {isExporting ? (
                    <>
                      <Spinner size="4" className="mr-2" />
                      Starting Export...
                    </>
                  ) : (
                    "Start Export"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="history"
            className="flex-1 mt-0 overflow-y-auto 2"
          >
            <ExportHistory
              allExports={allExports}
              pendingTasks={pendingTasks}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ExportHistoryProps {
  allExports?: {
    exports: Record<
      string,
      {
        progress: number;
        status: string;
        file_name: string | null;
        created: string;
        error?: string | null;
      }
    >;
  };
  pendingTasks: string[];
}

function ExportHistory({ allExports, pendingTasks }: ExportHistoryProps) {
  if (!allExports?.exports || Object.keys(allExports.exports).length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-center">
        <History className="mb-4 w-12 h-12 text-muted-foreground" />
        <h3 className="mb-2 font-medium text-neutral-900 dark:text-neutral-100 text-lg">
          No Export History
        </h3>
        <p className="max-w-sm text-muted-foreground text-sm">
          Your export history will appear here once you start your first export.
        </p>
      </div>
    );
  }

  const exportEntries = Object.entries(allExports.exports).sort(
    ([, a], [, b]) =>
      new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  const activeExports = exportEntries.filter(
    ([, exportInfo]) =>
      exportInfo.status.toLowerCase() === "pending" ||
      exportInfo.status.toLowerCase() === "in_progress"
  );

  const otherExports = exportEntries.filter(
    ([, exportInfo]) =>
      exportInfo.status.toLowerCase() !== "pending" &&
      exportInfo.status.toLowerCase() !== "in_progress"
  );

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                Export Details
              </TableHead>
              <TableHead className="w-[120px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeExports.map(([taskId, exportInfo], index) => (
              <ExportTableRow
                key={taskId}
                taskId={taskId}
                exportInfo={exportInfo}
                index={index}
              />
            ))}

            {activeExports.length > 0 && otherExports.length > 0 && (
              <TableRow>
                <TableCell colSpan={2} className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <hr className="flex-1 border-neutral-300 dark:border-neutral-600" />
                    <span className="font-medium text-neutral-500 text-sm">
                      Export History
                    </span>
                    <hr className="flex-1 border-neutral-300 dark:border-neutral-600" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {otherExports.map(([taskId, exportInfo], index) => (
              <ExportTableRow
                key={taskId}
                taskId={taskId}
                exportInfo={exportInfo}
                index={
                  index +
                  activeExports.length +
                  (activeExports.length > 0 ? 1 : 0)
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface ExportTableRowProps {
  taskId: string;
  exportInfo: {
    progress: number;
    status: string;
    file_name: string | null;
    created: string;
    error?: string | null;
  };
  index: number;
}

function ExportTableRow({ taskId, exportInfo, index }: ExportTableRowProps) {
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  const shouldPoll =
    exportInfo.status.toLowerCase() === "pending" ||
    exportInfo.status.toLowerCase() === "in_progress";

  const { data: statusData } = useGetExportStatusQuery(
    { task_id: taskId },
    {
      skip: !shouldPoll,
      pollingInterval: shouldPoll ? 5000 : undefined
    }
  );

  const currentStatus = statusData?.status || exportInfo.status;
  const currentProgress = statusData?.progress ?? exportInfo.progress;
  const currentError = statusData?.error || exportInfo.error;
  const currentFileName = statusData?.file_name || exportInfo.file_name;

  const { data: downloadData } = useDownloadExportFileQuery(
    { file_name: currentFileName! },
    { skip: !downloadTriggered || !currentFileName }
  );

  const handleDownload = () => {
    if (currentFileName && !downloadTriggered) {
      setDownloadTriggered(true);
    }
  };

  useEffect(() => {
    if (downloadData && currentFileName) {
      const url = URL.createObjectURL(downloadData);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadTriggered(false);
    }
  }, [downloadData, currentFileName]);

  const getStatusIcon = () => {
    switch (currentStatus.toLowerCase()) {
      case "completed":
        return <Check className="w-3 h-3 text-primary-600" />;
      case "failed":
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case "in_progress":
        return <Clock className="w-3 h-3 text-blue-600" />;
      case "pending":
        return <Spinner size="4" className="p-0.5 w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const isInProgress =
    currentStatus.toLowerCase() === "in_progress" ||
    currentStatus.toLowerCase() === "pending";

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center">
          <FileText className="mr-3 w-4 h-4 text-gray-400" />
          <div className="flex flex-col space-y-1">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span
                  className="block font-medium text-gray-900 text-sm cursor-help"
                  title={`Task ID: ${taskId}`}
                >
                  {currentFileName || `Export ${taskId.slice(0, 8)}...`}
                </span>
              </div>
            </div>
            <span className="flex items-center gap-2 text-gray-500 text-xs text-nowrap">
              {formatDateTime(new Date(exportInfo.created))} • {getStatusIcon()}{" "}
              <span className="capitalize">
                {currentStatus.toLowerCase() === "in_progress"
                  ? "In Progress"
                  : currentStatus.toLowerCase()}
              </span>
              {currentError && (
                <span className="text-red-600 text-xs">{currentError}</span>
              )}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right">
        {currentStatus.toLowerCase() === "completed" && currentFileName ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            loading={downloadTriggered}
            disabled={downloadTriggered}
            className="h-8"
          >
            Download
          </Button>
        ) : isInProgress ? (
          <div className="flex justify-end items-center gap-2">
            <div className="bg-gray-200 rounded-full w-16 h-2">
              <div
                className={`rounded-full h-2 transition-all duration-300 ${
                  currentStatus.toLowerCase() === "pending"
                    ? "bg-primary-500"
                    : "bg-primary-500"
                }`}
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <span className={`font-medium tabular-nums text-xs text-black`}>
              {currentProgress.toFixed(0)}%
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}
