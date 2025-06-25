import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  severityMap,
  normalizeSeverity,
  useAcknowledgeAlertMutation,
  useClearAlertMutation,
} from "../data/alerts.slice";
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  Info,
  AlertOctagon,
  Eye,
  X,
  RotateCcw,
} from "lucide-react";
import { formatUnixTimestamp } from "@/utils";
import { toast } from "sonner";
interface AlertDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
}

const getSeverityIcon = (severity: number | string) => {
  const normalizedSeverity = normalizeSeverity(severity);
  const severityString = severityMap[normalizedSeverity];
  switch (severityString) {
    case "CRITICAL":
      return <AlertOctagon className="w-4 h-4" />;
    case "HIGH":
      return <AlertCircle className="w-4 h-4" />;
    case "WARNING":
      return <AlertTriangle className="w-4 h-4" />;
    case "INFO":
      return <Info className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getSeverityColor = (severity: number | string) => {
  const normalizedSeverity = normalizeSeverity(severity);
  const severityString = severityMap[normalizedSeverity];
  switch (severityString) {
    case "CRITICAL":
      return "text-red-600 dark:text-red-400";
    case "HIGH":
      return "text-orange-600 dark:text-orange-400";
    case "WARNING":
      return "text-yellow-600 dark:text-yellow-400";
    case "INFO":
      return "text-gray-600 dark:text-gray-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

export const AlertDetailsPanel = ({ isOpen, onClose, alert }: AlertDetailsPanelProps) => {
  const [acknowledgeAlert, { isLoading: isAcknowledging }] = useAcknowledgeAlertMutation();
  const [clearAlert, { isLoading: isClearing }] = useClearAlertMutation();

  if (!alert) return null;

  const alertState = alert.alert_state || alert.state || "Unknown";
  const normalizedSeverity = normalizeSeverity(alert.severity);
  const severityString = severityMap[normalizedSeverity];

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAlert({
        driver_name: alert.driver_name,
        alarm_name: alert.alarm_name,
        error: alert.error,
      }).unwrap();

      toast.success("Alert acknowledged successfully");
      onClose();
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
      toast.error("Failed to acknowledge alert. Please try again.");
    }
  };

  const handleClear = async () => {
    try {
      await clearAlert({
        driver_name: alert.driver_name,
        alarm_name: alert.alarm_name,
        error: alert.error,
      }).unwrap();

      toast.success("Alert cleared successfully");
      onClose();
    } catch (error) {
      console.error("Failed to clear alert:", error);
      toast.error("Failed to clear alert. Please try again.");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col justify-between bg-neutral-50 pb-0 w-full min-w-[500px] max-w-[90vw] h-full max-h-[100vh] overflow-y-auto duration-200">
        <SheetHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded ${getSeverityColor(alert.severity)}`}>
              {getSeverityIcon(alert.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="font-medium text-gray-900 dark:text-white text-lg">
                {alert.alarm_name}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-neutral-600 text-sm">
                {alert.driver_name}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-4 overflow-auto">
          {/* Status Overview */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Status</h3>
            <div className="gap-3 grid grid-cols-3">
              <div className="space-y-1">
                <div className="text-neutral-600 text-xs">Severity</div>
                <div className={`text-sm font-medium `}>{severityString}</div>
              </div>
              <div className="space-y-1">
                <div className="text-neutral-600 text-xs">State</div>
                <div className={`text-sm font-medium `}>{alertState}</div>
              </div>
              <div className="space-y-1">
                <div className="text-neutral-600 text-xs">Count</div>
                <div className="font-medium text-sm">{alert.published_count}</div>
              </div>
            </div>
          </div>

          {/* Error Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Error Details</h3>
            <div className="bg-gray-50 dark:bg-neutral-800/50 p-3 border dark:border-neutral-700/50 rounded font-mono text-xs leading-relaxed">
              {alert.error}
            </div>
          </div>

          {/* Timing */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Timing</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">First Occurrence</span>
                <span className="font-mono text-xs">
                  {formatUnixTimestamp(alert.first_timestamp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Last Occurrence</span>
                <span className="font-mono text-xs">
                  {formatUnixTimestamp(alert.last_timestamp)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Technical Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Driver</span>
                <span className="bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono text-xs">
                  {alert.driver_name}
                </span>
              </div>
              {alert.redis_key && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Key</span>
                  <span className="bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded max-w-[300px] font-mono text-neutral-600 text-xs truncate text-wrap">
                    {alert.redis_key}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-grow flex-1" />

        {alertState !== "Active" && alertState !== "Acknowledged" && (
          <div className="pt-4 dark:border-neutral-700 border-t">
            <div className="py-4 text-center">
              <div className="flex gap-2 bg-gray-100 dark:bg-neutral-800 mt-2 p-4 rounded-lg text-sm">
                <Info className="mt-1 mr-1 size-4 text-gray-500 dark:text-white shrink-0" />
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Alert is {alertState.toLowerCase()}. No actions available.
                </p>
              </div>
            </div>
          </div>
        )}
        {(alertState === "Active" || alertState === "Acknowledged") && (
          <div className="space-y-4 bg-white -mx-6 px-6 pt-8 pb-8 dark:border-neutral-700 border-b">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Choose an Action
            </h3>

            <div className="space-y-3">
              {/* Acknowledge Action */}
              <div
                className={`${
                  alertState === "Acknowledged" && "hidden"
                } flex items-center gap-3 p-4 border hover:border-gray-300 dark:border-neutral-700/50 dark:hover:border-gray-600 rounded-lg transition-colors`}>
                <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-full">
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Acknowledge
                  </div>
                  <div className="mt-0.5 text-neutral-600 text-xs">
                    Mark as seen and continue monitoring
                  </div>
                </div>
                <Button
                  onClick={handleAcknowledge}
                  disabled={isAcknowledging || isClearing}
                  variant="outline"
                  size="sm">
                  {isAcknowledging ? (
                    <>
                      <div className="mr-1.5 border border-current border-t-transparent rounded-full w-3 h-3 animate-spin" />
                      Acknowledging...
                    </>
                  ) : (
                    "Acknowledge"
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className={`${alertState === "Acknowledged" && "hidden"} flex items-center`}>
                <div className="flex-1 border-gray-200 dark:border-neutral-700 border-t"></div>
                <span className="bg-white dark:bg-neutral-900 px-3 text-neutral-600 text-xs">
                  OR
                </span>
                <div className="flex-1 border-gray-200 dark:border-neutral-700 border-t"></div>
              </div>

              {/* Clear Action */}
              <div className="flex items-center gap-3 p-4 border dark:border-neutral-700/50 hover:border-red-300 dark:hover:border-red-700 rounded-lg transition-colors">
                <div className="p-2 border border-red-200 dark:border-red-800 rounded-full">
                  <RotateCcw className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Acknowledge + Clear
                  </div>
                  <div className="mt-0.5 text-neutral-600 text-xs">
                    Mark resolved and reset tracking
                  </div>
                </div>
                <Button
                  onClick={handleClear}
                  disabled={isAcknowledging || isClearing}
                  variant="outline"
                  size="sm">
                  {isClearing ? (
                    <>
                      <div className="mr-1.5 border border-current border-t-transparent rounded-full w-3 h-3 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    "Clear"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
