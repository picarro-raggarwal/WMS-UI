import { protectedBaseQuery } from "@/utils/api/ProtectedBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export type DataCompletenessSuccessResponse = {
  status: string;
  data_completeness: {
    valid_data_points: number;
    total_data_points: number;
    completeness_fraction: number;
    quarter_start_date?: number;
  };
  target: number;
  meet_target: boolean;
};

export type DataCompletenessErrorResponse = {
  error: {
    name: string;
    description: string;
    message: string;
  };
};

export type DataCompletenessResponse =
  | DataCompletenessSuccessResponse
  | DataCompletenessErrorResponse;

export type DataCompletenessQueryType = "active_quarter" | `${number}`;
export type SystemUptimeQueryType = "active_quarter" | `${number}`;

export const qaqcApi = createApi({
  reducerPath: "qaqcApi",
  baseQuery: protectedBaseQuery(
    import.meta.env.VITE_FENCELINE_QAQC_API_BASE_URL ||
      "/api/fenceline_qaqc/api/v1"
  ),
  tagTypes: ["DataCompleteness", "SystemUptime"],
  endpoints: (builder) => ({
    getDataCompleteness: builder.query<
      DataCompletenessResponse,
      { query_type: DataCompletenessQueryType }
    >({
      query: ({ query_type }) => ({
        url: "/qaqc/data_completeness",
        params: { query_type }
      }),
      providesTags: ["DataCompleteness"]
    }),
    getSystemUptime: builder.query<
      SystemUptimeResponse,
      { query_type: SystemUptimeQueryType }
    >({
      query: ({ query_type }) => ({
        url: "/qaqc/system_uptime",
        params: { query_type }
      }),
      providesTags: ["SystemUptime"]
    })
  })
});

// Types for System Uptime endpoint
export type SystemUptime = {
  uptime_sec: number;
  elapsed_time_sec: number;
  uptime_fraction: number; // 0..1
  quarter_start_date?: number;
};

export type SystemUptimeSuccess = {
  status: string; // e.g., "active"
  system_uptime: SystemUptime;
  target: number; // 0..1
  meet_target: boolean;
  thirty_days_success?: {
    value: {
      status: string;
      system_uptime: SystemUptime;
    };
  };
  not_available?: {
    value: {
      status: string; // e.g., "not_available"
      message: string;
    };
  };
};

export type SystemUptimeResponse = SystemUptimeSuccess;

export const { useGetDataCompletenessQuery, useGetSystemUptimeQuery } = qaqcApi;
