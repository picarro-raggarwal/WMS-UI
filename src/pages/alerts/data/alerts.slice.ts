import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface Alert {
  driver_name: string;
  alarm_name: string;
  severity: number;
  state?: "Active" | "Acknowledged" | "Cleared";
  alert_state?: "Active" | "Acknowledged" | "Cleared";
  first_timestamp: number;
  last_timestamp: number;
  repeat_count: number;
  error: string;
  redis_key?: string;
  published_count: number;
  consecutive_count: number;
}

export interface ActiveAlert extends Omit<Alert, "state" | "severity"> {
  severity: number | string;
  alert_state: "Active";
  redis_key: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  count: number;
  lastFetched?: number;
}

export interface ActiveAlertsResponse {
  active_alerts: ActiveAlert[];
  count: number;
  lastFetched?: number;
}

export interface AlertsSummaryResponse {
  summary: {
    total_alerts: number;
    by_state: {
      Active: number;
      Acknowledged: number;
      Cleared: number;
    };
    by_severity: {
      CRITICAL: number;
      HIGH: number;
      WARNING: number;
      INFO: number;
    };
  };
  lastFetched?: number;
}

export interface AlertsQueryParams {
  state?: "Active" | "Acknowledged" | "Cleared";
  severity?: "CRITICAL" | "HIGH" | "WARNING" | "INFO";
  driver_name?: string;
  limit?: number;
}

// Request body for acknowledge and clear operations
export interface AlertActionRequest {
  driver_name: string;
  alarm_name: string;
  error: string;
}

// Map severity numbers to readable strings for UI
export const severityMap: Record<number, string> = {
  0: "CRITICAL",
  1: "HIGH",
  2: "WARNING",
  3: "INFO"
};

// Map severity strings to numbers for API
export const severityToNumber: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  WARNING: 2,
  INFO: 3
};

// Helper function to normalize severity (handles both string and number)
export const normalizeSeverity = (severity: number | string): number => {
  if (typeof severity === "string") {
    return parseInt(severity, 10);
  }
  return severity;
};

export const alertsApi = createApi({
  reducerPath: "alertsApi",
  baseQuery: protectedBaseQuery(
    import.meta.env.VITE_FENCELINE_ALERT_API_BASE_URL ||
      "/api/fenceline_alert/api/v1"
  ),
  tagTypes: ["Alerts", "ActiveAlerts", "AlertsSummary"],
  endpoints: (builder) => ({
    getAlerts: builder.query<AlertsResponse, AlertsQueryParams | void>({
      query: (params) => ({
        url: "/alerts",
        params: params
          ? {
              ...(params.state && { state: params.state }),
              ...(params.severity && { severity: params.severity }),
              ...(params.driver_name && { driver_name: params.driver_name }),
              ...(params.limit && { limit: params.limit })
            }
          : {}
      }),
      providesTags: ["Alerts"],
      transformResponse: (response: Omit<AlertsResponse, "lastFetched">) => ({
        ...response,
        lastFetched: Date.now()
      })
    }),
    getActiveAlerts: builder.query<ActiveAlertsResponse, void>({
      query: () => "/alerts/active",
      providesTags: ["ActiveAlerts"],
      transformResponse: (
        response: Omit<ActiveAlertsResponse, "lastFetched">
      ) => ({
        ...response,
        lastFetched: Date.now()
      })
    }),
    getAlertsSummary: builder.query<AlertsSummaryResponse, void>({
      query: () => "/alerts/summary",
      providesTags: ["AlertsSummary"],
      transformResponse: (
        response: Omit<AlertsSummaryResponse, "lastFetched">
      ) => ({
        ...response,
        lastFetched: Date.now()
      })
    }),
    acknowledgeAlert: builder.mutation<void, AlertActionRequest>({
      query: (alertData) => ({
        url: "/alerts/acknowledge",
        method: "POST",
        body: alertData
      }),
      invalidatesTags: ["Alerts", "ActiveAlerts", "AlertsSummary"]
    }),
    clearAlert: builder.mutation<void, AlertActionRequest>({
      query: (alertData) => ({
        url: "/alerts/clear",
        method: "POST",
        body: alertData
      }),
      invalidatesTags: ["Alerts", "ActiveAlerts", "AlertsSummary"]
    })
  })
});

export const {
  useGetAlertsQuery,
  useGetActiveAlertsQuery,
  useGetAlertsSummaryQuery,
  useAcknowledgeAlertMutation,
  useClearAlertMutation
} = alertsApi;
