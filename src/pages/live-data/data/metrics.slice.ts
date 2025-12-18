import { MetricsResponse } from "@/types";
import { protectedBaseQuery } from "@/utils";
import { createApi } from "@reduxjs/toolkit/query/react";

type DownsampleMode = "MEAN" | "MEDIAN" | "FIRST" | "LAST";

type MetricDataParams = {
  start?: number;
  end?: number;
  metrics: string;
  latest_value?: boolean;
  downsample_data?: boolean;
  downsample_mode?: DownsampleMode;
  rollingAvg?: string;
};

type MetricData = {
  timestamps: number[];
  values: number[];
  mean: number;
  std_dev: number;
  unit: string;
  thresholds?: {
    warning: number;
    alarm: number;
  };
};

export type MetricDataResponse = {
  [metric: string]: MetricData;
};

export const metricsApi = createApi({
  reducerPath: "metricsApi",
  baseQuery: protectedBaseQuery("/api/fenceline_data/api/v1"),
  tagTypes: ["Metrics"],
  endpoints: (builder) => ({
    getMetrics: builder.query<MetricsResponse, void>({
      query: () => "/configure_charts_list",
      providesTags: ["Metrics"]
    }),
    getMetricData: builder.query<MetricDataResponse, MetricDataParams>({
      query: ({
        start,
        end,
        metrics,
        latest_value,
        downsample_data,
        downsample_mode,
        rollingAvg
      }) => ({
        url: "/metric_data",
        params: {
          start,
          end,
          metrics,
          latest_value,
          downsample_data,
          downsample_mode,
          rollingAvg
        }
      }),
      transformResponse: (response: { result: MetricDataResponse }) =>
        response.result
    })
  })
});

export const { useGetMetricsQuery, useGetMetricDataQuery } = metricsApi;
