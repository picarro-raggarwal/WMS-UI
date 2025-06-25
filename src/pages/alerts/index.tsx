import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  Info,
  X,
  ChevronDown,
  Check,
  StopCircle,
  PlayCircle,
  RefreshCcw,
  Loader2,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/hooks/useSocket";
import {
  useGetAlertsQuery,
  useGetActiveAlertsQuery,
  useGetAlertsSummaryQuery,
  Alert,
  AlertsQueryParams,
  severityMap,
  normalizeSeverity,
} from "./data/alerts.slice";
import { formatUnixTimestamp } from "@/utils";
import { AlertDetailsPanel } from "./components/alert-details-panel";
import { AlertsTimeline } from "./components/alerts-timeline";
import NumberFlow from "@number-flow/react";
import { EmptyStateInfo } from "@/components/empty-state-info";

type SeverityFilter = "CRITICAL" | "HIGH" | "WARNING" | "INFO";
type StateFilter = "Active" | "Acknowledged" | "Cleared";

const getSeverityIcon = (severity: number | string) => {
  const normalizedSeverity = normalizeSeverity(severity);
  const severityString = severityMap[normalizedSeverity];
  switch (severityString) {
    case "CRITICAL":
      return <AlertCircle className="w-4 h-4" />;
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

const getSeverityVariant = (
  severity: number | string
): "default" | "secondary" | "destructive" | "outline" => {
  const normalizedSeverity = normalizeSeverity(severity);
  const severityString = severityMap[normalizedSeverity];
  switch (severityString) {
    case "CRITICAL":
      return "outline";
    case "HIGH":
      return "outline";
    case "WARNING":
      return "secondary";
    case "INFO":
    default:
      return "outline";
  }
};

const AlertsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityFilter[]>([]);
  const [selectedStates, setSelectedStates] = useState<StateFilter[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(true);

  // Alert details panel state
  const [selectedAlertKey, setSelectedAlertKey] = useState<string | null>(null);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  // Track recently updated alerts for highlighting
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set());
  const previousAlertsRef = useRef<Map<string, Alert>>(new Map());

  // Pause system: queue alerts while paused
  const [queuedAlerts, setQueuedAlerts] = useState<typeof processedAlerts>([]);
  const [pausedAlertCount, setPausedAlertCount] = useState(0);
  const lastProcessedCountRef = useRef(0);

  const {
    data: alertsData,
    isLoading: alertsLoading,
    isFetching: alertsFetching,
    isError: alertsError,
    refetch: refetchAlerts,
  } = useGetAlertsQuery();

  // Get real-time alerts from WebSocket
  const { processedAlerts, connected } = useSocket();

  const alerts = alertsData?.alerts || [];

  // Handle pausing/queuing of WebSocket alerts
  const activeProcessedAlerts = useMemo(() => {
    if (liveUpdatesEnabled) {
      // When live, use all alerts and reset queue
      return [...queuedAlerts, ...processedAlerts];
    } else {
      // When paused, only use alerts that were active when we paused
      return queuedAlerts;
    }
  }, [liveUpdatesEnabled, processedAlerts, queuedAlerts]);

  // Track new alerts that come in while paused
  useEffect(() => {
    if (!liveUpdatesEnabled) {
      // Calculate total new alerts since pause (not incremental)
      const totalNewAlerts = processedAlerts.length - lastProcessedCountRef.current;
      if (totalNewAlerts > 0) {
        setPausedAlertCount(totalNewAlerts);
      }
    } else {
      // When resuming, merge queued alerts and reset counters
      if (queuedAlerts.length > 0 || pausedAlertCount > 0) {
        setQueuedAlerts([]);
        setPausedAlertCount(0);
      }
      lastProcessedCountRef.current = processedAlerts.length;
    }
  }, [liveUpdatesEnabled, processedAlerts, queuedAlerts.length, pausedAlertCount]);

  // Handle pause/unpause
  const toggleLiveUpdates = () => {
    if (liveUpdatesEnabled) {
      // Pausing: capture current state
      setQueuedAlerts([...processedAlerts]);
      lastProcessedCountRef.current = processedAlerts.length;
      setPausedAlertCount(0);
    }
    setLiveUpdatesEnabled(!liveUpdatesEnabled);
  };

  // Convert WebSocket alerts to Alert format and merge with API alerts
  const allAlerts = useMemo(() => {
    const wsAlerts: Alert[] = activeProcessedAlerts.map(
      (wsAlert) =>
        ({
          driver_name: wsAlert.data.processed_alert.driver_name,
          alarm_name: wsAlert.data.processed_alert.alarm_name,
          severity: wsAlert.data.processed_alert.severity,
          first_timestamp: wsAlert.data.processed_alert.first_timestamp,
          last_timestamp: wsAlert.data.processed_alert.last_timestamp,
          alert_state: wsAlert.data.processed_alert.alert_state as
            | "Active"
            | "Acknowledged"
            | "Cleared",
          state: wsAlert.data.processed_alert.alert_state as "Active" | "Acknowledged" | "Cleared",
          repeat_count: wsAlert.data.processed_alert.repeat_count,
          published_count: wsAlert.data.processed_alert.published_count,
          error: wsAlert.data.processed_alert.error,
          // Generate redis_key for WebSocket alerts to match API pattern
          redis_key: `alert:${wsAlert.data.processed_alert.driver_name}:${wsAlert.data.processed_alert.alarm_name}:${wsAlert.data.processed_alert.error}`,
          // Add WebSocket metadata as optional fields
          ws_event_time: wsAlert.event_time,
          ws_source: wsAlert.source,
        } as Alert & { ws_event_time?: number; ws_source?: string })
    );

    // Create a map to track unique alerts by their redis_key (or fallback key)
    const alertsMap = new Map<string, Alert & { ws_event_time?: number; ws_source?: string }>();

    // Helper function to get alert key (prefer redis_key, fallback to constructed key)
    const getAlertKey = (alert: Alert & { ws_event_time?: number; ws_source?: string }) => {
      return alert.redis_key || `${alert.driver_name}|${alert.alarm_name}|${alert.error}`;
    };

    // Add WebSocket alerts first (they have priority)
    wsAlerts.forEach((wsAlert) => {
      const alertKey = getAlertKey(wsAlert);
      const existing = alertsMap.get(alertKey);

      // Keep the most recent alert (highest last_timestamp)
      if (!existing || wsAlert.last_timestamp > existing.last_timestamp) {
        alertsMap.set(alertKey, wsAlert);
      }
    });

    // Add API alerts only if they don't exist or are newer
    alerts.forEach((apiAlert) => {
      const alertKey = getAlertKey(apiAlert);
      const existing = alertsMap.get(alertKey);

      // Only add API alert if no WebSocket version exists, or if API version is newer
      if (
        !existing ||
        (!existing.ws_event_time && apiAlert.last_timestamp > existing.last_timestamp)
      ) {
        alertsMap.set(alertKey, apiAlert);
      }
    });

    // Convert map back to array and sort by last timestamp (most recent first)
    return Array.from(alertsMap.values()).sort((a, b) => b.last_timestamp - a.last_timestamp);
  }, [activeProcessedAlerts, alerts]);

  // Detect alert updates and trigger highlighting
  useEffect(() => {
    if (!liveUpdatesEnabled) return;

    const newUpdated = new Set<string>();
    const currentAlertsMap = new Map<string, Alert>();

    // Helper function to get alert key (prefer redis_key, fallback to constructed key)
    const getAlertKey = (alert: Alert) => {
      return alert.redis_key || `${alert.driver_name}|${alert.alarm_name}|${alert.error}`;
    };

    // Build current alerts map
    allAlerts.forEach((alert) => {
      const alertKey = getAlertKey(alert);
      currentAlertsMap.set(alertKey, alert);
    });

    // Compare with previous alerts to detect updates
    currentAlertsMap.forEach((currentAlert, alertKey) => {
      const previousAlert = previousAlertsRef.current.get(alertKey);

      if (previousAlert) {
        // Check if count increased or timestamp changed
        if (
          currentAlert.published_count > previousAlert.published_count ||
          currentAlert.last_timestamp > previousAlert.last_timestamp
        ) {
          newUpdated.add(alertKey);
        }
      }
    });

    // Update recently updated set - merge with existing instead of replacing
    if (newUpdated.size > 0) {
      setRecentlyUpdated((prev) => new Set([...prev, ...newUpdated]));

      // Remove highlighting after 3 seconds for each individual alert
      newUpdated.forEach((alertKey) => {
        setTimeout(() => {
          setRecentlyUpdated((prev) => {
            const updated = new Set(prev);
            updated.delete(alertKey);
            return updated;
          });
        }, 3000);
      });
    }

    // Update previous alerts reference
    previousAlertsRef.current = currentAlertsMap;
  }, [allAlerts, liveUpdatesEnabled]);

  // Helper function to check if alert was recently updated
  const isRecentlyUpdated = (alert: Alert) => {
    const alertKey = alert.redis_key || `${alert.driver_name}|${alert.alarm_name}|${alert.error}`;
    return recentlyUpdated.has(alertKey);
  };

  // Get unique drivers for filter options
  const availableDrivers = useMemo(() => {
    return Array.from(new Set(allAlerts.map((alert) => alert.driver_name))).sort();
  }, [allAlerts]);

  // Filter alerts based on selected filters and search term
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      // Search term filter
      if (
        searchTerm &&
        !alert.alarm_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !alert.error.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !alert.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Severity filter
      if (selectedSeverities.length > 0) {
        const normalizedSeverity = normalizeSeverity(alert.severity);
        const severityString = severityMap[normalizedSeverity];
        if (!selectedSeverities.includes(severityString as SeverityFilter)) {
          return false;
        }
      }

      // State filter - handle both state and alert_state fields
      if (selectedStates.length > 0) {
        const alertState = alert.alert_state || alert.state;
        if (!selectedStates.includes(alertState as StateFilter)) {
          return false;
        }
      }

      // Driver filter
      if (selectedDrivers.length > 0 && !selectedDrivers.includes(alert.driver_name)) {
        return false;
      }

      return true;
    });
  }, [allAlerts, searchTerm, selectedSeverities, selectedStates, selectedDrivers]);

  // Separate alerts by recency: Active within last hour vs Recent (everything else)
  const combinedAlerts = useMemo(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour ago in milliseconds

    const recentActiveAlerts = filteredAlerts.filter((alert) => {
      const alertState = alert.alert_state || alert.state;
      const alertTime = alert.last_timestamp * 1000; // Convert to milliseconds
      return alertState === "Active" && alertTime >= oneHourAgo;
    });

    const otherAlerts = filteredAlerts.filter((alert) => {
      const alertState = alert.alert_state || alert.state;
      const alertTime = alert.last_timestamp * 1000; // Convert to milliseconds
      // Everything else: non-active alerts OR active alerts older than 1 hour
      return alertState !== "Active" || alertTime < oneHourAgo;
    });

    return { recentActiveAlerts, otherAlerts };
  }, [filteredAlerts]);

  const toggleSeverityFilter = (severity: SeverityFilter) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity]
    );
  };

  const toggleStateFilter = (state: StateFilter) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const toggleDriverFilter = (driver: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(driver) ? prev.filter((d) => d !== driver) : [...prev, driver]
    );
  };

  const clearAllFilters = () => {
    setSelectedSeverities([]);
    setSelectedStates([]);
    setSelectedDrivers([]);
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedSeverities.length > 0 ||
    selectedStates.length > 0 ||
    selectedDrivers.length > 0 ||
    searchTerm.length > 0;

  // Handle opening alert details
  const getAlertKey = (alert: Alert & { ws_event_time?: number; ws_source?: string }) => {
    return alert.redis_key || `${alert.driver_name}|${alert.alarm_name}|${alert.error}`;
  };
  const handleAlertClick = (alert: Alert & { ws_event_time?: number; ws_source?: string }) => {
    setSelectedAlertKey(getAlertKey(alert));
    setDetailsPanelOpen(true);
  };

  const handleDetailsPanelClose = () => {
    setDetailsPanelOpen(false);
    setSelectedAlertKey(null);
  };

  if (alertsLoading) {
    return (
      <>
        <PageHeader pageName="System Alerts" />
        <main className="mx-auto px-8 md:px-12 py-8 max-w-8xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-neutral-500">Loading alerts...</div>
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="dark:bg-neutral-900 from-neutral-50 gradient-to-b to-white rounded-t-xl">
      <PageHeader pageName="System Alerts" />
      <main className="space-y-6 mx-auto px-8 md:px-12 py-8 w-full max-w-8xl">
        {/* Alerts Toolbar */}
        <div className="relative inset-px bg-white dark:bg-neutral-800 shadow-black/5 shadow-lg dark:shadow-none dark:border dark:border-neutral-700/20 rounded-xl ring-1 ring-black/5 text-neutral-950 dark:text-neutral-50">
          {/* Main Toolbar Row */}
          <div className="flex justify-between items-center gap-6 p-4 border-neutral-200 border-b">
            {/* Title Section */}
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-neutral-900 text-lg">Alert Monitoring</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"></div>

                <div className="flex items-center gap-2 min-w-[150px]">
                  <Button
                    variant="outline"
                    color="primary"
                    size="sm"
                    className={`${
                      liveUpdatesEnabled
                        ? "border-primary-500 text-primary-600 hover:bg-primary-50 hover:text-primary-600 "
                        : "border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                    onClick={toggleLiveUpdates}>
                    {liveUpdatesEnabled ? (
                      <>
                        <StopCircle className="w-4 h-4" />
                        Live
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        Paused
                        {pausedAlertCount > 0 && (
                          <Badge className="px-1 text-xs" variant="secondary">
                            +{pausedAlertCount}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchAlerts()}
                    disabled={alertsLoading}
                    className="px-2">
                    {alertsLoading || alertsFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              {/* <Badge variant="outline" className="text-sm">
                <div className="flex items-center gap-1 font-medium text-neutral-800 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      connected ? "bg-primary-500" : "bg-red-500"
                    }`}></div>

                  {connected ? (!liveUpdatesEnabled ? "Paused" : "Live") : "Disconnected"}
                </div>
              </Badge> */}
            </div>

            {/* Vertical Divider */}
            <div className="bg-neutral-200 w-px h-8"></div>

            {/* Search Section */}
            <div className="flex-1 min-w-[300px] max-w-[400px]">
              <Input
                placeholder="Search alerts by name, error, or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                size="sm"
              />
            </div>

            {/* Vertical Divider */}
            <div className="bg-neutral-200 w-px h-8"></div>

            {/* Filters Section */}
            <div className="flex items-center gap-3">
              {/* Severity Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`min-w-[100px] justify-between ${
                      selectedSeverities.length > 0
                        ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                        : ""
                    }`}>
                    Severity
                    <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Select Severities</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(["CRITICAL", "HIGH", "WARNING", "INFO"] as SeverityFilter[]).map((severity) => (
                    <DropdownMenuItem
                      key={severity}
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleSeverityFilter(severity);
                      }}>
                      <Checkbox
                        checked={selectedSeverities.includes(severity)}
                        onCheckedChange={() => toggleSeverityFilter(severity)}
                      />
                      <span className="capitalize">{severity.toLowerCase()}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* State Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`min-w-[80px] justify-between ${
                      selectedStates.length > 0
                        ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                        : ""
                    }`}>
                    State
                    <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Select States</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(["Active", "Acknowledged", "Cleared"] as StateFilter[]).map((state) => (
                    <DropdownMenuItem
                      key={state}
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleStateFilter(state);
                      }}>
                      <Checkbox
                        checked={selectedStates.includes(state)}
                        onCheckedChange={() => toggleStateFilter(state)}
                      />
                      <span>{state}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Driver Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`min-w-[100px] justify-between ${
                      selectedDrivers.length > 0
                        ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                        : ""
                    }`}>
                    Drivers
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-96 overflow-y-auto" align="end">
                  <DropdownMenuLabel>Select Drivers</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableDrivers.map((driver) => (
                    <DropdownMenuItem
                      key={driver}
                      className="flex items-center space-x-2 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleDriverFilter(driver);
                      }}>
                      <Checkbox
                        checked={selectedDrivers.includes(driver)}
                        onCheckedChange={() => toggleDriverFilter(driver)}
                      />
                      <span>{driver}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>{" "}
          <div className="p-4">
            <AlertsTimeline alerts={allAlerts} />
          </div>
          {/* Active Filters Row - Only shown when filters are active */}
          {hasActiveFilters && (
            <div className="mt-3 px-4 py-3 border-neutral-200 border-t">
              <div className="flex justify-between items-center gap-4">
                {/* Active Filters Display */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-neutral-600 text-sm">Active filters:</span>

                  {/* Search Term */}
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: "{searchTerm}"
                      <Button
                        variant="ghost"
                        size="xs"
                        className="hover:bg-transparent p-0 h-auto"
                        onClick={() => setSearchTerm("")}>
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )}

                  {/* Severity Filters */}
                  {selectedSeverities.map((severity) => (
                    <Badge key={severity} variant="secondary" className="gap-1">
                      Severity: {severity.toLowerCase()}
                      <Button
                        variant="ghost"
                        size="xs"
                        className="hover:bg-transparent p-0 h-auto"
                        onClick={() => toggleSeverityFilter(severity)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}

                  {/* State Filters */}
                  {selectedStates.map((state) => (
                    <Badge key={state} variant="secondary" className="gap-1">
                      State: {state}
                      <Button
                        variant="ghost"
                        size="xs"
                        className="hover:bg-transparent p-0 h-auto"
                        onClick={() => toggleStateFilter(state)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}

                  {/* Driver Filters */}
                  {selectedDrivers.map((driver) => (
                    <Badge key={driver} variant="secondary" className="gap-1">
                      Driver: <span className="font-mono">{driver}</span>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="hover:bg-transparent p-0 h-auto"
                        onClick={() => toggleDriverFilter(driver)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {/* Clear All Button */}
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="shrink-0">
                  <X className="mr-1 w-4 h-4" />
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Alerts Content */}
        <Card className="bg-transparent !shadow-none !border-none rounded-none !ring-0">
          <div className="relative inset-px flex flex-col bg-white dark:bg-neutral-800 shadow-black/5 shadow-xl dark:shadow-none p-6 dark:border dark:border-neutral-700/20 rounded-xl ring-1 ring-black/5 h-full text-neutral-950 dark:text-neutral-50">
            {/* Active Alerts Section */}
            {combinedAlerts.recentActiveAlerts.length > 0 && (
              <>
                {/* <CardTitle className="mb-3 pb-2 dark:border-neutral-700 border-b-2 font-semibold dark:text-white text-base md:text-xl leading-none tracking-tight">
        Recipe Library  
      </CardTitle> */}

                <div className="bg-white shadow-sm mb-4 p-4 border border-neutral-200 border-red-500 border-l-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-neutral-900 text-lg">
                      <NumberFlow value={combinedAlerts.recentActiveAlerts.length} /> Active Alerts
                    </span>
                    <span className="-ml-2 font-semibold text-neutral-400 text-lg">
                      within the last hour
                    </span>
                  </div>
                </div>

                <Table className="border-separate border-spacing-y-0.5">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-none">
                      <TableHead className="w-[100px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Time
                      </TableHead>
                      <TableHead className="w-[80px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Severity
                      </TableHead>
                      <TableHead className="w-[120px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Driver
                      </TableHead>
                      <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Alarm
                      </TableHead>
                      <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Error Details
                      </TableHead>
                      <TableHead className="w-[80px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Count
                      </TableHead>
                      <TableHead className="w-[100px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        State
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Recent Active Alert Rows */}
                    {combinedAlerts.recentActiveAlerts.map((alert, index) => {
                      const normalizedSeverity = normalizeSeverity(alert.severity);
                      const severityString = severityMap[normalizedSeverity];
                      const isFromWebSocket = "ws_event_time" in alert;
                      const isUpdated = isRecentlyUpdated(alert);

                      return (
                        <TableRow
                          key={`recent-active-${alert.driver_name}-${alert.alarm_name}-${index}`}
                          className={`border-white !border-2
                            ${index % 2 === 0 ? "bg-neutral-100" : "bg-white"} ${
                            isUpdated
                              ? severityString === "CRITICAL" || severityString === "HIGH"
                                ? "bg-red-50 border-l-4 border-red-500"
                                : "bg-primary-100"
                              : ""
                          } rounded-lg border-none hover:bg-neutral-200 cursor-pointer`}
                          onClick={() => handleAlertClick(alert)}>
                          <TableCell
                            className={`text-sm text-neutral-500 py-3 px-4 rounded-l-lg text-nowrap font-normal ${
                              isUpdated ? "text-black" : ""
                            }`}>
                            {formatUnixTimestamp(alert.last_timestamp)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getSeverityVariant(alert.severity)}
                                className={`relative capitalize ${
                                  severityString === "HIGH" || severityString === "CRITICAL"
                                    ? "bg-white text-red-500 border-red-200 hover:bg-red-50"
                                    : ""
                                }`}>
                                {severityString === "CRITICAL" && (
                                  <>
                                    <div className="top-0 left-0 absolute flex justify-center items-center bg-red-600 rounded-full w-6 h-full">
                                      <AlertTriangle className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="w-5"></div>
                                  </>
                                )}
                                {severityMap[normalizedSeverity]?.toLowerCase()}
                              </Badge>
                              {isFromWebSocket && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary-50 border-primary-200 text-primary-600 text-xs">
                                  Live
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="bg-neutral-100 px-2 py-1 rounded font-mono text-xs">
                              {alert.driver_name}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 font-medium">
                            {alert.alarm_name}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-neutral-600">
                            {alert.error}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isUpdated
                                  ? "bg-primary-100 text-primary-600 border-primary-400 font-bold animate-pulse tabular-nums"
                                  : ""
                              }`}>
                              {alert.published_count}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 rounded-r-lg">
                            {alert?.alert_state}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            )}

            {/* Horizontal Separator */}
            {combinedAlerts.recentActiveAlerts.length > 0 &&
              combinedAlerts.otherAlerts.length > 0 && (
                <div className="px-4 py-6">
                  <div className="flex items-center gap-4">
                    <hr className="flex-1 border-neutral-300" />
                    <span className="font-medium text-neutral-500 text-sm">Earlier alerts</span>
                    <hr className="flex-1 border-neutral-300" />
                  </div>
                </div>
              )}

            {/* Recent Alerts Section */}
            {combinedAlerts.otherAlerts.length > 0 && (
              <>
                {/* Recent Alerts Section Header - Outside Table */}
                <div className="bg-gradient-to-r from-neutral-50 to-white shadow-sm mb-4 p-4 border border-neutral-200 border-neutral-500 border-l-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-neutral-600" />
                    <span className="font-semibold text-neutral-900 text-lg">
                      <NumberFlow value={combinedAlerts.otherAlerts.length} /> Recent Alerts
                    </span>
                  </div>
                </div>

                <Table className="border-separate border-spacing-y-0.5">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-none">
                      <TableHead className="w-[100px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Time
                      </TableHead>
                      <TableHead className="w-[80px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Severity
                      </TableHead>
                      <TableHead className="w-[120px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Driver
                      </TableHead>
                      <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Alarm
                      </TableHead>
                      <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Error Details
                      </TableHead>
                      <TableHead className="w-[80px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        Count
                      </TableHead>
                      <TableHead className="w-[100px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                        State
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Other Alert Rows */}
                    {combinedAlerts.otherAlerts.map((alert, index) => {
                      const normalizedSeverity = normalizeSeverity(alert.severity);
                      const severityString = severityMap[normalizedSeverity];
                      const isFromWebSocket = "ws_event_time" in alert;
                      const isUpdated = isRecentlyUpdated(alert);
                      // Calculate index for alternating pattern, accounting for recent active alerts
                      const adjustedIndex = index + combinedAlerts.recentActiveAlerts.length;

                      return (
                        <TableRow
                          key={`other-${alert.driver_name}-${alert.alarm_name}-${index}`}
                          className={`
                          
                            ${
                              adjustedIndex % 2 === 0 ? "bg-neutral-100" : "bg-white"
                            } rounded-lg border-none hover:bg-neutral-50 cursor-pointer ${
                            isFromWebSocket ? "ring-1 ring-primary-100" : ""
                          }`}
                          onClick={() => handleAlertClick(alert)}>
                          <TableCell className="px-4 py-3 rounded-l-lg font-normal text-neutral-500 text-sm text-nowrap">
                            {formatUnixTimestamp(alert.last_timestamp)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getSeverityVariant(alert.severity)}
                                className={`relative capitalize ${
                                  severityString === "HIGH" || severityString === "CRITICAL"
                                    ? "bg-white text-red-500 border-red-200 hover:bg-red-50"
                                    : ""
                                }`}>
                                {severityString === "CRITICAL" && (
                                  <>
                                    <div className="top-0 left-0 absolute flex justify-center items-center bg-red-600 rounded-full w-6 h-full">
                                      <AlertTriangle className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="w-5"></div>
                                  </>
                                )}
                                {severityMap[normalizedSeverity]?.toLowerCase()}
                              </Badge>
                              {isFromWebSocket && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary-50 border-primary-200 text-primary-600 text-xs">
                                  Live
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="bg-neutral-100 px-2 py-1 rounded font-mono text-xs">
                              {alert.driver_name}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 font-medium">
                            {alert.alarm_name}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-neutral-600">
                            {alert.error}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isUpdated
                                  ? "bg-primary-100 text-primary-600 border-primary-400 font-bold animate-pulse tabular-nums"
                                  : ""
                              }`}>
                              {alert.published_count}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 rounded-r-lg">
                            {alert.alert_state}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            )}

            {/* Empty State */}
            {combinedAlerts.otherAlerts.length === 0 &&
              combinedAlerts.recentActiveAlerts.length === 0 && (
                <div className="flex justify-center items-center py-8 text-neutral-500 text-center">
                  {hasActiveFilters ? (
                    <EmptyStateInfo
                      className="border-none"
                      icon={<Filter className="w-5 h-5 text-neutral-500" />}
                      title="No alerts found for the selected filters"
                      description="Try adjusting your filters to see more alerts"
                    />
                  ) : (
                    <EmptyStateInfo
                      className="border-none"
                      icon={<Bell className="w-5 h-5 text-neutral-500" />}
                      title="No alerts found"
                      description="Try adjusting your filters to see more alerts"
                    />
                  )}
                </div>
              )}
          </div>
        </Card>
      </main>

      {/* Alert Details Panel */}
      <AlertDetailsPanel
        isOpen={detailsPanelOpen}
        onClose={handleDetailsPanelClose}
        alert={allAlerts.find((a) => getAlertKey(a) === selectedAlertKey) || null}
      />
    </div>
  );
};

export default AlertsPage;
