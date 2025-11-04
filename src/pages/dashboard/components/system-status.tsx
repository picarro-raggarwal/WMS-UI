import { EmptyStateInfo } from "@/components/empty-state-info";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { useSystemInfo, useSystemMetrics } from "@/context/DataContext";
import { formatLabel } from "@/utils";
import {
  AlertCircle,
  Box,
  Check,
  CircleAlert,
  Cpu,
  Fan,
  Gauge,
  Server,
  Thermometer,
  Waves,
  Wind
} from "lucide-react";
import { Link } from "react-router";

// Define interfaces for system status data
interface ComponentStatus {
  status: "ok" | "warning" | "error" | string;
  message: string[];
}

const SystemStatus = ({
  systemStatus,
  isSystemStatusLoading,
  systemStatusError,
  errorRetryingConnectionUI
}: {
  systemStatus: typeof SystemStatus;
  isSystemStatusLoading: boolean;
  systemStatusError: boolean;
  errorRetryingConnectionUI: boolean;
}) => {
  const metrics = useSystemMetrics();
  const { name } = useSystemInfo();

  return (
    <>
      {metrics.systemStatus === "error" && (
        <Link to="/dashboard/alerts">
          <Alert variant="destructive" className="-mt-4 mb-6">
            <AlertCircle className="fill-white -mt-0.5 size-5" />
            <AlertTitle className="mb-0">2 active critical alerts</AlertTitle>
          </Alert>
        </Link>
      )}

      <div className="flex flex-col gap-2 w-full h-full">
        <div
          className={`p-6 transition-all duration-300 relative bg-gradient-to-b shadow-sm to-white dark:to-neutral-800 rounded-xl px-8 w-full flex flex-col gap-2 ${
            systemStatus?.overall_status?.status?.toLowerCase() === "ok"
              ? "from-neutral-50"
              : metrics.systemStatus === "warning" || systemStatusError
              ? "from-red-500/5"
              : "from-red-500/5"
          }`}
        >
          {/* <p className="font-semibold text-neutral-500 dark:text-neutral-400 text-xs text-center uppercase tracking-wide">
            Workplace Monitoring System
          </p> */}
          <h2 className="mb-2 font-semibold text-gray-900 dark:text-white text-lg md:text-xl text-center tracking-tight">
            {name || "Workplace Monitoring System"}
          </h2>

          <div className="flex justify-center">
            <div
              className={`relative flex items-center justify-center rounded-full h-32 w-32 ${
                systemStatus?.overall_status?.status?.toLowerCase() === "ok"
                  ? "bg-primary-100/20 border-primary-500/50 border dark:bg-primary-neutral-900/10"
                  : metrics.systemStatus === "warning" || systemStatusError
                  ? "bg-gray-100/50 border-gray-500/50 border dark:bg-amber-900/20"
                  : "bg-red-100/20 border-red-500/50 border dark:bg-red-900/10"
              }`}
            >
              <img
                src="/fenceline_icon_d.png"
                alt="Device"
                className="hidden dark:block absolute w-64 h-36"
              />
              <img
                src="/fenceline_icon.png"
                alt="Device"
                className="dark:hidden block absolute w-64 h-36"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mx-auto mt-2">
            {!systemStatusError ? (
              <span
                className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium ${
                  systemStatus?.overall_status?.status?.toLowerCase() === "ok"
                    ? "bg-primary-500 text-white dark:bg-primary-900/30 dark:text-primary-300"
                    : "bg-red-600 text-white dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {systemStatus?.overall_status?.status?.toLowerCase() !==
                "ok" ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="mr-1 w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    System Issue
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="mr-1 w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    System OK
                  </>
                )}
              </span>
            ) : (
              <span
                className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-medium  bg-red-600 text-white dark:bg-red-900/30 dark:text-red-300"`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mr-1 w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                System Status Unknown
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 p-6 px-8 pt-0 w-full">
          {/* <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="-my-4 text-xs">
              <Info className="size-3" />
              System Diagram
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl min-h-[50vh]">
            <DialogHeader>
              <DialogTitle>Exploded 3D View</DialogTitle>
            </DialogHeader>
            <Scene />
          </DialogContent>
        </Dialog> */}

          {systemStatus?.overall_status?.faulty_components?.length > 0 ||
          (systemStatus?.system_status &&
            Object.keys(systemStatus?.system_status).length > 0) ? (
            <div className="gap-2 grid grid-cols-1 mt-4">
              {systemStatus?.overall_status?.faulty_components?.length > 0 && (
                <div className="mb-2 p-3 border border-red-200 dark:border-red-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CircleAlert className="size-5 text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Faulty Components Detected
                    </span>
                  </div>
                  <div className="mt-2 mt-2 pt-2 pl-7 border-gray-100 dark:border-gray-800 border-t text-gray-600 dark:text-gray-300 text-sm">
                    {systemStatus.overall_status.faulty_components.map(
                      (component, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span>• {component}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {systemStatus?.system_status &&
                Object.entries(systemStatus.system_status).map(
                  ([key, value]) => {
                    const componentValue = value as unknown as ComponentStatus;
                    const status = componentValue.status || "unknown";
                    const messages = componentValue.message || [];

                    // Get component icon based on name
                    const getComponentIcon = (name) => {
                      const lcName = name.toLowerCase();
                      if (lcName.includes("mfc"))
                        return (
                          <Gauge className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      if (
                        lcName.includes("temperature") ||
                        lcName.includes("temp")
                      )
                        return (
                          <Thermometer className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      if (lcName.includes("anemometer"))
                        return (
                          <Wind className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      if (lcName.includes("samlet"))
                        return (
                          <Box className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      if (lcName.includes("catalytic"))
                        return (
                          <Waves className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      if (lcName.includes("hvac"))
                        return (
                          <Fan className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      if (
                        lcName.includes("server") ||
                        lcName.includes("monitor")
                      )
                        return (
                          <Server className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      if (lcName.includes("cpu"))
                        return (
                          <Cpu className="size-5 text-gray-600 dark:text-gray-400" />
                        );
                      return (
                        <Box className="size-5 text-gray-600 dark:text-gray-400" />
                      );
                    };

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border ${
                          status === "error"
                            ? "border-red-200 dark:border-red-800/50"
                            : status === "warning"
                            ? "border-amber-200 dark:border-amber-800/50"
                            : "border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-neutral-800"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getComponentIcon(key)}
                            <span className="font-medium">
                              {formatLabel(key)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                status === "error"
                                  ? "text-red-600 dark:text-red-400"
                                  : status === "warning"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-primary-500 dark:text-primary-400"
                              }`}
                            >
                              {status.toUpperCase()}
                            </span>
                            {status === "error" ? (
                              <CircleAlert className="size-4 text-red-500" />
                            ) : status === "warning" ? (
                              <AlertCircle className="size-4 text-amber-500" />
                            ) : (
                              <Check className="size-4 text-primary-500" />
                            )}
                          </div>
                        </div>

                        {messages.length > 0 && (
                          <div className="mt-2 mt-2 pt-2 pl-7 border-gray-100 dark:border-gray-800 border-t text-gray-600 dark:text-gray-300 text-sm">
                            {messages.map((msg, idx) => (
                              <div key={idx}>{msg}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
            </div>
          ) : (
            <EmptyStateInfo
              title="No Hardware Connected"
              className="mt-6"
              description="Please check device connections. Status of connected components will appear here."
              icon={<CircleAlert className="size-6 text-gray-400" />}
            />
          )}
        </div>
        <div className="flex-1" />
      </div>
    </>
  );
};

export default SystemStatus;
