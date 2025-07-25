import { protectedBaseQuery } from "@/common/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface MetricThreshold {
  warning: number;
  alarm: number;
  unit: string;
}

export interface ThresholdsResponse {
  metric_thresholds: Record<string, MetricThreshold>;
  wind_rose_calm_threshold: number;
  lastFetched?: number;
}

export interface SetThresholdRequest {
  metric_name: string;
  warning: number;
  alarm: number;
}

export const thresholdsApi = createApi({
  reducerPath: "thresholdsApi",
  baseQuery: protectedBaseQuery("/api/fenceline_data/api/v1"),
  tagTypes: ["Thresholds"],
  endpoints: (builder) => ({
    getAllThresholds: builder.query<ThresholdsResponse, void>({
      query: () => "/get_all_thresholds",
      providesTags: ["Thresholds"],
      transformResponse: (
        response: Omit<ThresholdsResponse, "lastFetched">
      ) => ({
        ...response,
        lastFetched: Date.now()
      })
    }),

    setMetricThreshold: builder.mutation<void, SetThresholdRequest>({
      query: (thresholds) => ({
        url: "/set_metric_thresholds",
        method: "PUT",
        body: thresholds
      }),
      invalidatesTags: ["Thresholds"]
    }),

    setWindRoseThreshold: builder.mutation<void, { calm_threshold: number }>({
      query: (thresholds) => ({
        url: "/set_wind_rose_calm_threshold",
        method: "PUT",
        body: thresholds
      }),
      invalidatesTags: ["Thresholds"]
    })
  })
});

export const {
  useGetAllThresholdsQuery,
  useSetMetricThresholdMutation,
  useSetWindRoseThresholdMutation
} = thresholdsApi;
