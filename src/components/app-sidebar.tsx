import {
  Activity,
  Bell,
  ChartScatter,
  Home,
  LifeBuoy,
  Map,
  Settings2,
  Shield,
  Table2,
  Terminal
} from "lucide-react";
import { useEffect, useState } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import {
  SystemInfoResponse,
  useGetSystemInfoQuery
} from "@/lib/services/systemInfo.slice";
// import { useGetTimeQuery } from "@/lib/services/timesync.slice";
import { useGetSystemMetricsQuery } from "@/pages/dashboard/data/systemMetrics.slice";
import { WebSocketJobStateData } from "@/types";
import { formatTime } from "@/utils";
import { useLocalStorage } from "@mantine/hooks";
import BatteryIndicator from "./battery-indicator";
import { FooterToggleSidebar } from "./footer-toggle-sidebar";
import { Logomark } from "./picarro-logomark";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, isHydrated } = useSidebar();
  const [sidebarOpenLocalStorage] = useLocalStorage({
    key: "sidebar:state"
  });
  const { data: systemInfo, isLoading: isLoadingSystemInfo } =
    useGetSystemInfoQuery();
  const { user } = useAuth();

  // Get active alerts and WebSocket data for real-time critical alert count
  // const { data: activeAlertsData } = useGetActiveAlertsQuery(undefined, {
  //   pollingInterval: 10000 // Poll every 10 seconds for accurate count
  // });
  const { processedAlerts } = useSocket();

  // Calculate critical alerts in last hour
  // const criticalAlertsCount = useMemo(() => {
  //   const oneHourAgo = Date.now() - 60 * 60 * 1000;

  //   // Combine API and WebSocket alerts
  //   // const allActiveAlerts = [...(activeAlertsData?.active_alerts || [])];

  //   // Add WebSocket alerts that are active and critical
  //   processedAlerts.forEach((wsAlert) => {
  //     const alertState = wsAlert.data.processed_alert.alert_state;
  //     const normalizedSeverity = normalizeSeverity(
  //       wsAlert.data.processed_alert.severity
  //     );
  //     const severityString = severityMap[normalizedSeverity];
  //     const alertTime = wsAlert.data.processed_alert.last_timestamp * 1000;

  //     if (
  //       alertState === "Active" &&
  //       severityString === "CRITICAL" &&
  //       alertTime >= oneHourAgo
  //     ) {
  //       // Check if this alert already exists in API data to avoid duplicates
  //       const exists = allActiveAlerts.some(
  //         (apiAlert) =>
  //           apiAlert.driver_name === wsAlert.data.processed_alert.driver_name &&
  //           apiAlert.alarm_name === wsAlert.data.processed_alert.alarm_name &&
  //           apiAlert.error === wsAlert.data.processed_alert.error
  //       );

  //       if (!exists) {
  //         allActiveAlerts.push({
  //           driver_name: wsAlert.data.processed_alert.driver_name,
  //           alarm_name: wsAlert.data.processed_alert.alarm_name,
  //           severity: wsAlert.data.processed_alert.severity,
  //           first_timestamp: wsAlert.data.processed_alert.first_timestamp,
  //           last_timestamp: wsAlert.data.processed_alert.last_timestamp,
  //           alert_state: wsAlert.data.processed_alert.alert_state as "Active",
  //           repeat_count: wsAlert.data.processed_alert.repeat_count,
  //           published_count: wsAlert.data.processed_alert.published_count || 0,
  //           consecutive_count: 0,
  //           error: wsAlert.data.processed_alert.error,
  //           redis_key: `ws-${wsAlert.data.processed_alert.driver_name}-${wsAlert.data.processed_alert.alarm_name}`
  //         });
  //       }
  //     }
  //   });

  //   // Count critical alerts in the last hour
  //   return allActiveAlerts.filter((alert) => {
  //     const normalizedSeverity = normalizeSeverity(alert.severity);
  //     const severityString = severityMap[normalizedSeverity];
  //     const alertTime = alert.last_timestamp * 1000;
  //     // return alertTime >= oneHourAgo;
  //     return severityString === "CRITICAL" && alertTime >= oneHourAgo;
  //   }).length;
  // }, [activeAlertsData, processedAlerts]);

  const data = {
    user: user || {
      name: "service",
      email: "service@picarro.com"
    },
    navMain: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: Home,
        isActive: true
      },
      {
        title: "Map Display",
        url: "/dashboard/map-display",
        icon: Map
      },
      {
        title: "Live Data",
        url: "/dashboard/live-data",
        icon: Activity
      },

      // {
      //   title: "Data Review",
      //   url: "/dashboard/data-review",
      //   icon: ChartScatter
      // },
      {
        title: "Data Review",
        url: "/dashboard/data-review",
        icon: ChartScatter
      },
      {
        title: "QA/QC",
        url: "/dashboard/qa-qc",
        icon: Shield
      },
      {
        title: "Method",
        url: "/dashboard/method",
        icon: Terminal
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2
      },
      // {
      //   title: "Reports",
      //   url: "/dashboard/reports",
      //   icon: LifeBuoy
      // },
      {
        title: "Service",
        url: "/dashboard/service",
        icon: LifeBuoy
      },
      {
        title: "Alerts",
        url: "/dashboard/alerts",
        icon: Bell
        // notification: criticalAlertsCount,
        // tooltip:
        //   criticalAlertsCount > 0
        //     ? `${criticalAlertsCount} active critical alert${
        //         criticalAlertsCount === 1 ? "" : "s"
        //       } within the last hour`
        //     : "No critical alerts in the last hour"
      },
      {
        title: "Personal Exposure",
        url: "/dashboard/personal-exposure",
        icon: Table2
      }
    ]
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <button onClick={() => toggleSidebar()}>
              <div className="flex justify-center items-center py-1 leading-tight">
                {/* <FencelineLogo className="w-36" /> */}
                <Logomark
                  className={`w-10 text-white${
                    isHydrated ? "duration-300  transition-all " : "duration-0"
                  } border-r ${
                    sidebarOpenLocalStorage
                      ? " border-white/20 mr-1 pl-0 pr-1 w-10"
                      : "   pl-1 border-transparent"
                  }`}
                />
                <div
                  className={`px-2 text-left !text-white    text-base  font-medium ${
                    sidebarOpenLocalStorage
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  WMS
                  <p className="-mt-0.5 text-neutral-400 text-xs text-nowrap">
                    {isLoadingSystemInfo ? (
                      <div className="bg-neutral-500 rounded-full w-full h-4 animate-pulse"></div>
                    ) : systemInfo?.serial_number ? (
                      systemInfo?.serial_number
                    ) : (
                      "System Software"
                    )}
                  </p>
                </div>
              </div>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={`thin-scrollbar `}>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SystemFooter systemInfo={systemInfo} />
        <NavUser user={data.user} />
        <FooterToggleSidebar />
      </SidebarFooter>
    </Sidebar>
  );
}

const SystemFooter = ({ systemInfo }: { systemInfo: SystemInfoResponse }) => {
  const { fencelineJobState, connected } = useSocket();
  // const { data: timeData } = useGetTimeQuery();

  const [currentTime, setCurrentTime] = useState<{
    epoch: number;
    timezone: string;
  } | null>(null);

  const [browserTime, setBrowserTime] = useState(new Date());

  // Update local time when server data changes
  // useEffect(() => {
  //   if (timeData?.epoch && timeData?.timezone) {
  //     setCurrentTime({
  //       epoch: timeData.epoch,
  //       timezone: timeData.timezone
  //     });
  //   }
  // }, [timeData]);

  // increment local time every second in between polling
  useEffect(() => {
    if (!currentTime) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) =>
        prev
          ? {
              ...prev,
              epoch: prev.epoch + 1
            }
          : null
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTime?.timezone]); //if timezone changes re-create

  // Update browser time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setBrowserTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [sidebarOpenLocalStorage] = useLocalStorage({
    key: "sidebar:state"
  });
  const { data: metricsData } = useGetSystemMetricsQuery(undefined, {
    skip:
      (fencelineJobState?.data as WebSocketJobStateData)?.state ===
        "SystemStartup" || !connected,
    pollingInterval:
      (fencelineJobState?.data as WebSocketJobStateData)?.state ===
        "SystemStartup" || !connected
        ? 5000
        : 0
  });
  const uiVersion = import.meta.env.VITE_UI_VERSION || "dev";

  const upsMetric = metricsData?.system_metrics?.find((metric) =>
    metric.name.toLowerCase().includes("ups")
  );

  // Format current time using browser local time
  const currentTimeFormatted = formatTime(browserTime);

  if (!sidebarOpenLocalStorage) {
    return (
      <div className="space-y-4 px-2 pt-3 border-neutral-800 border-l w-full text-xs text-nowrap -rotate-90">
        <div className="flex items-center mb-4 -ml-1 transition-transform duration-200 ease-out transform">
          {upsMetric && (
            <BatteryIndicator level={upsMetric?.value ?? 0} label="UPS" />
          )}
          <p className="ml-4 text-neutral-400 text-xs">
            <Tooltip>
              <TooltipTrigger className="cursor-default">
                <p className="hover:bg-neutral-800/40 -mx-2 px-2 py-0 rounded-full text-neutral-400">
                  {currentTimeFormatted ? `${currentTimeFormatted}` : "--:--"}
                </p>{" "}
              </TooltipTrigger>
              <div className="rotate-90">
                <TooltipContent
                  side="right"
                  sideOffset={10}
                  className="bg-neutral-800/40 backdrop-blur-sm ml-2 p-2 rounded-full text-white text-xs"
                >
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </TooltipContent>
              </div>
            </Tooltip>
            {uiVersion} | {systemInfo?.serial_number || "SYS-WMS"}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 px-2 py-4 border-neutral-800 border-t border-b text-xs">
      <div className={`space-y-0.5`}>
        <h2 className="font-medium text-white text-nowrap wrap-nowrap">
          {systemInfo?.model || "WMS"}
        </h2>
        <p className="text-neutral-400 text-nowrap">
          {systemInfo?.serial_number}
        </p>
        {/* <p className="text-neutral-400 text-nowrap">build: {uiVersion}</p> */}
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <p className="hover:bg-neutral-800/40 -mx-2 px-2 py-1 rounded-full text-neutral-400 text-nowrap">
              {currentTimeFormatted}
            </p>{" "}
          </TooltipTrigger>
          <TooltipContent className="bg-neutral-800/40 backdrop-blur-sm ml-2 p-2 rounded-full text-white text-xs">
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </TooltipContent>
        </Tooltip>
      </div>
      {upsMetric?.value && (
        <BatteryIndicator level={upsMetric?.value ?? 0} label="UPS" />
      )}
    </div>
  );
};
