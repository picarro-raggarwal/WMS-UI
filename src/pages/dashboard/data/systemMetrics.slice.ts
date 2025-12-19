import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

type Range = [number, number];

export interface MetricRange {
  extreme_cold?: Range;
  cold_warning?: Range;
  optimal?: Range;
  hot_warning?: Range;
  extreme_hot?: Range;
  low?: Range;
  normal?: Range;
  high?: Range;
  idle?: Range;
}

export interface SystemMetric {
  name: string;
  unit: string;
  range?: MetricRange;
  value: number | null;
  status: "error" | "idle" | "low" | "normal" | "high";
  set_point?: number | null;
}

// Device availability can be either a boolean or an object with sub-components
type DeviceStatus = boolean | Record<string, boolean>;

export type WarmupStatus = {
  analyzer_warmup_complete: boolean;
  catalytic_converter_warmup_complete: boolean;
  warmup_complete: boolean;
};

export interface SystemComponentsAvailabilityResponse {
  device_availability: Record<string, DeviceStatus>;
  warmup_status: WarmupStatus;
}

// Configuration for how each metric should behave
export const METRIC_BEHAVIORS: Record<string, { higherIsBetter: boolean }> = {
  ups: { higherIsBetter: true },
  pressure: { higherIsBetter: true },
  disk_usage: { higherIsBetter: false },
  cpu_capacity: { higherIsBetter: false },
  ram_usage: { higherIsBetter: false },
  cabinet_temperature: { higherIsBetter: false },
  mfc_a: { higherIsBetter: false },
  mfc_b: { higherIsBetter: false },
  mfc_c: { higherIsBetter: false },
  mfc_d: { higherIsBetter: false }
};

interface SystemMetricsResponse {
  system_metrics: SystemMetric[];
  lastFetched?: number;
}

export const systemMetricsApi = createApi({
  reducerPath: "systemMetricsApi",
  baseQuery: protectedBaseQuery(
    import.meta.env.VITE_WMS_SYSTEM_HEALTH_API_BASE_URL ||
      "/wms-api/wms_system_health/api/v1"
  ),
  tagTypes: ["SystemMetrics"],
  endpoints: (builder) => ({
    getSystemMetrics: builder.query<SystemMetricsResponse, void>({
      query: () => "/system_metrics",
      providesTags: ["SystemMetrics"],
      transformResponse: (
        response: Omit<SystemMetricsResponse, "lastFetched">
      ) => ({
        ...response,
        lastFetched: Date.now()
      })
    }),
    getSystemComponentsAvailability: builder.query<
      SystemComponentsAvailabilityResponse,
      void
    >({
      query: () => "/system_components_availability",
      providesTags: ["SystemMetrics"]
    })
  })
});

export const {
  useGetSystemMetricsQuery,
  useGetSystemComponentsAvailabilityQuery
} = systemMetricsApi;
